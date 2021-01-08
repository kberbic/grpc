/* eslint-disable no-console */

import grpc from '@grpc/grpc-js';
import path from 'path';
import protoLoader from '@grpc/proto-loader';
import Validation from './validation.js';
import Routes from './routes.js';
import ArgumentsError from './arguments.error.js';
import logger from './logger.js';

const OPTIONS = {
  includeDirs: [
    `${path.resolve()}/node_modules/protobufjs`,
    `${path.resolve()}/server`,
    `${path.resolve()}/interfaces`,
  ],
};

const PATH = import.meta.url.replace('server/grpc.js', '').replace('file://', '');
export default class GPRCServer {
    routes = [];

    #port;

    #host;

    #services;

    #interfaces;

    #modules;

    #validations;

    #proto;

    #server;

    constructor(options = {
      port: 8080,
      host: '0.0.0.0',
      modules: [],
      services: {},
      interfaces: '',
      server: null,
    }) {
      this.#port = options.port;
      this.#host = options.host;
      this.#services = options.services;
      this.#interfaces = options.interfaces || (`${PATH}/interfaces`);
      this.#modules = options.modules || [];
      this.#server = options.server || new grpc.Server();
    }

    attach() {
      this.#services.forEach((service) => {
        const protoPath = `${this.#interfaces}/${service.proto}`;
        const { root, definition } = protoLoader.loadSync(protoPath, OPTIONS);

        this.#proto = grpc.loadPackageDefinition(definition);
        this.#validations = Validation.load(root);
        this.routes = Routes.load(root, protoPath, `${this.#host}:${this.#port}`);

        const services = Object
          .getOwnPropertyNames(service)
          .filter((key) => ['length', 'name', 'prototype', 'proto'].indexOf(key) === -1)
          .reduce(this.#exec(service), {});

        this.#server.addService(this.#proto[service.name].service, services);
      });
    }

    async start() {
      this.attach();
      return this.#run();
    }

    #exec (item) {
      return (service, key) => {
        service[key] = (_, callback) => {
          this.#validation(
            this.#validations,
            _.request,
            this.#proto[item.name].service[key].requestType,
          ).then(() => {
            const action = item[key].bind(_);
            return this.#executeModules(this.#modules, _)
              .then((data) => {
                if (data) return callback(undefined, data);

                // TODO Add support for streams
                return action(_.request).then((response) => this.#validation(
                  this.#validations,
                  response,
                  this.#proto[item.name].service[key].responseType,
                ).then(() => {
                  callback(undefined, response);
                }));
              });
          })
            .catch((err) => {
              logger.error(err);
              callback(err);
            });
        };

        return service;
      };
    }

    #run () {
      return new Promise((resolve, reject) => this.#server.bindAsync(`${this.#host}:${this.#port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
        if (err) return reject(err);

        this.#server.start();

        logger.info(`Listening to requests on grpc://0.0.0.0:${port}`);
        return resolve(this.#server);
      }));
    }

    #executeModules (modules, req) {
      return new Promise((resolve, reject) => {
        if (!modules || !modules.length) return resolve();

        return this.#next({ resolve, reject },
          modules,
          0,
          req);
      });
    }

    #next ({ resolve, reject }, modules, index, req) {
      return this.#middleware(modules[index], req, (err, data) => {
        if (err) return reject(err);

        if (data) return resolve(data);

        if (modules.length === (index + 1)) return resolve();

        return this.#next({ resolve, reject }, modules, index + 1, req);
      });
    }

    #middleware (active, req, callback) {
      active(req, (err, data) => {
        callback(err, data);
      });
    }

    #validation (validations, request, inputType) {
      const name = inputType ? inputType.type.name : null;
      if (validations[name]) {
        return validations[name].validate(request, { abortEarly: false })
          .catch((err) => { throw new ArgumentsError(err.errors.join(', '), err); });
      }

      return Promise.resolve();
    }
}

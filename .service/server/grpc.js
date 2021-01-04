/* eslint-disable no-console */

import grpc from '@grpc/grpc-js';
import path from 'path';
import protoLoader from '@grpc/proto-loader';
import Validation from './validation.js';
import Routes from './routes.js';

const OPTIONS = {
  includeDirs: [
    `${path.resolve()}/node_modules/protobufjs`,
    `${path.resolve()}/server`,
    `${path.resolve()}/interfaces`,
  ],
};

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
    }) {
      this.#port = options.port;
      this.#host = options.host;
      this.#services = options.services;
      this.#interfaces = path.resolve() + (options.interfaces || '/interfaces');
      this.#modules = options.modules || [];
      this.#server = new grpc.Server();
    }

    async start() {
      this.#services.forEach((service) => {
        const protoPath = `${this.#interfaces}/${service.proto}`;
        const { root, definition } = protoLoader.loadSync(protoPath, OPTIONS);

        this.#proto = grpc.loadPackageDefinition(definition);
        this.#validations = Validation.load(root);
        this.routes = Routes.load(root, service.proto, `${this.#host}:${this.#port}`);

        const services = Object.getOwnPropertyNames(service)
          .filter((key) => ['length', 'name', 'prototype', 'proto'].indexOf(key) === -1)
          .reduce(this.#exec(service), {});

        this.#server.addService(this.#proto[service.name].service, services);
      });

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
            .catch(callback);
        };

        return service;
      };
    }

    #run () {
      return new Promise((resolve, reject) => this.#server.bindAsync(`${this.#host}:${this.#port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
        if (err) return reject(err);

        this.#server.start();

        console.log(`Listening to requests on grpc://0.0.0.0:${port}`);
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
        return validations[name].validate(request);
      }

      return Promise.resolve();
    }
}

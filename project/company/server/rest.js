/* eslint-disable no-console */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable no-unused-vars */

import express from 'express';
import grpc from '@grpc/grpc-js';
import Client from '../clients/grpc.js';
import ServerError from '../errors/service.error.js';

export default class HttpServer {
    #port;

    #routes;

    #app = express();

    constructor(options = {
      port: 8080,
      host: '0.0.0.0',
      modules: [],
    }) {
      this.#port = options.port;
      this.defaults();
    }

    defaults() {
      this.#app.use(express.urlencoded({ extended: false }));

      this.#app.use(express.json({
        inflate: true,
        limit: '100kb',
        reviver: null,
        strict: true,
        type: 'application/json',
        verify: undefined,
      }));

      this.#app.use(express.json({
        extended: true,
        inflate: true,
        limit: '100kb',
        parameterLimit: 1000,
        type: 'application/x-www-form-urlencoded',
        verify: undefined,
      }));
    }

    start(routes) {
      this.#routes = routes;
      this.#attachRoutes(new Client(routes));

      return new Promise((resolve, reject) => {
        this.errors();
        this.#app.listen(this.#port, (err) => {
          if (err) return reject(err);

          console.log(`Listening to requests on http://0.0.0.0:${this.#port}`);
          return resolve(this.#app);
        });
      });
    }

    #attachRoutes (client) {
      this.#routes.forEach((route) => {
        this.#app[route.type](route.path, (req, res, next) => {
          const metadata = new grpc.Metadata();
          Object.keys(req.headers)
            .filter((x) => ['connection', 'content-length'].indexOf(x) === -1)
            .forEach((key) => metadata.add(key, req.headers[key]));

          client[route.service][route.method](route.map.reduce((body, map) => {
            for (const key in req[map]) body[key] = req[map][key];

            return body;
          }, {}), metadata)
            .then((data) => res.json(data))
            .catch(next);
        });
      });
    }

    errors() {
      this.#app.use((err, req, res, next) => {
        const fields = err.metadata.internalRepr.has("fields") ? err.metadata.internalRepr.get("fields")[0] : null;
        res.status(ServerError.HTTP_CODES[err.code] || 500).json({
          message: err.details || err.message,
          errors: fields ? JSON.parse(fields) : undefined,
        });
      });
    }
}

import path from 'path';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';

const OPTIONS = {
  keepCase: true,
  longs: String,
  enums: String,
  arrays: true,
};

export default class Client {
    #services = null;

    #interfaces = `${path.resolve()}/interfaces`;

    constructor(services) {
      this.#init(services);
    }

    #init (services) {
      this.#services = services.reduce((input, item) => {
        const protoPath = `${item.interfaces || this.#interfaces}/${item.proto}`;
        const { definition } = protoLoader.loadSync(protoPath, OPTIONS);
        const proto = grpc.loadPackageDefinition(definition);

        Object.keys(proto).forEach((serviceKey) => {
          if (serviceKey.endsWith('Service')) {
            input.clients[serviceKey] = new proto[serviceKey](
              item.address,
              grpc.credentials.createInsecure(),
            );

            input.services[serviceKey] = Object.getOwnPropertyNames(proto[serviceKey].service)
              .filter((key) => ['length', 'name', 'prototype'].indexOf(key) === -1)
              .reduce((service, key) => {
                service[key] = (...args) => new Promise((resolve, reject) => {
                  const metadata = args.find((x) => x instanceof grpc.Metadata)
                      || new grpc.Metadata();
                  input.clients[serviceKey][key](...args, metadata, (err, data) => {
                    if (err) return reject(err);

                    return resolve(data);
                  });
                });

                return service;
              }, {});
          }
        });

        return input;
      }, { clients: {}, services: this });
    }
}

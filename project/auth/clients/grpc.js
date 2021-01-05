import axios from 'axios';
import path from 'path';
import fs from "fs";
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
        if (services)
            this.#init(services);
    }

    async load(){
        this.#init(await this.#parse());
        return this;
    }

    async #parse () {
        return Promise.all(Object.keys(process.env).filter((x) => x.endsWith('_SERVICE')).map(async (key) => {
            const url = this.#url(process.env[key]);
            if (!url)
                return null;

            const filePath = `${path.resolve()}/interfaces/.${url.file}`;
            await axios.request({
                method: 'get',
                url: url.url
            }).then(({data}) => new Promise((resolve, reject)=>
                fs.writeFile(filePath,
                    data,
                    {encoding: "utf8"},
                    (err)=> err ? reject(err) : resolve())));

            return {proto: `.${url.file}`, address: url.address};
        }));
    }

    #url(input){
        let url = input;

        if(!url.endsWith(".proto"))
            return null;

        const segments = url.split('/');
        const file = segments[segments.length - 1];
        const [host, port] = segments[segments.length - 2].split(":");
        if(segments.find(x=> x.startsWith("http")))
            return {file, url, address: `${host}:${Number(port) - 1}`};

        return {file, url: `http://${host}:${Number(port) + 1}/${file}`, address: `${host}:${Number(port)}`};
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

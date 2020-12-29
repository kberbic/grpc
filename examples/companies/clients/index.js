process.env.NODE_ENV = process.env.NODE_ENV || 'local';

import path from 'path';
import GRPCServer from "./server/grpc.js";
import HttpServer from "./server/rest.js";
import Client from './clients/grpc.js';
import services from './services/index.js';
import correlation from './modules/correlation.js';

const client = new Client([{
    address: "0.0.0.0:8080",
    proto: "auth.proto"
}]);

const auth = (req, next) => client.AuthService
        .getUser(req.metadata)
        .then(user => req.user = user && next())
    .catch(next)

async function start() {
    (await import('dotenv'))
        .config({path: path.resolve(`./.env.${process.env.NODE_ENV}`)});

    async function start() {
        (await import('dotenv'))
            .config({path: path.resolve(`./.env.${process.env.NODE_ENV}`)});

        const grcp = new GRPCServer({
            modules: [correlation, auth],
            port: process.env.PORT,
            host: '0.0.0.0',
            services: services
        });

        const http = new HttpServer({
            modules: [],
            port: Number(process.env.PORT) + 1
        });

        grcp.start()
            .then(() => http.start(grcp.routes))
            .then(() => console.log("STARTED"))
            .catch(console.error);
    }

    start();
}

start();
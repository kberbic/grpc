process.env.NODE_ENV = process.env.NODE_ENV || 'local';

import path from 'path';
import GPRCServer from "./server/grpc.js";
import HttpServer from "./server/rest.js";
import Auth from './providers/jwt.js';
import Auth0 from './providers/auth0.js';
import services from './services/index.js';

const PUBLIC = [
    "/AuthService/token"
];

async function start() {
    (await import('dotenv'))
        .config({path: path.resolve(`./.env.${process.env.NODE_ENV}`)});

    const grcp = new GPRCServer({
        modules: [Auth(
            PUBLIC)],
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
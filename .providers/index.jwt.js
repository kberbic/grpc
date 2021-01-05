/* eslint-disable no-console */
const dotenv = await import('dotenv');
process.env.NODE_ENV = process.env.NODE_ENV || 'local';
dotenv.config({ path: path.resolve(`./.env.${process.env.NODE_ENV}`) });

import path from 'path';
import GPRCServer from './server/grpc.js';
import HttpServer from './server/rest.js';
import jwt from './providers/jwt.js';
import services from './services/index.js';
import models from './models/index.js';

const PUBLIC = [];
async function start() {
    const grpc = new GPRCServer({
        modules: [jwt(PUBLIC)],
        port: process.env.PORT,
        host: '0.0.0.0',
        services,
    });

    const http = new HttpServer({
        port: Number(process.env.PORT) + 1,
    });

    models.init()
        .then(() => grpc.start())
        .then(() => http.start(grpc.routes))
        .then(() => console.log('STARTED'))
        .catch(console.error);
}

start();

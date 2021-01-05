/* eslint-disable no-console */
const dotenv = await import('dotenv');
process.env.NODE_ENV = process.env.NODE_ENV || 'local';
dotenv.config({ path: path.resolve(`./.env.${process.env.NODE_ENV}`) });

import path from 'path';
import GPRCServer from './server/grpc.js';
import HttpServer from './server/rest.js';
import auth0 from './providers/auth0.js';
import services from './services/index.js';
import models from './models/index.js';
import projectName from 'project-name';
import logger from './logger.js';

const PUBLIC = [];
async function start() {
    const grpc = new GPRCServer({
        modules: [auth0(PUBLIC)],
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
        .then(() => logger.info(`${projectName()} STARTED`))
        .catch(logger.error);
}

start();

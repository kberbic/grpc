/* eslint-disable no-console */

import path from 'path';

import GRPCServer from './server/grpc.js';
import HttpServer from './server/rest.js';
import services from './services/index.js';
import correlation from './modules/correlation.js';

process.env.NODE_ENV = process.env.NODE_ENV || 'local';

async function start() {
  (await import('dotenv'))
    .config({ path: path.resolve(`./.env.${process.env.NODE_ENV}`) });

  const grpc = new GRPCServer({
    modules: [correlation],
    port: process.env.PORT,
    host: '0.0.0.0',
    services,
  });

  const http = new HttpServer({
    modules: [],
    port: Number(process.env.PORT) + 1,
  });

  grpc.start()
    .then(() => http.start(grpc.routes))
    .then(() => console.log('STARTED'))
    .catch(console.error);
}

start();

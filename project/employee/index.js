/* eslint-disable no-console */

const dotenv = await import('dotenv');
process.env.NODE_ENV = process.env.NODE_ENV || 'local';
dotenv.config({ path: path.resolve(`./.env.${process.env.NODE_ENV}`) });

import path from 'path';
import GRPCClient from './clients/grpc.js';
import GRPCServer from './server/grpc.js';
import HttpServer from './server/rest.js';
import services from './services/index.js';
import correlation from './modules/correlation.js';
import models from './models/index.js';

process.client = await new GRPCClient().load();
const { authService } = process.client;
const auth = (req, next) => authService
    .profile(req.metadata)
    // eslint-disable-next-line no-return-assign
    .then((user) => { req.user = user; next(); })
    .catch(next);

async function start() {
  const grpc = new GRPCServer({
    modules: [correlation, auth],
    port: process.env.PORT,
    host: '0.0.0.0',
    services,
  });

  const http = new HttpServer({
    port: Number(process.env.PORT) + 1,
  });

  models
      .init()
      .then(() => grpc.start())
      .then(() => http.start(grpc.routes))
      .then(() => console.log('STARTED'))
      .catch(console.error);
}

start();
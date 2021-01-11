/* eslint-disable no-console */

import fs from 'fs';
import path from 'path';
import grpcjs from '@grpc/grpc-js';
import projectName from 'project-name';
// eslint-disable-next-line no-unused-vars
import config from './server/config.js';
import GRPCClient from './server/client.js';
import GRPCServer from './server/grpc.js';
import HttpServer from './server/rest.js';
import services from './services/index.js';
import modules from './modules/index.js';
import models from './models/index.js';
import logger from './server/logger.js';

const IS_EXEC_PATH = import.meta.url.indexOf(path.resolve()) !== -1;
class Server {
  #server = null

  #http = null;

  #grpc = null;

  constructor(server) {
    this.#server = server || new grpcjs.Server();
  }

  async start() {
    this.#grpc = new GRPCServer({
      modules: [].concat(modules),
      port: process.env.PORT,
      host: '0.0.0.0',
      server: this.#server,
      services,
    });

    if (!IS_EXEC_PATH) return { grpc: this.#grpc, models };

    let routes = await this.mono();
    this.#http = new HttpServer({
      port: Number(process.env.PORT) + 1,
    });

    models.init()
        .then(() => this.#grpc.start())
        .then(async () => {
          routes = this.#grpc.routes.concat(routes);
          process.client = await (new GRPCClient(routes)).load();
          return this.#http.start(routes, process.client);
        })
        .then(() => logger.info(`${projectName()} started`))
        .catch(logger.error);

    return { grpc: this.#grpc, models };
  }

  async mono() {
    const [mono] = process.argv.slice(2);
    if (mono !== 'mono') return [];

    const currentPath = import.meta.url;

    logger.info('Start service discovering');
    const paths = this.#getDirectories('../')
        .filter((x) => fs.existsSync(`../${x}/index.js`)
            && !currentPath.endsWith(`/${x}/index.js`));

    let routes = [];
    const servers = await Promise.all(paths.map(async (x) => import(`../${x}/index.js`)));

    const founds = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < servers.length; i++) {
      const ChildServer = servers[i].default;
      if (ChildServer.name === Server.name) {
        // eslint-disable-next-line no-await-in-loop,no-shadow
        const { grpc, models } = await (new ChildServer(this.#server)).start();
        grpc.attach();
        // eslint-disable-next-line no-await-in-loop
        await models.init();
        routes = routes.concat(grpc.routes);
        founds.push(paths[i]);
      }
    }

    logger.info(`Finish service discovering, found: ${founds.join(' ')}`);

    return routes;
  }

  #getDirectories (source) {
    return fs.readdirSync(source, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name);
  }
}

if (IS_EXEC_PATH) new Server().start();

export default Server;

import fs from 'fs';
import path from 'path';
import utils from '../server/utils.js';

const PATH = utils.path(import.meta);
const loadServices = async () => fs.readdirSync(PATH)
  .reduce(async (promise, file) => promise.then(async (services) => {
    const fullPath = path.join(PATH, file);
    if (file.endsWith('.service.js')) {
            const Service = await import(fullPath); // eslint-disable-line
      services.push(Service.default);
    }
    return services;
  }), Promise.resolve([]));

const services = await loadServices();
export default services;

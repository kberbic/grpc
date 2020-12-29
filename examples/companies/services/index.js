import fs from 'fs';
import path from 'path';

const _path = path.resolve() + "/services";
const loadServices = async ()=> await fs.readdirSync(_path)
    .reduce(async (promise, file) => {
        return promise.then(async services=> {
            const fullPath = path.join(_path, file);
            if (file.endsWith('.service.js')) {
                const Service = await import(fullPath); // eslint-disable-line
                services.push(Service.default)
            }
            return services;
        })

    }, Promise.resolve([]));

const services = await loadServices();
export default services;
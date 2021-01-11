import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import projectName from 'project-name';

import utils from '../server/utils.js';

const PATH = utils.path(import.meta);
const loadModels = async () => fs.readdirSync(PATH)
    .reduce(async (promise, file) => promise.then(async (models) => {
        const fullPath = path.join(PATH, file);
        if (file.endsWith('.model.js')) {
            const Model = await import(fullPath); // eslint-disable-line
            models[Model.default.modelName] = Model.default;
        }
        return models;
    }), Promise.resolve({}));

const models = await loadModels();
models.lib = mongoose;
models.connect = mongoose.connect;
models.init = async ()=> mongoose.connect(
    process.env[`${projectName().toUpperCase()}_DATABASE_URI`] || process.env.DATABASE_URI,
    {useNewUrlParser: true, useUnifiedTopology: true});

export default models;

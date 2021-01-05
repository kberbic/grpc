import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

mongoose.Promise = global.Promise;

const PATH = `${path.resolve()}/models`;
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
    process.env.DATABASE_URI,
    {useNewUrlParser: true, useUnifiedTopology: true});

export default models;

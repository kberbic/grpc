/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */

import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';
import ConnectionString from 'pg-connection-string';
import projectName from 'project-name';
import utils from '../server/utils.js';

const PATH = utils.path(import.meta);
const PROJECT_PATH = projectName(PATH.replace('/models', ''));
const loadModels = async () => fs.readdirSync(PATH)
    .reduce(async (promise, file) => promise.then(async (models) => {
        const fullPath = path.join(PATH, file);
        if (file.endsWith('.model.js')) {
            models[fullPath] = true;
        }
        return models;
    }), Promise.resolve({}));

const models = await loadModels();

models.init = async () => {
    const config = ConnectionString.parse(
        process.env[`${projectName(PROJECT_PATH).toUpperCase()}_DATABASE_URI`]
        || process.env.DATABASE_URI);
    const sequelize = new Sequelize(
        config.database,
        config.user,
        config.password,
        {
            host: config.host,
            port: config.port,
            dialect: 'postgres',
            define: {
                freezeTableName: true,
                timestamps: false,
            },
        },
    );

    for (const key in models) {
        if (models[key] === true) {
            const model = await import(key);
            models[model.default.name] = model.default(sequelize, Sequelize);
            delete models[key];
        }
    }

    models.sequelize = sequelize;

    return sequelize.sync({ force: process.env.DATABASE_DROP_ON_START || false });
};

export default models;

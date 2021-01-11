const { exec } = require('child_process');

const capitalize = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
}

function execAsync(command){
    return new Promise((resolve, reject)=> {
        exec(command, (err)=> {
            if(err)
                return reject(err);

            resolve();
        });
    });
}

function parse (program) {

    const PROTO_TEMPLATE = `
syntax = "proto3";

import "google/protobuf/duration.proto";
import "google/protobuf/empty.proto";
import "google/api/annotations.proto";
import "validation.proto";

service ${capitalize(program.service)}Service {
  rpc test (google.protobuf.Empty) returns (Test) {
      option (google.api.http) = {
      get: "/${program.service}/me"
    };
  }
}

message Test {
  string id = 1;
}
`;

    const SERVICE_TEMPLATE = `
export default class ${capitalize(program.service)}Service {
    static proto = '${program.service}.proto';

    static async test() {
      return { id: 'test' };
    }
}
`;

    const TEST_TEMPLATE = `
/* eslint-disable no-undef */
import ${capitalize(program.service)}Service from '../../services/${program.service}.service.js';

describe('${program.service}.service.js', () => {
    it('If ${capitalize(program.service)}Service is initialized, static field "proto" exist in ${capitalize(program.service)}Service', () => {
        expect(${capitalize(program.service)}Service).toHaveProperty("proto");
    });
});
`;

    const MONGODB_MODEL_TEMPLATE = `
import mongoose from 'mongoose';

const ${capitalize(program.service)}Schema = new mongoose.Schema(
    {
        name: String
    }, {
        timestamps: true,
        collection: "${program.service}"
    }
);

const Model = mongoose.model('${capitalize(program.service)}', ${capitalize(program.service)}Schema);
export default Model;
`;

    const POSTGRES_MODEL_TEMPLATE = `
const ${capitalize(program.service)} = (sequelize, { DataTypes }) => sequelize.define('${program.service}', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
});

export default ${capitalize(program.service)};
`;

    let ENVIRONMENT_TEMPLATE = `
PORT=${program.port}
`;

    const DOCKER_TEMPLATE = `
FROM node:15-alpine as build
RUN apk add bash
WORKDIR /src/app
COPY package*.json ./
COPY . .
RUN npm install
EXPOSE ${program.port} ${Number(program.port) + 1}
CMD ["npm","start"]
`;

    return {
        PROTO_TEMPLATE,
        SERVICE_TEMPLATE,
        TEST_TEMPLATE,
        MONGODB_MODEL_TEMPLATE,
        POSTGRES_MODEL_TEMPLATE,
        ENVIRONMENT_TEMPLATE,
        DOCKER_TEMPLATE
    }
}

module.exports = {
    capitalize,
    execAsync,
    parse
}
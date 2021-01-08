HELP=$1

while [ $# -gt 0 ]; do

   if [[ $1 == *"-"* ]]; then
        v="${1/-/}"
        declare $v="$2"
   fi

  shift
done

MODULE_PATH=${x:-.}
INTERFACES='interfaces'
SERVICE=${s:-"REQUIRED"}
PORT=${p:-"REQUIRED"}
DATABASE=$d
AUTH=$a

if [ $HELP == "-h" ]
then
  echo ""
  echo "MSGRPC -> Generate ms with grpc and http support"
  echo ""
  echo "    [-s]=Service name without 'Service' keyword - REQUIRED"
  echo "    [-p]=Service port number - REQUIRED"
  echo "    [-i]=Service interfaces over git repository"
  echo "    [-a]=Add init auth on service, support: jwt, auth0, okta"
  echo "    [-d]=Add database configuration, support: mongodb, postgres"
  echo ""
  exit 1
fi

if [ $SERVICE == "REQUIRED" ]
  then
    echo "Missing service name with args -s"
    exit 0
fi

if [ $PORT == "REQUIRED" ]
  then
    echo "Missing service port with args -p"
    exit 0
fi

echo "GENERATE CONFIGURATION FOR" ${SERVICE}Service
mkdir -p $SERVICE
mkdir -p $SERVICE/interfaces

cp -a $MODULE_PATH/.service/. $SERVICE/.
rm -rf $SERVICE/node_modules
rm -rf $SERVICE/__tests__/*


# Initialize proto example with test call and test model
cat <<EOF >$SERVICE/$INTERFACES/$SERVICE.proto
syntax = "proto3";

import "google/protobuf/duration.proto";
import "google/protobuf/empty.proto";
import "google/api/annotations.proto";
import "validation.proto";

service ${SERVICE}Service {
  rpc test (google.protobuf.Empty) returns (Test) {
      option (google.api.http) = {
      get: "/${SERVICE}/me"
    };
  }
}

message Test {
  string id = 1;
}

EOF

# Initialize service template with test function
cat <<EOF >$SERVICE/services/$SERVICE.service.js
export default class ${SERVICE}Service {
    static proto = '${SERVICE}.proto';

    static async test() {
      return { id: 'test' };
    }
}
EOF

# Initialize test for checking if service is create i properly way, with static field 'proto'
mkdir -p $SERVICE/__tests__/services
cat <<EOF >$SERVICE/__tests__/services/$SERVICE.service.spec.js
/* eslint-disable no-undef */
import ${SERVICE}Service from '../../services/${SERVICE}.service.js';

describe('${SERVICE}.service.js', () => {
    it('If ${SERVICE}Service is initialized, static field "proto" exist in ${SERVICE}Service', () => {
        expect(${SERVICE}Service).toHaveProperty("proto");
    });
});
EOF

cat <<EOF >$SERVICE/.env.local
PORT=$PORT

EOF

if test -z "$AUTH"
    then
      echo ""
    else
       mkdir -p $SERVICE/providers
       cp -a .providers/${AUTH}/${AUTH}.js $SERVICE/providers/.
       cp -a .providers/index.${AUTH}.js $SERVICE/index.js
fi

if [[ $DATABASE == "mongodb" ]]
  then
    cp -a .database/${DATABASE}/index.js $SERVICE/models/.
    cat <<EOF >$SERVICE/models/$SERVICE.model.js
import mongoose from 'mongoose';

const ${SERVICE}Schema = new mongoose.Schema(
    {
        name: String
    }, {
        timestamps: true,
        collection: "${SERVICE}"
    }
);

const Model = mongoose.model('${SERVICE}', ${SERVICE}Schema);
export default Model;
EOF
echo "MONGO_DATABASE_URI=mongodb://localhost:27017/${SERVICE}" >>$SERVICE/.env.local
fi

if [[ $DATABASE == "postgres" ]]
  then
    cp -a .database/${DATABASE}/index.js $SERVICE/models/.
    cat <<EOF >$SERVICE/models/$SERVICE.model.js
const ${SERVICE} = (sequelize, { DataTypes }) => sequelize.define('${SERVICE}', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
});

export default ${SERVICE};
EOF
echo "POSGRES_DATABASE_URI=postgres://postgres:password@localhost:5432/${SERVICE}" >>$SERVICE/.env.local
fi

# Setup correct package json
cat <<EOF >$SERVICE/package.json
{
  "name": "${SERVICE}Service",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "lint": "eslint . --ext .js",
    "lint:fix": "eslint --fix . --ext .js",
    "test": "node --experimental-vm-modules node_modules/.bin/jest --config ./jest.config.json",
    "test:watch": "npm run test -- --watch",
    "commit": "npm run lint:fix; npm run test",
    "patch:proto-loader": "cp -a patch/. node_modules/.",
    "postinstall": "npm run patch:proto-loader; npm run lint:fix"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@grpc/grpc-js": "^1.2.2",
    "@grpc/proto-loader": "0.5.5",
    "axios": "^0.21.1",
    "correlation-id": "^4.0.0",
    "dotenv": "^8.2.0",
    "express": "^4.17.1",
    "express-jwt": "^6.0.0",
    "google-protobuf": "^3.14.0",
    "json-schema-yup-transformer": "^1.5.8",
    "jsonwebtoken": "^8.5.1",
    "jwks-rsa": "^1.12.0",
    "mongoose": "^5.11.10",
    "protobufjs": "^6.10.2",
    "project-name": "^1.0.0",
    "pg": "^8.5.1",
    "pg-connection-string": "^2.4.0",
    "sequelize": "^6.3.5",
    "winston": "^3.3.3"
  },
  "devDependencies": {
    "@babel/eslint-parser": "^7.12.1",
    "@babel/plugin-proposal-class-properties": "^7.12.1",
    "@babel/plugin-proposal-private-methods": "^7.12.1",
    "@babel/plugin-syntax-top-level-await": "^7.12.1",
    "babel-eslint": "^11.0.0-beta.2",
    "eslint": "^7.16.0",
    "eslint-config-airbnb-base": "^14.2.1",
    "eslint-plugin-babel": "^5.3.1",
    "eslint-plugin-import": "^2.22.1",
    "husky": "^4.3.6",
    "jest": "^26.6.3"
  }
}
EOF

# Setup Dockerfile
cat <<EOF >$SERVICE/Dockerfile
FROM node:15-alpine as build
RUN apk add bash
WORKDIR /src/app
COPY package*.json ./
COPY . .
RUN npm install
EXPOSE $PORT $((PORT+1))
CMD ["npm","start"]
EOF

echo "INSTALL MODULES"
cd $SERVICE
npm install
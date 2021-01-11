#Microservice GRPC/HTTP NodeJS code generator with auth, database and monolithic runner support 

>Simple, fast, and scalable code generator to quickly create a microservice application skeleton.
>
>Features:
>- GRPC and HTTP protocols
>- Express and custom middlewares support
>- Proto3 validations (request and response validations)
>- JWT and Auth0 authorization
>- MongoDB and Postgres databases support
>- Default docker configuration
>- Same project structure for all microservices
>- Run your microservices like a monolithic application

## See [examples (auth, company, employee, statistic)](https://github.com/kberbic/grpc.examples)

## How to use (NodeJS >= 14.14.0)

#### Install
    npm i @kberbic/grpc-ms -g

#### Generate a template for your first microservice

> grpc-ms -s [service name] -p [port] -d [mongodb | postgres]

    grpc-ms -s mymicro -p 8080
    grpc-ms -s mymicro -p 8080 -d monogodb // with mongodb support, need to have installed mongodb
    grpc-ms -s mymicro -p 8080 -d postgres // with postgresql support, need to have installed postgres
    
#### Generate auth service
    grpc-ms -s auth -p 8080 -a jwt
    grpc-ms -s auth -p 8080 -a auth0
    grpc-ms -s auth -p 8080 -a okta // in development
    
#### Start your service
    cd mymicro 
    npm start or npm run start:live

#### Share proto files between microservices and create connections

To call the action from other microservices, add the address of that microservice in the configuration file

> [service name]_SERVICE=[host address]:[port]/[proto name].proto

Example (.env.local)

    AUTH_SERVICE=0.0.0.0:8080/auth.proto 
    COMPANY_SERVICE=0.0.0.0:8084/company.proto
    EMPLOYEE_SERVICE=0.0.0.0:8082/employee.proto

#### Add new configuration file

    .env.[environment name]
    NODE_ENV=[environment name] npm start

Example

    echo "PORT=8080" >> .env.production
    NODE_ENV=production npm start

#### Create docker image
    docker build --tag test .
    
#### Clients
- BloomRPC (grpc) - can load proto file definition
- Postman (http)

#### Commands
    [-s] - service name without 'Service' keyword
    [-p] - service port number
    [-a] - add init auth on service, support: jwt, auth0, okta
    [-d] - add database configuration, support: mongodb, postgres
    [-h] - help

## How to run all your microservices like monolithic application in the same process (for easy development and debugging)

Open one microservice and add a new configuration file named '.env.mono'.
In that file, add configuration for all microservices, for example

    PORT=8086
    JWT_SECRET=232342342345345345
    MONGO_DATABASE_URI=mongodb://localhost:27017/microservices
  
#### Run the monolithic application (in the same process on the same port)

    cd mymicro
    npm start -- mono

## Documentation

### How it works

After you select your configuration, a generator will generate a skeleton for your microservice project. The project contains minimal setup to start with development, and it contains the next structure:
- __ tests___
- errors
- interfaces
- models
- modules
- providers (if generator is run with command’-a jwt’ or ‘-a auth0’)
- patch
- server
- services

#### __ tests___

Great place for tests with a unique names and correct folder structure. Jest is the test engine for all tests in a project. The extension for all tests is ‘’.spec.js’. This means that jest will try to run all files that end with extensions ‘.spec.js’.

Run tests

	npm test

Run tests in watch mode

	npm test:watch

#### errors

Contains errors implementation. By default generator will generate next files:
- internal.error.js - Server Error, REST (500)
- notfound.error.js - Not Found, REST (204)
- invalidarguments.error.js - Bad Request, REST (400)
- unauthenticated.error.js - Unauthenticated, REST (401)
- unauthorized.error.js - Unauthorized - , REST (403)

To define a new error, it’s enough to create file ‘your error name’.error.js in error folder and extend ServiceError imported from ‘./service.error.js’, like in the next example:
```
import ServiceError from '../server/service.error.js';

export default class ExampleError extends ServiceError {
  constructor(message) {
    super(ServiceError.GRPC_CODES.NOT_FOUND, message);
  }
}
```

###### GRPC -> HTTP response mapping

| GRPC | HTTP | GRPC Description    | Implemented errors    |
|------|------|---------------------|-----------------------|
| 0    | 200  | OK                  |                       |
| 1    | 500  | CANCELLED           |                       |
| 2    | 500  | UNKNOWN             |                       |
| 3    | 400  | INVALID_ARGUMENT    | InvalidArgumentsError |
| 4    | 500  | DEADLINE_EXCEEDED   |                       |
| 5    | 204  | NOT_FOUND           | NotFoundError         |
| 6    | 400  | ALREADY_EXISTS      |                       |
| 7    | 403  | PERMISSION_DENIED   | UnauthorizedError     |
| 8    | 429  | RESOURCE_EXHAUSTED  |                       |
| 9    | 400  | FAILED_PRECONDITION |                       |
| 10   | 500  | ABORTED             |                       |
| 11   | 400  | OUT_OF_RANGE        |                       |
| 12   | 404  | UNIMPLEMENTED       |                       |
| 13   | 500  | INTERNAL            | InternalError         |
| 14   | 404  | UNAVAILABLE         |                       |
| 15   | 500  | DATA_LOSS           |                       |
| 16   | 401  | UNAUTHENTICATED     | UnauthenticatedError  |

#### interfaces

In this folder, a generator will create an init proto file. That proto file contains an example of how to defined models and actions for your service, auth example.
```
syntax = "proto3";

import "google/protobuf/duration.proto";
import "google/protobuf/empty.proto";
import "google/api/annotations.proto";
import "validation.proto";

service authService {
  rpc login (Login) returns (Token) {
    option (google.api.http) = {
      post: "/auth/login",
      body: "*"
    };
  }

  rpc profile (google.protobuf.Empty) returns (Profile) {
    option (google.api.http) = {
      get: "/auth/me"
    };
  }
}

message UserId {
  string id = 1 [(validation.required)=true, (validation.max)=255];
}

message Login {
  string email = 1 [(validation.required)=true, (validation.max)=255];
  string password = 2 [(validation.required)=true, (validation.max)=255, (validation.min)=8];
}

message Token {
  string id = 1 [(validation.required)=true];
  string token = 2 [(validation.required)=true];
}
```

For more details about proto3:
> https://developers.google.com/protocol-buffers/docs/overview

###### validations

For now only supported:
- validation.required,
- validation.min (string, number),
- validation.max (string, number),
- validation.pattern,
- validation.email,
- validation.matches,
- validation.url,
- validation.lowercase,
- validation.uppercase,
- validation.trim

###### how to use in proto:

```
message EmployeeList {
  repeated Employee employees = 1 [(validation.required)=true];
}

message Employee {
  string id=1;
  string name = 2 [(validation.required)=true, (validation.max)=255];
  string address = 3 [(validation.required)=true, (validation.max)=255];
  string companyId = 4 [(validation.required)=true, (validation.max)=255];
}
```

### models

All database models need to be defined in this folder. Main file ‘index.js’ has discovery model implementation and action for connection on db. Currently, the generator supports two databases only, MongoDB and PostgreSQL. New support can be implemented in the same way as these two databases. The main action in this file is the ‘init’ function that contains logic for database connection
```
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

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
    process.env.MONGO_DATABASE_URI,
    {useNewUrlParser: true, useUnifiedTopology: true});

export default models;

```

#### modules (Middleware’s)

By default, this folder will contain Correlation (npm correlation-id) middleware. Middleware implementation is similar to Express. The main difference is that GRPC does not have response arguments in functions. Example of JWT middleware:
```
export default function jwt(publics = []) {
  if(!process.env.JWT_SECRET)
      throw new Error("Please provide configuration field 'JWT_SECRET'");

  return (req, next) => {
    if (req.call
            && req.call.handler
            && publics.find((x) => x === req.call.handler.path)) return next();

    if (!req.metadata
            || !req.metadata.internalRepr
            || !req.metadata.internalRepr.has('authorization')
            || !req.metadata.internalRepr.get('authorization')[0]
    ) return next(new UnauthorizedError());

    return webtoken.verify(
      req.metadata.internalRepr.get('authorization')[0],
      process.env.JWT_SECRET,
      (err, decoded) => {
        if (err) next(new UnauthorizedError());

        req.user = decoded.data;
        next();
      },
    );
  };
}

```

#### patch

Will apply and fix the issue with loading proto files for ‘@grpc/proto-loader’. This issue is related to loading proto field options, that is required to support proto validations.
#### server (Magic)

- https://grpc.github.io/grpc/node/grpc.html
- https://expressjs.com/

#### services

Service example can be found in service folder

```
import db from '../models/index.js';

export default class employeeService {
    static proto = 'employee.proto';

    static async create(employee) {
      const { companyService } = process.client;

      const company = await companyService.get({ id: employee.companyId }, this.metadata);
      const output = await (new db.Employee({ userId: this.user.id, ...employee, company })).save();

      return { id: output._id };
    }

    static async list({ companyId }) {
      const { companyService } = process.client;

      const company = await companyService.get({ id: companyId }, this.metadata);
      const employees = await db.Employee.find({ userId: this.user.id, companyId: company._id });

      return { employees };
    }
}

```

#### index.js (Exec)

    TODO


## TODO
>- Add tests and improve code coverage (missing: grpc, rest, auth)
>- Update documentation
>- More validation rules
>- Custom validation message support
>- Auto include modules from modules folder
>- Update examples
>- Terraform for deployments
>- Intellij plugin
>- Upgrade support
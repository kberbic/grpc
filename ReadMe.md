#Microservice GRPC/HTTP NodeJS code generator with auth and database support 

>Simple, fast, and scalable code generator for quickly create an microservice application skeleton.
>
>Features:
>- GRPC and HTTP protocols
>- Add support for express and custom middlewares
>- Add proto3 validations
>- JWT and Auth0 authorization
>- MongoDB and Postgres databases
>- Same project structure for all microservices
>- Run you microservices like monolithic application

### <p style='color:red'>Required NodeJS >= 14.14.0</p>

## See [examples (auth, company, employee, statistic)](https://github.com/kberbic/grpc.examples)

## How to use

#### Install
    npm i @kberbic/grpc-ms -g

#### Generate template for your first microservice

> grpc-ms -s [service name] -p [port]

    grpc-ms -s mymicro -p 8080
    grpc-ms -s mymicro -p 8080 -d monogodb // with mongodb support
    grpc-ms -s mymicro -p 8080 -d postgres // with postgresql support
    
#### Generate auth service
    grpc-ms -s auth -p 8080 -a jwt
    grpc-ms -s auth -p 8080 -a auth0
    grpc-ms -s auth -p 8080 -a okta // in development
    
#### Start your service
    cd mymicro 
    npm start

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

## How to run all your microservices like monolithic application in same process (for easy development and debugging)

Open one microservice and add new configuration file named '.env.mono'.
In that file, add configuration for all microservices, example

    PORT=8086
    JWT_SECRET=232342342345345345
    MONGO_DATABASE_URI=mongodb://localhost:27017/microservices
  
#### Run monolithic application (in same process on same port)

    cd mymicro
    nano start -- mono

## Documentation

### Project structure
|            | Description                                                | Comment |
|------------|------------------------------------------------------------|---------|
| clients    | MS client implementation, it's only support grpc           |         |
| errors     | Error classes implementation                               |         |
| interfaces | All proto3 definition files                                |         |
| __ tests__ | Tests implementation                                       |         |
| models     | Database models                                            |         |
| modules    | Modules or middlewares                                     |         |
| patch      |                                                            |         |
| server     | Server implementation                                      |         |
| services   | Proto3 service implementation                              |         |

#### Proto

Proto example can be found in interfaces folder
```
syntax = "proto3";

import "google/protobuf/duration.proto";
import "google/protobuf/empty.proto";
import "google/api/annotations.proto";
import "validation.proto";

service employeeService {
  rpc create (Employee) returns (Create) {
      option (google.api.http) = {
      post: "/employee",
      body: "*"
    };
  }

  rpc list (EmployeeQuery) returns (EmployeeList) {
    option (google.api.http) = {
      get: "/employee/:companyId"
    };
  }
}

message Create {
  string id = 1;
}

message EmployeeQuery {
  string companyId = 1;
}

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

#### Service

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

#### Middlewares

This is implemented in similar way like Express implement on their side

```
process.client = await new GRPCClient().load();
const { authService } = process.client;
const auth = (req, next) => authService
  .profile(req.metadata)
// eslint-disable-next-line no-return-assign
  .then((user) => { req.user = user; next(); })
  .catch(next);

async function start() {
  const grpc = new GRPCServer({
    modules: [correlation, auth], // middlewares
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

```

#### Validations with proto

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

How to use in proto:

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

#### Errors

All implemented error classes are in "errors" folder and any new error implementation need to extend ServiceError [service.error.js]

###### Example
    
    import ServiceError from './service.error.js';
    
    export default class MyCustomError extends ServiceError {
        constructor(message) {
            super(ServiceError.GRPC_CODES.NOT_FOUND, message);
        }
    }

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

## Support
- GRPC
- HTTP
- Proto3
- Request/Response validations


## TODO
- Add tests and improve code coverage (missing: grpc, rest, auths)
- Update documentation
- Add more validation rules
- Update documentation for examples
- Add terraform support
- Upgrade support
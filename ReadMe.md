#Microservice GRPC/Express NodeJS Template with auth support: jwt, auth0, okta) 

## !!! Still under development - [Alpha 0.0.1] !!!

### How to use

#### Install
    npm i @kberbic/grpc-ms -g

#### Generate template for your first microservice
    grpc-ms -s test -p 8080
    
#### Generate auth service
    grpc-ms -s auth -p 8080 -a jwt
    grpc-ms -s auth -p 8080 -a auth0
    grpc-ms -s auth -p 8080 -a okta // in development
    
#### Start your service
    cd test
    npm start
    
#### Commands
    [-s] - service name without 'Service' keyword
    [-p] - service port number
    [-i] - service interfaces over git repository
    [-a] - add init auth on service, support: jwt, auth0, okta
    [-h] - help

## Documentation

### Validations
https://github.com/ritchieanesco/json-schema-yup-transform, 
For now only supported: 
- required, 
- min (string, number), 
- max (string, number), 
- pattern, 
- email, 
- matches, 
- url, 
- lowercase, 
- uppercase, 
- trim

### Errors

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
- Add more examples, and update documentation for examples
- Add deployment example
- Add example with MongoDB, Postgres
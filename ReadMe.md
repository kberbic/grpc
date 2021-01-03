#Microservice GRPC/Express NodeJS Template with auth support: jwt, auth0, okta) 

## !!! Still under development - [Alpha 0.0.1] !!!

### How to use

#### Install
    npm i @kberbic/grpc-ms -g

#### Generate template for your first microservice
    grpc-ms -s test -p 8080
    
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
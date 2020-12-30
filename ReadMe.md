#[Alpha 0.0.1]  Microservice GRPC/Express NodeJS Template with auth(jwt, auth0, okta) 

## Support
- GRPC
- HTTP
- proto3
- request/response validation

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

## TODO
- Add tests and improve code coverage
- Update documentation
- Add more validation rules
- Add more examples, and update documentation in examples
- Add deployment example
- Deploy like npm package
- Add example with MongoDB, Postgres

### Your first micro service

    curl -LJ0 https://github.com/kberbic/grpc/archive/master.zip | tar -xf - --strip=1; chmod +x ms.sh; ./ms.sh -s test -p 8080
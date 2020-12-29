import {default as convertToYup} from "json-schema-yup-transformer";
import protobufjs from 'protobufjs';

const {types} = protobufjs;

const _mappers = {
    "(google.api.http)": true,
}

const _jsonSchema = {
    type: "object",
    $schema: "http://json-schema.org/draft-07/schema#",
    $id: null,
    properties: {},
    required: []
}

class Routes {

    load(root, proto, address) {
        return Object.keys(root).reduce((methods,serviceKey)=> {
            if (!root[serviceKey] || !root[serviceKey].methods)
                return methods;

            const innerMethods = Object.keys(root[serviceKey].methods).reduce((methods, fieldKey) => {
                const options = root[serviceKey].methods[fieldKey].parsedOptions;
                if (!options)
                    return methods;

                const routes = root[serviceKey].methods[fieldKey]
                    .parsedOptions.reduce((route, option) => {
                        const [key] = Object.keys(option);
                        if(!_mappers[key])
                            return route;

                        const val = option[key];
                        route.push({
                            service: serviceKey,
                            method: fieldKey,
                            path: getPath(val),
                            type: getMethod(val),
                            map: getMap(val),
                            proto,
                            address
                        })

                        return route;
                    }, []);

                methods = methods.concat(routes);
                return methods;
            }, []);

            methods = methods.concat(innerMethods);
            return methods;
        }, []);
    }
}

function getMethod(input) {
    if(input.post)
        return "post";

    if(input.get)
        return "get";

    if(input.put)
        return "put";

    if(input.delete)
        return "delete";

    return null;
}

function getPath(input) {
    if(input.post)
        return input.post;

    if(input.get)
        return input.get;

    if(input.put)
        return input.put;

    if(input.delete)
        return input.delete;

    return null;
}

function getMap(input) {
    if(input.post)
        return ["query","params", "body"];

    if(input.get)
        return ["query","params"];

    if(input.put)
        return ["query","params", "body"];

    if(input.delete)
        return ["query","params", "body"];

    return [];
}

export default new Routes();
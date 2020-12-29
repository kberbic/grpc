import {default as convertToYup} from "json-schema-yup-transformer";
import protobufjs from 'protobufjs';

const {types} = protobufjs;

const _mappers = {
    "(validation.required)": {name: "required", type: Boolean},
    "(validation.lt)": {name: "lt", type: Number},
    "(validation.gt)": {name: "gt", type: Number},
    "(validation.email)": {name: "email"},
}

class Validation {

    load(root) {
        return Object.keys(root).reduce((rule,key)=> {
            if (!root[key] || !root[key].fields)
                return rule;

            const rules = Object.keys(root[key].fields).reduce((valid, fieldKey) => {
                const options = root[key].fields[fieldKey].parsedOptions;
                if (!options)
                    return valid;

                const rules = root[key].fields[fieldKey]
                    .parsedOptions.reduce((rules, option) => {
                        const [key] = Object.keys(option);
                        const val = option[key];
                        const mapper = _mappers[key];
                        rules[mapper.name] = mapper.type ? mapper.type(val) : val.toString();
                        return rules;
                    }, {});


                valid.properties[fieldKey] = {type: typeof types.defaults[root[key].fields[fieldKey].type]};
                if(rules.required)
                    valid.required.push(fieldKey);


                return valid;
            }, {
                type: "object",
                $schema: "http://json-schema.org/draft-07/schema#",
                $id: key,
                properties: {},
                required: []
            });
            rule[key] = convertToYup.default(rules);
            return rule;
        }, {});
    }
}

export default new Validation();
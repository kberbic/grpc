import convertToYup from 'json-schema-yup-transformer';
import protobufjs from 'protobufjs';

const { types } = protobufjs;

const MAPPERS = {
  '(validation.required)': { name: 'required', type: Boolean },
  '(validation.lt)': { name: 'lt', type: Number },
  '(validation.gt)': { name: 'gt', type: Number },
  '(validation.email)': { name: 'email' },
};

class Validation {
  #rules;

  load(root) {
    this.#rules = Object.keys(root).reduce((rule, key) => {
      if (!root[key] || !root[key].fields) return rule;

      const validationRules = Object.keys(root[key].fields).reduce((valid, fieldKey) => {
        const options = root[key].fields[fieldKey].parsedOptions;
        if (!options) return valid;

        const propRules = root[key].fields[fieldKey]
          .parsedOptions.reduce((rules, option) => {
            const [inKey] = Object.keys(option);
            const val = option[inKey];
            const mapper = MAPPERS[inKey];
            rules[mapper.name] = mapper.type ? mapper.type(val) : val.toString();
            return rules;
          }, {});

        valid.properties[fieldKey] = {
          type: typeof types.defaults[root[key].fields[fieldKey].type],
        };
        if (propRules.required) valid.required.push(fieldKey);

        return valid;
      }, {
        type: 'object',
        $schema: 'http://json-schema.org/draft-07/schema#',
        $id: key,
        properties: {},
        required: [],
      });
      rule[key] = convertToYup.default(validationRules);
      return rule;
    }, {});

    return this.#rules;
  }
}

export default new Validation();

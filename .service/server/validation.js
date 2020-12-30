import convertToYup from 'json-schema-yup-transformer';
import protobufjs from 'protobufjs';

const { types } = protobufjs;

const MAPPERS = {
  '(validation.required)': { name: 'required' },
  '(validation.min)': { name: 'min', type: Number },
  '(validation.max)': { name: 'max', type: Number },
  '(validation.email)': { name: 'email' },
  '(validation.pattern)': { name: 'pattern' },
  '(validation.matches)': { name: 'matches' },
  '(validation.url)': { name: 'url' },
  '(validation.lowercase)': { name: 'lowercase' },
  '(validation.uppercase)': { name: 'uppercase' },
  '(validation.trim)': { name: 'trim' },
};

class Validation {
  #rules = null;

  load(root) {
    if(!root)
      return this.#rules;

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

        valid.properties[fieldKey] = this.#check(valid, propRules, root, key, fieldKey);
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

  #check (valid, propRules, root, key, fieldKey) {
    const props = {
      type: typeof types.defaults[root[key].fields[fieldKey].type],
    };

    if (propRules.required) {
      props.required = true;
      valid.required.push(fieldKey);
    }

    if (propRules.pattern) props.pattern = propRules.pattern;

    if (propRules.email) props.format = 'email';

    if (propRules.url) props.format = 'url';

    if (propRules.matches) props.matches = propRules.matches;

    if (propRules.lowercase) props.lowercase = true;

    if (propRules.uppercase) props.uppercase = true;

    if (propRules.trim) props.trim = true;

    if (propRules.min) props[props.type === 'string' ? 'minLength' : 'min'] = propRules.min;

    if (propRules.max) props[props.type === 'string' ? 'maxLength' : 'max'] = propRules.max;

    return props;
  }
}

export default new Validation();

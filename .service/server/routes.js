const MAPPERS = {
  '(google.api.http)': true,
};

class Routes {
  load(definition, proto, address) {
    if (!definition) return [];

    const root = definition.nested || definition;
    return Object.keys(root).reduce((methods, serviceKey) => {
      if (!root[serviceKey] || !root[serviceKey].methods) return methods;

      const innerMethods = Object.keys(root[serviceKey].methods).reduce((outMethods, fieldKey) => {
        const options = root[serviceKey].methods[fieldKey].parsedOptions;
        if (!options) return outMethods;

        const routes = root[serviceKey].methods[fieldKey]
          .parsedOptions.reduce((route, option) => {
            const [key] = Object.keys(option);
            if (!MAPPERS[key]) return route;

            const val = option[key];
            route.push({
              service: serviceKey,
              method: fieldKey,
              path: this.#getPath(val),
              type: this.#getMethod(val),
              map: this.#getMap(val),
              proto,
              address,
            });

            return route;
          }, []);

        outMethods = outMethods.concat(routes);
        return outMethods;
      }, []);

      methods = methods.concat(innerMethods);
      return methods;
    }, []);
  }

  #getMethod (input) {
    if (input.post) return 'post';

    if (input.get) return 'get';

    if (input.put) return 'put';

    if (input.delete) return 'delete';

    return null;
  }

  #getPath (input) {
    if (input.post) return input.post;

    if (input.get) return input.get;

    if (input.put) return input.put;

    if (input.delete) return input.delete;

    return null;
  }

  #getMap (input) {
    if (input.post) return ['query', 'params', 'body'];

    if (input.get) return ['query', 'params'];

    if (input.put) return ['query', 'params', 'body'];

    if (input.delete) return ['query', 'params', 'body'];

    return [];
  }
}

export default new Routes();

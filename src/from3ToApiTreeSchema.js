/**
 * @private
 */
function flatten(tree, definitions) {
  if (Array.isArray(tree)) {
    return tree.map((t) => flatten(t, definitions));
  } else if (Object(tree) === tree) {
    return Object.entries(tree).reduce((accumulator, [k, v]) => {
      if (k === '$ref') {
        const key = v.split('/').slice(-1);

        if (definitions.hasOwnProperty(key)) {
          return Object.assign(accumulator, flatten(definitions[key], definitions));
        }
      }

      return Object.assign(accumulator, {[k]: flatten(v, definitions)});
    }, {});
  }

  return tree;
}

const interpolationPattern = /^\{.+\}$/;
const interpolationReplacePattern = /\{(.+?)\}/g;

function convertPathname(pathname) {
  return pathname.replace(interpolationReplacePattern, (match, capture) => {
    return `:${capture}`;
  });
}

/**
 * @private
 */
function ensureTree(root, pathname) {
  const parts = pathname.split('/').filter((p) => p && !p.match(interpolationPattern));

  return parts.reduce((node, p) => {
    node[p] = node[p] || {};

    return node[p];
  }, root);
}

/**
 * @private
 */
function convertAction(pathname, [method, configuration], include) {
  if (include.validation !== false) {
    const schema = {
      $schema: "http://json-schema.org/draft-07/schema#",
      title: configuration.operationId,
      description: configuration.description,
      type: 'object',
      properties: {
        body: {
          type: 'object',
          properties: {},
          required: [],
          additionalProperties: false,
        },
        params: {
          type: 'object',
          properties: {},
          required: [],
          additionalProperties: false,
        },
      },
    };
    const parameters = configuration.parameters || [];
    const requestBody = configuration.requestBody || {};

    parameters.forEach((p) => {
      if (p.required) {
        schema.properties.params.required.push(p.name);
      }

      schema.properties.params.properties[p.name] = Object.assign({
        description: p.description
      }, p.schema);
    });

    const content = requestBody.content || {};
    const contentTypes = Object.keys(content);
    const bodySchemas = Object.values(content).map((c) => c.schema).map((c) => {
      if (c.properties) {
        return Object.assign({}, c, {type: 'object'});
      }

      return c;
    });

    if (contentTypes.length === 1 && contentTypes[0] === 'application/json') {
      schema.properties.body = bodySchemas[0];
    } else if (contentTypes.length > 0) {
      schema.properties.body = {};
    }

    const output = [
      convertPathname(pathname),
      {method: method.toUpperCase()},
      JSON.parse(JSON.stringify(schema)),
    ];

    if (contentTypes.length) {
      const headers = output[1].headers = output[1].headers || {};

      headers['Content-Type'] = contentTypes[0];
    }

    return output;
  }

  return [
    convertPathname(pathname),
    {method: method.toUpperCase()},
  ];
}

function isOverload(data) {
  return Array.isArray(data) && Array.isArray(data[0]);
}

/**
 * @private
 */
export default function from3ToApiTreeSchema(schema, include = {}) {
  const {paths, components = {}} = schema;
  const base = schema.servers[0].url;

  return {
    base,
    tree: Object.entries(flatten(paths, components.schemas || {}))
    .reduce((root, [pathname, actions]) => {
      const leaf = ensureTree(root, pathname);

      Object.entries(actions).forEach((entry) => {
        const method = entry[0];
        const action = convertAction(pathname, entry, include)

        if (leaf.hasOwnProperty(method)) {
          if (isOverload(leaf[method])) {
            leaf[method].push(action);
          } else {
            leaf[method] = [leaf[method], action];
          }
        } else {
          leaf[method] = action;
        }
      });

      return root;
    }, {})
  };
}

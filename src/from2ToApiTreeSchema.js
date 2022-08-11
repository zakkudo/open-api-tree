//https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md

/**
 * @private
 */
function flatten(tree, definitions, _refs = null) {
	if(!_refs) // detect circular reference
		_refs = new WeakSet();

	if (Array.isArray(tree)) {
		return tree.map(t => flatten(t, definitions));
	} else if (Object(tree) === tree) {
		return Object.entries(tree).reduce((accumulator, [k, v]) => {
			if (k === '$ref') {
				const key = v.split('/').slice(-1);
				const model = definitions[key];

				if (definitions.hasOwnProperty(key) && !_refs.has(model)) {
					_refs.add(model);
					return Object.assign(accumulator, flatten(model, definitions, _refs));
				}
			}

			return Object.assign(accumulator, { [k]: flatten(v, definitions, _refs) });
		}, {});
	}

	return tree;
}

const interpolationPattern = /^\{.+\}$/;
const interpolationReplacePattern = /\{(.+?)\}/g;

/**
 * @private
 */
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

const basicTypes = new Set([
  'string',
  'number',
  'float',
  'integer',
  'object',
  'array',
  'boolean',
  'null',
]);

/**
 * @private
 */
function toJsonSchemaProperty(property) {
  const {
    name,
    additionalProperties,
    in: _in,
    required,
    collectionFormat,
    schema = {},
    ...leftover
  } = property;
  const type = leftover.type || schema.type;

  if (!type || basicTypes.has(type)) {
    return Object.assign({}, leftover, schema)
  }

  return {}; //For unknown types allow anything
}

/**
 * @private
 */
function getContentType(consumes) {
  return consumes && consumes[0];
}

/**
 * @private
 */
function convertAction(pathname, [method, configuration], include, fullSchema) {
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
      }
    };
    const parameters = configuration.parameters || [];
    const contentType = getContentType(configuration.consumes) || getContentType(fullSchema.consumes);

    parameters.forEach((p) => {
      if (p.in === 'body' || p.in === 'formData') {
        schema.properties.body = toJsonSchemaProperty(p);
      } else {
        if (p.required) {
          schema.properties.params.required.push(p.name);
        }

        schema.properties.params.properties[p.name] = toJsonSchemaProperty(p);
      }
    });

    const output = [
      convertPathname(pathname),
      {method: method.toUpperCase()},
      JSON.parse(JSON.stringify(schema)),
    ];

    if (contentType) {
      const headers = output[1].headers = output[1].headers || {};

      headers['Content-Type'] = contentType;
    }

    return output;
  }

  return [
    convertPathname(pathname),
    {method: method.toUpperCase()},
  ];
}

/**
 * @private
 */
function isOverload(data) {
  return Array.isArray(data) && Array.isArray(data[0]);
}

/**
 * @private
 */
export default function from2ToApiTreeSchema(schema, include = {}) {
  const {schemes = ['https'], host, basePath, paths, definitions = {}} = schema;
  const base = `${schemes[0]}://${host}${basePath}`;

  return {
    base,
    tree: Object.entries(flatten(paths, definitions)).reduce((root, [pathname, actions]) => {
      const leaf = ensureTree(root, pathname);

      Object.entries(actions).forEach((entry) => {
        const method = entry[0];
        const action = convertAction(pathname, entry, include, schema)

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

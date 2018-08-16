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
function toJsonSchemaProperty(property) {
    const {name, additionalProperties, in: _in, required, collectionFormat, schema, ...leftover} = property;

    return Object.assign({}, leftover, schema)
}

/**
 * @private
 */
function convertAction(pathname, [method, configuration]) {
    const normalizedPathName = pathname.replace(/\{(.+?)\}/, (match, capture) => {
        return `:${capture}`;
    });
    const schema = {
        body: {
            $schema: "http://json-schema.org/draft-07/schema#",
            title: configuration.operationId,
            description: configuration.description,
            type: 'object',
            properties: {},
            required: [],
            additionalProperties: false,
        },
        params: {
            $schema: "http://json-schema.org/draft-07/schema#",
            title: configuration.operationId,
            description: configuration.description,
            type: 'object',
            properties: {},
            required: [],
            additionalProperties: false,
        },
    };
    const parameters = configuration.parameters || [];

    parameters.forEach((p) => {
        const key = (p.in === 'body') && 'body' || 'params';

        if (p.required) {
            schema[key].required.push(p.name);
        }

        schema[key].properties[p.name] = toJsonSchemaProperty(p);
    });

    return [
        normalizedPathName,
        {method: method.toUpperCase()},
        schema,
    ];
}

/**
 * @private
 */
export default function from2ToApiTreeSchema(schema) {
    const {schemes, host, basePath, paths, definitions} = schema;
    const base = `${schemes[0]}://${host}${basePath}`;

    return Object.entries(flatten(paths, definitions)).reduce((root, [pathname, actions]) => {
        const leaf = ensureTree(root, pathname);

        Object.entries(actions).forEach((entry) => {
            leaf[entry[0]] = convertAction(pathname, entry);
        });

        return root;
    }, {});
}

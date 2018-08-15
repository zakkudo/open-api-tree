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

/**
 * @private
 */
function ensureTree(root, pathname) {
    const parts = pathname.split('/').filter((p) => p);

    return parts.reduce((node, p) => {
        node[p] = node[p] || {};

        return node[p];
    }, root);
}

/**
 * @private
 */
function toJsonSchemaProperty(property) {
    const {name, in: _in, required, collectionFormat, schema, ...leftover} = property;

    return Object.assign({}, leftover, schema)
}

/**
 * @private
 */
function convertAction(pathname, [method, configuration]) {
    const schema = {
        "$schema": "http://json-schema.org/draft-07/schema#",
        title: configuration.operationId,
        description: configuration.description,
        type: 'object',
        body: {
            type: 'object',
            properties: {},
            required: []
        },
        params: {
            type: 'object',
            properties: {},
            required: [],
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
        pathname,
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
        console.log('ROOT', JSON.stringify(root, null, 4));

        Object.assign(leaf, Object.entries(actions).reduce((root, entry) => {
            return Object.assign({}, root, convertAction(pathname, entry));
        }, {}));

        return root;
    }, {});
}

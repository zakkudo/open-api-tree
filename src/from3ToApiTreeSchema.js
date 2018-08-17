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
function convertAction(pathname, [method, configuration]) {
    const schema = {
        $schema: "http://json-schema.org/draft-07/schema#",
        title: configuration.operationId,
        description: configuration.description,
        type: 'object',
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
    };
    const parameters = configuration.parameters || [];
    const requestBody = configuration.requestBody || {};

    parameters.forEach((p) => {
        if (p.required) {
            schema.params.required.push(p.name);
        }

        schema.params.properties[p.name] = Object.assign({description: p.description}, p.schema);
    });

    const content = requestBody.content || {};
    const bodySchemas = Object.values(content).map((c) => c.schema).map((c) => {
        if (c.properties) {
            return Object.assign({}, c, {type: 'object'});;
        }

        return c;
    });
    schema.body = bodySchemas[0]

    return [
        pathname,
        {method: method.toUpperCase()},
        JSON.parse(JSON.stringify(schema)),
    ];
}

function isOverload(data) {
    return Array.isArray(data) && Array.isArray(data[0]);
}

/**
 * @private
 */
export default function from3ToApiTreeSchema(schema) {
    const {schemes, host, basePath, paths, components = {}} = schema;
    const base = schema.servers;

    return Object.entries(flatten(paths, components.schemas || {})).reduce((root, [pathname, actions]) => {
        const leaf = ensureTree(root, pathname);

        Object.entries(actions).forEach((entry) => {
            const method = entry[0];
            const action = convertAction(pathname, entry)

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
    }, {});
}

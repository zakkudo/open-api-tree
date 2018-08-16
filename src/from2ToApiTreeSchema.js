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
class PathnameTemplate {
    /**
     * @private
     */
    constructor(pathname) {
        const signature = this.signature = [];

        this.pathname = pathname.replace(/\{(.+?)\}/g, (match, capture) => {
            signature.push(capture);

            return `:${capture}`;
        });
    }

    /**
     * @private
     */
    toString() {
        return this.pathname;
    }

    /**
     * @private
     */
    toJSON() {
        return this.toString();
    }
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

    parameters.forEach((p) => {
        const key = (p.in === 'body') && 'body' || 'params';

        if (p.required) {
            schema[key].required.push(p.name);
        }

        schema[key].properties[p.name] = toJsonSchemaProperty(p);
    });

    return [
        new PathnameTemplate(pathname),
        {method: method.toUpperCase()},
        JSON.parse(JSON.stringify(schema)),
    ];
}

function shouldOverload(data) {
    return Array.isArray(data) && data[0] instanceof  PathnameTemplate;
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
            const method = entry[0];
            const action = convertAction(pathname, entry)

            if (leaf.hasOwnProperty(method)) {
                if (shouldOverload(leaf[method])) {
                    leaf[method] = [leaf[method], action];
                } else {
                    leaf[method].push(action);
                }
            } else {
                leaf[method] = action;
            }
        });

        return root;
    }, {});
}

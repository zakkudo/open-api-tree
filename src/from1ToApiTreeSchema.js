/**
 * @private
 */
function flatten(tree, models) {
    const flattenedModels = flattenModelInheritance(models);

    return flattenTree(tree, flattenedModels);
}

/**
 * @private
 */
function flattenModelInheritance(models) {
    const copy = JSON.parse(JSON.stringify(models));
    const keys = Object.keys(copy);
    const inherits = keys.reduce((accumulator, k) => {
        return Object.assign({}, accumulator, {[k]: []});
    }, {});

    Object.entries(copy).forEach(([k, model]) => {
        const subTypes = model.subTypes || [];

        subTypes.forEach((t) => {
            inherits[t].push(k);
        });

        delete model.subTypes;
        delete model.discriminator;
    });

    function merge(model, chain) {
        return chain.reduce((accumulator, c) => {
            const subchain = inherits[c];

            accumulator.required = (accumulator.required || []).concat(copy[c].required || []);
            accumulator.properties = Object.assign(
                {},
                copy[c].properties || {},
                accumulator.properties || {}
            );

            return merge(accumulator, subchain);
        }, model);
    }

    return Object.entries(inherits).reduce((accumulator, [k, chain]) => {
        return Object.assign({}, accumulator, {[k]: merge(copy[k], chain)});
    }, {});
}

/**
 * @private
 */
function flattenTree(tree, models) {
    if (Array.isArray(tree)) {
        return tree.map((t) => flattenTree(t, models));
    } else if (Object(tree) === tree) {
        return Object.entries(tree).reduce((accumulator, [k, v]) => {
            if (k === '$ref' || k === 'type') {
                if (models.hasOwnProperty(v)) {
                    return Object.assign(accumulator, flattenTree(models[v], models));
                }
            }

            return Object.assign(accumulator, {[k]: flattenTree(v, models)});
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
        paramType,
        required,
        id,
        subTypes,
        discriminator,
        ...leftover
    } = property;
    const type = leftover.type;

    if (!type || basicTypes.has(type)) {
        return Object.assign({}, leftover)
    }

    return {}; //For unknown types allow anything
}

/**
 * @private
 */
function convertAction(pathname, configuration) {
    const method = configuration.method;
    const schema = {
        $schema: "http://json-schema.org/draft-07/schema#",
        title: configuration.nickname,
        description: configuration.summary,
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

    parameters.forEach((p) => {
        if (p.paramType === 'body' || p.paramType === 'formData') {
            schema.properties.body = toJsonSchemaProperty(p);
            if (p.paramType === 'body') {
                schema.properties.body.type = schema.properties.body.type || 'object';
            }
        } else {
            if (p.required) {
                schema.properties.params.required.push(p.name);
            }

            schema.properties.params.properties[p.name] = toJsonSchemaProperty(p);
        }
    });

    return [
        convertPathname(pathname),
        {method: method.toUpperCase()},
        JSON.parse(JSON.stringify(schema)),
    ];
}

function isOverload(data) {
    return Array.isArray(data) && Array.isArray(data[0]);
}

function removeResourcePath(resourcePath, path) {
    if (path.startsWith(resourcePath)) {
        return path.slice(resourcePath.length);
    }

    return path;
}

/**
 * @private
 */
export default function from1ToApiTreeSchema(schema) {
    const {basePath, resourcePath = '', apis, models = {}} = schema;
    const base = basePath + resourcePath;
    const pattern = new RegExp(resourcePath)

    return {
        base,
        tree: flatten(apis, models).reduce((root, api) => {
            const pathname = removeResourcePath(resourcePath, api.path);
            const leaf = ensureTree(root, pathname);

            api.operations.forEach((o) => {
                const method = o.method.toLowerCase();
                const action = convertAction(pathname, o)

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

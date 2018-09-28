/**
 * @module @zakkudo/open-api-tree
 */

/**
 * Executes the network request using the api tree configuration. Generated from the triplets of the form
 * `[url, options, jsonschema]` where only url is required.
 * @callback module:@zakkudo/open-api-tree~OpenApiTree~FetchFunction
 * @param {module:@zakkudo/open-api-tree~OpenApiTree~Options} [options] - The override options for the final network call
 * @param {Boolean} [validate = true] - Set to false to force validation to be skipped, even if there is a schema
 */

/**
 * Options modifying the network call, mostly analogous to fetch
 * @typedef {Object} module:@zakkudo/open-api-tree~OpenApiTree~Options
 * @property {String} [options.method='GET'] - GET, POST, PUT, DELETE, etc.
 * @property {String} [options.mode='same-origin'] - no-cors, cors, same-origin
 * @property {String} [options.cache='default'] - default, no-cache, reload, force-cache, only-if-cached
 * @property {String} [options.credentials='omit'] - include, same-origin, omit
 * @property {String} [options.headers] - "application/json; charset=utf-8".
 * @property {String} [options.redirect='follow'] - manual, follow, error
 * @property {String} [options.referrer='client'] - no-referrer, client
 * @property {String|Object} [options.body] - `JSON.stringify` is automatically run for non-string types
 * @property {String|Object} [options.params] - Query params to be appended to
 * the url. The url must not already have params.  The serialization uses the
 * same rules as used by `@zakkudo/query-string`
 * @property {Boolean} [options.unsafe] - Disable escaping of params in the url
 * @property {Function|Array<Function>} [options.transformRequest] - Transforms for the request body.
 * When not supplied, it by default json serializes the contents if not a simple string. Also accepts
 * promises as return values for asynchronous work.
 * @property {Function|Array<Function>} [options.transformResponse] - Transform the response.  Also accepts
 * promises as return values for asynchronous work.
 * @property {Function|Array<Function>} [options.transformError] - Transform the
 * error response. Return the error to keep the error state.  Return a non
 * `Error` to recover from the error in the promise chain.  A good place to place a login
 * handler when recieving a `401` from a backend endpoint or redirect to another page.
 * It's preferable to never throw an error here which will break the error transform chain in
 * a non-graceful way. Also accepts promises as return values for asynchronous work.
 */

import toApiTreeSchema from './toApiTreeSchema';
import ApiTree from '@zakkudo/api-tree';

class OpenApiTree {
    /**
     * @param {Object} schema - The swagger/openapi schema, usually accessible
     * from a url path like `v2/swagger.json` where swagger is run
     * @param {module:@zakkudo/open-api-tree~OpenApiTree~Options} [options] - Options
     * modifying the network call, mostly analogous to fetch
     * @param {Object} [include] - Modifiers for the conversion of the swagger schema to an api tree schema
     * @param {Boolean} [include.validation = true] - Set to false to not
     * include json schemas for client side validation of api requests
     * @return {Object} The generated api tree
     */
    constructor(schema, options, include) {
        const {base, tree} = toApiTreeSchema(schema, include);

        return new ApiTree(base, tree, options);
    }
}

export default OpenApiTree;

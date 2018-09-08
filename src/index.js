/**
 * @module @zakkudo/open-api-tree
 */

import toApiTreeSchema from './toApiTreeSchema';
import ApiTree from '@zakkudo/api-tree';

class OpenApiTree {
    /**
     * @param {Object} schema - The swagger/openapi schema, usually accessible
     * from a url path like `v2/swagger.json` where swagger is run
     * @param {Object} options - Options modifying the network call, mostly analogous to fetch
     * @param {String} [options.method='GET'] - GET, POST, PUT, DELETE, etc.
     * @param {String} [options.mode='same-origin'] - no-cors, cors, same-origin
     * @param {String} [options.cache='default'] - default, no-cache, reload, force-cache, only-if-cached
     * @param {String} [options.credentials='omit'] - include, same-origin, omit
     * @param {String} options.headers - "application/json; charset=utf-8".
     * @param {String} [options.redirect='follow'] - manual, follow, error
     * @param {String} [options.referrer='client'] - no-referrer, client
     * @param {String|Object} [options.body] - `JSON.stringify` is automatically run for non-string types
     * @param {String|Object} [options.params] - Query params to be appended to
     * the url. The url must not already have params.  The serialization uses the
     * same rules as used by `@zakkudo/query-string`
     * @param {Function|Array<Function>} [options.transformRequest] - Transforms for the request body.
     * When not supplied, it by default json serializes the contents if not a simple string. Also accepts
     * promises as return values for asynchronous work.
     * @param {Function|Array<Function>} [options.transformResponse] - Transform the response.  Also accepts
     * promises as return values for asynchronous work.
     * @param {Function|Array<Function>} [options.transformError] - Transform the
     * error response. Return the error to keep the error state.  Return a non
     * `Error` to recover from the error in the promise chain.  A good place to place a login
     * handler when recieving a `401` from a backend endpoint or redirect to another page.
     * It's preferable to never throw an error here which will break the error transform chain in
     * a non-graceful way. Also accepts promises as return values for asynchronous work.
     * @return {Object} The generated api tree
     */
    constructor(schema, options) {
        const {base, tree} = toApiTreeSchema(schema);

        return new ApiTree(base, tree, options);
    }
}

export default OpenApiTree;

import toApiTreeSchema from './toApiTreeSchema';
import ApiTree from '@zakkudo/api-tree';

/**
 * Make working with backend api trees enjoyable from [swagger]{@link https://swagger.io/}/[openapi]{@link https://www.openapis.org/}.
 *
 * [![Build Status](https://travis-ci.org/zakkudo/open-api-tree.svg?branch=master)](https://travis-ci.org/zakkudo/open-api-tree)
 * [![Coverage Status](https://coveralls.io/repos/github/zakkudo/open-api-tree/badge.svg?branch=master)](https://coveralls.io/github/zakkudo/open-api-tree?branch=master)
 *
 * Generate an
 * easy to use api tree that includes format checking using
 * [JSON Schema]{@link http://json-schema.org/} for the body and params
 * with only a single configuration object. Network calls are executed using
 * a thin convenience wrapper around [fetch]{@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch}.
 *
 * Why use this?
 *
 * - No longer need to maintain a set of functions for accessing apis
 * - Automatic validation of the body/params against the swagger definition
 * - Support for swagger 2.0 definitions and open api 3.0 definitions
 * - Network calls are mostly the same as fetch
 *
 * The api tree is based off of the path name
 * - `[POST] /users` -> `api.users.post({body: data})`
 * - `[GET] /users/{id}` -> `api.users.get({params: {id: 1}})`
 * - `[GET] /users` -> `api.users.get()`
 * - `[PUT] /users/{id}` -> `api.users.put({params: {id: 1}, body: data})`
 * - `[GET] /users/{userId}/roles/{roleId}` -> `api.users.roles.get({params: {userId: 1, roleId: 3}})`
 *
 * Install with:
 *
 * ```console
 * yarn add @zakkudo/open-api-tree
 * ```
 *
 * @example <caption>Parse a scema dynamically during runtime to reduce the size of the application</caption>
 * import OpenApiTree from '@zakkudo/open-api-tree';
 * import fetch from '@zakkudo/fetch';
 *
 * fetch('https://petstore.swagger.io/v2/swagger.json').then((configuration) => {
 *     const api = new OpenApiTree(configuration, {
 *         headers: {
 *              'X-AUTH-TOKEN': '1234'
 *         }
 *     });
 *
 *     // GET http://petstore.swagger.io/api/pets?limit=10
 *     api.pets.get({params: {limit: 10}})
 *
 *     // GET http://petstore.swagger.io/api/pets/1
 *     api.pets.get({params: {id: 1}})
 *
 *     // POST http://petstore.swagger.io/api/pets
 *     api.pets.post({})
 *
 *     // DELETE http://petstore.swagger.io/api/pets/1
 *     api.pets.delete({params: {id: 1}});
 * });
 *
 * @example <caption>Preparse a schema to make the definition stable for a build</caption>
 * //In webpack.conf.js////////////////////////////
 * import ApiTree from '@zakkudo/api-tree';
 *
 * const toApiTreeSchema = require('@zakkudo/open-api-tree/toApiTreeSchema');
 * const execSync = require('child_process').execSync;
 * const configuration = JSON.parse(String(execSync('curl https://petstore.swagger.io/v2/swagger.json'));
 *
 * new DefinePlugin({
 *     __API_CONFIGURATION__: JSON.stringify(toApiTreeSchema(configuration))
 * });
 *
 * //In src/api.js////////////////////////////////
 * import ApiTree from '@zakkudo/api-tree';
 *
 * export default new ApiTree(__API_CONFIGURATION__);
 *
 * //In src/index.js////////////////////////////
 * import api from './api';
 *
 * // GET http://petstore.swagger.io/api/pets?limit=10
 * api.pets.get({params: {limit: 10}})
 *
 * // GET http://petstore.swagger.io/api/pets/1
 * api.pets.get({params: {id: 1}})
 *
 * // POST http://petstore.swagger.io/api/pets
 * api.pets.post({})
 *
 * // DELETE http://petstore.swagger.io/api/pets/1
 * api.pets.delete({params: {id: 1}});
 *
 * @example <caption>Validation error failure example</caption>
 * import ValidationError from '@zakkudo/api-tree/ValidationError';
 *
 * api.pets.get({params: {id: 'lollipops'}}).catch((reason) => {
 *     if (reason instanceof ValidationError) {
 *         console.log(reason)
 *         // ValidationError: [
 *         //     "<http://petstore.swagger.io/api/pets/:id> .params.id: should be integer"
 *         // ]
 *     } else {
 *         throw reason;
 *     }
 * });
 *
 * @module OpenApiTree
 */
export default class OpenApiTree {
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
     * @param {String} [options.params] - Query params to be appended to the url. The url must not already have params.
     * @param {Function|Array<Function>} [options.transformRequest] - Transforms for the request body.
     * When not supplied, it by default json serializes the contents if not a simple string.
     * @param {Function|Array<Function>} [options.transformResponse] - Transform the response.
     * @param {Function|Array<Function>} [options.transformError] - Transform the
     * error response. Return the error to keep the error state.  Return a non
     * `Error` to recover from the error in the promise chain.  A good place to place a login
     * handler when recieving a `401` from a backend endpoint or redirect to another page.
     * It's preferable to never throw an error here which will break the error transform chain in
     * a non-graceful way.
     * @return {Object} The generated api tree
     */
    constructor(schema, options) {
        const {base, tree} = toApiTreeSchema(schema);

        return new ApiTree(base, tree, options);
    }
}

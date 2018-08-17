import toApiTreeSchema from './toApiTreeSchema';
import ApiTree from '@zakkudo/api-tree';

/**
 * Make working with backend api trees enjoyable from [swagger]{@link https://swagger.io/}/[openapi]{@link https://www.openapis.org/}. Generate an
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
 * @example <caption>Parse a scema dynamically during runtime</caption>
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
 * @example <caption>Preparse a schema</caption>
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
 * @module OpenApiTree
 */
export default class OpenApiTree {
    constructor(schema, options) {
        const {base, tree} = toApiTreeSchema(schema);

        return new ApiTree(base, tree, options);
    }
}

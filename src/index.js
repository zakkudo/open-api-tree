import toApiTreeSchema from './toApiTreeSchema';

/**
 * Make working with backend api trees enjoyable. Generate an
 * easy to use api tree that includes format checking using
 * [JSON Schema]{@link http://json-schema.org/} for the body and params
 * with only a single configuration object. Network calls are executed using
 * a thin convenience wrapper around [fetch]{@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch}.
 *
 * Why use this?
 *
 * - Consistancy with simplicity
 * - Leverages native fetch, adding a thin convenience layer.
 * - Use json schemas to ensure correct usage of the apis
 * - Share authorization handling using a single location that can be updated dynamically
 * - Share a single transform for the responses and request in a location that can be updated dynamically
 *
 * Install with:
 *
 * ```console
 * yarn add @zakkudo/api-tree
 * ```
 *
 * @example
 * import OpenApiTree from '@zakkudo/open-api-tree';
 *
 * const api = new ApiTree('https://backend', {
 *     users: {
 *         query: ['/v1/users'],
 *         post: ['/v1/users', {method: 'POST'}, {
 *              body: {
 *                  type: 'object',
 *                  required: ['first_name', 'last_name'],
 *                  properties: {
 *                       first_name: {
 *                           type: 'string'
 *                       },
 *                       last_name: {
 *                           type: 'string'
 *                       },
 *                  },
 *              }
 *         }],
 *         get: ['/v2/users/:userId', {}, {
 *              params: {
 *                  type: 'object',
 *                  required: ['userId'],
 *                  properties: {
 *                       userId: {
 *                           type: 'string',
 *                           pattern: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}',
 *                       },
 *                  },
 *              }
 *         }]
 *     }
 * }, {
 *     headers: {
 *          'X-AUTH-TOKEN': '1234'
 *     }
 * });
 *
 * //Set headers after the fact
 * api.options.headers['X-AUTH-TOKEN'] = '5678';
 *
 * //Get 10 users
 * api.users.query({params: {limit: 10}}).then((users) => {
 *      console.log(users); // [{id: ...}, ...]
 * });
 *
 * //Create a user
 * api.users.post({first_name: 'John', last_name: 'Doe'}).then((response) => {
 *      console.log(response); // {id: 'ff599c67-1cac-4167-927e-49c02c93625f', first_name: 'John', last_name: 'Doe'}
 * });
 *
 * // Try using a valid id
 * api.users.get({params: {userId: 'ff599c67-1cac-4167-927e-49c02c93625f'}}).then((user) => {
 *      console.log(user); // {id: 'ff599c67-1cac-4167-927e-49c02c93625f', first_name: 'john', last_name: 'doe'}
 * })
 *
 * // Try fetching without an id
 * api.users.get().catch((reason) => {
 *      console.log(reason); // "params: should have required property 'userId'
 * })
 *
 * // Try using an invalidly formatted id
 * api.usrs.get({params: {userId: 'invalid format'}}).catch((reason) => {
 *      console.log(reason); // "params.userId: should match pattern \"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\""
 * });
 *
 * @module OpenApiTree
 */
export default class OpenApiTree {
    constructor(schema, options) {
        const baseUrl = schema.servers[0];

        return new ApiTree(schema.servers[0], toApiTreeSchema(schema), options);
    }
}

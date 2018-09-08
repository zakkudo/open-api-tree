/**
 * @module @zakkudo/open-api-tree/toApiTreeSchema
 */

import from1ToApiTreeSchema from './from1ToApiTreeSchema';
import from2ToApiTreeSchema from './from2ToApiTreeSchema';
import from3ToApiTreeSchema from './from3ToApiTreeSchema';

/**
 * Converts an open-api/swagger schema to an api tree configuration.
 * @param {Object} schema - The schema as such that comes from `swagger.json`
 * @return {Object} The converted schema that can be passed to `ApiTree` from `@zakkudo/api-tree`
 * @throws {Error} when trying to convert an unsupported schema
 */
function toApiTreeSchema(schema) {
    if ((schema.swaggerVersion || '').match(/^1\.2$/)) {
        return from1ToApiTreeSchema(schema);
    } else if ((schema.swagger || '').match(/^2\.0$/)) {
        return from2ToApiTreeSchema(schema);
    } else if ((schema.openapi || '').match(/^3\.0\.[^.]+$/)) {
        return from3ToApiTreeSchema(schema);
    } else {
        throw new Error('Unsupported schema');
    }
}

export default toApiTreeSchema;

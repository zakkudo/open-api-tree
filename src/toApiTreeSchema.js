/**
 * @module @zakkudo/open-api-tree/toApiTreeSchema
 */

import from1ToApiTreeSchema from './from1ToApiTreeSchema';
import from2ToApiTreeSchema from './from2ToApiTreeSchema';
import from3ToApiTreeSchema from './from3ToApiTreeSchema';

/**
 * Converts an open-api/swagger schema to an api tree configuration.
 * @param {Object} schema - The schema as such that comes from `swagger.json`
 * @param {Object} [include] - Modifiers for the conversion of the swagger schema to an api tree schema
 * @param {Boolean} [include.validation = true] - Set to false to not
 * include json schemas for client side validation of api requests
 * @return {Object} The converted schema that can be passed to `ApiTree` from `@zakkudo/api-tree`
 * @throws {Error} when trying to convert an unsupported schema
 */
function toApiTreeSchema(schema, include) {
  if ((schema.swaggerVersion || '').match(/^1\.2$/)) {
    return from1ToApiTreeSchema(schema, include);
  } else if ((schema.swagger || '').match(/^2\.0$/)) {
    return from2ToApiTreeSchema(schema, include);
  } else if ((schema.openapi || '').match(/^3\.0\.[^.]+$/)) {
    return from3ToApiTreeSchema(schema, include);
  } else {
    throw new Error('Unsupported schema');
  }
}

export default toApiTreeSchema;

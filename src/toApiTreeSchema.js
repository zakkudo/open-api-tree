import from2ToApiTreeSchema from './from2ToApiTreeSchema';
import from3ToApiTreeSchema from './from3ToApiTreeSchema';

/**
 * Converts an open-api/swagger schema to an api tree configuration.
 * @param {Object} schema - The schema as such that comes from `swagger.json`
 * @return {Object} The converted schema that can be passed to `ApiTree` from `@zakkudo/api-tree`
 * @private
 */
export default function toApiTreeSchema(schema) {
    if (schema.swagger === '2.0') {
        return from2ToApiTreeSchema(schema);
    } else if (schema.openapi === '3.0.0') {
        return from3ToApiTreeSchema(schema);
    } else {
        throw new Error('Unsupported schema');
    }
}

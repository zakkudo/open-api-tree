import from2ToApiTreeSchema from './from2ToApiTreeSchema';
import from3ToApiTreeSchema from './from3ToApiTreeSchema';

/**
 * @private
 */
export default function toApiTreeSchema(schema) {
    if (schema.swagger === '2.0') {
        return from2ToApiTreeSchema(schema);
    } else if (schema.openapi === '3.0') {
        return from3ToApiTreeSchema(schema);
    } else {
        throw new Error('Unsupported schema');
    }
}

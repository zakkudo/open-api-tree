import toApiTreeSchema from './toApiTreeSchema';
import fetch from '@zakkudo/fetch';
import swaggerExample from './swagger.2.0.example';
import openApiExample from './openapi.3.0.example';

jest.mock('@zakkudo/fetch');

describe('toApiTreeSchema', () => {
    beforeEach(() => {
        fetch.mockReset();
        fetch.mockReturnValue(Promise.resolve('test response'));
    });

    it('converts swagger api', () => {
        console.log(JSON.stringify(toApiTreeSchema(swaggerExample), null, 4));
    });

    it('converts openapi api', () => {
        console.log(JSON.stringify(toApiTreeSchema(openApiExample), null, 4));
    });

    it('throws an exception for an unknown type', () => {
        expect(() => toApiTreeSchema({})).toThrow(new Error('Unsupported schema'));
    });
});

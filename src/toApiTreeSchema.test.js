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
});

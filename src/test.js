import OpenApiTree from '.';
import ValidationError from '@zakkudo/api-tree/ValidationError';
import fetch from '@zakkudo/fetch';
import openApiExample from './openapi.3.0.example';
import swaggerExample from './swagger.2.0.example';

jest.mock('@zakkudo/fetch');

describe('OpenApiTree', () => {
    beforeEach(() => {
        fetch.mockReset();
        fetch.mockReturnValue(Promise.resolve('test response'));
    });

    describe('swagger 2.0 schema', () => {
        it('can do network call', () => {
            const api = new OpenApiTree(swaggerExample);

            return api.pets.get().then((response) => {
                expect(fetch.mock.calls).toEqual([[
                    "http://petstore.swagger.io/api/pets",
                    {"method": "GET"},
                ]]);
            });
        });

        fit('can\'t pass params that don\'t match schema', () => {
            const api = new OpenApiTree(swaggerExample);

            return api.pets.get({params: {id: '1234'}}).then((response) => {
                throw new Error('Should not be reachable');
            }).catch((reason) => {
                expect(fetch.mock.calls).toEqual([]);
                expect(reason).toEqual(new ValidationError());
            });
        });
    });
});

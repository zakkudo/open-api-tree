import toApiTreeSchema from './toApiTreeSchema';
import fetch from '@zakkudo/fetch';
import api from './api';

jest.mock('@zakkudo/fetch');

describe('toApiTreeSchema', () => {
    beforeEach(() => {
        fetch.mockReset();
        fetch.mockReturnValue(Promise.resolve('test response'));
    });

    it('converts parameters', () => {
        console.log(JSON.stringify(toJsonSchema(parameters), null, 4));

        expect(toApiTreeSchema({
            "openapi": "3.0.0",
                "paths": {
                    "/pets": {
                        "get": {
                            "operationId": "findPets",
                            "parameters": [
                                {
                                    "name": "tags",
                                    "in": "query",
                                    "description": "tags to filter by",
                                    "required": false,
                                    "style": "form",
                                    "schema": {
                                        "type": "array",
                                        "items": {
                                            "type": "string"
                                        }
                                    }
                                },
                                {
                                    "name": "limit",
                                    "in": "query",
                                    "description": "maximum number of results to return",
                                    "required": false,
                                    "schema": {
                                        "type": "integer",
                                        "format": "int32"
                                    }
                                }
                            ],
                        }
                    }
                }
        })).toEqual({
        });
    });
});

import toApiTreeSchema from './toApiTreeSchema';
import fetch from '@zakkudo/fetch';
import swaggerExample from './swagger.2.0.example';
import swaggerExpected from './swagger.2.0.expected';
import openApiExpected from './openapi.3.0.expected';
import openApiExample from './openapi.3.0.example';

jest.mock('@zakkudo/fetch');

describe('toApiTreeSchema', () => {
    beforeEach(() => {
        fetch.mockReset();
        fetch.mockReturnValue(Promise.resolve('test response'));
    });

    describe('swagger.2.0 schema', () => {
        it('converts swagger api', () => {
            expect(toApiTreeSchema(swaggerExample)).toEqual({
                base: 'http://petstore.swagger.io/api',
                tree: swaggerExpected
            });
        });

        it('handles a file up load gracefully', () => {
            expect(toApiTreeSchema({
                "swagger": "2.0",
                "host": "petstore.swagger.io",
                "basePath": "/api",
                "schemes": [
                    "http"
                ],
                "paths": {
                    "/pets": {
                        "post": {
                            "operationId": "findPets",
                            "parameters": [
                                {
                                    "name": "file",
                                    "in": "formData",
                                    "description": "file",
                                    "required": true,
                                    "type": "file",
                                }
                            ]
                        },
                    }
                }
            })).toEqual({
                "base": "http://petstore.swagger.io/api",
                "tree": {
                    "pets": {
                        "post": [
                            "/pets",
                            {
                                "method": "POST"
                            },
                            {
                                "$schema": "http://json-schema.org/draft-07/schema#",
                                "title": "findPets",
                                "type": "object",
                                "properties": {
                                    "body": {},
                                    "params": {
                                        "type": "object",
                                        "properties": {},
                                        "required": [],
                                        "additionalProperties": false
                                    }
                                }
                            }
                        ]
                    }
                }
            });
        });

        it('ignores missing $refs', () => {
            expect(toApiTreeSchema({
                "swagger": "2.0",
                "host": "petstore.swagger.io",
                "basePath": "/api",
                "schemes": [
                    "http"
                ],
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
                                    "collectionFormat": "csv",
                                    "schema": {
                                        "$ref": "#/definitions/Pet",
                                    }
                                },
                            ],
                        }
                    }
                }
            })).toEqual({
                base: 'http://petstore.swagger.io/api',
                tree: {
                    "pets": {
                        "get": [
                            "/pets",
                            {
                                "method": "GET"
                            },
                            {
                                "$schema": "http://json-schema.org/draft-07/schema#",
                                "title": "findPets",
                                "type": "object",
                                "properties": {
                                    "body": {
                                        "type": "object",
                                        "properties": {},
                                        "required": [],
                                        "additionalProperties": false
                                    },
                                    "params": {
                                        "type": "object",
                                        "properties": {
                                            "tags": {
                                                "description": "tags to filter by",
                                                "$ref": "#/definitions/Pet"
                                            }
                                        },
                                        "required": [],
                                        "additionalProperties": false
                                    }
                                }
                            }
                        ]
                    }
                }
            });
        });

        it('defaults scheme to https when missing', () => {
            expect(toApiTreeSchema({
                "swagger": "2.0",
                "host": "petstore.swagger.io",
                "basePath": "/api",
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
                                    "collectionFormat": "csv",
                                    "schema": {
                                        "$ref": "#/definitions/Pet",
                                    }
                                },
                            ],
                        }
                    }
                }
            })).toEqual({
                base: 'https://petstore.swagger.io/api',
                tree: {
                    "pets": {
                        "get": [
                            "/pets",
                            {
                                "method": "GET"
                            },
                            {
                                "$schema": "http://json-schema.org/draft-07/schema#",
                                "title": "findPets",
                                "type": "object",
                                "properties": {
                                    "body": {
                                        "type": "object",
                                        "properties": {},
                                        "required": [],
                                        "additionalProperties": false
                                    },
                                    "params": {
                                        "type": "object",
                                        "properties": {
                                            "tags": {
                                                "description": "tags to filter by",
                                                "$ref": "#/definitions/Pet"
                                            }
                                        },
                                        "required": [],
                                        "additionalProperties": false
                                    }
                                }
                            }
                        ]
                    }
                }
            });
        });

        it('converts swagger api with no definitions', () => {
            expect(toApiTreeSchema({
                "swagger": "2.0",
                "host": "petstore.swagger.io",
                "basePath": "/api",
                "schemes": [
                    "http"
                ],
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
                                    "type": "array",
                                    "collectionFormat": "csv",
                                    "items": {
                                        "type": "string"
                                    }
                                },
                            ],
                        }
                    }
                }
            })).toEqual({
                base: 'http://petstore.swagger.io/api',
                tree: {
                    "pets": {
                        "get": [
                            "/pets",
                            {
                                "method": "GET"
                            },
                            {
                                "$schema": "http://json-schema.org/draft-07/schema#",
                                "title": "findPets",
                                "type": "object",
                                "properties": {
                                    "body": {
                                        "type": "object",
                                        "properties": {},
                                        "required": [],
                                        "additionalProperties": false
                                    },
                                    "params": {
                                        "type": "object",
                                        "properties": {
                                            "tags": {
                                                "description": "tags to filter by",
                                                "type": "array",
                                                "items": {
                                                    "type": "string"
                                                }
                                            }
                                        },
                                        "required": [],
                                        "additionalProperties": false
                                    }
                                }
                            }
                        ]
                    }
                }
            });
        });

        it('converts swagger api with no parameters', () => {
            expect(toApiTreeSchema({
                "swagger": "2.0",
                "host": "petstore.swagger.io",
                "basePath": "/api",
                "schemes": [
                    "http"
                ],
                "paths": {
                    "/pets": {
                        "get": {
                            "operationId": "findPets"
                        }
                    }
                }
            })).toEqual({
                base: 'http://petstore.swagger.io/api',
                tree: {
                    "pets": {
                        "get": [
                            "/pets",
                            {
                                "method": "GET"
                            },
                            {
                                "$schema": "http://json-schema.org/draft-07/schema#",
                                "title": "findPets",
                                "type": "object",
                                "properties": {
                                    "body": {
                                        "type": "object",
                                        "properties": {},
                                        "required": [],
                                        "additionalProperties": false
                                    },
                                    "params": {
                                        "type": "object",
                                        "properties": {},
                                        "required": [],
                                        "additionalProperties": false
                                    }
                                }
                            }
                        ]
                    }
                }
            });
        });
    });

    describe('openapi.3.0.0 schema', () => {
        it('converts openapi api', () => {
            expect(toApiTreeSchema(openApiExample)).toEqual({
                base: 'http://petstore.swagger.io/api',
                tree: openApiExpected
            });
        });

        it('ignores missing $refs', () => {
            expect(toApiTreeSchema({
                "openapi": "3.0.0",
                "servers": [
                    {
                        "url": "http://petstore.swagger.io/api"
                    }
                ],
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
                                        "$ref": "#/components/schemas/Pet"
                                    }
                                },
                            ],
                        }
                    }
                }
            })).toEqual({
                base: 'http://petstore.swagger.io/api',
                tree: {
                    "pets": {
                        "get": [
                            "/pets",
                            {
                                "method": "GET"
                            },
                            {
                                "$schema": "http://json-schema.org/draft-07/schema#",
                                "title": "findPets",
                                "type": "object",
                                "properties": {
                                    "params": {
                                        "type": "object",
                                        "properties": {
                                            "tags": {
                                                "description": "tags to filter by",
                                                "$ref": "#/components/schemas/Pet",
                                            }
                                        },
                                        "required": [],
                                        "additionalProperties": false
                                    },
                                    "body": {
                                        "additionalProperties": false,
                                        "properties": {},
                                        "required": [],
                                        "type": "object",
                                    },
                                },
                            }
                        ]
                    }
                }
            });
        });

        it('converts open api with no definitions', () => {
            expect(toApiTreeSchema({
                "openapi": "3.0.0",
                "servers": [
                    {
                        "url": "http://petstore.swagger.io/api"
                    }
                ],
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
                            ],
                        }
                    }
                }
            })).toEqual({
                base: 'http://petstore.swagger.io/api',
                tree: {
                    "pets": {
                        "get": [
                            "/pets",
                            {
                                "method": "GET"
                            },
                            {
                                "$schema": "http://json-schema.org/draft-07/schema#",
                                "title": "findPets",
                                "type": "object",
                                "properties": {
                                    "params": {
                                        "type": "object",
                                        "properties": {
                                            "tags": {
                                                "description": "tags to filter by",
                                                "type": "array",
                                                "items": {
                                                    "type": "string"
                                                }
                                            }
                                        },
                                        "required": [],
                                        "additionalProperties": false
                                    },
                                    "body": {
                                        "type": "object",
                                        "properties": {},
                                        "required": [],
                                        "additionalProperties": false,
                                    }
                                }
                            }
                        ]
                    }
                }
            });
        });

        it('handles a file up load gracefully', () => {
            expect(toApiTreeSchema({
                "openapi": "3.0.0",
                "servers": [
                    {
                        "url": "http://petstore.swagger.io/api"
                    }
                ],
                "paths": {
                    "/pets": {
                        "post": {
                            "operationId": "uploadPetFile",
                            "requestBody": {
                                "content": {
                                    "multipart/form-data": {
                                        "schema": {
                                        }
                                    }
                                }
                            },
                        }
                    }
                }
            })).toEqual({
                "base": "http://petstore.swagger.io/api",
                "tree": {
                    "pets": {
                        "post": [
                            "/pets",
                            {
                                "method": "POST"
                            },
                            {
                                "$schema": "http://json-schema.org/draft-07/schema#",
                                "title": "uploadPetFile",
                                "type": "object",
                                "properties": {
                                    "body": {},
                                    "params": {
                                        "type": "object",
                                        "properties": {},
                                        "required": [],
                                        "additionalProperties": false
                                    }
                                }
                            }
                        ]
                    }
                }
            });
        });
    });

    describe('unsupported schema', () => {
        it('throws an exception for an unknown type', () => {
            expect(() => toApiTreeSchema({})).toThrow(new Error('Unsupported schema'));
        });
    });
});

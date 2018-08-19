import OpenApiTree from '.';
import ValidationError from '@zakkudo/api-tree/ValidationError';
import fetch from '@zakkudo/fetch';
import openApiExample from './openapi.3.0.example';
import swaggerExample from './swagger.2.0.example';

class NotReachableError extends Error {
    constructor() {
        super();
        this.message = 'This code should not be reachable';
    }
}

jest.mock('@zakkudo/fetch');

describe('OpenApiTree', () => {
    beforeEach(() => {
        fetch.mockReset();
        fetch.mockReturnValue(Promise.resolve('test response'));
    });

    describe('swagger 2.0 schema', () => {
        /*
        GET /pets
        GET /pets/:id
        POST /pests
        DELETE /pets/:id
        */

        describe('GET /pets', () => {
            it('can do a successful minimal network call', () => {
                const api = new OpenApiTree(swaggerExample);

                return api.pets.get().then(() => {
                    expect(fetch.mock.calls).toEqual([[
                        "http://petstore.swagger.io/api/pets",
                        {"method": "GET"},
                    ]]);
                });
            });

            it('can do a successful full network call', () => {
                const api = new OpenApiTree(swaggerExample);

                return api.pets.get({
                    "params": {
                        "limit": 10,
                        "tags": ["dog", "cat"],
                    },
                }).then(() => {
                    expect(fetch.mock.calls).toEqual([[
                        "http://petstore.swagger.io/api/pets",
                        {
                            "method": "GET",
                            "params": {
                                "limit": 10,
                                "tags": ["dog", "cat"],
                            },
                        },
                    ]]);
                });
            });

            it('throws a validation error when there are additional properties in params', () => {
                const api = new OpenApiTree(swaggerExample);

                return api.pets.get({
                    "params": {
                        "test-invalid-param": true
                    },
                }).then(() => {
                    throw new NotReachableError();
                }).catch((reason) => {
                    expect(fetch.mock.calls).toEqual([]);
                    expect(reason).toEqual(new ValidationError(
                        'http://petstore.swagger.io/api/pets',
                        [{
                            dataPath: '.params',
                            message: 'should NOT have additional properties',
                        }]
                    ));
                });
            });
        });

        describe('GET /pets/:id', () => {
            it('can do a successful minimal network call', () => {
                const api = new OpenApiTree(swaggerExample);

                return api.pets.get({
                    "params": {"id": 1234}
                }).then(() => {
                    expect(fetch.mock.calls).toEqual([[
                        "http://petstore.swagger.io/api/pets/:id",
                        {
                            "method": "GET",
                            "params": {"id": 1234}
                        },
                    ]]);
                });
            });

            it('throws a validation error when there are additional properties in params', () => {
                const api = new OpenApiTree(swaggerExample);

                return api.pets.get({
                    "params": {
                        "id": 1234,
                        "test-invalid-param": true
                    },
                }).then(() => {
                    throw new NotReachableError();
                }).catch((reason) => {
                    expect(fetch.mock.calls).toEqual([]);
                    expect(reason).toEqual(new ValidationError(
                        'http://petstore.swagger.io/api/pets/:id',
                        [{
                            dataPath: '.params',
                            message: 'should NOT have additional properties',
                        }]
                    ));
                });
            });

            it('throws a validation error when property has wrong type in params', () => {
                const api = new OpenApiTree(swaggerExample);

                return api.pets.get({
                    "params": {
                        "id": "1234",
                    },
                }).then(() => {
                    throw new NotReachableError();
                }).catch((reason) => {
                    expect(fetch.mock.calls).toEqual([]);
                    expect(reason).toEqual(new ValidationError(
                        'http://petstore.swagger.io/api/pets/:id',
                        [{
                            dataPath: '.params.id',
                            message: 'should be integer',
                        }]
                    ));
                });
            });
        });

        describe('POST /pets', () => {
            it('can do a successful minimal network call', () => {
                const api = new OpenApiTree(swaggerExample);

                return api.pets.post({
                    "body": {
                        "name": "test name"
                    }
                }).then(() => {
                    expect(fetch.mock.calls).toEqual([[
                        "http://petstore.swagger.io/api/pets",
                        {
                            "method": "POST",
                            "body": {
                                "name": "test name"
                            }
                        },
                    ]]);
                });
            });

            it('throws a validation error when there are additional properties in params', () => {
                const api = new OpenApiTree(swaggerExample);

                return api.pets.post({
                    "params": {
                        "id": 1234,
                    },
                }).then(() => {
                    throw new NotReachableError();
                }).catch((reason) => {
                    expect(fetch.mock.calls).toEqual([]);
                    expect(reason).toEqual(new ValidationError(
                        'http://petstore.swagger.io/api/pets',
                        [{
                            dataPath: '.params',
                            message: 'should NOT have additional properties',
                        }]
                    ));
                });
            });

            it('throws a validation error when property has wrong type in body', () => {
                const api = new OpenApiTree(swaggerExample);

                return api.pets.post({
                    "body": {
                        "name": 1234,
                    },
                }).then(() => {
                    throw new NotReachableError();
                }).catch((reason) => {
                    expect(fetch.mock.calls).toEqual([]);
                    expect(reason).toEqual(new ValidationError(
                        'http://petstore.swagger.io/api/pets',
                        [{
                            dataPath: '.body.name',
                            message: 'should be string',
                        }]
                    ));
                });
            });
        });

        describe('DELETE /pets/:id', () => {
            it('can do a successful minimal network call', () => {
                const api = new OpenApiTree(swaggerExample);

                return api.pets.delete({
                    "params": {"id": 1234}
                }).then(() => {
                    expect(fetch.mock.calls).toEqual([[
                        "http://petstore.swagger.io/api/pets/:id",
                        {
                            "method": "DELETE",
                            "params": {"id": 1234}
                        },
                    ]]);
                });
            });

            it('throws a validation error when there are additional properties in params', () => {
                const api = new OpenApiTree(swaggerExample);

                return api.pets.delete({
                    "params": {
                        "id": 1234,
                        "test-invalid-param": true
                    },
                }).then(() => {
                    throw new NotReachableError();
                }).catch((reason) => {
                    expect(fetch.mock.calls).toEqual([]);
                    expect(reason).toEqual(new ValidationError(
                        'http://petstore.swagger.io/api/pets/:id',
                        [{
                            dataPath: '.params',
                            message: 'should NOT have additional properties',
                        }]
                    ));
                });
            });

            it('throws a validation error when property has wrong type in params', () => {
                const api = new OpenApiTree(swaggerExample);

                return api.pets.delete({
                    "params": {
                        "id": "1234",
                    },
                }).then(() => {
                    throw new NotReachableError();
                }).catch((reason) => {
                    expect(fetch.mock.calls).toEqual([]);
                    expect(reason).toEqual(new ValidationError(
                        'http://petstore.swagger.io/api/pets/:id',
                        [{
                            dataPath: '.params.id',
                            message: 'should be integer',
                        }]
                    ));
                });
            });
        });
    });

    describe('openapi 3.0.0 schema', () => {
        /*
        GET /pets
        GET /pets/:id
        POST /pests
        DELETE /pets/:id
        */

        describe('GET /pets', () => {
            it('can do a successful minimal network call', () => {
                const api = new OpenApiTree(openApiExample);

                return api.pets.get().then(() => {
                    expect(fetch.mock.calls).toEqual([[
                        "http://petstore.swagger.io/api/pets",
                        {"method": "GET"},
                    ]]);
                });
            });

            it('can do a successful full network call', () => {
                const api = new OpenApiTree(openApiExample);

                return api.pets.get({
                    "params": {
                        "limit": 10,
                        "tags": ["dog", "cat"],
                    },
                }).then(() => {
                    expect(fetch.mock.calls).toEqual([[
                        "http://petstore.swagger.io/api/pets",
                        {
                            "method": "GET",
                            "params": {
                                "limit": 10,
                                "tags": ["dog", "cat"],
                            },
                        },
                    ]]);
                });
            });

            it('throws a validation error when there are additional properties in params', () => {
                const api = new OpenApiTree(openApiExample);

                return api.pets.get({
                    "params": {
                        "test-invalid-param": true
                    },
                }).then(() => {
                    throw new NotReachableError();
                }).catch((reason) => {
                    expect(fetch.mock.calls).toEqual([]);
                    expect(reason).toEqual(new ValidationError(
                        'http://petstore.swagger.io/api/pets',
                        [{
                            dataPath: '.params',
                            message: 'should NOT have additional properties',
                        }]
                    ));
                });
            });
        });

        describe('GET /pets/:id', () => {
            it('can do a successful minimal network call', () => {
                const api = new OpenApiTree(openApiExample);

                return api.pets.get({
                    "params": {"id": 1234}
                }).then(() => {
                    expect(fetch.mock.calls).toEqual([[
                        "http://petstore.swagger.io/api/pets/:id",
                        {
                            "method": "GET",
                            "params": {"id": 1234}
                        },
                    ]]);
                });
            });

            it('throws a validation error when there are additional properties in params', () => {
                const api = new OpenApiTree(openApiExample);

                return api.pets.get({
                    "params": {
                        "id": 1234,
                        "test-invalid-param": true
                    },
                }).then(() => {
                    throw new NotReachableError();
                }).catch((reason) => {
                    expect(fetch.mock.calls).toEqual([]);
                    expect(reason).toEqual(new ValidationError(
                        'http://petstore.swagger.io/api/pets/:id',
                        [{
                            dataPath: '.params',
                            message: 'should NOT have additional properties',
                        }]
                    ));
                });
            });

            it('throws a validation error when property has wrong type in params', () => {
                const api = new OpenApiTree(openApiExample);

                return api.pets.get({
                    "params": {
                        "id": "1234",
                    },
                }).then(() => {
                    throw new NotReachableError();
                }).catch((reason) => {
                    expect(fetch.mock.calls).toEqual([]);
                    expect(reason).toEqual(new ValidationError(
                        'http://petstore.swagger.io/api/pets/:id',
                        [{
                            dataPath: '.params.id',
                            message: 'should be integer',
                        }]
                    ));
                });
            });
        });

        describe('POST /pets', () => {
            it('can do a successful minimal network call', () => {
                const api = new OpenApiTree(openApiExample);

                return api.pets.post({
                    "body": {
                        "name": "test name"
                    }
                }).then(() => {
                    expect(fetch.mock.calls).toEqual([[
                        "http://petstore.swagger.io/api/pets",
                        {
                            "method": "POST",
                            "body": {
                                "name": "test name"
                            }
                        },
                    ]]);
                });
            });

            it('throws a validation error when there are additional properties in params', () => {
                const api = new OpenApiTree(openApiExample);

                return api.pets.post({
                    "params": {
                        "id": 1234,
                    },
                }).then(() => {
                    throw new NotReachableError();
                }).catch((reason) => {
                    expect(fetch.mock.calls).toEqual([]);
                    expect(reason).toEqual(new ValidationError(
                        'http://petstore.swagger.io/api/pets',
                        [{
                            dataPath: '.params',
                            message: 'should NOT have additional properties',
                        }]
                    ));
                });
            });

            it('throws a validation error when property has wrong type in body', () => {
                const api = new OpenApiTree(openApiExample);

                return api.pets.post({
                    "body": {
                        "name": 1234,
                    },
                }).then(() => {
                    throw new NotReachableError();
                }).catch((reason) => {
                    expect(fetch.mock.calls).toEqual([]);
                    expect(reason).toEqual(new ValidationError(
                        'http://petstore.swagger.io/api/pets',
                        [{
                            dataPath: '.body.name',
                            message: 'should be string',
                        }]
                    ));
                });
            });
        });

        describe('DELETE /pets/:id', () => {
            it('can do a successful minimal network call', () => {
                const api = new OpenApiTree(openApiExample);

                return api.pets.delete({
                    "params": {"id": 1234}
                }).then(() => {
                    expect(fetch.mock.calls).toEqual([[
                        "http://petstore.swagger.io/api/pets/:id",
                        {
                            "method": "DELETE",
                            "params": {"id": 1234}
                        },
                    ]]);
                });
            });

            it('throws a validation error when there are additional properties in params', () => {
                const api = new OpenApiTree(openApiExample);

                return api.pets.delete({
                    "params": {
                        "id": 1234,
                        "test-invalid-param": true
                    },
                }).then(() => {
                    throw new NotReachableError();
                }).catch((reason) => {
                    expect(fetch.mock.calls).toEqual([]);
                    expect(reason).toEqual(new ValidationError(
                        'http://petstore.swagger.io/api/pets/:id',
                        [{
                            dataPath: '.params',
                            message: 'should NOT have additional properties',
                        }]
                    ));
                });
            });

            it('throws a validation error when property has wrong type in params', () => {
                const api = new OpenApiTree(openApiExample);

                return api.pets.delete({
                    "params": {
                        "id": "1234",
                    },
                }).then(() => {
                    throw new NotReachableError();
                }).catch((reason) => {
                    expect(fetch.mock.calls).toEqual([]);
                    expect(reason).toEqual(new ValidationError(
                        'http://petstore.swagger.io/api/pets/:id',
                        [{
                            dataPath: '.params.id',
                            message: 'should be integer',
                        }]
                    ));
                });
            });
        });
    });
});

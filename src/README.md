# @zakkudo/open-api-tree

Make working with backend api trees enjoyable from
[swagger](https://swagger.io/)/[openapi](https://www.openapis.org/).

[![Build Status](https://travis-ci.org/zakkudo/open-api-tree.svg?branch=master)](https://travis-ci.org/zakkudo/open-api-tree)
[![Coverage Status](https://coveralls.io/repos/github/zakkudo/open-api-tree/badge.svg?branch=master)](https://coveralls.io/github/zakkudo/open-api-tree?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/zakkudo/open-api-tree/badge.svg)](https://snyk.io/test/github/zakkudo/open-api-tree)
[![Node](https://img.shields.io/node/v/@zakkudo/open-api-tree.svg)](https://nodejs.org/)
[![License](https://img.shields.io/npm/l/@zakkudo/open-api-tree.svg)](https://opensource.org/licenses/BSD-3-Clause)

Generate an easy to use api tree that includes format checking using
[JSON Schema](http://json-schema.org/) for the body and params
with only a single configuration object. Network calls are executed using
a thin convenience wrapper around
[fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch).

This library is a thin wrapper for `@zakkudo/api-tree` if you need the same
functionality but don't use Swagger.

Why use this?

- Consistancy with simplicity
- No longer need to maintain a set of functions for accessing apis
- Automatic validation of the body/params against the Swagger definition
- Support for Swagger 1.2, [Swagger 2.0](https://github.com/OAI/OpenAPI-Specification/tree/master/examples/v2.0) and [OpenApi 3.0.x](https://github.com/OAI/OpenAPI-Specification/tree/master/examples/v3.0) definitions
- Leverages [native fetch](https://developer.mozilla.org/docs/Web/API/Fetch_API/Using_Fetch), adding a thin convenience layer in the form of [Fetch Functions](#openapitreefetchfunction--function)
- Share authorization handling using a single location that can be updated dynamically
- Share a single transform for the responses and request in a location that can be updated dynamically
- Supports overloading the tree methods so that you can use the same method for getting a single item or a collection of items

The api tree is based off of the path name
- `[POST] /users` -> `api.users.post({body: data})`
- `[GET] /users/{id}` -> `api.users.get({params: {id: 1}})`
- `[GET] /users` -> `api.users.get()`
- `[PUT] /users/{id}` -> `api.users.put({params: {id: 1}, body: data})`
- `[GET] /users/{userId}/roles/{roleId}` -> `api.users.roles.get({params: {userId: 1, roleId: 3}})`

## Install

``` console
# Install using npm
npm install @zakkudo/open-api-tree
```

``` console
# Install using yarn
yarn add @zakkudo/open-api-tree
```

## Examples

### Parse a swagger schema at runtime
``` javascript
import OpenApiTree from '@zakkudo/open-api-tree';
import fetch from '@zakkudo/fetch';

fetch('https://petstore.swagger.io/v2/swagger.json').then((configuration) => {
    const api = new OpenApiTree(configuration, {
        headers: {
             'X-AUTH-TOKEN': '1234'
        }
    });

    // GET http://petstore.swagger.io/api/pets?limit=10
    api.pets.get({params: {limit: 10}})

    // GET http://petstore.swagger.io/api/pets/1
    api.pets.get({params: {id: 1}})

    // POST http://petstore.swagger.io/api/pets
    api.pets.post({})

    // DELETE http://petstore.swagger.io/api/pets/1
    api.pets.delete({params: {id: 1}});
});
```

### Parse a swagger schema at buildtime in [webpack](https://webpack.js.org/)
``` javascript
//In webpack.conf.js////////////////////////////
import ApiTree from '@zakkudo/api-tree';

const toApiTreeSchema = require('@zakkudo/open-api-tree/toApiTreeSchema').default;
const execSync = require('child_process').execSync;
const configuration = JSON.parse(String(execSync('curl https://petstore.swagger.io/v2/swagger.json'));

module.exports = {
    plugins: [
        new DefinePlugin({
            __API_CONFIGURATION__: JSON.stringify(toApiTreeSchema(configuration))
        })
    }
}

//In src/api.js////////////////////////////////
import ApiTree from '@zakkudo/api-tree';

export default new ApiTree(__API_CONFIGURATION__);

//In src/index.js////////////////////////////
import api from './api';

// GET http://petstore.swagger.io/api/pets?limit=10
api.pets.get({params: {limit: 10}})

// GET http://petstore.swagger.io/api/pets/1
api.pets.get({params: {id: 1}})

// POST http://petstore.swagger.io/api/pets
api.pets.post({})

// DELETE http://petstore.swagger.io/api/pets/1
api.pets.delete({params: {id: 1}});

@example <caption>Validation error failure example</caption>
import ValidationError from '@zakkudo/open-api-tree/ValidationError';

api.pets.get({params: {id: 'lollipops'}}).catch((reason) => {
    if (reason instanceof ValidationError) {
        console.log(reason)
        // ValidationError: [
        //     "<http://petstore.swagger.io/api/pets/:id> .params.id: should be integer"
        // ]
    } else {
        throw reason;
    }
});
```

### Handling validation errors
``` javascript
import ValidationError from '@zakkudo/open-api-tree/ValidationError';

// Try fetching without an id
api.users.get().catch((reason) => {
    if (reason instanceof ValidationError) {
        console.log(reason); // "params: should have required property 'userId'
    }

    throw reason;
})

// Try using an invalidly formatted id
api.users.get({params: {userId: 'invalid format'}}).catch((reason) => {
    if (reason instanceof ValidationError) {
        console.log(reason); // "params.userId: should match pattern \"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\""
    }

    throw reason;
});

// Skip the validation by passing false to the network call
api.users.get({params: {userId: 'invalid format'}}, false).catch((reason) => {
    if (reason instanceof HttpError) {
        console.log(reason.status); // 500
    }

    thow reason;
});
```

### Don't include validation schemas in api tree
``` javascript
import OpenApiTree from '@zakkudo/open-api-tree';
import HttpError from '@zakkudo/open-api-tree/HttpError';

fetch('https://petstore.swagger.io/v2/swagger.json').then((configuration) => {
    const api = new OpenApiTree(configuration, {
        headers: {
             'X-AUTH-TOKEN': '1234'
        }
    }, {validation: false});

    // Try fetching without an id
    api.users.get().catch((reason) => {
        if (reason instanceof HttpError) {
            console.log(reason.status); // 500
        }

        thow reason;
    })

    // Try using an invalidly formatted id
    api.users.get({params: {userId: 'invalid format'}}).catch((reason) => {
        if (reason instanceof HttpError) {
            console.log(reason.status); // 500
        }

        thow reason;
    });

    // Skip the validation by passing false to the network call
    api.users.get({params: {userId: 'invalid format'}}, false).catch((reason) => {
        if (reason instanceof HttpError) {
            console.log(reason.status); // 500
        }

        thow reason;
    });
});
```

### Handling network errors
``` javascript
import HttpError from '@zakkudo/open-api-tree/HttpError';

// Force execution with an invalidly formatted id
api.users.get({params: {userId: 'invalid format'}}, false).catch((reason) => {
    if (reason instanceof HttpError) {
        console.log(reason.status); // 500
        console.log(reason.response); // response body from the server, often json
    }

    throw reason;
});
```

### Overriding options
``` javascript
import HttpError from '@zakkudo/open-api-tree/HttpError';
import ValidationError from '@zakkudo/open-api-tree/ValidationError';


//Set headers after the fact
api.options.headers['X-AUTH-TOKEN'] = '5678';

//Get 10 users
api.users.get({params: {limit: 10}}).then((users) => {
     console.log(users); // [{id: ...}, ...]
});

//Create a user
api.users.post({first_name: 'John', last_name: 'Doe'}).then((response) => {
     console.log(response); // {id: 'ff599c67-1cac-4167-927e-49c02c93625f', first_name: 'John', last_name: 'Doe'}
});

// Try using a valid id
api.users.get({params: {userId: 'ff599c67-1cac-4167-927e-49c02c93625f'}}).then((user) => {
     console.log(user); // {id: 'ff599c67-1cac-4167-927e-49c02c93625f', first_name: 'john', last_name: 'doe'}
})

// Override the global options at any time
api.users.get({transformResponse: () => 'something else'}).then((response) => {
   console.log(response); // 'something else'
});
```


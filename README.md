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
```

### Validation error failure example
``` javascript
import ValidationError from '@zakkudo/open-api-tree/ValidationError';

api.pets.get({params: {id: 'lollipops'}}).catch((reason) => {
    if (reason instanceof ValidationError) {
        console.log(reason)
        // ValidationError: [
        //     "<http://petstore.swagger.io/api/pets/:id> .params.id: should be integer"
        // ]
    }

    throw reason;
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

    throw reason;
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

        throw reason;
    })

    // Try using an invalidly formatted id
    api.users.get({params: {userId: 'invalid format'}}).catch((reason) => {
        if (reason instanceof HttpError) {
            console.log(reason.status); // 500
        }

        throw reason;
    });

    // Skip the validation by passing false to the network call
    api.users.get({params: {userId: 'invalid format'}}, false).catch((reason) => {
        if (reason instanceof HttpError) {
            console.log(reason.status); // 500
        }

        throw reason;
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

## API

<a name="module_@zakkudo/open-api-tree"></a>

<a name="module_@zakkudo/open-api-tree..OpenApiTree"></a>

### @zakkudo/open-api-tree~OpenApiTree ⏏

**Kind**: Exported class

* [~OpenApiTree](#module_@zakkudo/open-api-tree..OpenApiTree)
    * [new OpenApiTree(schema, [options], [include])](#new_module_@zakkudo/open-api-tree..OpenApiTree_new)
    * [~FetchFunction](#module_@zakkudo/open-api-tree..OpenApiTree..FetchFunction) : <code>function</code>
    * [~Options](#module_@zakkudo/open-api-tree..OpenApiTree..Options) : <code>Object</code>

<a name="new_module_@zakkudo/open-api-tree..OpenApiTree_new"></a>

#### new OpenApiTree(schema, [options], [include])
**Returns**: <code>Object</code> - The generated api tree  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| schema | <code>Object</code> |  | The swagger/openapi schema, usually accessible from a url path like `v2/swagger.json` where swagger is run |
| [options] | [<code>Options</code>](#module_@zakkudo/open-api-tree..OpenApiTree..Options) |  | Options modifying the network call, mostly analogous to fetch |
| [include] | <code>Object</code> |  | Modifiers for the conversion of the swagger schema to an api tree schema |
| [include.validation] | <code>Boolean</code> | <code>true</code> | Set to false to not include json schemas for client side validation of api requests |

<a name="module_@zakkudo/open-api-tree..OpenApiTree..FetchFunction"></a>

#### OpenApiTree~FetchFunction : <code>function</code>
Executes the network request using the api tree configuration. Generated from the triplets of the form
`[url, options, jsonschema]` where only url is required.

**Kind**: inner typedef of [<code>OpenApiTree</code>](#module_@zakkudo/open-api-tree..OpenApiTree)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | [<code>Options</code>](#module_@zakkudo/open-api-tree..OpenApiTree..Options) |  | The override options for the final network call |
| [validate] | <code>Boolean</code> | <code>true</code> | Set to false to force validation to be skipped, even if there is a schema |

<a name="module_@zakkudo/open-api-tree..OpenApiTree..Options"></a>

#### OpenApiTree~Options : <code>Object</code>
Options modifying the network call, mostly analogous to fetch

**Kind**: inner typedef of [<code>OpenApiTree</code>](#module_@zakkudo/open-api-tree..OpenApiTree)  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| [options.method] | <code>String</code> | <code>&#x27;GET&#x27;</code> | GET, POST, PUT, DELETE, etc. |
| [options.mode] | <code>String</code> | <code>&#x27;same-origin&#x27;</code> | no-cors, cors, same-origin |
| [options.cache] | <code>String</code> | <code>&#x27;default&#x27;</code> | default, no-cache, reload, force-cache, only-if-cached |
| [options.credentials] | <code>String</code> | <code>&#x27;omit&#x27;</code> | include, same-origin, omit |
| [options.headers] | <code>String</code> |  | "application/json; charset=utf-8". |
| [options.redirect] | <code>String</code> | <code>&#x27;follow&#x27;</code> | manual, follow, error |
| [options.referrer] | <code>String</code> | <code>&#x27;client&#x27;</code> | no-referrer, client |
| [options.body] | <code>String</code> \| <code>Object</code> |  | `JSON.stringify` is automatically run for non-string types |
| [options.params] | <code>String</code> \| <code>Object</code> |  | Query params to be appended to the url. The url must not already have params.  The serialization uses the same rules as used by `@zakkudo/query-string` |
| [options.unsafe] | <code>Boolean</code> |  | Disable escaping of params in the url |
| [options.transformRequest] | <code>function</code> \| <code>Array.&lt;function()&gt;</code> |  | Transforms for the request body. When not supplied, it by default json serializes the contents if not a simple string. Also accepts promises as return values for asynchronous work. |
| [options.transformResponse] | <code>function</code> \| <code>Array.&lt;function()&gt;</code> |  | Transform the response.  Also accepts promises as return values for asynchronous work. |
| [options.transformError] | <code>function</code> \| <code>Array.&lt;function()&gt;</code> |  | Transform the error response. Return the error to keep the error state.  Return a non `Error` to recover from the error in the promise chain.  A good place to place a login handler when recieving a `401` from a backend endpoint or redirect to another page. It's preferable to never throw an error here which will break the error transform chain in a non-graceful way. Also accepts promises as return values for asynchronous work. |

<a name="module_@zakkudo/open-api-tree/toApiTreeSchema"></a>

<a name="module_@zakkudo/open-api-tree/toApiTreeSchema..toApiTreeSchema"></a>

### @zakkudo/open-api-tree/toApiTreeSchema~toApiTreeSchema(schema, [include]) ⇒ <code>Object</code> ⏏
Converts an open-api/swagger schema to an api tree configuration.

**Kind**: Exported function

**Returns**: <code>Object</code> - The converted schema that can be passed to `ApiTree` from `@zakkudo/api-tree`  
**Throws**:

- <code>Error</code> when trying to convert an unsupported schema

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| schema | <code>Object</code> |  | The schema as such that comes from `swagger.json` |
| [include] | <code>Object</code> |  | Modifiers for the conversion of the swagger schema to an api tree schema |
| [include.validation] | <code>Boolean</code> | <code>true</code> | Set to false to not include json schemas for client side validation of api requests |

<a name="module_@zakkudo/open-api-tree/ValidationError"></a>

<a name="module_@zakkudo/open-api-tree/ValidationError..ValidationError"></a>

### @zakkudo/open-api-tree/ValidationError~ValidationError ⏏
Aliased error from package `@zakkudo/api-tree/ValidationError`

**Kind**: Exported class

<a name="module_@zakkudo/open-api-tree/HttpError"></a>

<a name="module_@zakkudo/open-api-tree/HttpError..HttpError"></a>

### @zakkudo/open-api-tree/HttpError~HttpError ⏏
Aliased error from package `@zakkudo/api-tree/HttpError`

**Kind**: Exported class

<a name="module_@zakkudo/open-api-tree/UrlError"></a>

<a name="module_@zakkudo/open-api-tree/UrlError..UrlError"></a>

### @zakkudo/open-api-tree/UrlError~UrlError ⏏
Aliased error from package `@zakkudo/api-tree/UrlError`

**Kind**: Exported class

<a name="module_@zakkudo/open-api-tree/QueryStringError"></a>

<a name="module_@zakkudo/open-api-tree/QueryStringError..QueryStringError"></a>

### @zakkudo/open-api-tree/QueryStringError~QueryStringError ⏏
Aliased error from package `@zakkudo/api-tree/QueryStringError`

**Kind**: Exported class


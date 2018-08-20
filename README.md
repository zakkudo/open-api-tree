<a name="module_OpenApiTree"></a>

## OpenApiTree
Make working with backend api trees enjoyable from
[swagger](https://swagger.io/)/[openapi](https://www.openapis.org/).

[![Build Status](https://travis-ci.org/zakkudo/open-api-tree.svg?branch=master)](https://travis-ci.org/zakkudo/open-api-tree)
[![Coverage Status](https://coveralls.io/repos/github/zakkudo/open-api-tree/badge.svg?branch=master)](https://coveralls.io/github/zakkudo/open-api-tree?branch=master)

Generate an
easy to use api tree that includes format checking using
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
- Support for Swagger 2.0 definitions and OpenApi 3.0 definitions
- Leverages native fetch, adding a thin convenience layer.
- Share authorization handling using a single location that can be updated dynamically
- Share a single transform for the responses and request in a location that can be updated dynamically
- Supports overloading the tree methods so that you can use the same method for getting a single item or a collection of items

The api tree is based off of the path name
- `[POST] /users` -> `api.users.post({body: data})`
- `[GET] /users/{id}` -> `api.users.get({params: {id: 1}})`
- `[GET] /users` -> `api.users.get()`
- `[PUT] /users/{id}` -> `api.users.put({params: {id: 1}, body: data})`
- `[GET] /users/{userId}/roles/{roleId}` -> `api.users.roles.get({params: {userId: 1, roleId: 3}})`

Install with:

```console
yarn add @zakkudo/open-api-tree
```

**Example** *(Parse a schema dynamically during runtime to reduce the size of the application)*  
```js
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
**Example** *(Preparse a schema to make the definition stable for a build)*  
```js
//In webpack.conf.js////////////////////////////
import ApiTree from '@zakkudo/api-tree';

const toApiTreeSchema = require('@zakkudo/open-api-tree/toApiTreeSchema');
const execSync = require('child_process').execSync;
const configuration = JSON.parse(String(execSync('curl https://petstore.swagger.io/v2/swagger.json'));

new DefinePlugin({
    __API_CONFIGURATION__: JSON.stringify(toApiTreeSchema(configuration))
});

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
**Example** *(Validation error failure example)*  
```js
import ValidationError from '@zakkudo/api-tree/ValidationError';

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

* [OpenApiTree](#module_OpenApiTree)
    * [module.exports](#exp_module_OpenApiTree--module.exports) ⏏
        * [new module.exports(schema, options)](#new_module_OpenApiTree--module.exports_new)

<a name="exp_module_OpenApiTree--module.exports"></a>

### module.exports ⏏
**Kind**: Exported class  
<a name="new_module_OpenApiTree--module.exports_new"></a>

#### new module.exports(schema, options)
**Returns**: <code>Object</code> - The generated api tree  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| schema | <code>Object</code> |  | The swagger/openapi schema, usually accessible from a url path like `v2/swagger.json` where swagger is run |
| options | <code>Object</code> |  | Options modifying the network call, mostly analogous to fetch |
| [options.method] | <code>String</code> | <code>&#x27;GET&#x27;</code> | GET, POST, PUT, DELETE, etc. |
| [options.mode] | <code>String</code> | <code>&#x27;same-origin&#x27;</code> | no-cors, cors, same-origin |
| [options.cache] | <code>String</code> | <code>&#x27;default&#x27;</code> | default, no-cache, reload, force-cache, only-if-cached |
| [options.credentials] | <code>String</code> | <code>&#x27;omit&#x27;</code> | include, same-origin, omit |
| options.headers | <code>String</code> |  | "application/json; charset=utf-8". |
| [options.redirect] | <code>String</code> | <code>&#x27;follow&#x27;</code> | manual, follow, error |
| [options.referrer] | <code>String</code> | <code>&#x27;client&#x27;</code> | no-referrer, client |
| [options.body] | <code>String</code> \| <code>Object</code> |  | `JSON.stringify` is automatically run for non-string types |
| [options.params] | <code>String</code> \| <code>Object</code> |  | Query params to be appended to the url. The url must not already have params.  The serialization uses the same rules as used by `@zakkudo/query-string` |
| [options.transformRequest] | <code>function</code> \| <code>Array.&lt;function()&gt;</code> |  | Transforms for the request body. When not supplied, it by default json serializes the contents if not a simple string. |
| [options.transformResponse] | <code>function</code> \| <code>Array.&lt;function()&gt;</code> |  | Transform the response. |
| [options.transformError] | <code>function</code> \| <code>Array.&lt;function()&gt;</code> |  | Transform the error response. Return the error to keep the error state.  Return a non `Error` to recover from the error in the promise chain.  A good place to place a login handler when recieving a `401` from a backend endpoint or redirect to another page. It's preferable to never throw an error here which will break the error transform chain in a non-graceful way. |


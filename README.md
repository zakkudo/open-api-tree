<a name="module_OpenApiTree"></a>

## OpenApiTree
Make working with backend api trees enjoyable. Generate an
easy to use api tree that includes format checking using
[JSON Schema](http://json-schema.org/) for the body and params
with only a single configuration object. Network calls are executed using
a thin convenience wrapper around [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch).

Why use this?

- Consistancy with simplicity
- Leverages native fetch, adding a thin convenience layer.
- Use json schemas to ensure correct usage of the apis
- Share authorization handling using a single location that can be updated dynamically
- Share a single transform for the responses and request in a location that can be updated dynamically

Install with:

```console
yarn add @zakkudo/api-tree
```

**Example**  
```js
import OpenApiTree from '@zakkudo/open-api-tree';

const swaggerConfig = {
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
          {
            "name": "limit",
            "in": "query",
            "description": "maximum number of results to return",
            "required": false,
            "type": "integer",
            "format": "int32"
          }
        ],
      },
      "post": {
        "description": "Creates a new pet in the store.  Duplicates are allowed",
        "operationId": "addPet",
        "parameters": [
          {
            "name": "pet",
            "in": "body",
            "description": "Pet to add to the store",
            "required": true,
            "schema": {
              "$ref": "#/definitions/NewPet"
            }
          }
        ],
      }
    },
    "/pets/{id}": {
      "get": {
        "description": "Returns a user based on a single ID, if the user does not have access to the pet",
        "operationId": "find pet by id",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "ID of pet to fetch",
            "required": true,
            "type": "integer",
            "format": "int64"
          }
        ],
      },
      "delete": {
        "description": "deletes a single pet based on the ID supplied",
        "operationId": "deletePet",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "ID of pet to delete",
            "required": true,
            "type": "integer",
            "format": "int64"
          }
        ],
      }
    }
  },
  "definitions": {
    "Pet": {
      "type": "object",
      "allOf": [
        {
          "$ref": "#/definitions/NewPet"
        },
        {
          "required": [
            "id"
          ],
          "properties": {
            "id": {
              "type": "integer",
              "format": "int64"
            }
          }
        }
      ]
    },
    "NewPet": {
      "type": "object",
      "required": [
        "name"
      ],
      "properties": {
        "name": {
          "type": "string"
        },
        "tag": {
          "type": "string"
        }
      }
    },
  }
}

const api = new OpenApiTree(swaggerConfig, {
    headers: {
         'X-AUTH-TOKEN': '1234'
    }
});
```

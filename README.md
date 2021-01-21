# charlatan
Charlatan is a Typescript API generator with the purpose of quickly auto-generating mock APIs based on OpenAPI specifications.

Charlatan is built around [JSON server](https://github.com/typicode/json-server) and is using [mocker-data-generator](https://github.com/danibram/mocker-data-generator) to generate the fake data.

## Getting started
Install with: `npm install -g @binaryprovider/charlatan`.

### Examples:

#### Generate an API using the CLI wizard:

```
> charlatan
Name of API (charlatan-api): example-api
Version (1.0.0): 1.0.0
Out dir: C:\temp
Swagger definition: https://petstore.swagger.io/v2/swagger.json

Parsing Swagger definition...
Creating new project...

------------------------------

API generated successfully!   

Location: C:\tmp\example-api     

------------------------------
```

#### Generate an API using a configuration file

Create a file in the root of your project called `.charlatanrc`:
```json
{
  "name": "example-api",
  "version": "1.0.0",
  "swagger": "(https://petstore.swagger.io/v2/swagger.json",
  "outDir": "/",
  "schemaDir": "/schemas",
  "extensionDir": "/extensions",
  "masterdataDir": "/masterdata"
}
```
Run `charlatan` to generate the API.

## Options

**Authentication**
The API can be generated with or without a authentication enabled. A predefined secret can be configured and you can choose to protect specific endpoints using a regex pattern.

```json
    "auth": {
      "enabled": true,
      "rule": "^(?!\/identity\/authenticate).*$",
      "secret": "MY_SECRET_KEY"
    },
```

**Adjusting endpoint/model names**
A regex replace can be applied to endpoint and model names when generating the API. This can be done on both file and interface level.

```json
  "options": {
    "file": {
      "name": {
        "find": "[regex match to replace]",
        "replace": "[string to replace with]"
      }
    },
    "model": {
      "name": {
        "find": "[regex match to replace]",
        "replace": "[string to replace with]"
      }
    },
    "endpoint": {
      "name": {
        "find": "[regex match to replace]",
        "replace": "[string to replace with]"
      }
    }
  }
```

## Schemas
By default, charlatan will generate schemas based on the response of each endpoint. In most cases this is sufficient if you just want to spin up a quick mock API to test something. 

But in cases where you want to have a smarter API that looks and behaves the same as the API you're mocking, you may want to enable some type of relationship between the endpoints.

This can be achieved using schemas. You can override any endpoint, and even create custom endpoints, using schemas.

Schemas are defined in JS files that are automatically imported into the final API. You can create a folder containing all your schemas and define these in the configuration file.

##### Configuration
```json
  "schemaDir": "/schemas",
```

Each schema can contain a definition. It is defined in the same way as it's done in [mocker-data-generator](https://github.com/danibram/mocker-data-generator), the underlying library that is used to generate the data.

HTTP verbs and methods are automatically generated for each endpoint, but you can get full control of all methods, supported verbs, and returned data, using custom routes.

Schema files are defined through exported objects. The variable name defines the endpoint being created or overridden.
```js
// This will either create a new endpoint called ExampleEndpoint
// or override an existing endpoint in the generated API
exports.ExampleEndpoint = {
...
}
```
### Schema structure
```ts
{
  index: number;     // Determines the order the endpoints are generated (default 0, ascending)
  count: number;     // The number of results to return (default 10)
  definition: any;    // mocker-data-generator definition
  routes: any;        // custom routes for full control over generated endpoint behavior
}
```
#### Definition
Definitions are based on the definitions used in mocker-data-generator. Please refer to that [documentation](https://github.com/danibram/mocker-data-generator) for more info.

##### Example
```js
...
  definition: {
    id: {
      chance: 'integer({"min": 1, "max": 99999})'
    },
    name: {
      static: 'abc'
    },
    occupation: {
      function: function() {
        return 'Painter';
      }
    }
  },
...
```
#### Routes
Custom routes can be used to fully control each endpoint in the API, and how it should behave. Routes are defined in the same way as they are defined in JSON server, the underlying library used by the API. Please refer to that [documentation](https://github.com/typicode/json-server#custom-routes-example) to learn more.

##### Structure
```ts
{
  path: string;   // The endpoint to generate routes for
  handler: any;   // Custom handler for responses
}
```

##### Example
```js
...
  routes: [
    {
      path: '/example-endpoint',
      handler: (req, res, next) => {
        const data = { value: 1, name: 'test' };
        res.status(200).json(data);
      }
    }
  ]
...
```

### Example of a schema
```js
/// schemas/example-endpoint.js
exports.ExampleEndpoint = {
  count: 1,
  definition: {
    id: {
      chance: 'integer({"min": 1, "max": 99999})'
    },
    name: {
      static: 'abc'
    },
    occupation: {
      function: function() {
        return 'Painter';
      }
    }
  },
  routes: [
    {
      path: '/example-endpoint',
      handler: (req, res, next) => {
        const data = { value: 1, name: 'test' };
        res.status(200).json(data);
      }
    }
  ]
}
```

## Extensions
Extensions can be used to create global helper methods that can be used in schema definitions and routes (e.g. custom methods to format specific data or similar).

They are defined in js files, similar to schemas.
##### Configuration
```json
  "extensionDir": "/extensions",
```

Extensions are added to a static class called `Extensions`, globally imported everywhere, and can be accessed as a sub-method on that class.

#### Example
##### Extension that generates a random string in a specific pattern
```js
/// extensions/generateRandomValue.js
exports.generateRandomValue = () => {
  const length = Math.floor(Math.random() * 6) + 4;
  const part1 = Math.floor(Math.random() * 50000) + 1000;

  var part2 = '';
  var characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;

  for (var i = 0; i < length; i++) {
    part2 += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return `${part1}${part2}`;
}
```
##### This extension can then be used in the schema, either directly in the definition or in a custom route.
```js
...
  definition: {
    value: {
      function: function() {
        return Extensions.generateRandomValue();
      }
    }
  }
...
  routes: [
    {
      path: '/random-value',
      handler: (req, res, next) => {
        const data = { value: Extensions.generateRandomValue() };
        res.status(200).json(data);
      }
    }
  ]
...
```

## Master data
Similar to extensions, master data can be used to predefine data that we want to use in our mocking.

It's defined in js files, similar to extensions and schemas.

##### Configuration
```json
  "masterdataDir": "/masterdata",
```

Master data are added to a static class called `Masterdata` and is globally accessible everywhere. Data can be accessed using a static  call to `Masterdata.get([name of masterdata key])`.

#### Example
##### Master data containing an array of pets
```js
/// masterdata/pets.js
exports.Pets = ['Dog', 'Cat', 'Parrot', 'Dove']
```
##### This data can then be used in the schema, either directly in the definition or in a custom route.
```js
...
  pets: {
    value: {
      function: function() {
        return Masterdata.get('Pets');
      }
    }
  }
...
  routes: [
    {
      path: '/pets',
      handler: (req, res, next) => {
        const data = Masterdata.get('Pets');
        res.status(200).json(data);
      }
    }
  ]
...
```


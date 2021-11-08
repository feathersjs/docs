# Configuration

[![npm version](https://img.shields.io/npm/v/@feathersjs/configuration.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/configuration)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.svg?style=flat-square)](https://github.com/feathersjs/feathers/blob/crow/packages/configuration/CHANGELOG.md)

```
npm install @feathersjs/configuration --save
```

`@feathersjs/configuration` is a wrapper for [node-config](https://github.com/lorenwest/node-config) which allows to configure a server side Feathers application.


By default this implementation will look in `config/*` for `default.json` which retains convention. It will be merged with other configuration files in the `config/` folder using the `NODE_ENV` environment variable. So setting `NODE_ENV=production` will merge `config/default.json` with `config/production.json`.

As per the [config docs](https://github.com/lorenwest/node-config/wiki/Configuration-Files) you can organize *"hierarchical configurations for your app deployments"*.

## Usage

The `@feathersjs/configuration` module is an app configuration function that takes a root directory (usually something like `__dirname` in your application) and the configuration folder (set to `config` by default):

```js
const feathers = require('@feathersjs/feathers');
const configuration = require('@feathersjs/configuration');

// Use the application root and `config/` as the configuration folder
const app = feathers().configure(configuration())
```

**Note**: Direct access to nested config properties is not supported via `app.get()`. To access a nested config property (e.g. `Customer.dbConfig.host`, use `app.get('Customer').dbConfig.host` or `require('config')` directly and use it [as documented](https://github.com/lorenwest/node-config). 

## Environment variables

As recommended by node-config, it is possible to override the configuration with custom variables by passing a JSON object in the [`NODE_CONFIG` environment variable](https://github.com/lorenwest/node-config/wiki/Environment-Variables#node_config):

```
$ export NODE_CONFIG='{ "port":  8080, "host": "production.app" }'
$ node myapp.js
```

Individual environment variables can be used through [Custom Environment Variables](https://github.com/lorenwest/node-config/wiki/Environment-Variables#custom-environment-variables) by creating a `config/custom-environment-variables.json` like this:

```js
{
  "port": "PORT",
  "mongodb": "MONGOHQ_URL"
}
```

## Configuration directory

By default, Feathers will use the `config/` directory in the root of your project’s source directory. To change this, e.g., if you have Feathers installed under the `server/` directory and you want your configuration at `server/config/`, you have to set the `NODE_CONFIG_DIR` environment variable in `app.js` _before_ importing `@feathersjs/configuration`:

```
$ export NODE_CONFIG_DIR=server/config
$ node myapp.js
```

> __Note:__ The NODE_CONFIG_DIR environment variable isn’t used directly by @feathersjs/configuration but by the [node-config](https://github.com/lorenwest/node-config) module that it uses. For more information on configuring node-config settings, see the [Configuration Files Wiki page](https://github.com/lorenwest/node-config/wiki/Configuration-Files).

## Example

In `config/default.json` we want to use the local development environment and default MongoDB connection string:

```js
{
  "frontend": "../public",
  "host": "localhost",
  "port": 3030,
  "mongodb": "mongodb://localhost:27017/myapp",
  "templates": "../templates"
}
```

Now it can be used in our `app.js` like this:

```js
const feathers = require('@feathersjs/feathers');
const configuration = require('@feathersjs/configuration');

const app = feathers().configure(configuration());

console.log(app.get('frontend'));
console.log(app.get('host'));
console.log(app.get('port'));
console.log(app.get('mongodb'));
console.log(app.get('templates'));

```


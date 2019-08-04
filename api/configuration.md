# Configuration

[![npm version](https://img.shields.io/npm/v/@feathersjs/configuration.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/configuration)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.svg?style=flat-square)](https://github.com/feathersjs/feathers/blob/master/packages/configuration/CHANGELOG.md)

```
$ npm install @feathersjs/configuration --save
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

## Variable types

`@feathersjs/configuration` uses the following variable mechanisms:

- Given a root and configuration path load a `default.json` in that path
- Also try to load `<NODE_ENV>.json` in that path, and if found, extend the default configuration
- Go through each configuration value and sets it on the application (via `app.set(name, value)`).
  - If the value is a valid environment variable (e.v. `NODE_ENV`), use its value instead
  - If the value starts with `./` or `../` turn it into an absolute path relative to the configuration file path
  - If the value is escaped (starting with a `\`) always use that value (e.g. `\\NODE_ENV` will become `NODE_ENV`)
- Both `default` and `<env>` configurations can be modules which provide their computed settings with `module.exports = {...}` and a `.js` file suffix. See `test/config/testing.js` for an example.  
All rules listed above apply for `.js` modules.

## Configuration directory

By default, Feathers will use the `config/` directory in the root of your project’s source directory. To change this, e.g., if you have Feathers installed under the `server/` directory and you want your configuration at `server/config/`, you have to set the `NODE_CONFIG_DIR` environment variable in `app.js` _before_ importing `@feathersjs/configuration`:

e.g., In `server/app.js`:
```javascript
process.env['NODE_CONFIG_DIR'] = path.join(__dirname, 'config/')
const configuration = require('@feathersjs/configuration')
```

The above code is portable, so you can keep your `config/` directory with the rest of your Feathers files. It will work, for example, even if you change the directory from `server/` to `amazing-server`, etc.

(The NODE_CONFIG_DIR environment variable isn’t used directly by @feathersjs/configuration but by the [node-config](https://github.com/lorenwest/node-config) module that it uses. For more information on configuring node-config settings, see the [Configuration Files Wiki page](https://github.com/lorenwest/node-config/wiki/Configuration-Files).

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

In `config/production.json` we are going to use environment variables (e.g. set by Heroku) and use `public/dist` to load the frontend production build:

```js
{
  "frontend": "./public/dist",
  "host": "myapp.com",
  "port": "PORT",
  "mongodb": "MONGOHQ_URL"
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

If you now run

```
node app
// -> path/to/app/public
// -> localhost
// -> 3030
// -> mongodb://localhost:27017/myapp
// -> path/to/templates
```

Or via custom environment variables by setting them in `config/custom-environment-variables.json`:

```js
{
  "port": "PORT",
  "mongodb": "MONGOHQ_URL"
}
```

```
$ PORT=8080 MONGOHQ_URL=mongodb://localhost:27017/production NODE_ENV=production node app
// -> path/to/app/public/dist
// -> myapp.com
// -> 8080
// -> mongodb://localhost:27017/production
// -> path/to/templates
```

You can also override these variables with arguments. Read more about how with [node-config](https://github.com/lorenwest/node-config)

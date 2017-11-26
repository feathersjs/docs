# Configuration

[![GitHub stars](https://img.shields.io/github/stars/feathersjs/configuration.png?style=social&label=Star)](https://github.com/feathersjs/configuration/)
[![npm version](https://img.shields.io/npm/v/@feathersjs/configuration.png?style=flat-square)](https://www.npmjs.com/package/@feathersjs/configuration)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.png?style=flat-square)](https://github.com/feathersjs/configuration/blob/master/CHANGELOG.md)

```
$ npm install @feathersjs/configuration --save
```

`@feathersjs/configuration` is a wrapper for [node-config](https://github.com/lorenwest/node-config) which allows to configure a server side Feathers application.


By default this implementation will look in `config/*` for `default.json` which retains convention. As per the [config docs](https://github.com/lorenwest/node-config/wiki/Configuration-Files) you can organize *"hierarchical configurations for your app deployments"*. See the usage section below for better information how to implement this.

## Usage

The `@feathersjs/configuration` module is an app configuration function that takes a root directory (usually something like `__dirname` in your application) and the configuration folder (set to `config` by default):

```js
import feathers from 'feathers';
import configuration from '@feathersjs/configuration';

// Use the application roo and `config/` as the configuration folder
let app = feathers().configure(configuration())
```
## Variable types

`@feathersjs/configuration` uses the following variable mechanisms:

- Given a root and configuration path load a `default.json` in that path
- When the `NODE_ENV` is not `development`, also try to load `<NODE_ENV>.json` in that path and merge both configurations
- Go through each configuration value and sets it on the application (via `app.set(name, value)`).
  - If the value is a valid environment variable (e.v. `NODE_ENV`), use its value instead
  - If the value starts with `./` or `../` turn it into an absolute path relative to the configuration file path
  - If the value is escaped (starting with a `\`) always use that value (e.g. `\\NODE_ENV` will become `NODE_ENV`)
- Both `default` and `<env>` configurations can be modules which provide their computed settings with `module.exports = {...}` and a `.js` file suffix. See `test/config/testing.js` for an example.  
All rules listed above apply for `.js` modules.

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

In `config/production.js` we are going to use environment variables (e.g. set by Heroku) and use `public/dist` to load the frontend production build:

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
import feathers from 'feathers';
import configuration from '@feathersjs/configuration';

let conf = configuration();

let app = feathers()
  .configure(conf);

console.log(app.get('frontend'));
console.log(app.get('host'));
console.log(app.get('port'));
console.log(app.get('mongodb'));
console.log(app.get('templates'));
console.log(conf());

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

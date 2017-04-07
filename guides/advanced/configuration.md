# App Configuration

`feathers-configuration` allows you to load default and environment specific JSON and/or JS configuration files and environment variables and set them on your application. In a [generated application](../getting-started/readme.md) the `config/default.json` and `config/production.json` files are set up with feathers-configuration automatically.

Here is what it does:

- Given a `NODE_CONFIG_DIR` environment variable it will load a `default.json` in that path, the default here is `./config`.
- When the `NODE_ENV` is not `development`, also try to load `<NODE_ENV>.json` in that path and merge both configurations (with `<NODE_ENV>.json` taking precedence)
- Go through each configuration value and sets it on the application (via `app.set(name, value)`).
  - If the value is a valid environment variable (e.v. `NODE_ENV`), use its value instead
  - If the value start with `./` or `../` turn it to an absolute path relative to the configuration file path
  - If the value starts with a `\`, do none of the above two

## Usage

The `feathers-configuration` module is an app configuration function that takes a root directory (usually something like `__dirname` in your application) and the configuration folder (set to `config` by default):

```js
const feathers = require('feathers');
const configuration = require('feathers-configuration')

// Use the current folder as the root and look configuration up in `settings`
const app = feathers().configure(configuration(__dirname, 'settings'))
```

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
module.exports = {
  "frontend": "./public/dist",
  "host": "myapp.com",
  "port": "PORT",
  "mongodb": "MONGOHQ_URL"
}
```

Now it can be used in our `app.js` like this:

```js
const feathers = require('feathers');
const configuration = require('feathers-configuration')

const app = feathers()
  .configure(configuration(__dirname));

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
PORT=8080 MONGOHQ_URL=mongodb://localhost:27017/production NODE_ENV=production node app
// -> path/to/app/public/dist
// -> myapp.com
// -> 8080
// -> mongodb://localhost:27017/production
// -> path/to/templates
```

You can also override these variables with arguments. Read more about how with [node-config](https://github.com/lorenwest/node-config)

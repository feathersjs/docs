# Local Authentication

[![GitHub stars](https://img.shields.io/github/stars/feathersjs/feathers-authentication-local.png?style=social&label=Star)](https://github.com/feathersjs/feathers-authentication-local/)
[![npm version](https://img.shields.io/npm/v/feathers-authentication-local.png?style=flat-square)](https://www.npmjs.com/package/feathers-authentication-local)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.png?style=flat-square)](https://github.com/feathersjs/feathers-authentication-local/blob/master/CHANGELOG.md)

```
$ npm install feathers-authentication-local --save
```


[feathers-authentication-local](https://github.com/feathersjs/feathers-authentication-local) is a server side module that wraps the [passport-local](https://github.com/jaredhanson/passport-local) authentication strategy, which lets you authenticate with your Feathers application using a username and password.

This module contains 3 core pieces:

1. The main initialization function
2. The `hashPassword` hook 
3. The `Verifier` class

## Configuration

In most cases initializing the module is as simple as doing this:

```js
const feathers = require('feathers');
const authentication = require('feathers-authentication');
const local = require('feathers-authentication-local');
const app = feathers();

// Setup authentication
app.configure(authentication(settings));
app.configure(local());

// Setup a hook to only allow valid JWTs or successful 
// local auth to authenticate and get new JWT access tokens
app.service('authentication').hooks({
  before: {
    create: [
      authentication.hooks.authenticate(['local', 'jwt'])
    ]
  }
});
```

This will pull from your global authentication object in your config file. It will also mix in the following defaults, which can be customized.

### Default Options

```js
{
    name: 'local', // the name to use when invoking the authentication Strategy
    entity: 'user', // the entity that you're comparing username/password against
    service: 'users', // the service to look up the entity
    usernameField: 'email', // key name of username field
    passwordField: 'password', // key name of password field
    passReqToCallback: true, // whether the request object should be passed to `verify`
    session: false // whether to use sessions,
    Verifier: Verifier // A Verifier class. Defaults to the built-in one but can be a custom one. See below for details.
}
```

## hashPassword hook

This hook is used to hash plain text passwords before they are saved to the database. It uses the bcrypt algorithm by default but can be customized by passing your own `options.hash` function.

```js
const local = require('feathers-authentication-local');

app.service('users').hooks({
  before: {
    create: [
      local.hooks.hashPassword()
    ]
  }
});
```

### Default Options

```js
{
  passwordField: 'password', // key name of password field to look on hook.data
  hash: customHashFunction // default is the bcrypt hash function. Takes in a password and returns a hash.
}
```

## Verifier

This is the verification class that does the actual username and password verification by looking up the entity (normally a `user`) on a given service by the `usernameField` and compares the hashed password using bcrypt. It has the following methods that can all be overridden. All methods return a promise except `verify`, which has the exact same signature as [passport-local](https://github.com/jaredhanson/passport-local).

```js
{
    constructor(app, options) // the class constructor
    _comparePassword(entity, password) // compares password using bcrypt
    _normalizeResult(result) // normalizes result from service to account for pagination
    verify(req, username, password, done) // queries the service and calls the other internal functions.
}
```


### Customizing the Verifier

The `Verifier` class can be extended so that you customize it's behavior without having to rewrite and test a totally custom local Passport implementation. Although that is always an option if you don't want use this plugin.

An example of customizing the Verifier:

```js
import local, { Verifier } from 'feathers-authentication-local';

class CustomVerifier extends Verifier {
  // The verify function has the exact same inputs and 
  // return values as a vanilla passport strategy
  verify(req, username, password, done) {
    // do your custom stuff. You can call internal Verifier methods
    // and reference this.app and this.options. This method must be implemented.

    // the 'user' variable can be any truthy value
    // the 'payload' is the payload for the JWT access token that is generated after successful authentication
    done(null, user, payload);
  }
}

app.configure(local({ Verifier: CustomVerifier }));
```


## Client Usage

When this module is registered server side, using the default config values this is how you can authenticate using `feathers-authentication-client`:

```js
app.authenticate({
  strategy: 'local',
  email: 'your email',
  password: 'your password'
}).then(response => {
  // You are now authenticated
});
```

## Direct Usage

### Using a HTTP Request

If you are not using the `feathers-authentication-client` and you have registered this module server side then you can simply make a `POST` request to `/authentication` with the following payload:

```json
// POST /authentication the Content-Type header set to application/json
{
  "strategy": "local",
  "email": "your email",
  "password": "your password"
}
```

Here is what that looks like with curl:

```bash
curl -H "Content-Type: application/json" -X POST -d '{"strategy":"local","email":"your email","password":"your password"}' http://localhost:3030/authentication
```

### Using Sockets

Authenticating using a local strategy via sockets is done by emitting the following message:

```js
const io = require('socket.io-client');
const socket = io('http://localhost:3030');

socket.emit('authenticate', {
  strategy: 'local',
  email: 'your email',
  password: 'your password'
}, function(message, data) {
  console.log(message); // message will be null
  console.log(data); // data will be {"accessToken": "your token"}
  // You can now send authenticated messages to the server
});
```


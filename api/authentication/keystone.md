# Keystone Authentication

[![GitHub stars](https://img.shields.io/github/stars/virtuozzo/feathers-authentication-keystone.png?style=social&label=Star)](https://github.com/virtuozzo/feathers-authentication-keystone)
[![npm version](https://img.shields.io/npm/v/feathers-authentication-keystone.png?style=flat-square)](https://www.npmjs.com/package/feathers-authentication-keystone)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.png?style=flat-square)](https://github.com/virtuozzo/feathers-authentication-keystone/blob/master/CHANGELOG.md)

```
$ npm install feathers-authentication-keystone --save
```


[feathers-authentication-keystone](https://github.com/virtuozzo/feathers-authentication-keystone) is a server side module that wraps the PassportJS authentication strategy, which lets you authenticate in Openstack Keystone with your Feathers application using a username and password.

This module contains 2 core pieces:

1. The main initialization function
3. The `Verifier` class

## Configuration

In most cases initializing the module is as simple as doing this:

```js
const feathers = require('feathers');
const authentication = require('feathers-authentication');
const keystone = require('feathers-authentication-keystone');
const app = feathers();

// Setup authentication
app.configure(authentication(settings));
app.configure(keystone());

// Setup a hook to only allow valid JWTs or successful
// keystone auth to authenticate and get new JWT access tokens
app.service('authentication').hooks({
  before: {
    create: [
      authentication.hooks.authenticate(['keystone', 'jwt'])
    ]
  }
});
```

This will pull from your global authentication object in your config file. It will also mix in the following defaults, which can be customized.

### Default Options

```js
{
    name: 'keystone', // the name to use when invoking the authentication Strategy
    entity: 'user', // the entity that will be added to the request, socket, and hook.params. (ie. req.user, socket.user, hook.params.user)
    service: 'users', // the service to look up the entity
    passReqToCallback: true, // whether the request object should be passed to `verify`
    authUrl: 'http://<address>:<port>', // keystone endpoint with configured v3 authentication
    usernameField: 'username', // key name of username field
    passwordField: 'password', // key name of password field
    Verifier: Verifier, // A Verifier class. Defaults to the built-in one but can be a custom one. See below for details.
}

## Verifier

This is the verification class that receives the users identity (if verification is successful), populates the entity (normally a user) and returns both the entity and the payload. It has the following methods that can all be overridden.

```js
{
    constructor(app, options) // the class constructor
    verify(req, payload, done) // queries the configured service
}
```

### Customizing the Verifier

The `Verifier` class can be extended so that you customize it's behavior without having to rewrite and test a totally custom local Passport implementation. Although that is always an option if you don't want use this plugin.

An example of customizing the Verifier:

```js
import keystone, { Verifier } from 'feathers-authentication-keystone';

class CustomVerifier extends Verifier {
  // The verify function has the exact same inputs and
  // return values as a vanilla passport strategy
  verify(req, payload, done) {
    // do your custom stuff. You can call internal Verifier methods
    // and reference this.app and this.options. This method must be implemented.
    done(null, payload);
  }
}

app.configure(keystone({ Verifier: CustomVerifier }));
```

## Client Usage

When this module is registered server side, using the default config values this is how you can authenticate using `feathers-authentication-keystone`:

```js
app.authenticate({
  strategy: 'keystone',
  username: 'your name',
  password: 'your password'
}).then(response => {
  // You are now authenticated
});
```

## Direct Usage

### Using a HTTP Request

If you are not using the `feathers-authentication-client` and you have registered this module server side then you can simply make a `POST` request to `/authentication` with the following payload:

```json
// POST /authentication
{
  "strategy": "keystone",
  "username": "your name",
  "password": "your password"
}
```

Here is what that looks like with curl:

```bash
curl -H "Content-Type: application/json" -X POST -d '{"strategy":"keystone","username":"your name","password":"your password"}' http://localhost:3030/authentication
```

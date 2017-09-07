# JWT Authentication

[![GitHub stars](https://img.shields.io/github/stars/feathersjs/feathers-authentication-jwt.png?style=social&label=Star)](https://github.com/feathersjs/feathers-authentication-jwt/)
[![npm version](https://img.shields.io/npm/v/feathers-authentication-jwt.png?style=flat-square)](https://www.npmjs.com/package/feathers-authentication-jwt)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.png?style=flat-square)](https://github.com/feathersjs/feathers-authentication-jwt/blob/master/CHANGELOG.md)

```
$ npm install feathers-authentication-jwt --save
```


[feathers-authentication-jwt](https://github.com/feathersjs/feathers-authentication-jwt) is a server side module that wraps the [passport-jwt](https://github.com/themikenicholson/passport-jwt) authentication strategy, which lets you authenticate with your Feathers application using a JSON Web Token ([JWT](https://jwt.io/)) access token.

This module contains 3 core pieces:

1. The main initialization function
2. The `Verifier` class
3. The [`ExtractJwt`](https://github.com/themikenicholson/passport-jwt#extracting-the-jwt-from-the-request) object from passport-jwt.

## Configuration

In most cases initializing the module is as simple as doing this:

```js
const feathers = require('feathers');
const authentication = require('feathers-authentication');
const jwt = require('feathers-authentication-jwt');
const app = feathers();

// Setup authentication
app.configure(authentication(settings));
app.configure(jwt());

// Setup a hook to only allow valid JWTs to authenticate
// and get new JWT access tokens
app.service('authentication').hooks({
  before: {
    create: [
      authentication.hooks.authenticate(['jwt'])
    ]
  }
});
```

This will pull from your global authentication object in your config file. It will also mix in the following defaults, which can be customized.

### Default Options

```js
{
    name: 'jwt', // the name to use when invoking the authentication Strategy
    entity: 'user', // the entity that you pull from if an 'id' is present in the payload
    service: 'users', // the service to look up the entity
    passReqToCallback: true, // whether the request object should be passed to `verify`
    jwtFromRequest: [ // a passport-jwt option determining where to parse the JWT
      ExtractJwt.fromHeader, // From "Authorization" header
      ExtractJwt.fromAuthHeaderWithScheme('Bearer'), // Allowing "Bearer" prefix
      ExtractJwt.fromBodyField('body') // from request body
    ],
    secretOrKey: auth.secret, // Your main secret provided to passport-jwt
    session: false // whether to use sessions,
    Verifier: Verifier // A Verifier class. Defaults to the built-in one but can be a custom one. See below for details.
}
```

Additional [passport-jwt](https://github.com/themikenicholson/passport-jwt) options can be provided.

## Verifier

This is the verification class that receives the JWT payload (if verification is successful) and either returns the payload or, if an `id` is present in the payload, populates the entity (normally a `user`) and returns both the entity and the payload. It has the following methods that can all be overridden. The `verify` function has the exact same signature as [passport-jwt](https://github.com/themikenicholson/passport-jwt).

```js
{
    constructor(app, options) // the class constructor
    verify(req, payload, done) // queries the configured service
}
```

#### Customizing the Verifier

The `Verifier` class can be extended so that you customize it's behavior without having to rewrite and test a totally custom local Passport implementation. Although that is always an option if you don't want use this plugin.

An example of customizing the Verifier:

```js
import jwt, { Verifier } from 'feathers-authentication-jwt';

class CustomVerifier extends Verifier {
  // The verify function has the exact same inputs and 
  // return values as a vanilla passport strategy
  verify(req, payload, done) {
    // do your custom stuff. You can call internal Verifier methods
    // and reference this.app and this.options. This method must be implemented.
    
    // the 'user' variable can be any truthy value
    // the 'payload' is the payload for the JWT access token that is generated after successful authentication
    done(null, user, payload);
  }
}

app.configure(jwt({ Verifier: CustomVerifier }));
```

## Client Usage

When this module is registered server side, using the default config values this is how you can authenticate using `feathers-authentication-client`:

```js
app.authenticate({
  strategy: 'jwt',
  accessToken: 'your access token'
}).then(response => {
  // You are now authenticated
});
```

## Direct Usage

### Using a HTTP Request

If you are not using the `feathers-authentication-client` and you have registered this module server side then you can simply include the access token in an `Authorization` header.

Here is what that looks like with curl:

```bash
curl -H "Content-Type: application/json" -H "Authorization: <your access token>" -X POST http://localhost:3030/authentication
```

### Using Sockets

Authenticating using an access token via sockets is done by emitting the following message:

```js
const io = require('socket.io-client');
const socket = io('http://localhost:3030');

socket.emit('authenticate', {
  strategy: 'jwt',
  accessToken: 'your token'
}, function(message, data) {
  console.log(message); // message will be null
  console.log(data); // data will be {"accessToken": "your token"}
  // You can now send authenticated messages to the server
});
```


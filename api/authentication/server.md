# Authentication

[![GitHub stars](https://img.shields.io/github/stars/feathersjs/feathers-authentication.png?style=social&label=Star)](https://github.com/feathersjs/feathers-authentication/)
[![npm version](https://img.shields.io/npm/v/feathers-authentication.png?style=flat-square)](https://www.npmjs.com/package/feathers-authentication)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.png?style=flat-square)](https://github.com/feathersjs/feathers-authentication/blob/master/CHANGELOG.md)

```
$ npm install feathers-authentication --save
```

The [feathers-authentication](https://github.com/feathersjs/feathers-authentication) module assists in using JWT for authentication.  It has three primary purposes:

1. Setup an `/authentication` endpoint to create JSON Web Tokens (JWT). JWT are used as access tokens. (learn more about JWT at [jwt.io](https://jwt.io))
2. Provide a consistent authentication API for all of the Feathers transports: feathers-rest, feathers-socketio, and feathers-primus.
3. Provide a framework for authentication plugins that use [Passport](http://passportjs.org/) strategies to protect endpoints.

## Complementary Plugins

The following plugins are complementary, but entirely optional:

- [feathers-authentication-client](./client.md)
- [feathers-authentication-local](./local.md)
- [feathers-authentication-jwt](./jwt.md)
- [feathers-authentication-oauth1](./oauth1.md)
- [feathers-authentication-oauth2](./oauth2.md)
- [feathers-permissions](./permissions.md)

## API

This module contains:

1. [The main entry function](#configuring-the-plugin)
2. [The `/authentication` service](#the-authentication-service)
3. [The `authenticate` hook](#the-authenticate-hook)
4. Socket listeners
5. Express middleware
6. A [Passport](http://passportjs.org/) adapter for Feathers

## Configuration
### `app.configure(auth(options))`
Setup is done the same as all Feathers plugins, using the `configure` method:

```js
const auth = require('feathers-authentication');

// Available options are listed in the "Default Options" section
app.configure(auth(options))
```

## Default `options`

The following default options will be mixed in with your global `auth` object from your config file. It will set the mixed options back on to the app so that they are available at any time by calling `app.get('auth')`. They can all be overridden and are required by some of the authentication plugins.

```js
{
  path: '/authentication', // the authentication service path
  header: 'Authorization', // the header to use when using JWT auth
  entity: 'user', // the entity that will be added to the request, socket, and hook.params. (ie. req.user, socket.user, hook.params.user)
  service: 'users', // the service to look up the entity
  passReqToCallback: true, // whether the request object should be passed to the strategies `verify` function
  session: false, // whether to use sessions
  cookie: {
    enabled: false, // whether cookie creation is enabled
    name: 'feathers-jwt', // the cookie name
    httpOnly: false, // when enabled, prevents the client from reading the cookie.
    secure: true // whether cookies should only be available over HTTPS
  },
  jwt: {
    header: { typ: 'access' }, // by default is an access token but can be any type
    audience: 'https://yourdomain.com', // The resource server where the token is processed
    subject: 'anonymous', // Typically the entity id associated with the JWT
    issuer: 'feathers', // The issuing server, application or resource
    algorithm: 'HS256', // the algorithm to use
    expiresIn: '1d' // the access token expiry
  }
}
```

## Methods
The Feathers `app` will contain a few useful methods once you've configured the auth plugin.
### `app.authenticate(data)`

```js
app.authenticate({
  strategy: 'jwt', 
  accessToken: '<the.jwt.token.string>'
})
```

- `data {Object}` - of the format `{strategy [, ...otherProps]}`
  - `strategy {String}` - the name of the strategy to be used to authenticate.  Required.
  - `...otherProps {Properties} ` vary depending on the chosen strategy. Above is an example of using the `jwt` strategy.  Below is one for the `local` strategy.

```js
app.authenticate({
  strategy: 'local',
  email: 'my@email.com',
  password: 'my-password'
})
```

### `app.passport.createJWT(payload, options)` [source](https://github.com/feathersjs/feathers-authentication/blob/master/src/utils.js#L8)
This is the method used by the `/authentication` service to generate JSON Web Tokens.
- `payload {Object}` - becomes the JWT payload. Will also include an `exp` property denoting the expiry timestamp.
- `options {Object}` - the options passed to [jsonwebtoken `sign()`](https://www.npmjs.com/package/jsonwebtoken#jwtsignpayload-secretorprivatekey-options-callback)
  - `secret {String | Buffer}` - either the secret for HMAC algorithms, or the PEM encoded private key for RSA and ECDSA.
  - See the [`jsonwebtoken`](https://www.npmjs.com/package/jsonwebtoken#jwtsignpayload-secretorprivatekey-options-callback) package docs for other available options.  The authenticate method uses the [default `jwt` options](#default-options). When using this package, directly, they will have to be passed in manually.

### `app.passport.verifyJWT(token, options)` [source](https://github.com/feathersjs/feathers-authentication/blob/master/src/utils.js#L48)
Verifies the signature and payload of the passed in JWT `token` using the `options`.
- `token {JWT}` - the JWT to be verified.
- `options {Object}` the options passed to [jsonwebtoken `verify()`](https://www.npmjs.com/package/jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback)
  - `secret {String | Buffer}` - - either the secret for HMAC algorithms, or the PEM encoded private key for RSA and ECDSA.
  - See the [`jsonwebtoken`](https://www.npmjs.com/package/jsonwebtoken#jwtsignpayload-secretorprivatekey-options-callback) package docs for other available options.


## The `/authentication` service
The heart of this plugin is simply a service for creating JWT.  It's a normal Feathers service that implements only the `create` and `remove` methods.  

### `app.service('/authentication').create(data)`

The `create` method will be used in nearly every Feathers application.  It creates a JWT that contains the `hook.data` as its payload.  Having a JWT is equivalent to being logged in.  Once the JWT expires or is deleted from the client, the user is essentially logged out.

### `app.service('/authentication').remove(data)`

The `remove` method will be used less often.  It mostly exists to allow for adding hooks the the "logout" process.  For example, in services that require high control over security, a developer could register hooks on the `remove` method that perform token blacklisting.

## The `authenticate` Hook

`auth.hooks.authenticate(strategies)`, where `strategies` is an array of passport strategy names.

`feathers-authentication` only includes a single hook. This bundled `authenticate` hook is used to register an array of authentication strategies on a service method.

> **Note:** This should usually be used on your `/authentication` service. Without it you can hit the `authentication` service and generate a JWT `accessToken` without authentication (ie. anonymous authentication).

```js
app.service('authentication').hooks({
  before: {
    create: [
      // You can chain multiple strategies
      auth.hooks.authenticate(['jwt', 'local']),
    ],
    remove: [
      auth.hooks.authenticate('jwt')
    ]
  }
});
```

The hooks that were once bundled with this module are now located at [feathers-legacy-authentication-hooks](https://github.com/feathersjs/feathers-legacy-authentication-hooks). They are completely compatible but are deprecated and will not be supported by the core team going forward.

## Express Middleware

There is an `authenticate` middleware. It is used the exact same way you would the regular Passport express middleware:

```js
app.post('/login', auth.express.authenticate('local', { successRedirect: '/app', failureRedirect: '/login' }));
```

Additional middleware are included and exposed but typically you don't need to worry about them:

- `emitEvents` - emit `login` and `logout` events
- `exposeCookies` - expose cookies to Feathers so they are available to hooks and services
- `exposeHeaders` - expose headers to Feathers so they are available to hooks and services
- `failureRedirect` - support redirecting on auth failure. Only triggered if `hook.redirect` is set.
- `successRedirect` - support redirecting on auth success. Only triggered if `hook.redirect` is set.
- `setCookie` - support setting the JWT access token in a cookie. Only enabled if cookies are enabled.  Note: Feathers will not read an access token from a cookie.  This would expose the API to CSRF attacks.  This `setCookie` feature is available primarily for helping with Server Side Rendering.

## Migrating to 1.x
Refer to [the migration guide](https://github.com/feathersjs/feathers-authentication/blob/master/docs/migrating.md).

## Complete Example
Here's an example of a Feathers server that uses `feathers-authentication` for local auth. You can try it out on your own machine by running the [example](./example/).

**Note:** This does NOT implement any authorization. Use [feathers-permissions](https://github.com/feathersjs/feathers-permissions) for that.

```js
const feathers = require('feathers');
const rest = require('feathers-rest');
const socketio = require('feathers-socketio');
const hooks = require('feathers-hooks');
const memory = require('feathers-memory');
const bodyParser = require('body-parser');
const errors = require('feathers-errors');
const errorHandler = require('feathers-errors/handler');
const local = require('feathers-authentication-local');
const jwt = require('feathers-authentication-jwt');
const auth = require('feathers-authentication');

const app = feathers();
app.configure(rest())
  .configure(socketio())
  .configure(hooks())
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .configure(auth({ secret: 'supersecret' }))
  .configure(local())
  .configure(jwt())
  .use('/users', memory())
  .use('/', feathers.static(__dirname + '/public'))
  .use(errorHandler());

app.service('authentication').hooks({
  before: {
    create: [
      // You can chain multiple strategies
      auth.hooks.authenticate(['jwt', 'local'])
    ],
    remove: [
      auth.hooks.authenticate('jwt')
    ]
  }
});

// Add a hook to the user service that automatically replaces
// the password with a hash of the password before saving it.
app.service('users').hooks({
  before: {
    find: [
      auth.hooks.authenticate('jwt')
    ],
    create: [
      local.hooks.hashPassword({ passwordField: 'password' })
    ]
  }
});

const port = 3030;
let server = app.listen(port);
server.on('listening', function() {
  console.log(`Feathers application started on localhost:${port}`);
});
```
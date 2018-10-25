# Authentication

[![npm version](https://img.shields.io/npm/v/@feathersjs/authentication.png?style=flat-square)](https://www.npmjs.com/package/@feathersjs/authentication)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.png?style=flat-square)](https://github.com/feathersjs/feathers/blob/master/packages/authentication/CHANGELOG.md)

```
$ npm install @feathersjs/authentication --save
```

The [@feathersjs/authentication](https://github.com/feathersjs/authentication) module assists in using JWT for authentication. It has three primary purposes:

1. Setup an `/authentication` endpoint to create JSON Web Tokens (JWT). JWT are used as access tokens. You can learn more about JWT at [jwt.io](https://jwt.io)
2. Provide a consistent authentication API for all Feathers transports
3. Provide a framework for authentication plugins that use [Passport](http://passportjs.org/) strategies to protect endpoints.

> __Note:__ If you are using a 0.x version of `feathers-authentication` please refer to [the migration guide](https://github.com/feathersjs/authentication/blob/4344c6f037f2660e4636c1c05ea22a0000649312/docs/migrating.md). The hooks that were once bundled with this module are now located at [feathers-authentication-hooks](https://github.com/feathersjs-ecosystem/feathers-authentication-hooks).

## Complementary Plugins

The following plugins are complementary, but entirely optional:

- Using the authencation server on the client: [@feathersjs/authentication-client](./client.md)
- Local (username/password) authentication: [@feathersjs/authentication-local](./local.md)
- JWT authentication: [@feathersjs/authentication-jwt](./jwt.md)
- OAuth1 authentication: [@feathersjs/authentication-oauth1](./oauth1.md)
- OAuth2 authentication: [@feathersjs/authentication-oauth2](./oauth2.md)

## app.configure(auth(options))

Configure the authentication plugin with the given options. For options that are not provided, the [default options](#default-options) will be used.

```js
const auth = require('@feathersjs/authentication');

// Available options are listed in the "Default Options" section
app.configure(auth(options))
```

> __Important:__ The plugin has to be configured __before__ any other service.

## Options

The following default options will be mixed in with your global `auth` object from your config file. It will set the mixed options back onto the app so that they are available at any time by calling `app.get('authentication')`. They can all be overridden and are required by some of the authentication plugins.

```js
{
 path: '/authentication', // the authentication service path
 header: 'Authorization', // the header to use when using JWT auth
 entity: 'user', // the entity that will be added to the request, socket, and context.params. (ie. req.user, socket.user, context.params.user)
 secret: 'supersecret', // either the secret for HMAC algorithms or the PEM encoded private key for RSA and ECDSA.
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
  header: { typ: 'access' }, // by default is an access token but can be any type. This is not a typo!
  audience: 'https://yourdomain.com', // The resource server where the token is processed
  subject: 'anonymous', // Typically the entity id associated with the JWT
  issuer: 'feathers', // The issuing server, application or resource
  algorithm: 'HS256', // the algorithm to use
  expiresIn: '1d' // the access token expiry
 }
}
```

> __Note:__ The `typ` in the JWT header options is not a typo. It is the [typ parameter defined in the JWT specification](https://tools.ietf.org/html/rfc7519#section-5.1).

## app.service('authentication')

The heart of this plugin is a service for creating JWT. It's a normal Feathers service that implements only the `create` and `remove` methods. The `/authentication` service provides all of the functionality that the `/auth/local` and `/auth/token` endpoints did. To choose a strategy, the client must pass the `strategy` name in the request body. This will be different based on the plugin used. See the documentation for the plugins listed at the top of this page for more information.

### service.create(data)

The `create` method will be used in nearly every Feathers application. It creates a JWT based on the `jwt` options configured on the plugin. The API of this method utilizes the `context` object.

### service.remove(data)

The `remove` method is used less often. Its main purpose is adding hooks to the "logout" process. For example, in services that require high control over security, a developer can register hooks on the `remove` method that perform token blacklisting.

### service.hooks({ before })

These properties can be modified to change the behavior of the `/authentication` service:

- `context.data.payload {Object}` - determines the payload of the JWT
- `context.params.payload {Object}` - also determines the payload of the JWT. Any matching attributes in the `context.data.payload` will be overwritten by these. Persists into after hooks.
- `context.params.authenticated {Boolean}` - After successful authentication, will be set to `true`, unless it's set to `false` in a before hook. If you set it to `false` in a before hook, it will prevent the websocket from being flagged as authenticated. Persists into after hooks.

### service.hooks({ after })

- `context.params[entity] {Object}` - After successful authentication, the `entity` looked up from the database will be populated here. (The default option is `user`.)

## app.passport

### app.passport.createJWT(payload, options)

`app.passport.createJWT(payload, options) -> Promise` is used by the [authentication service](#appserviceauthentication) to generate JSON Web Tokens.

- `payload {Object}` - becomes the JWT payload. Will also include an `exp` property denoting the expiry timestamp.
- `options {Object}` - the options passed to [jsonwebtoken `sign()`](https://www.npmjs.com/package/jsonwebtoken#jwtsignpayload-secretorprivatekey-options-callback)
 - `secret {String | Buffer}` - either the secret for HMAC algorithms, or the PEM encoded private key for RSA and ECDSA.
 - `jwt` - See the [`jsonwebtoken`](https://www.npmjs.com/package/jsonwebtoken#jwtsignpayload-secretorprivatekey-options-callback) package docs for other available options. The authenticate method uses the [default `jwt` options](#default-options). When using this package directly, they have to be passed in manually.

The returned `promise` resolves with the JWT or fails with an error.

### app.passport.verifyJWT(token, options)

Verifies the signature and payload of the passed in JWT `token` using the `options`.

- `token {JWT}` - the JWT to be verified.
- `options {Object}` the options passed to [jsonwebtoken `verify()`](https://www.npmjs.com/package/jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback)
 - `secret {String | Buffer}` - - either the secret for HMAC algorithms, or the PEM encoded private key for RSA and ECDSA.
 - See the [`jsonwebtoken`](https://www.npmjs.com/package/jsonwebtoken#jwtsignpayload-secretorprivatekey-options-callback) package docs for other available options.

The returned `promise` resolves with the payload or fails with an error.

## auth.hooks.authenticate(strategies)

`@feathersjs/authentication` only includes a single hook. This bundled `authenticate` hook is used to register an array of authentication strategies on a service method.

> **Note:** This should usually be used on your `/authentication` service. Without it, you can hit the `authentication` service and generate a JWT `accessToken` without authentication (ie. anonymous authentication).

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

## Authentication Events

The `login` and `logout` events are emitted on the `app` object whenever a client successfully authenticates or "logs out". (With JWT, logging out doesn't invalidate the JWT. (Read the section on JWT for details.) These events are only emitted on the server.

### app.on('login', callback))

### app.on('logout', callback))

These two events use a `callback` function with the same signature.

- `result` {Object} - The final `context.result` from the `authentication` service. Unless you customize the `context.response` in an after hook, this will only contain the `accessToken`, which is the JWT.
- `meta` {Object} - information about the request. *The `meta` data varies per transport / provider as follows.*
  - Using `@feathersjs/express/rest`
    - `provider` {String} - will always be `"rest"`
    - `req` {Object} - the Express request object.
    - `res` {Object} - the Express response object.
  - Using `feathers-socketio` and `feathers-primus`:
    - `provider` {String} - the transport name: `socketio` or `primus`
    - `connection` {Object} - the same as `params` in the hook context
    - `socket` {SocketObject} - the current user's WebSocket object. It also contains the `feathers` attribute, which is the same as `params` in the hook context.

## Express Middleware

There is an `authenticate` middleware. It is used the exact same way as the regular Passport express middleware:

```js
const cookieParser = require('cookie-parser');

app.post('/protected-route', cookieParser(), auth.express.authenticate('jwt'));
app.post('/protected-route-that-redirects', cookieParser(), auth.express.authenticate('jwt', {
  failureRedirect: '/login'
}));
```

For details, see the [Express middleware recipe](../../guides/auth/recipe.express-middleware.md).

Additional middleware are included and exposed, but you typically don't need to worry about them:

- `emitEvents` - emit `login` and `logout` events
- `exposeCookies` - expose cookies to Feathers so they are available to hooks and services. **This is NOT used by default as its use exposes your API to CSRF vulnerabilities.** Only use it if you really know what you're doing.
- `exposeHeaders` - expose headers to Feathers so they are available to hooks and services. **This is NOT used by default as its use exposes your API to CSRF vulnerabilities.** Only use it if you really know what you're doing.
- `failureRedirect` - support redirecting on auth failure. Only triggered if `hook.redirect` is set.
- `successRedirect` - support redirecting on auth success. Only triggered if `hook.redirect` is set.
- `setCookie` - support setting the JWT access token in a cookie. Only enabled if cookies are enabled. **Note: Feathers will NOT read an access token from a cookie. This would expose the API to CSRF attacks.** This `setCookie` feature is available primarily for helping with Server Side Rendering.

## Complete Example

Here's an example of a Feathers server that uses `@feathersjs/authentication` for local authentication.

```js
const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');
const auth = require('@feathersjs/authentication');
const local = require('@feathersjs/authentication-local');
const jwt = require('@feathersjs/authentication-jwt');
const memory = require('feathers-memory');

const app = express(feathers());
app.configure(express.rest())
 .configure(socketio())
 .use(express.json())
 .use(express.urlencoded({ extended: true }))
 .configure(auth({ secret: 'supersecret' }))
 .configure(local())
 .configure(jwt())
 .use('/users', memory())
 .use('/', express.static(__dirname + '/public'))
 .use(express.errorHandler());

app.service('users').hooks({
  // Make sure `password` never gets sent to the client
  after: local.hooks.protect('password')
});

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
// the password with a hash of the password, before saving it.
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

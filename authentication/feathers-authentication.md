# feathers-authentication

[![Build Status](https://travis-ci.org/feathersjs/feathers-authentication.png?branch=master)](https://travis-ci.org/feathersjs/feathers-authentication)
[![Code Climate](https://codeclimate.com/github/feathersjs/feathers-authentication.png)](https://codeclimate.com/github/feathersjs/feathers-authentication)
[![Test Coverage](https://codeclimate.com/github/feathersjs/feathers-authentication/badges/coverage.svg)](https://codeclimate.com/github/feathersjs/feathers-authentication/coverage)
[![Dependency Status](https://img.shields.io/david/feathersjs/feathers-authentication.svg?style=flat-square)](https://david-dm.org/feathersjs/feathers-authentication)
[![Download Status](https://img.shields.io/npm/dm/feathers-authentication.svg?style=flat-square)](https://www.npmjs.com/package/feathers-authentication)
[![Slack Status](http://slack.feathersjs.com/badge.svg)](http://slack.feathersjs.com)

> Add Authentication to your FeathersJS app.

`feathers-authentication` adds shared [PassportJS](http://passportjs.org/) authentication for Feathers HTTP REST and WebSockets transports using [JSON Web Tokens](http://jwt.io/).


## Installation

```
npm install feathers-authentication --save
```

## Documentation

<!-- Please refer to the [Authentication documentation](http://docs.feathersjs.com/authentication/readme.html) for more details. -->

This module contains:

1. The main entry function
2. The `authentication` service
3. An `authenticate` hook, which is used to authenticate requests to Feathers services.
4. Express middleware
5. Socket listeners for authenticating Socket.io or Primus connections. These are used internally, set up automatically, and are generally non-configurable.
6. A [Passport](http://passportjs.org/) adapter. This is also used internally by the middleware and hooks, and set up automatically.

## Main Entry Function

Setting up the plugin is as easy as importing the plugin and configuring it on your Feathers app instance:

```js
const feathers = require('feathers');
const auth = require('feathers-authentication');

const options = {
  // See Default Options in next section.
}

const app = feathers()
  .configure(auth(options));
```

### Default Options

The following default options will be mixed in with your global `auth` object from your config file. It will set the mixed options back to to the app so that they are available at any time by `app.get('auth')`. They can all be overridden and are depended upon by some of the authentication plugins.

```js
{
  path: '/authentication', // the authentication service path
  header: 'Authorization', // the header to use when using JWT auth
  entity: 'user', // the entity that will be added to the request, socket, and hook.params. (ie. req.user, socket.user, hook.params.user)
  service: 'users', // the service to look up the entity
  passReqToCallback: true, // whether the request object should be passed to the strategies `verify` function
  session: false, // whether to use sessions
  cookie: {
    enabled: false, // whether the cookie should be enabled
    name: 'feathers-jwt', // the cookie name
    httpOnly: false, // whether the cookie should not be available to client side JavaScript
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

## The `authentication` service

A service for creating JWT Tokens is automatically setup at the `config.path`.  When a user logs in, it will happen on the `create` method of this service.  You determine which strategies are available for authentication on this service by using the `authenticate` hook.

## Required `authenticate` Hook

`feathers-authentication` only includes a single hook, now. Using the bundled `authenticate` hook is required for two purposes:

1. Use it on the `authentication` service to setup the strategies available for creating a JWT.  The following example shows how the hook is used to configure two possible strategies for creating JWT tokens using the `/authentication` service:

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

2. Use it on other services to setup the strategies used to authenticate requests.  The following example will verify JWTs on a `todos` service:

```js
app.service('todos').hooks({
  before: {
    all: [
      auth.hooks.authenticate(['jwt'])
    ]
  }
});
```

The hooks that were once bundled with this module are now located at [feathers-legacy-authentication-hooks](https://github.com/feathersjs/feathers-legacy-authentication-hooks)


## Express Middleware

Just like hooks there is an `authenticate` middleware. It is used the exact same way you would the regular Passport Express middleware.

```js
app.post('/login', auth.express.authenticate('local', { successRedirect: '/app', failureRedirect: '/login' }));
```

The following middleware are included but typically you don't need to manually register them:

- `emitEvents` - emit `login` and `logout` events
- `exposeCookies` - expose cookies to Feathers so they are available to hooks and services
- `exposeHeaders` - expose headers to Feathers so they are available to hooks and services
- `failureRedirect` - support redirecting on auth failure. Only triggered if `hook.redirect` is set.
- `successRedirect` - support redirecting on auth success. Only triggered if `hook.redirect` is set.
- `setCookie` - support setting the JWT access token in a cookie. Only enabled if cookies are enabled.

## Complementary Plugins

The following plugins are complementary but entirely optional:

- [feathers-authentication-local](./local.md)
- [feathers-authentication-jwt](./jwt.md)
- [feathers-authentication-oauth1](./oauth1.md)
- [feathers-authentication-oauth2](./oauth2.md)
- [feathers-permissions](./permissions.md)
- [feathers-authentication-client](./client.md)

## Migrating to 1.0
Refer to [the migration guide](./docs/migrating.md).

## Complete Example
Here's an example of a Feathers server that uses `feathers-authentication` for local auth.

**Note:** This does NOT implement any authorization. Use [feathers-permissions](./permissions.md) for that.

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















## How does it work?

Regardless of whether you use OAuth, a token, or email + password to authenticate, after successful login the `feathers-authentication` plugin gives back a signed JSON web token containing the entity `id` as the payload.  An `entity` is the subject you are authenticating, whether it be a `user`, a `computer`, an `IoT` device, etc.

### Authentication Over REST

#### Creating Tokens

To create a new token with an HTTP request make a `POST` request to the local authentication endpoint with a valid set of user credentials. By default this endpoint is `/auth/local`. If you have not already set up a User Service you should do that first. See the README for [a complete example](https://github.com/feathersjs/feathers-authentication#complete-example).

The following cURL request can be used to authenticate a user from the command line using the default options. If the authentication request was successful you will receive a response back with your token.

 ```bash
 # Assuming a user exists with the following credentials
$ curl -X POST \
-H 'Content-Type: application/json' \
-d '{ "email": "hulk@hogan.net", "password": "bandana" }' \
http://127.0.0.1:3000
 ```

> **ProTip** These defaults can all be overridden as described in the [server-side config options](#options) and [local auth config options](./local.md#local-service-specific-options).

#### Using Tokens

For REST the token needs to be passed with each request. Therefore if you did `.configure(rest())` in your Feathers app, the auth plugin also includes a [special middleware](https://github.com/feathersjs/feathers-authentication/blob/master/src/middleware/index.js#L34-L73) that ensures that a token, if sent, is available on the Feathers `params` object that is passed to services and hooks by setting it on `req.feathers.token`.

> **ProTip:** The `req.feathers` object is special because its attributes are made available inside Feathers hooks on the `hook.params` object.

This middleware uses graceful fall-back to check for a token in order from most secure/appropriate to least secure:

1. Authorization header (recommended)
2. Cookie
3. The request body
4. The query string (not recommended but supported)

So you can send your token using any of those methods. Using the `authorization` header it should look like this:

```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IklseWEgRmFkZWV2IiwiYWRtaW4iOnRydWV9.YiG9JdVVm6Pvpqj8jDT5bMxsm0gwoQTOaZOLI-QfSNc
```

> **ProTip:** The `Bearer` part can be omitted and the case doesn't matter.

<!-- -->

> **ProTip:** You can use a custom header name for your token by passing a `header` option as described above.

### Authentication Over Sockets

After a socket is connected an `authenticate` event needs to be emitted from the client to initiate the socket authentication. The data passed with it can either be an email and password, a JWT or OAuth access tokens. After successful authentication an `authenticated` event is emitted from the server and just like with REST you get back a JWT and the current user. From then on you are now using an authenticated socket until that socket is disconnected, the token expires, or you log out.

### What Happens During Authentication?

Regardless of the mechanism, the credentials used to authenticate, and the transport, the high level order of execution is as follows:

1. The credentials passed in are verified or you go through a series of OAuth redirects and are verified by the OAuth provider.
2. Once credentials are verified the user associated with those credentials is looked up and if a user does not exist they are created by calling your `user` service.
3. The user id is encrypted into the JWT by an asymmetric hashing function using your `secret` inside the `token` service.
4. The user is added to the response _after_ a token is created using the `populateUser()` hook and the new token and user are returned to the client.

### Authorizing Future Requests

Regardless of the protocol, once a valid auth token has been returned to the client, for any subsequent request the token (if present) is normalized and the [verifyToken()](../authorization/bundled-hooks.md#verifytoken) hook should be called by you prior to any restricted service methods.

This hook decrypts the token found in `hook.params.token`. After the JWT is decrypted, the [populateUser()](../authorization/bundled-hooks.md#populateuser) hook should be called. This is used to look up the user by id in the database and attach them to `hook.params.user` so that any other hooks in the chain can reference the current user, for example the [restrictToAuthenticated()](../authorization/bundled-hooks.md#requireauth) hook.

For more information on refer to the [Authorization chapter](../authorization/readme.md).

## What's next?

Adding authentication allows you to know **who** users are. Now you'll want to specify **what** they can do. This is done using authorization hooks. Learn more about it in the [Authorization section](../authorization/readme.md) or dive deeper into each of the individual authentication schemes:

- [Setting Up Local Auth](local.md) (username and password)
- [Setting Up Token Auth](token.md) (JWT)
- [Setting Up OAuth1](oauth1.md) (Twitter)
- [Setting Up OAuth2](oauth2.md) (Facebook, LinkedIn, etc.)
- [Setting Up 2 Factor](two-factor.md)
- [Auth with Feathers client](client.md)

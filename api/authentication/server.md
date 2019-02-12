# Server

[![npm version](https://img.shields.io/npm/v/@feathersjs/authentication.png?style=flat-square)](https://www.npmjs.com/package/@feathersjs/authentication)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.png?style=flat-square)](https://github.com/feathersjs/feathers/blob/master/packages/authentication/CHANGELOG.md)

```
$ npm install @feathersjs/authentication --save
```

The [@feathersjs/authentication](https://github.com/feathersjs/authentication) module provides tools to support different authentication strategies and to use [JSON web token (JWT)](https://jwt.io/). The key concepts are:

- Authentication strategies that verify authentication information
- An authentication service that allows to register strategies and use them to authenticate and manage JWTs
- The `authenticate` hook which uses `params.authentication` and the authentication service to verify authentication information

> *Important:* `@feathersjs/authentication` is an abstraction for different authentication mechanisms. It does not handle things like user verification or password reset functionality etc. This can be implemented manually, with the help of libraries like [feathers-authentication-management](https://github.com/feathers-plus/feathers-authentication-management) or a platform like [Auth0](https://auth0.com/).

## Complementary Plugins

The following plugins are complementary, but entirely optional:

- Using the authentication server on the client: [@feathersjs/authentication-client](./client.md)
- Local (username/password) authentication: [@feathersjs/authentication-local](./local.md)
- OAuth authentication: [@feathersjs/authentication-oauth](./oauth.md)
- API Key authentication: [@feathersjs/authentication-api-key](./api-key.md)

## Authentication service

### constructor(app, configKey)

`new AuthenticationService(app, configKey = 'authentication')` initializes a new authentication service with the [Feathers application]() instance and a `configKey` which is the name of the configuration property to use via `app.get(configKey)` (default: `app.get('authentication')`). Will also update the configuration with the [default settings](#configuration).

### configuration

`service.configuration` returns a copy of current value of `app.get(configKey)` (default: `app.get('authentication')`) which must at least contain a `secret` property. The default configuration is:

```js
{
  entity: 'user', // The name of the entity. Can be `null` when not used
  service: 'users', // The service to retrieve the entity from
  jwtOptions: {
    header: { typ: 'access' }, // by default is an access token but can be any type
    audience: 'https://yourdomain.com', // The resource server where the token is processed
    issuer: 'feathers', // The issuing server, application or resource
    algorithm: 'HS256',
    expiresIn: '1d'
  },
  jwt: {
    header: 'Authorization', // The HTTP header value
    schemes: [ 'Bearer', 'JWT' ] // The header schemes to use (e.g. `Bearer <token>`)
  }
}
```

`jwtOption` can take all options available for the [node-jsonwebtoken package](https://github.com/auth0/node-jsonwebtoken).

> *Note:* `typ` in the `header` options is not a typo, it is part of the [JWT JOSE header specification](https://tools.ietf.org/html/rfc7519#section-5).

### register(name, strategy)

`service.register(name, strategy)` registers an [authentication strategy]() under `name` and calls the strategy setters `setName`, `setAuthentication` and `setApplication` if implemented.

### getStrategies(...names)

`service.getStrategies(...names)` returns the authentication strategies that exist for a list of names.

### authenticate(data, params, ...strategies)

Run [.authenticate()]() for the given `strategies` with `data` and `params`. Will return the value of the first strategy that didn't throw an error or the first error if all strategies failed. If `data.strategy` is set and it is not included in `strategies`, an error will be thrown.

### parse(req, res, ...strategies)

Parse a [NodeJS HTTP request](https://nodejs.org/api/http.html#http_class_http_incomingmessage) and [response](https://nodejs.org/api/http.html#http_class_http_serverresponse) for authentication information using `strategies` calling [each strategies `.parse()` method](). Will return the value of the first strategy that didn't return `null`.

### createJWT(payload, [options, secret])

Create a new JWT with `payload` using [configuration.jwtOptions](#configuration) merged with `options` (optional). Will either use `configuration.secret` or the optional `secret` to sign the JWT.

### verifyJWT(accessToken, [options, secret])

Verify the JWT `accessToken` using `configuration.jwtOptions` merged with `options` (optional). Will either use `configuration.secret` or the optional `secret` to verify the JWT.

### getJwtOptions(authResult, params)

Return the options for creating a new JWT based on the return value from an authentication strategy. Called internally on [.create](). Will try to set the JWT subject to the entity (user) id if it is available which in turn is used by the [JWT strategy]() to populate `params[entity]` (usually `params.user`).

### getPayload(authResult, params)

Returns the payload for an authentication result and parameters. Called internally on [.create](). Will either return `params.payload` or an empty object (`{}`).

### create(data, params)

### remove(id, params)

Should be called with `id` set to `null` or to the authenticated JWT. Will verify `params.authentication` and emit the [`logout` event]() if successful.

### setup(path, app)

Will verify the [configuration](#configuration) and make sure that

- A `secret` has been set
- If `entity` is not `null`, check if the entity service is available and make sure that either the `entityId` configuration or the `entityService.id` property is set.
- Register internal hooks to send events and keep real-time connections up to date. All custom hooks should be registered at this time.

### Customization

The `AuthenticationService` can be customized like any other ES6 class:

```js
const { AuthenticationService } = require('@feathersjs/authentication');

class MyAuthService extends AuthenticationService {
  async getPayload(authResult, params) {
    // Call original `getPayload` first
    const payload = await super.getPayload(authResult, params);
    const { user } = authResult;

    if (user && user.permissions) {
      payload.permissions = user.permissions;
    }

    return payload;
  }
}

app.use('/authentication', new MyAuthService(app));
```

Things to be aware of when extending the authentication service:

- When implementing your own `constructor`, always call `super(app, configKey)`
- When overriding a method, calling `super.method` and working with its return value is recommended unless you are certain your custom method behaves exactly the same way, otherwise things may no longer work as expected.
- When extending `setup`, `super.setup(path, app)` should always be called, otherwise events and real-time connection authentication will no longer work.

## Authentication strategies

### setName(name)

Will be called with the `name` under which the strategy has been registered.

### setApplication(app)

Will be called with the [application]() instance.

### setAuthentication(service)

Will be called with the [Authentication service]() this strategy has been registered on.

### authenticate(data, params)

Authenticate `data` with additional `params`. A strategy may check for `data.strategy` being set to its `name` and throw an error if it does not match. `authenticate` will be called for all strategies. `authenticate` should throw a `NotAuthenticated` if it failed or return an authentication result object.

### parse(req, res)

Parse a given plain Node HTTP request and response and return `null` or the authentication information it provides. `parse` does not have to implemented.

## `authenticate` hook

The `authenticate` hook will use `params.authentication` of the service method call and run [authenticationService.authenticate()]().

It should be used as a `before` hook and either takes a list of strategy names (using `app.service('authentication')` as the authentication service) or an object with `service` set to the authentication service name and `strategies` set to a list of strategy names to authenticate with:

```js
const { authenticate } = require('@feathersjs/authentication');

// Authenticate with `jwt` and `api-key` strategy
// using app.service('authentication') as the authentication service
app.service('messages').hooks({
  before: authenticate('jwt', 'api-key')
});

// Authenticate with `jwt` and `api-key` strategy
// using app.service('v1/authentication') as the authentication service
app.service('messages').hooks({
  before: authenticate({
    service: 'v1/authentication',
    strategies: [ 'jwt', 'api-key' ]
  })
});
```

It will either throw an error if all strategies failed or merge `params` with the result from the first successful authentication strategy. For example, a successful [JWT strategy]() authentication will set:

```js
params.authentication.payload // The decoded payload
params.authentication.strategy === 'jwt' // The strategy name
params.user // or params[entity] if entity is not `null`
```

In the following hooks and for the service method call.

## Events

### app.on('login')

### app.on('logout')

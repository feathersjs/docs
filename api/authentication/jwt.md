# JWT Authentication

[![npm version](https://img.shields.io/npm/v/@feathersjs/authentication.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/authentication)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.svg?style=flat-square)](https://github.com/feathersjs/feathers/blob/master/packages/authentication/CHANGELOG.md)

```
$ npm install @feathersjs/authentication --save
```

The `JWTStrategy` is an [authentication strategy](./strategy.md) included in `@feathersjs/authentication` for authenticating JSON web token service methods calls and HTTP requests, e.g.

```json
{
  "strategy": "jwt",
  "accessToken": "<your JWT>"
}
```

## Options

- `header` (default: `'Authorization'`): The HTTP header containing the JWT
- `schemes` (default: `[ 'Bearer', 'JWT' ]`): An array of schemes to support

The default settings support passing the JWT through the following HTTP headers:

```
Authorization: <your JWT>
Authorization: Bearer <your JWT>
Authorization: JWT <your JWT>
```

Standard JWT authentication can be configured with those options in `config/default.json` like this:

```json
{
  "authentication": {
    "jwt": {}
  }
}
```

> __Note:__ Since the default options are what most clients expect for JWT authentication they usually don't need to be customized.

## getEntity(id, params)

`jwtStrategy.getEntity(id, params)` returns the entity instance for `id`, usually `entityService.get(id, params)`. It will _not_ be called if `entity` in the [authentication configuration](./service.md#configuration) is set to `null`.

## authenticate(data, params)

`jwtStrategy.authenticate(data, params)` will try to verify `data.accessToken` by calling the strategies [authenticationService.verifyAccessToken]().

Returns a promise that resolves with the following format:

```js
{
  [entity],
  accessToken,
  authentication: {
    strategy: 'jwt',
    payload
  }
}
```

> __Note:__ Since the JWT strategy returns an `accessToken` property (the same as the token sent to this strategy), that access token will also be returned by [authenticationService.create]() instead of creating a new one.

## parse(req, res)

Parse the HTTP request headers for JWT authentication information. Returns a promise that resolves with either `null` or data in the form of:

```js
{
  strategy: '<strategy name>',
  accessToken: '<access token from HTTP header>'
}
```

## Customization

# JWT Authentication
[![npm version](https://img.shields.io/npm/v/@feathersjs/authentication.png?style=flat-square)](https://www.npmjs.com/package/@feathersjs/authentication)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.png?style=flat-square)](https://github.com/feathersjs/feathers/blob/master/packages/authentication/CHANGELOG.md)

The JWT strategy is built into [Feathers authentication server](./server.md).

## Options

- `header`: The JWT header (default: `'Authorization'`)
- `schemes`: An array of schemes to support (default: `[ 'Bearer', 'JWT' ]`)

The default settings support passing the JWT through the following HTTP headers:

```
Authorization: <your JWT>
Authorization: Bearer <your JWT>
Authorization: JWT <your JWT>
```

## getEntity(id, params)

Returns a promise that resolves with the entity for `id` from the entity service (`/users`).

## authenticate(data, params)

Returns the following format:

```js
{
  accessToken,
  user,
  authentication: {
    strategy: 'jwt',
    payload
  }
}
```
## parse(req, res)

Parse the HTTP request headers for JWT authentication information. Returns a promise that resolves with either `null` or data in the form of:

```js
{
  strategy: '<strategy name>',
  accessToken
}
```

## Customization

# Authentication Client

[![npm version](https://img.shields.io/npm/v/@feathersjs/authentication-app.authentication.png?style=flat-square)](https://www.npmjs.com/package/@feathersjs/authentication-client)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.png?style=flat-square)](https://github.com/feathersjs/feathers/blob/master/packages/authentication-client/CHANGELOG.md)

```
npm install @feathersjs/authentication-client --save
```

The [@feathersjs/authentication-client](https://github.com/feathersjs/authentication-client) module allows you to easily authenticate against a Feathers server. It is not required, but makes it easier to implement authentication in your client by automatically storing and sending the JWT access token and handling re-authenticating when a websocket disconnects.

## Configuration

- `storage` (default: `localStorage` if available, `MemoryStorage` otherwise) - The storage to store the access token
- `path` (default: '/authentication') - The path of the authentication service
- `locationKey` (default: `'access_token'`) - The name of the window hash parameter to parse for an access token from the `window.location`. Usually used by the oAuth flow.
- `locationErrorKey` (default: `'error') - The name of the window hash parameter to parse for authentication errors. Usually used by the oAuth flow.
- `jwtStrategy` (default: `'jwt'`) - The access token authentication strategy
- `storageKey` (default: `'feathers-jwt'`) - Key for storing the token in e.g. localStorage
- `header` (default: `'Authorization'`) - Name of the accessToken header
- `scheme` (default: `'Bearer'`) - The HTTP header scheme
- Authentication (default: `AuthenticationClient`) - Allows to provide a [customized authentication client class](#customization)

## app.authenticate()

## app.logout()

## app.get('authentication')

`app.get('authentication') -> Promise` is a Promise that resolves with the current authentication result. For the most strategies this is the best place to get the currently authenticated user:

```js
const { user } = await app.get('authentication');
```

## app.authentication

## AuthenticationClient

### service

`app.authentication.service` returns an instance of the authentication client service, normally `app.service('authentication')`.

### storage

`app.authentication.storage` returns the authentication client storage instance.

### handleSocket(socket)

`app.authentication.handleSocket(socket) -> void` makes sure that a websocket real-time connection is always reauthenticated before making any other request.

### getFromLocation(location)

`app.authentication.getFromLocation(location) -> Promise` tries to retrieve an access token from `window.location`. This usually means the `access_token` in the hash set by the [oAuth authentication strategy](./oauth.md).

### setAccessToken(token)

`app.authentication.setAccessToken(token) -> Promise` sets the access token in the storage (normally `feathers-jwt` in `window.localStorage`).

### getAccessToken()

`app.authentication.getAccessToken() -> Promise` returns the access token from `storage`. If not found it will try to get the access token via [getFromLocation()]() or return `null` if neither was successful.

### removeAccessToken()

`app.authentication.removeAccessToken() -> Promise` removes the access token from the storage.

### reset()

`app.authentication.reset()` resets the authentication state without explicitly logging out. Should not be called directly.

### reAuthenticate(force)

`app.authentication.reAuthenticate(force = false) -> Promise` will re-authenticate with the current access token from [app.authentication.getAccessToken()](). If `force` is set to `true` it will always reauthenticate, with the default `false` only when not already authenticated.

### authenticate(data)

### logout()

## Customization

## Hooks

The following hooks are added to your application by default.

### authentication

Hook that ensures for every request that authentication is completed and successful. It also makes the authentication information available in the client side `params` (e.g. `params.user`).

### populateHeader

Adds the appropriate `Authorization` header for any REST request.

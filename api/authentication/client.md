# Authentication Client

[![npm version](https://img.shields.io/npm/v/@feathersjs/authentication-client.png?style=flat-square)](https://www.npmjs.com/package/@feathersjs/authentication-client)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.png?style=flat-square)](https://github.com/feathersjs/feathers/blob/master/packages/authentication-client/CHANGELOG.md)

```
npm install @feathersjs/authentication-client --save
```

The [@feathersjs/authentication-client](https://github.com/feathersjs/authentication-client) module allows you to easily authenticate against a Feathers server. It is not required, but makes it easier to implement authentication in your client by automatically storing and sending the JWT access token and handling re-authenticating when a websocket disconnects.

## Configuration

- `storage` - The storage to store the access token (default: `localStorage` if available, `MemoryStorage` otherwise)
- `path` - The path of the authentication service (default: '/authentication')
- `locationKey` - The name of the query string parameter to parse for an access token from the `window.location`. Usually used by the oAuth flow. (default: `'access_token'`)
- `jwtStrategy` - The access token authentication strategy (default: `'jwt'`)
- `storageKey` - Key for storing the token in e.g. localStorage (default: `'feathers-jwt'`)
- `header` - Name of the accessToken header (default: `'Authorization'`)
- `scheme` - The HTTP header scheme (default: `'Bearer'`)
- Authentication - Allows to provide a custom authentication client class (default: `AuthenticationClient`)

## app.authenticate()

## app.logout()

## app.authentication

## AuthenticationClient

### getJwt()

### setJwt(jwt)

### removeJwt()

### getFromLocation(location)

### reset()

### reAuthenticate(force)

### authenticate(authentication)

### logout()

## Hooks

The following hooks are added to your application by default.

### authentication

Hook that ensures for every request that authentication is completed and successful. It also makes the authentication information available in the client side `params` (e.g. `params.user`).

### populateHeader

Adds the appropriate `Authorization` header for any REST request.

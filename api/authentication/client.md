# Authentication Client

[![npm version](https://img.shields.io/npm/v/@feathersjs/authentication-client.png?style=flat-square)](https://www.npmjs.com/package/@feathersjs/authentication-client)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.png?style=flat-square)](https://github.com/feathersjs/feathers/blob/master/packages/authentication-client/CHANGELOG.md)

```
npm install @feathersjs/authentication-client --save
```

The [@feathersjs/authentication-client](https://github.com/feathersjs/authentication-client) module allows you to easily authenticate against a Feathers server. It is not required, but makes it easier to implement authentication in your client by automatically storing and sending the JWT access token and handling re-authenticating when a websocket disconnects.

## Configuration

- header: 'Authorization',
- scheme: 'Bearer',
- storageKey: 'feathers-jwt',
- locationKey: 'access_token',
- jwtStrategy: 'jwt',
- path: '/authentication',
- Authentication: AuthenticationClient,
- storage: defaultStorage

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

### authentication

### populateHeader

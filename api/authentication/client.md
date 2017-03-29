# Authentication Client

[![GitHub stars](https://img.shields.io/github/stars/feathersjs/feathers-authentication-client.png?style=social&label=Star)](https://github.com/feathersjs/feathers-authentication-client/)
[![npm version](https://img.shields.io/npm/v/feathers-authentication-client.png?style=flat-square)](https://www.npmjs.com/package/feathers-authentication-client)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.png?style=flat-square)](https://github.com/feathersjs/feathers-authentication-client/blob/master/CHANGELOG.md)

```
npm install feathers-authentication-client --save
```

**Note:** This is only compatibile with `feathers-authentication@1.x` and above.

The [feathers-authentication-client](https://github.com/feathersjs/feathers-authentication-client) module allows you to easily authenticate against a Feathers server. It is not required. It simply makes it easier to implement authentication in your client by automatically storing and sending the JWT access token and handling re-authenticating when a websocket disconnects.

## API

This module contains:

- [The main entry function](#configuration)
- [Additional feathersClient methods](#additional-feathersclient-methods)
- [Some helpful hooks](#hooks)

## Configuration
### `feathersClient.configure(auth(options))`
Setup is done the same as all Feathers plugins, using the `configure` method:

```js
import auth from 'feathers-authentication-client';

// Available options are listed in the "Default Options" section
feathersClient.configure(auth(options))
```

### Default `options`

The following default options will be mixed in with the settings you pass in when configuring authentication. It will set the mixed options back to to the app so that they are available at any time by `app.get('auth')`. They can all be overridden.

```js
{
  header: 'Authorization', // the default authorization header for REST
  path: '/authentication', // the server-side authentication service path
  jwtStrategy: 'jwt', // the name of the JWT authentication strategy 
  entity: 'user', // the entity you are authenticating (ie. a users)
  service: 'users', // the service to look up the entity
  cookie: 'feathers-jwt', // the name of the cookie to parse the JWT from when cookies are enabled server side
  storageKey: 'feathers-jwt', // the key to store the accessToken in localstorage or AsyncStorage on React Native
  storage: undefined // Passing a WebStorage-compatible object to enable automatic storage on the client.
}
```

To enable `localStorage` on the client, be sure to set `storage: window.localStorage` in the client options.  You can also provide other WebStorage-compatible objects.  One particularly handy storage package is [localForage](https://www.npmjs.com/package/localforage), which helps deal with older browsers and browsers in Incognito / Private Browsing mode.

## Additional feathersClient methods

After configuring this plugin, the Feathers client will have a few additional methods:

### `feathersClient.authenticate(options)` [source](https://github.com/feathersjs/feathers-authentication-client/blob/master/src/passport.js#L136)
Authenticate with a Feathers server by passing a `strategy` and other properties as credentials. It will use whichever transport has been setup on the client (feathers-rest, feathers-socketio, or feathers-primus). Returns a Promise.

```js
feathersClient.authenticate({
  strategy: 'jwt', 
  accessToken: '<the.jwt.token.string>'
})
```

- `data {Object}` - of the format `{strategy [, ...otherProps]}`
  - `strategy {String}` - the name of the strategy to be used to authenticate.  Required.
  - `...otherProps {Properties} ` vary depending on the chosen strategy. Above is an example of using the `jwt` strategy.  Below is one for the `local` strategy.

```js
feathersClient.authenticate({
  strategy: 'local',
  email: 'my@email.com',
  password: 'my-password'
})
```

### `feathersClient.logout()` [source](https://github.com/feathersjs/feathers-authentication-client/blob/master/src/passport.js#L212)
Removes the JWT accessToken from storage on the client.  It also calls the `remove` method of the `/authentication` service on the Feathers server.

### `feathersClient.passport.getJWT()` [source](https://github.com/feathersjs/feathers-authentication-client/blob/master/src/passport.js#L245)
Pull the JWT from localstorage or the cookie. Returns a Promise.

### `feathersClient.passport.verifyJWT(token)` [source](https://github.com/feathersjs/feathers-authentication-client/blob/master/src/passport.js#L268)
Verify that a JWT is not expired and decode it to get the payload. Returns a Promise.

### `feathersClient.passport.payloadIsValid(token)` [source](https://github.com/feathersjs/feathers-authentication-client/blob/master/src/utils.js#L21)
Synchronously verify that a token has not expired. Returns a Boolean.

## Hooks

There are 3 hooks. They are really meant for internal use and you shouldn't need to worry about them very often.

- `populateAccessToken` - Takes the token and puts in on `hooks.params.accessToken` in case you need it in one of your client side services or hooks
- `populateHeader` - Add the accessToken to the authorization header
- `populateEntity` - Experimental. Populate an entity based on the JWT payload.

## Complete Example

Here's an example of a Feathers server that uses `feathers-authentication-client`. 

```js
const feathers = require('feathers/client');
const rest = require('feathers-rest/client');
const superagent = require('superagent');
const hooks = require('feathers-hooks');
const localStorage = require('localstorage-memory');
const auth = require('feathers-authentication-client');

const feathersClient = feathers();

feathersClient.configure(hooks())
  .configure(rest('http://localhost:3030').superagent(superagent))
  .configure(auth({ storage: localStorage }));

feathersClient.authenticate({
  strategy: 'local',
  email: 'admin@feathersjs.com',
  password: 'admin'
})
.then(response => {
  console.log('Authenticated!', response);
  return feathersClient.passport.verifyJWT(response.accessToken);
})
.then(payload => {
  console.log('JWT Payload', payload);
  return feathersClient.service('users').get(payload.userId);
})
.then(user => {
  feathersClient.set('user', user);
  console.log('User', client.get('user'));
})
.catch(function(error){
  console.error('Error authenticating!', error);
});
```

### Handling the special re-authentication errors

In the event that your server goes down or the client loses connectivity, it will automatically handle attempting to re-authenticate the socket when the client regains connectivity with the server. In order to handle an authentication failure during automatic re-authentication you need to implement the following event listener:

```js
const errorHandler = error => {
  app.authenticate({
    strategy: 'local',
    email: 'admin@feathersjs.com',
    password: 'admin'
  }).then(response => {
    // You are now authenticated again
  });
};

// Handle when auth fails during a reconnect or a transport upgrade
app.on('reauthentication-error', errorHandler)
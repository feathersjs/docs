# Authentication Client

[![GitHub stars](https://img.shields.io/github/stars/feathersjs/authentication-client.png?style=social&label=Star)](https://github.com/feathersjs/authentication-client/)
[![npm version](https://img.shields.io/npm/v/@feathersjs/authentication-client.png?style=flat-square)](https://www.npmjs.com/package/@feathersjs/authentication-client)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.png?style=flat-square)](https://github.com/feathersjs/authentication-client/blob/master/CHANGELOG.md)

```
npm install @feathersjs/authentication-client --save
```

The [@feathersjs/authentication-client](https://github.com/feathersjs/authentication-client) module allows you to easily authenticate against a Feathers server. It is not required, but makes it easier to implement authentication in your client by automatically storing and sending the JWT access token and handling re-authenticating when a websocket disconnects.

This module contains:

- [The main entry function](#configuration)
- [Additional feathersClient methods](#additional-feathersclient-methods)
- [Some helpful hooks](#hooks)


## app.configure(auth(options))

Setup is done the same as all Feathers plugins, using the `configure` method:

```js
const feathers = require('@feathersjs/feathers');
const auth = require('@feathersjs/authentication-client');

const app = feathers();

// Available options are listed in the "Options" section
app.configure(auth(options))
```

> The [transports plugins](../client.md) must have been initialized previously to the authentication plugin on the client side

## Options

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

To enable storing the JWT make sure to provide a `storage` when configuring the plugin. The following storage options are available:

- `window.localStorage` in the browser to use the browsers [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [AsyncStorage](https://facebook.github.io/react-native/docs/asyncstorage.html) for _React Native_
- [localForage](https://www.npmjs.com/package/localforage) which helps deal with older browsers and browsers in Incognito / Private Browsing mode.
- [cookie-storage](https://www.npmjs.com/package/cookie-storage) uses cookies. It can be useful on devices that don't support `localStorage`.

## app.authenticate()

`app.authenticate() -> Promise` with no arguments will authenticate using the JWT from the `storage`. This is normally called to either show your application (when successfull) or showing a login page or redirecting to the appropriate oAuth link.

```js
app.authenticate().then(() => {
  // show application page
}).catch(() => {
  // show login page
})
```

> __Important:__ `app.authenticate()` __has__ to be called when you want to use the token from storage and __only once__ when the application initializes. Once successfull, all subsequent requests will send their authentication information automatically.

## app.authenticate(options)

`app.authenticate(options) -> Promise` will try to authenticate with a Feathers server by passing a `strategy` and other properties as credentials. It will use whichever transport has been setup on the client (@feathersjs/rest-client, @feathersjs/socketio-client, or @feathersjs/primus-client).

```js
// Authenticate with the local email/password strategy 
app.authenticate({
  strategy: 'local',
  email: 'my@email.com',
  password: 'my-password'
}).then(() => {
  // Logged in
}).catch(e => {
  // Show login page (potentially with `e.message`)
  console.error('Authentication error', e);
});

app.authenticate({
  strategy: 'jwt', 
  accessToken: '<the.jwt.token.string>'
}).then(() => {
  // JWT authentication successful
}).catch(e => {
  console.error('Authentication error', e);
  // Show login page
});
```

- `data {Object}` - of the format `{strategy [, ...otherProps]}`
  - `strategy {String}` - the name of the strategy to be used to authenticate.  Required.
  - `...otherProps {Properties} ` vary depending on the chosen strategy. Above is an example of using the `jwt` strategy.  Below is one for the `local` strategy.

## app.logout()

Removes the JWT accessToken from storage on the client.  It also calls the `remove` method of the [/authentication service](./server.md) on the Feathers server.

## app.passport

`app.passport` contains helper functions to work with the JWT.

### app.passport.getJWT()
  
Pull the JWT from `storage` or the cookie. Returns a Promise.

### app.passport.verifyJWT(token)

Verify that a JWT is not expired and decode it to get the payload. Returns a Promise.

### app.passport.payloadIsValid(token)

Synchronously verify that a token has not expired. Returns a Boolean.

## Authentication Events
On the client authentication events are emitted on the app object whenever a client successfully authenticates or "logs out".
These events are emitted on the client.

## app.on('authenticated', callback))
## app.on('logout', callback))
## app.on('reauthentication-error', errorHandler)

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
```

## Hooks

There are 3 hooks. They are really meant for internal use and you shouldn't need to worry about them very often.

- `populateAccessToken` - Takes the token and puts in on `hooks.params.accessToken` in case you need it in one of your client side services or hooks
- `populateHeader` - Add the accessToken to the authorization header
- `populateEntity` - Experimental. Populate an entity based on the JWT payload.

## Complete Example

Here's an example of a Feathers server that uses `@feathersjs/authentication-client`. 

```js
const feathers = require('@feathersjs/feathers');
const rest = require('@feathersjs/rest-client');
const auth = require('@feathersjs/authentication-client');

const superagent = require('superagent');
const localStorage = require('localstorage-memory');

const feathersClient = feathers();

feathersClient.configure(rest('http://localhost:3030').superagent(superagent))
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
  console.log('User', feathersClient.get('user'));
})
.catch(function(error){
  console.error('Error authenticating!', error);
});
```

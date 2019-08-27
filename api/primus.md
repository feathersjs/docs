# Primus

[![npm version](https://img.shields.io/npm/v/@feathersjs/primus.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/primus)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.svg?style=flat-square)](https://github.com/feathersjs/feathers/blob/master/packages/primus/CHANGELOG.md)

```
$ npm install @feathersjs/primus --save
```

The [@feathersjs/primus](https://github.com/feathersjs/primus) module allows to call [service methods](./services.md) and receive [real-time events](./events.md) via [Primus](https://github.com/primus/primus), a universal wrapper for real-time frameworks that supports Engine.IO, WebSockets, Faye, BrowserChannel, SockJS and Socket.IO.

> **Important:** This page describes how to set up Primus server. The [Primus client chapter](./client/primus.md) shows how to connect to this server on the client and the message format for service calls and real-time events.

## Configuration

Additionally to `@feathersjs/primus` your websocket library of choice also has to be installed.

```
$ npm install ws --save
```

### app.configure(primus(options))

Sets up the Primus transport with the given [Primus options](https://github.com/primus/primus).

> **Pro tip:** Once the server has been started with `app.listen()` or `app.setup(server)` the Primus server object is available as `app.primus`.

```js
const feathers = require('@feathersjs/feathers');
const primus = require('@feathersjs/primus');

const app = feathers();

// Set up Primus with SockJS
app.configure(primus({ transformer: 'ws' }));

app.listen(3030);
```

### app.configure(primus(options, callback))

Sets up the Primus transport with the given [Primus options](https://github.com/primus/primus) and calls the callback with the Primus server instance.

```js
const feathers = require('@feathersjs/feathers');
const primus = require('@feathersjs/primus');

const app = feathers();

// Set up Primus with SockJS
app.configure(primus({
  transformer: 'ws'
}, function(primus) {
  // Do something with primus object
}));

app.listen(3030);
```

## params

The Primus request object has a `feathers` property that can be extended with additional service `params` during authorization:

```js
app.configure(primus({
  transformer: 'ws'
}, function(primus) {
  // Do something with primus
  primus.use('feathers-referrer', function(req, res){
    // Exposing a request property to services and hooks
    req.feathers.referrer = request.referrer;
  });
}));

app.use('messages', {
  create(data, params, callback) {
    // When called via Primus:
    params.referrer // referrer from request
  }
});
```

### params.provider

For any [service method call](./services.md) made through a Primus socket `params.provider` will be set to `primus`. In a [hook](./hooks.md) this can for example be used to prevent external users from making a service method call:

```js
app.service('users').hooks({
  before: {
    remove(context) {
      // check for if(context.params.provider) to prevent any external call
      if(context.params.provider === 'primus') {
        throw new Error('You can not delete a user via Primus');
      }
    }
  }
});
```

### params.query

`params.query` will contain the query parameters sent from the client.

> **Important:** Only `params.query` is passed between the server and the client, other parts of `params` are not. This is for security reasons so that a client can't set things like `params.user` or the database options. You can always map from `params.query` to `params` in a before [hook](./hooks.md).

### params.connection

`params.connection` is the connection object that can be used with [channels](./channels.md). It is the same object as `req.feathers` in a Primus middleware as [shown in the `params` section](#params).

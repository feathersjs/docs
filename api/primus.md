# Primus

[![GitHub stars](https://img.shields.io/github/stars/feathersjs/primus.png?style=social&label=Star)](https://github.com/feathersjs/primus/)
[![npm version](https://img.shields.io/npm/v/@feathersjs/primus.png?style=flat-square)](https://www.npmjs.com/package/@feathersjs/primus)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.png?style=flat-square)](https://github.com/feathersjs/primus/blob/master/CHANGELOG.md)

```
$ npm install @feathersjs/primus --save
```

The [@feathersjs/primus](https://github.com/feathersjs/primus) module allows to call [service methods](./services.md) and receive [real-time events](./events.md) via [Primus](https://github.com/primus/primus), a universal wrapper for real-time frameworks that supports Engine.IO, WebSockets, Faye, BrowserChannel, SockJS and Socket.IO.

| Service method  | Method event name   | Real-time event    |
|-----------------|---------------------|--------------------|
| .find()         | `find`              | -                  |
| .get()          | `get`               | -                  |
| .create()       | `create`            | `messages created` |
| .update()       | `update`            | `messages updated` |
| .patch()        | `patch`             | `messages patched` |
| .remove()       | `removed`           | `messages removed` |

> **Important:** Primus is also used to *call* service methods. Using sockets for both, calling methods and receiving real-time events is generally faster than using [REST](./express.md) and there is usually no need to use both, REST and Socket.io in the same client application at the same time.

## Server

Additionally to `@feathersjs/primus` your websocket library of choice also has to be installed.

```
$ npm install ws --save
```

### `app.configure(primus(options [, callback]))`

Sets up the Primus transport with the given [Primus options](https://github.com/primus/primus) and optionally calls the callback with the Primus server instance.

> **Pro tip:** Once the server has been started with `app.listen()` or `app.setup(server)` the Primus server object is available as `app.primus`.

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
```

### `params.provider`

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

### `params.query`

`params.query` will contain the query parameters sent from the client.

> **Important:** Only `params.query` is passed between the server and the client, other parts of `params` are not. This is for security reasons so that a client can't set things like `params.user` or the database options. You can always map from `params.query` to `params` in a before [hook](./hooks.md).

### Middleware and service parameters

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

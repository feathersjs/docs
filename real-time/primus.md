# The Primus Provider

[Primus](https://github.com/primus/primus) is a universal wrapper for real-time frameworks that supports Engine.IO, WebSockets, Faye, BrowserChannel, SockJS and Socket.IO.

## Server Side Usage

Install the provider module with:

```
$ npm install feathers-primus ws
```

> **ProTip:** Here we also installed the `ws` module which will let us use plain websockets. Typically you need to install your transport module in addition to primus. See the [Primus docs](https://github.com/primus/primus) for more details.

Now import the module and pass `primus(configuration [, fn])` to `app.configure`.

The following example will start a server on port 3030 and also set up Primus using the `ws` websocket module.

```js
const feathers = require('feathers');
const primus = require('feathers-primus');

const app = feathers().configure(primus({
  transformer: 'websockets'
}));

app.listen(3030);
```

### Configuration

The second parameter to the configuration function can be a callback that gets called with the Primus server instance that can be used to register Primus [Middleware](https://github.com/primus/primus#middleware) or [Plugins](https://github.com/primus/primus#plugins)

```js
// Set up Primus with SockJS
app.configure(feathers.primus({
  transformer: 'sockjs'
}, function(primus) {
  // Do something with primus object
}));
```

### Middleware and service parameters

Just like [REST](../rest/readme.md) and [SocketIO](socket-io.md), the Primus request object has a `feathers` property that can be extended with additional service `params` during authorization:

```js
app.configure(primus({
  transformer: 'sockjs'
}, function(primus) {
  // Do something with primus
  primus.before('todos::create', function(socket, done){
    // Exposing a request property to services and hooks
    socket.request.feathers.referrer = socket.request.referrer;
    done();
  });
}));

app.use('messages', {
  create(data, params, callback) {
    // When called via Primus:
    params.provider // -> primus
    params.user // -> { name: 'David' }
  }
});
```

## Client Side Usage

A detailed description of the usage on a client can be found in the [Primus Feathers client](../clients/primus.md) chapter.

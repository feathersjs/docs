![feathers-socketio](/img/header-provider-socketio.jpg)

# The Socket.io Provider

The [feathers-socketio](https://github.com/feathersjs/feathers-socketio) provider adds support for [Socket.io](http://socket.io/) which enables real-time bi-directional, event-based communication. It works on every platform, browser or device, focusing equally on reliability and speed.

## Server Side Usage

Install the provider module with:

```
$ npm install feathers-socketio
```

Then import the module and pass it to `app.configure`. The following example will start a server on port 3030 and also set up Socket.io:

```js
const feathers = require('feathers');
const socketio = require('feathers-socketio');

const app = feathers().configure(socketio());

app.listen(3030);
```

### Configuration

Once the server has been started with `app.listen()` the Socket.io object is available as `app.io`. It is also possible to pass a function that gets called with the initialized `io` server object (for more details see the [Socket.io server documentation](http://socket.io/docs/server-api/)). This is a good place to listen to custom events or add [authorization](https://github.com/LearnBoost/socket.io/wiki/Authorizing):

```js
const feathers = require('feathers');
const socketio = require('feathers-socketio');

const app = feathers()
  .configure(socketio(function(io) {
    io.on('connection', function(socket) {
      socket.emit('news', { text: 'A client connected!' });
      socket.on('my other event', function (data) {
        console.log(data);
      });
    });
    
    // Registering Socket.io middleware
    io.use(function (socket, next) {
      // Exposing a request property to services and hooks
      socket.feathers.referrer = socket.request.referrer;
      next();
    });
  }));

app.listen(3030);
```

It is also possible to additionally pass [a Socket.io options object](https://github.com/socketio/engine.io#methods-1). This can be used to e.g. configure the path where Socket.io is initialize (`socket.io/` by default). The following changes the path to `ws/`:


```js
const feathers = require('feathers');
const socketio = require('feathers-socketio');

const app = feathers()
  .configure(socketio({
    path: '/ws/'
  }, function(io) {
    // Do something here
    // This function is optional
  }));

app.listen(3030);
```

### Using uWebSocket for better performance

[uWebSocket](https://github.com/uwebsockets/uwebsockets) is a WebSocket server implementation that provides better performace and reduced latency. You may opt-in to using uWebSockets whenever you configure `feathers-socket.io`.

```
$ npm install uws --save
```

```js
const feathers = require('feathers');
const socketio = require('feathers-socketio');

const app = feathers()
  .configure(socketio({
    wsEngine: 'uws'
  });

app.listen(3030);
```

### Middleware and service parameters

Similar to [REST provider](../rest/readme.md) middleware, Socket.io middleware can modify the `feathers` property on the `socket` which will then be used as the service parameters:

```js
app.configure(socketio(function(io) {
  io.use(function (socket, next) {
    socket.feathers.user = { name: 'David' };
    next();
  });
}));

app.use('messages', {
  create(data, params, callback) {
    // When called via SocketIO:
    params.provider // -> socketio
    params.user // -> { name: 'David' }
  }
});
```

## Client Side Usage

A detailed description of the usage on a client can be found in [Feathers Socket.io client](../clients/socket-io.md) chapter.

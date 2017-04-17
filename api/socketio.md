# Socket.io

[![GitHub stars](https://img.shields.io/github/stars/feathersjs/feathers-socketio.png?style=social&label=Star)](https://github.com/feathersjs/feathers-socketio/)
[![npm version](https://img.shields.io/npm/v/feathers-socketio.png?style=flat-square)](https://www.npmjs.com/package/feathers-socketio)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.png?style=flat-square)](https://github.com/feathersjs/feathers-socketio/blob/master/CHANGELOG.md)

```
$ npm install feathers-socketio --save
```

The [feathers-socketio](https://github.com/feathersjs/feathers-socketio) module allows to call [service methods](./services.md) and receive [real-time events](./events.md) via [Socket.io](http://socket.io/), a NodeJS library which enables real-time bi-directional, event-based communication.

| Service method  | Method event name   | Real-time event    |
|-----------------|---------------------|--------------------|
| .find()         | `messages::find`    | -                  |
| .get()          | `messages::get`     | -                  |
| .create()       | `messages::create`  | `messages created` |
| .update()       | `messages::update`  | `messages updated` |
| .patch()        | `messages::patch`   | `messages patched` |
| .remove()       | `messages::removed` | `messages removed` |

> **Important:** Socket.io is also used to *call* service methods. Using sockets for both, calling methods and receiving real-time events is generally faster than using [REST](rest.md) and there is usually no need to use both, REST and Socket.io in the same client application at the same time.

## Server

### `app.configure(socketio())`

Sets up the Socket.io transport with the default configuration using either the server provided by [app.listen](./application.md#listen) or passed in [app.setup(server)](./application.md#setup).

```js
const feathers = require('feathers');
const socketio = require('feathers-socketio');

const app = feathers();

app.configure(socketio());

app.listen(3030);
```

> **Pro tip:** Once the server has been started with `app.listen()` or `app.setup(server)` the Socket.io object is available as `app.io`.

### `app.configure(socketio(callback))`

Sets up the Socket.io transport with the default configuration and call `callback` with the [Socket.io server object](http://socket.io/docs/server-api/). This is a good place to listen to custom events or add [authorization](https://github.com/LearnBoost/socket.io/wiki/Authorizing):

```js
const feathers = require('feathers');
const socketio = require('feathers-socketio');

const app = feathers();

app.configure(socketio(function(io) {
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

### `app.configure(socketio(options [, callback]))`

Sets up the Socket.io transport with the given [Socket.io options object](https://github.com/socketio/engine.io#methods-1) and optionally calls the callback described above.

This can be used to e.g. configure the path where Socket.io is initialize (`socket.io/` by default). The following changes the path to `ws/`:


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

### `app.configure(socketio(port, [options], [callback]))`

Creates a new Socket.io server on a separate port. Options and a callback are optional and work as described above.

```js
const feathers = require('feathers');
const socketio = require('feathers-socketio');

const app = feathers()
  .configure(socketio(3031));
  
app.listen(3030);
```

### `params.provider`

For any [service method call](./services.md) made through Socket.io `params.provider` will be set to `socketio`. In a [hook](./hooks.md) this can for example be used to prevent external users from making a service method call:

```js
app.service('users').hooks({
  before: {
    remove(hook) {
      // check for if(hook.params.provider) to prevent any external call
      if(hook.params.provider === 'socketio') {
        throw new Error('You can not delete a user via Socket.io');
      }
    }
  }
});
```

### `params.query`

`params.query` will contain the query parameters sent from the client.

> **Important:** Only `params.query` is passed between the server and the client, other parts of `params` are not. This is for security reasons so that a client can't set things like `params.user` or the database options. You can always map from `params.query` to `params` in a before [hook](./hooks.md).

### uWebSocket

The options can also be used to initialize [uWebSocket](https://github.com/uwebsockets/uwebsockets) which is a WebSocket server implementation that provides better performace and reduced latency.

```
$ npm install uws --save
```

```js
const feathers = require('feathers');
const socketio = require('feathers-socketio');

const app = feathers();

app.configure(socketio({
  wsEngine: 'uws'
}));

app.listen(3030);
```

### Middleware and service parameters

[Socket.io middleware](http://socket.io/docs/server-api/#namespace#use(fn:function):namespace) can modify the `feathers` property on the `socket` which will then be used as the service parameters:

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

## Client

The `client` module in `feathers-socketio` (`require('feathers-socketio/client')`) allows to connect to services exposed through the [Socket.io server](#server) via a Socket.io socket.

> **Very important:** The examples below assume you are using Feathers either in Node or in the browser with a module loader like Webpack or Browserify. For using Feathers with a `<script>` tag, AMD modules or with React Native see the [client chapter](./client.md).

<!-- -->

> **Note:** A client application can only use a single transport (either REST, Socket.io or Primus). Using two transports in the same client application is normally not necessary.

### `socketio(socket)`

Initialize the Socket.io client using a given socket and the default options.

```js
const feathers = require('feathers/client');
const socketio = require('feahters-socketio/client');
const io = require('socket.io-client');

const socket = io('http://api.feathersjs.com');
const app = feathers();

// Set up Socket.io client with the socket
app.configure(socketio(socket));

// Receive real-time events through Socket.io
app.service('messages')
  .on('created', message => console.log('New message created', message));

// Call the `messages` service
app.service('messages').create({
  text: 'A message from a REST client'
});
```

### `socketio(socket, options)`

Initialize the Socket.io client using a given socket and the given options. 

Options can be:

- `timeout` (default: 5000ms) - The time after which a method call fails and times out. This usually happens when calling a service or service method that does not exist.

```js
const feathers = require('feathers/client');
const socketio = require('feahters-socketio/client');
const io = require('socket.io-client');

const socket = io('http://api.feathersjs.com');
const app = feathers();

// Set up Socket.io client with the socket
// And a timeout of 2 seconds
app.configure(socketio(socket, {
  timeout: 2000
}));
```

### Changing the socket client timeout

Currently, the only way for clients to determine if a service or service method exists is through a timeout. You can set the timeout either through the option above or on a per-service level by setting the `timeout` property:

```javascript
app.service('messages').timeout = 3000;
```

## Direct connection

Feathers sets up a normal Socket.io server that you can connect to with any Socket.io compatible client, usually the [Socket.io client](http://socket.io/docs/client-api/) either by loading the `socket.io-client` module or `/socket.io/socket.io.js` from the server. Unlike HTTP calls, websockets do not have an inherent cross-origin restriction in the browser so it is possible to connect to any Feathers server.

> **ProTip**: The socket connection URL has to point to the server root which is where Feathers will set up Socket.io.


```html
<!-- Connecting to the same URL -->
<script src="/socket.io/socket.io.js">
<script>
  var socket = io();
</script>

<!-- Connecting to a different server -->
<script src="http://localhost:3030/socket.io/socket.io.js">
<script>
  var socket = io('http://localhost:3030/');
</script>
```

### Calling service methods

Service methods can be called by emitting a `<servicepath>::<methodname>` event with the method parameters. `servicepath` is the name the service has been registered with (in `app.use`) without leading or trailing slashes. An optional callback following the `function(error, data)` Node convention will be called with the result of the method call or any errors that might have occurred.

`params` will be set as `params.query` in the service method call. Other service parameters can be set through a [Socket.io middleware](../real-time/socket-io.md).

#### `find`

Retrieves a list of all matching resources from the service

```js
socket.emit('messages::find', { status: 'read', user: 10 }, (error, data) => {
  console.log('Found all messages', data);
});
```

Will call `messages.find({ query: { status: 'read', user: 10 } })` on the server.

#### `get`

Retrieve a single resource from the service.

```js
socket.emit('messages::get', 1, (error, message) => {
  console.log('Found message', message);
});
```

Will call `messages.get(1, {})` on the server.

```js
socket.emit('messages::get', 1, { fetch: 'all' }, (error, message) => {
  console.log('Found message', message);
});
```

Will call `messages.get(1, { query: { fetch: 'all' } })` on the server.

#### `create`

Create a new resource with `data` which may also be an array.

```js
socket.emit('messages::create', {
  "text": "I really have to iron"
}, (error, message) => {
  console.log('Todo created', message);
});
```

Will call `messages.create({ "text": "I really have to iron" }, {})` on the server.

```js
socket.emit('messages::create', [
  { "text": "I really have to iron" },
  { "text": "Do laundry" }
]);
```

Will call `messages.create` with the array.

#### `update`

Completely replace a single or multiple resources.

```js
socket.emit('messages::update', 2, {
  "text": "I really have to do laundry"
}, (error, message) => {
  console.log('Todo updated', message);
});
```

Will call `messages.update(2, { "text": "I really have to do laundry" }, {})` on the server. The `id` can also be `null` to update multiple resources:

```js
socket.emit('messages::update', null, {
  complete: true
}, { complete: false });
```

Will call `messages.update(null, { "complete": true }, { query: { complete: 'false' } })` on the server.

> **ProTip:** `update` is normally expected to replace an entire resource which is why the database adapters only support `patch` for multiple records.

#### `patch`

Merge the existing data of a single or multiple resources with the new `data`.

```js
socket.emit('messages::patch', 2, {
  read: true
}, (error, message) => {
  console.log('Patched message', message);
});
```

Will call `messages.patch(2, { "read": true }, {})` on the server. The `id` can also be `null` to update multiple resources:

```js
socket.emit('messages::patch', null, {
  complete: true
}, {
  complete: false
}, (error, message) => {
  console.log('Patched message', message);
});
```

Will call `messages.patch(null, { complete: true }, { query: { complete: false } })` on the server to change the status for all read messages.

This is supported out of the box by the Feathers [database adapters](../databases/readme.md) 

#### `remove`

Remove a single or multiple resources:

```js
socket.emit('messages::remove', 2, { cascade: true }, (error, message) => {
  console.log('Removed a message', message);
});
```

Will call `messages.remove(2, { query: { cascade: true } })` on the server. The `id` can also be `null` to remove multiple resources:

```js
socket.emit('messages::remove', null, { read: true });
```

Will call `messages.remove(null, { query: { read: 'true' } })` on the server to delete all read messages.


### Listening to events

Listening to service events allows real-time behaviour in an application. [Service events](../real-time/readme.md) are sent to the socket in the form of `servicepath eventname`.

#### created

The `created` event will be published with the callback data when a service `create` returns successfully.

```js
var socket = io('http://localhost:3030/');

socket.on('messages created', function(message) {
  console.log('Got a new Todo!', message);
});
```

#### updated, patched

The `updated` and `patched` events will be published with the callback data when a service `update` or `patch` method calls back successfully.

```js
var socket = io('http://localhost:3030/');

socket.on('my/messages updated', function(message) {
  console.log('Got an updated Todo!', message);
});

socket.emit('my/messages::update', 1, {
  text: 'Updated text'
}, {}, function(error, callback) {
 // Do something here
});
```

#### removed

The `removed` event will be published with the callback data when a service `remove` calls back successfully.

```js
var socket = io('http://localhost:3030/');

socket.on('messages removed', function(message) {
  // Remove element showing the Todo from the page
  $('#message-' + message.id).remove();
});
```

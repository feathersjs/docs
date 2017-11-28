# Socket.io Client

> **Note:** We recommend using Feathers and the `@feathersjs/socketio-client` module on the client if possible. To use a direct Socket.io connection without using Feathers on the client however see the [Direct connection](#direct-connection) section.

## @feathersjs/socketio-client

[![GitHub stars](https://img.shields.io/github/stars/feathersjs/socketio-client.png?style=social&label=Star)](https://github.com/feathersjs/socketio-client/)
[![npm version](https://img.shields.io/npm/v/@feathersjs/socketio-client.png?style=flat-square)](https://www.npmjs.com/package/@feathersjs/socketio-client)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.png?style=flat-square)](https://github.com/feathersjs/socketio-client/blob/master/CHANGELOG.md)

```
$ npm install @feathersjs/socketio-client --save
```

The `@feathersjs/socketio-client` module allows to connect to services exposed through the [Socket.io server](../socketio.md) via a Socket.io socket.

> **Important:** Socket.io is also used to *call* service methods. Using sockets for both, calling methods and receiving real-time events is generally faster than using [REST](./express.md) and there is no need to use both, REST and Socket.io in the same client application at the same time.

### socketio(socket)

Initialize the Socket.io client using a given socket and the default options.

```js
const feathers = require('@feathersjs/feathers');
const socketio = require('@feathersjs/socketio-client');
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

### socketio(socket, options)

Initialize the Socket.io client using a given socket and the given options. 

Options can be:

- `timeout` (default: 5000ms) - The time after which a method call fails and times out. This usually happens when calling a service or service method that does not exist.

```js
const feathers = require('@feathersjs/feathers');
const socketio = require('@feathersjs/socketio-client');
const io = require('socket.io-client');

const socket = io('http://api.feathersjs.com');
const app = feathers();

// Set up Socket.io client with the socket
// And a timeout of 2 seconds
app.configure(socketio(socket, {
  timeout: 2000
}));
```

To set a service specific timeout you can use:

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

Service methods can be called by emitting a `<methodname>` event followed by the service path and method parameters. The service path is the name the service has been registered with (in `app.use`) without leading or trailing slashes. An optional callback following the `function(error, data)` Node convention will be called with the result of the method call or any errors that might have occurred.

`params` will be set as `params.query` in the service method call. Other service parameters can be set through a [Socket.io middleware](../socketio.md).

If the service path or method does not exist an appropriate Feathers error will be returned.

### Authentication

Sockets can be authenticated by sending the `authenticate` event with the `strategy` and the payload. For specific examples see the "Direct Connection" section in the [local](./local.md) and [jwt](./jwt.md) authentication chapters.

```js
const io = require('socket.io-client');
const socket = io('http://localhost:3030');

socket.emit('authenticate', {
  strategy: 'strategyname',
  ... otherData
}, function(message, data) {
  console.log(message); // message will be null
  console.log(data); // data will be {"accessToken": "your token"}
  // You can now send authenticated messages to the server
});
```

### find

Retrieves a list of all matching resources from the service

```js
socket.emit('find', 'messages', { status: 'read', user: 10 }, (error, data) => {
  console.log('Found all messages', data);
});
```

Will call `app.service('messages').find({ query: { status: 'read', user: 10 } })` on the server.

### get

Retrieve a single resource from the service.

```js
socket.emit('get', 'messages', 1, (error, message) => {
  console.log('Found message', message);
});
```

Will call `app.service('messages').get(1, {})` on the server.

```js
socket.emit('get', 'messages', 1, { fetch: 'all' }, (error, message) => {
  console.log('Found message', message);
});
```

Will call `app.service('messages').get(1, { query: { fetch: 'all' } })` on the server.

#### `create`

Create a new resource with `data` which may also be an array.

```js
socket.emit('create', 'messages', {
  text: 'I really have to iron'
}, (error, message) => {
  console.log('Todo created', message);
});
```

Will call `app.service('messages').create({ text: 'I really have to iron' }, {})` on the server.

```js
socket.emit('create', 'messages', [
  { text: 'I really have to iron' },
  { text: 'Do laundry' }
]);
```

Will call `app.service('messages').create` with the array.

### update

Completely replace a single or multiple resources.

```js
socket.emit('update', 'messages', 2, {
  text: 'I really have to do laundry'
}, (error, message) => {
  console.log('Todo updated', message);
});
```

Will call `app.service('messages').update(2, { text: 'I really have to do laundry' }, {})` on the server. The `id` can also be `null` to update multiple resources:

```js
socket.emit('update', 'messages', null, {
  complete: true
}, { complete: false });
```

Will call `app.service('messages').update(null, { complete: true }, { query: { complete: 'false' } })` on the server.

> **ProTip:** `update` is normally expected to replace an entire resource which is why the database adapters only support `patch` for multiple records.

### patch

Merge the existing data of a single or multiple resources with the new `data`.

```js
socket.emit('patch', 'messages', 2, {
  read: true
}, (error, message) => {
  console.log('Patched message', message);
});
```

Will call `app.service('messages').patch(2, { read: true }, {})` on the server. The `id` can also be `null` to update multiple resources:

```js
socket.emit('patch', 'messages', null, {
  complete: true
}, {
  complete: false
}, (error, message) => {
  console.log('Patched message', message);
});
```

Will call `app.service('messages').patch(null, { complete: true }, { query: { complete: false } })` on the server to change the status for all read app.service('messages').

This is supported out of the box by the Feathers [database adapters](../databases/readme.md) 

### remove

Remove a single or multiple resources:

```js
socket.emit('remove', 'messages', 2, { cascade: true }, (error, message) => {
  console.log('Removed a message', message);
});
```

Will call `app.service('messages').remove(2, { query: { cascade: true } })` on the server. The `id` can also be `null` to remove multiple resources:

```js
socket.emit('remove', 'messages', null, { read: true });
```

Will call `app.service('messages').remove(null, { query: { read: 'true' } })` on the server to delete all read app.service('messages').


### Listening to events

Listening to service events allows real-time behaviour in an application. [Service events](../events.md) are sent to the socket in the form of `servicepath eventname`.

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

socket.emit('update', 'my/messages', 1, {
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

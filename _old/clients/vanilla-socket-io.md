# Vanilla Socket.io

[With Socket.io configured on the server](../real-time/socket-io.md) service methods and events will be available through a websocket connection. While using the REST API and just listening to real-time events on a socket is possible, Feathers also allows to call service methods through a websocket which, in most cases will be faster than REST HTTP.

## Establishing the connection

Feathers sets up a normal Socket.io server that you can connect to using the [Socket.io client](http://socket.io/docs/client-api/) either by loading the `socket.io-client` module or `/socket.io/socket.io.js` from the server. Unlike HTTP calls, websockets do not have a cross-origin restriction in the browser so it is possible to connect to any Feathers server. See below for platform specific examples.

> **ProTip**: The socket connection URL has to point to the server root which is where Feathers will set up Socket.io.

## Calling service methods

Service methods can be called by emitting a `<servicepath>::<methodname>` event with the method parameters. `servicepath` is the name the service has been registered with (in `app.use`) without leading or trailing slashes. An optional callback following the `function(error, data)` Node convention will be called with the result of the method call or any errors that might have occurred.

`params` will be set as `params.query` in the service method call. Other service parameters can be set through a [Socket.io middleware](../real-time/socket-io.md).

### `find`

Retrieves a list of all matching resources from the service

```js
socket.emit('messages::find', { status: 'read', user: 10 }, (error, data) => {
  console.log('Found all messages', data);
});
```

Will call `messages.find({ query: { status: 'read', user: 10 } })` on the server.

### `get`

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

### `create`

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

### `update`

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

### `patch`

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

### `remove`

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

### created

The `created` event will be published with the callback data when a service `create` returns successfully.

```html
<script>
  var socket = io('http://localhost:3030/');

  socket.on('messages created', function(message) {
    console.log('Got a new Todo!', message);
  });
</script>
```

### updated, patched

The `updated` and `patched` events will be published with the callback data when a service `update` or `patch` method calls back successfully.

```html
<script>
  var socket = io('http://localhost:3030/');

  socket.on('my/messages updated', function(message) {
    console.log('Got an updated Todo!', message);
  });

  socket.emit('my/messages::update', 1, {
    text: 'Updated text'
  }, {}, function(error, callback) {
   // Do something here
  });
</script>
```

### removed

The `removed` event will be published with the callback data when a service `remove` calls back successfully.

```html
<script>
  var socket = io('http://localhost:3030/');

  socket.on('messages removed', function(message) {
    // Remove element showing the Todo from the page
    $('#message-' + message.id).remove();
  });
</script>
```

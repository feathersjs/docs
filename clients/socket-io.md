# Socket.io client use

[With Socket.io configured on the server](../real-time/socket-io.md) service methods and events will be available through a websocket connection. While using the REST API and just listening to real-time events on a socket is possible, Feathers also allows to call service methods through a  websocket which in most cases will be faster than REST HTTP.

## Establishing the connection

Feathers sets up a normal Socket.io server that you can connect to using the [Socket.io client](http://socket.io/docs/client-api/) either by loading the `socket.io-client` module or `/socket.io/socket.io.js` from the server. Unlike HTTP calls, websockets do not have a cross-origin restriction in the browser so it is possible to connect to any Feathers server.

```js
import io from 'socket.io-client';

const socket = io();
// Or to connect to another server
const socket = io('http://api.my-feathers-server.com');
```

```html
<script type="text/javascript" src="socket.io/socket.io.js"></script>
<script type="text/javascript">
  var socket = io();
  // Or to connect to another server
  var socket = io('http://api.my-feathers-server.com');
</script>
```

> __Note__: The socket connection URL has to point to the server root which is where Feathers will set up Socket.io.

## feathers-socketio client

Using [the Feathers client](feathers.md), the `feathers-socketio/client` module can now be configured to use that socket as the connection:

```js
import feathers from 'feathers';
import socketio from 'feathers-socketio/client';
import io from 'socket.io-client';

const socket = io();
const app = feathers().configure(socketio(socket));

// Get the todo service that uses a websocket connection
const todoService = app.service('todos');

todoService.on('created', todo => console.log('Someone created a todo', todo));
```

## Direct socket events

A service can also be used by sending and receiving events through a plain Socket.io connection (which is what the `feathers-socketio` client ultimately does). This works with any client that can connect to a Socket.io server. In the following example we will just re-use the socket connection that we set up at the beginning of this chapter.

### Calling service methods

Service methods can be called by emitting a `<servicepath>::<methodname>` event with the method parameters. `servicepath` is the name the service has been registered with (in `app.use`) without leading or trailing slashes. An optional callback following the `function(error, data)` Node convention will be called with the result of the method call or any errors that might have occurred.

`params` will be set as `params.query` in the service method call. Other service parameters can be set through a [Socket.io middleware](../real-time/socket-io.md).

#### `find`

Retrieves a list of all matching resources from the service

```js
socket.emit('todos::find', { status: 'completed', user: 10 }, (error, data) => {
  console.log('Found all todos', data);
});
```

Will call `todos.find({ query: { status: 'completed', user: 10 } })`.

#### `get`

Retrieve a single resource from the service.

```js
socket.emit('todos::get', 1, (error, todo) => {
  console.log('Found todo', todo);
});
```

Will call `todos.get(1, {})`.

```js
socket.emit('todos::get', 1, { fetch: 'all' }, (error, todo) => {
  console.log('Found todo', todo);
});
```

Will call `todos.get(1, { query: { fetch: 'all' } })`.

#### `create`

Create a new resource with `data` which may also be an array.

```js
socket.emit('todos::create', {
  "description": "I really have to iron"
}, (error, todo) => {
  console.log('Todo created', todo);
});
```

Will call `todos.create({ "description": "I really have to iron" }, {})`.

```js
socket.emit('todos::create', [
  { "description": "I really have to iron" },
  { "description": "Do laundry" }
]);
```

Will call `todos.create` with the array.

### `update`

Completely replace a single or multiple resources.

```js
socket.emit('todos::update', 2, {
  "description": "I really have to do laundry"
}, (error, todo) => {
  console.log('Todo updated', todo);
});
```

Will call `todos.update(2, { "description": "I really have to do laundry" }, {})`. The `id` can also be `null` to update multiple resources:

```js
socket.emit('todos::update', null, {
  complete: true
}, { complete: false });
```

Will call `todos.update(null, { "complete": true }, { query: { complete: 'false' } })`.

> __Note:__ `update` is normally expected to replace an entire resource which is why the database adapters only support `patch` for multiple records.

### `patch`

Merge the existing data of a single or multiple resources with the new `data`.

```js
socket.emit('todos::patch', 2, {
  completed: true
}, (error, todo) => {
  console.log('Patched todo', todo);
});
```

Will call `todos.patch(2, { "completed": true }, {})`. The `id` can also be `null` to update multiple resources:

```js
socket.emit('todos::patch', null, {
  complete: true
}, {
  complete: false
}, (error, todo) => {
  console.log('Patched todo', todo);
});
```

Will call `todos.patch(null, { complete: true }, { query: { complete: false } })` to change the status for all completed todos.

This is supported out of the box by the Feathers [database adapters](../databases/readme.md) 

### `remove`

Remove a single or multiple resources:

```js
socket.emit('todos::remove', 2, { cascade: true }, (error, todo) => {
  console.log('Removed a todo', todo);
});
```

Will call `todos.remove(2, { query: { cascade: true } })`. The `id` can also be `null` to remove multiple resources:

```js
socket.emit('todos::remove', null, { completed: true });
```

Will call `todos.remove(null, { query: { completed: 'true' } })` to delete all completed todos.


### Listening to events

Listening to service events allows real-time behaviour in an application. [Service events](..//real-time/readme.md) are sent to the socket in the form of `servicepath eventname`.

#### created

The `created` event will be published with the callback data when a service `create` returns successfully.

```html
<script>
  var socket = io.connect('http://localhost:8000/');

  socket.on('todos created', function(todo) {
    console.log('Got a new Todo!', todo);
  });
</script>
```

#### updated, patched

The `updated` and `patched` events will be published with the callback data when a service `update` or `patch` method calls back successfully.

```html
<script>
  var socket = io.connect('http://localhost:8000/');

  socket.on('my/todos updated', function(todo) {
    console.log('Got an updated Todo!', todo);
  });

  socket.emit('my/todos::update', 1, {
    description: 'Updated description'
  }, {}, function(error, callback) {
   // Do something here
  });
</script>
```

#### removed

The `removed` event will be published with the callback data when a service `remove` calls back successfully.

```html
<script>
  var socket = io.connect('http://localhost:8000/');

  socket.on('todos removed', function(todo) {
    // Remove element showing the Todo from the page
    $('#todo-' + todo.id).remove();
  });
</script>
```

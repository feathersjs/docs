# Primus client use

Primus works very similar to [Socket.io](socket-io.md) but supports a number of different real-time libraries. [Once configured on the server](..//real-time/primus.md) service methods and events will be available through a Primus socket connection. 

## Establishing the connection

In the browser, the connection can be established by loading the client from `primus/primus.js` and instantiating a new `Primus` instance:

```html
<script type="text/javascript" src="primus/primus.js"></script>
<script type="text/javascript">
  var primus = new Primus('http://api.my-feathers-server.com');
</script>
```

More details, like how to establish a connection between NodeJS servers can be found in the [Primus documentation](https://github.com/primus/primus#connecting-from-the-server).

## feathers-primus client

Using [the Feathers client](feathers.md), the `feathers-primus/client` module can now be configured to use the Primus connection:

```js
import feathers from 'feathers';
import primus from 'feathers-primus/client';

const app = feathers().configure(primus(primus));

// Get the todo service that uses a websocket connection
const todoService = app.service('todos');

todoService.on('created', todo => console.log('Someone created a todo', todo));
```

## Direct socket events

A service can also be used by sending and receiving events through the Primus connection. This works with any client that can connect to a websocket. In the following example we will just re-use the Primus connection that we set up at the beginning of this chapter.

### Calling service methods

Service methods can be called by emitting a `<servicepath>::<methodname>` event with the method parameters. `servicepath` is the name the service has been registered with (in `app.use`) without leading or trailing slashes. An optional callback following the `function(error, data)` Node convention will be called with the result of the method call or any errors that might have occurred.

`params` will be set as `params.query` in the service method call. Other service parameters can be set through a [Primus middleware](../real-time/primus.md).

#### `find`

Retrieves a list of all matching resources from the service

```js
primus.send('todos::find', { status: 'completed', user: 10 }, (error, data) => {
  console.log('Found all todos', data);
});
```

Will call `todos.find({ query: { status: 'completed', user: 10 } })`.

#### `get`

Retrieve a single resource from the service.

```js
primus.send('todos::get', 1, (error, todo) => {
  console.log('Found todo', todo);
});
```

Will call `todos.get(1, {})`.

```js
primus.send('todos::get', 1, { fetch: 'all' }, (error, todo) => {
  console.log('Found todo', todo);
});
```

Will call `todos.get(1, { query: { fetch: 'all' } })`.

#### `create`

Create a new resource with `data` which may also be an array.

```js
primus.send('todos::create', {
  "description": "I really have to iron"
}, (error, todo) => {
  console.log('Todo created', todo);
});
```

Will call `todos.create({ "description": "I really have to iron" }, {})`.

```js
primus.send('todos::create', [
  { "description": "I really have to iron" },
  { "description": "Do laundry" }
]);
```

Will call `todos.create` with the array.

### `update`

Completely replace a single or multiple resources.

```js
primus.send('todos::update', 2, {
  "description": "I really have to do laundry"
}, (error, todo) => {
  console.log('Todo updated', todo);
});
```

Will call `todos.update(2, { "description": "I really have to do laundry" }, {})`. The `id` can also be `null` to update multiple resources:

```js
primus.send('todos::update', null, {
  complete: true
}, { complete: false });
```

Will call `todos.update(null, { "complete": true }, { query: { complete: 'false' } })`.

> __Note:__ `update` is normally expected to replace an entire resource which is why the database adapters only support `patch` for multiple records.

### `patch`

Merge the existing data of a single or multiple resources with the new `data`.

```js
primus.send('todos::patch', 2, {
  completed: true
}, (error, todo) => {
  console.log('Patched todo', todo);
});
```

Will call `todos.patch(2, { "completed": true }, {})`. The `id` can also be `null` to update multiple resources:

```js
primus.send('todos::patch', null, {
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
primus.send('todos::remove', 2, { cascade: true }, (error, todo) => {
  console.log('Removed a todo', todo);
});
```

Will call `todos.remove(2, { query: { cascade: true } })`. The `id` can also be `null` to remove multiple resources:

```js
primus.send('todos::remove', null, { completed: true });
```

Will call `todos.remove(null, { query: { completed: 'true' } })` to delete all completed todos.


### Listening to events

Listening to service events allows real-time behaviour in an application. [Service events](..//real-time/readme.md) are sent to the socket in the form of `servicepath eventname`.

#### created

The `created` event will be published with the callback data when a service `create` returns successfully.

```html
<script>
  primus.on('todos created', function(todo) {
    console.log('Got a new Todo!', todo);
  });
</script>
```

#### updated, patched

The `updated` and `patched` events will be published with the callback data when a service `update` or `patch` method calls back successfully.

```html
<script>
  primus.on('my/todos updated', function(todo) {
    console.log('Got an updated Todo!', todo);
  });

  primus.send('my/todos::update', 1, {
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
  primus.on('todos removed', function(todo) {
    // Remove element showing the Todo from the page
    $('#todo-' + todo.id).remove();
  });
</script>
```

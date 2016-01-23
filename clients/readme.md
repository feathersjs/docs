# Using With Front-end Frameworks

Feathers works with your favorite frameworks.

# Frameworks

Feathers works great with any front-end that connects through HTTP/HTTPS or websockets to your Feathers REST API. Sometimes it is just a few lines of code to make a front-end turn real-time. To help you out we've provided some simple TodoMVC style examples and guides that all connect to the same Feathers real-time API (todos.feathersjs.com):

 - [jQuery](http://feathersjs.github.io/todomvc/feathers/jquery/)
 - [React](http://feathersjs.github.io/todomvc/feathers/react/)
 - [Angular](http://feathersjs.github.io/todomvc/feathers/angularjs/)
 - [CanJS](http://feathersjs.github.io/todomvc/feathers/canjs/)

If you don't see your favorite framework, create an issue or - even better - a pull request and we'll try our best to make it happen.



## Socket.io

Once a Socket.io connection has been established on the client, it can call service methods and receive events. We highly recommend to use [the Feathers client](../../clients/readme.md) to connect to remote services transparently. It is however also possible to directly call service methods and receive events through Socket.io.


## Calling service methods


## Listening to events

### created

The `created` event will be published with the callback data when a service `create` returns successfully.

```js
app.use('/todos', {
  create: function(data, params, callback) {
    callback(null, data);
  }
});

app.service('/todos').on('created', function(todo) {
  console.log('Created todo', todo);
});

app.service('/todos').create({
  description: 'We have to do something!'
}, {}, function(error, callback) {
  // ...
});

app.listen(8000);
```

__SocketIO__

```html
<script src="http://localhost:8000/socket.io/socket.io.js"></script>
<script>
  var socket = io.connect('http://localhost:8000/');

  socket.on('todos created', function(todo) {
    console.log('Got a new Todo!', todo);
  });
</script>
```

### updated, patched

The `updated` and `patched` events will be published with the callback data when a service `update` or `patch` method calls back successfully.

```js
app.use('/my/todos/', {
  update: function(id, data, params, callback) {
    callback(null, data);
  }
});

app.listen(8000);
```

__SocketIO__

```html
<script src="http://localhost:8000/socket.io/socket.io.js"></script>
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

### removed

The `removed` event will be published with the callback data when a service `remove` calls back successfully.

```js
app.use('/todos', {
  remove: function(id, params, callback) {
    callback(null, { id: id });
  }
});

app.service('/todos').remove(1, {}, function(error, callback) {
  // ...
});

app.listen(8000);
```

__SocketIO__

```html
<script src="http://localhost:8000/socket.io/socket.io.js"></script>
<script>
  var socket = io.connect('http://localhost:8000/');

  socket.on('todos removed', function(todo) {
    // Remove element showing the Todo from the page
    $('#todo-' + todo.id).remove();
  });
</script>
```

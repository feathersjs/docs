# Events

 It is therefore possible to bind to the below events via `app.service(servicename).on()` and, if enabled, all events will also broadcast to all connected SocketIO clients in the form of `<servicepath> <eventname>`. Note that the service path will always be stripped of leading and trailing slashes regardless of how it has been registered (e.g. `/my/service/` will become `my/service`).

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

## Better Event Filtering
// TODO: Add some information about what we're doing here.  Taken from https://github.com/feathersjs/feathers-socketio/issues/2
```js
const todos = app.service('todos');

// Blanket filter out all connections that don't belong to the same company
todos.filter(function(data, connection) {
  if(data.company_id !== connection.user.company_id) {
    return false;
  }

  return data;
});

// After that, filter todos, if the user that created it
// and the connected user aren't friends
todos.filter('created', function(data, connection, hook) {
  const todoUserId = hook.params.user._id;
  const currentUserFriends = connection.user.friends;

  if(currentUserFriends.indexOf(todoUserId) === -1) {
    return false;
  }

  return data;
});

// Other ways to use it
todos.filter({
  removed: [a, b],
  updated: function(data, connection, hook, callback) {}
});
```


## Get websocket events from REST calls

Every service emits all events no matter from where it has been called. So even creating a new Todo internally on the server will send the event out on every socket that should receive it. This is very similar to what [Firebase](http://firebase.io/) does (but for free and open source). For a more detailed comparison and migration guide read [Feathers as an open source alternative to Firebase](https://medium.com/all-about-feathersjs/using-feathersjs-as-an-open-source-alternative-to-firebase-b5d93c200cee).

You can also listen to events on the server by retrieving the wrapped service object which is an event emitter:

```js
// Retrieve the registered Todo service
var todoService = app.service('todos');
var todoCount = 0;

todoService.on('created', function(todo) {
  // Increment the total number of created todos
  todoCount++;
});
```

## Event filtering

By default all service events will be dispatched to all connected clients. In many cases you probably want to be able to only dispatch events for certain clients.
This can be done by implementing the `created`, `updated`, `patched` and `removed` methods as `function(data, params, callback) {}` with `params` being the parameters set when the client connected, in SocketIO when authorizing and setting `socket.feathers` and Primus with `req.feathers`.

```js
var myService = {
  created: function(data, params, callback) {},
  updated: function(data, params, callback) {},
  patched: function(data, params, callback) {},
  removed: function(data, params, callback) {}
}
```

The event dispatching service methods will run for every connected client. Calling the callback with data (that you also may modify) will dispatch the according event. Callling back with a falsy value will prevent the event being dispatched to this client.

The following example only dispatches the Todo `updated` event if the authorized user belongs to the same company:

```js
app.configure(feathers.socketio(function(io) {
  io.use(function (socket, callback) {
    // Authorize using the /users service
    app.service('users').find({
      username: socket.request.username,
      password: socket.request.password
    }, function(error, user) {
      if(!error || !user) {
        return callback(new Error('Not authenticated!'));
      }

      socket.feathers = {
        user: user
      };

      callback();
    });
  });
}));

app.use('todos', {
  update: function(id, data, params, callback) {
    // Update
    callback(null, data);
  },

  updated: function(todo, params, callback) {
    // params === socket.feathers
    if(todo.companyId === params.user.companyId) {
      // Dispatch the todo data to this client
      return callback(null, todo);
    }

    // Call back with a falsy value to prevent dispatching
    callback(null, false);
  }
});
```

On the client:

```js
socket.on('todo updated', function(data) {
  // The client will only get this event
  // if authorized and in the same company
});
```



## Only send certain events

In almost any larger application not every user is supposed to receive every event through websockets. The [event filtering section](/api/#event-filtering) in the API documentation contains detailed documentation on how to only send events to authorized users.

The following example only dispatches the Todo `updated` event if the authorized user belongs to the same company:

```js
app.configure(feathers.socketio(function(io) {
  io.use(function (socket, callback) {
    // Authorize using the /users service
    app.lookup('users').find({
      username: handshake.username,
      password: handshake.password
    }, function(error, user) {
      if(!error || !user) {
        return callback(error, false);
      }

      socket.feathers = {
        user: user
      };

      callback(null, true);
    });
  });
}));

app.use('todos', {
  update: function(id, data, params, callback) {
    // Update
    callback(null, data);
  },

  updated: function(todo, params, callback) {
    // params === handshake.feathers
    if(todo.companyId === params.user.companyId) {
      // Dispatch the todo data to this client
      return callback(null, todo);
    }

    // Call back with a falsy value to prevent dispatching
    callback(null, false);
  }
});
```


## Custom Events

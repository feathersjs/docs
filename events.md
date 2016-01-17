# Events

## Get websocket events from REST calls

Every service emits all events no matter from where it has been called. So even creating a new  Todo internally on the server will send the event out on every socket that should receive it. This is very similar to what [Firebase](http://firebase.io/) does (but for free and open source). For a more detailed comparison and migration guide read [Feathers as an open source alternative to Firebase](https://medium.com/all-about-feathersjs/using-feathersjs-as-an-open-source-alternative-to-firebase-b5d93c200cee).

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

## Custom Events

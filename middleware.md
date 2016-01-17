# Middleware


## Custom service middleware

Custom Express middleware that only should be run before a specific service can simply be passed to `app.use` before the service object:

```js
app.use('/todos', ensureAuthenticated, logRequest, todoService);
```

Keep in mind that shared authentication (between REST and websockets) should use a service based approach as described in the [authentication section of the guide](/learn/authentication).


## Nested routes

Feathers does not provide an ORM so it does not know about associations between your services. Generally services are connected by their resource ids so any nested route can be expressed by query parameters. For example if you have a user service and would like to get all todos (assuming the associated user id is stored in each todo) for that user the url would be `/todos?userId=<userid>`.

You can however add Express style parameters to your routes when you register a service which will then be set in the `params` object in each service call. For example a `/users/:userId/todos` route can be provided like this:

```js
app.use('/users/:userId/todos', {
  find: function(params, calllback) {
    // params.userId == current user id
  },
  create: function(data, params, callback) {
    data.userId = params.userId;
    // store the data
  }
})
```

__Note:__ This route has to be registered _before_ the `/users` service otherwise the `get` route from the user service at `/users` will be matched first.


## Find where a method call came from

Sometimes you want to allow certain service calls internally (like creating a new user) but not through the REST or websocket API. This can be done by adding the information in a middleware to the `request.feathers` object which will be merged into service call parameters:

```js
app.use(function(req, res, next) {
  req.feathers.external = 'rest';
  next();
});

app.configure(feathers.socketio(function(io) {
  io.use(function(socket, next) {
    // For websockets the feathers object does not exist by default
    if(!socket.feathers) {
      socket.feathers = {};
    }

    socket.feathers.external = 'socketio';
    next();
  });
}));


app.use('/todos', {
  get: function(id, params, callback) {
    if(!params.external) {
      return callback(null, {
        id: id,
        text: 'Do ' + id + '!'
      });
    }
    callback(new Error('External access not allowed'));
  }
});

var todoService = app.service('todos');
// Call .get without the external parameter set to get the result
todoService.get('laundry', {}, function(error, todo) {
  todo.text // -> 'Do laundry!'
});
```
As mentioned, the basic Feathers functionality is fully compatible with Express. The key concept added to that of middleware is *service* objects. A service can be any JavaScript object that offers one or more of the `find`, `get`, `create`, `update`, `remove` and `setup` service methods with the following signatures:

```js
var myService = {
  find: function(params, callback) {},
  get: function(id, params, callback) {},
  create: function(data, params, callback) {},
  update: function(id, data, params, callback) {},
  patch: function(id, data, params, callback) {},
  remove: function(id, params, callback) {},
  setup: function(app) {}
}
```

And can be used like any other Express middleware `app.use('/my-service', myService)`.

All service callbacks follow the `function(error, data)` NodeJS convention. `params` can contain any additional parameters, for example the currently authenticated user. REST service calls set `params.query` with the query parameters (e.g. a query string like `?status=active&type=user` becomes `{ query: { status: "active", type: "user" } }`), socket call parameters will also be passed as `params.query`.

It is also possible to return a [Promise](http://promises-aplus.github.io/promises-spec/) object from a service instead of using the callback, for example using [Q](https://github.com/kriskowal/q):

```js
var Q = require('q');

var todos = {
  get: function(id) {
    var dfd = Q.defer();

    setTimeout(function() {
      dfd.resolve({
        id: id,
        description: 'You have to do ' + id
      });
    }, 500);

    return dfd.promise;
  }
}
```

### find

`find(params, callback)` retrieves a list of all resources from the service. SocketIO parameters will be passed as `params.query` to the service.

__REST__

    GET todo?status=completed&user=10

__SocketIO__

```js
socket.emit('todo::find', {
  status: 'completed'
  user: 10
}, function(error, data) {
});
```

> Will call .create with `params` { query: { status: 'completed', user: 10 } }

### get

`get(id, params, callback)` retrieves a single resource with the given `id` from the service.

__REST__

    GET todo/1

__SocketIO__

```js
socket.emit('todo::get', 1, {}, function(error, data) {

});
```

### create

`create(data, params, callback)` creates a new resource with `data`. The callback should be called with the newly
created resource data.

__REST__

    POST todo
    { "description": "I really have to iron" }

By default the body can be eihter JSON or form encoded as long as the content type is set accordingly.

__SocketIO__

```js
socket.emit('todo::create', {
  description: 'I really have to iron'
}, {}, function(error, data) {
});
```

### update

`update(id, data, params, callback)` updates the resource identified by `id` using `data`. The callback should
be called with the updated resource data.

__REST__

    PUT todo/2
    { "description": "I really have to do laundry" }

__SocketIO__

```js
socket.emit('todo::update', 2, {
  description: 'I really have to do laundry'
}, {}, function(error, data) {
  // data -> { id: 2, description: "I really have to do laundry" }
});
```

### patch

`patch(id, data, params, callback)` patches the resource identified by `id` using `data`. The callback should be called with the updated resource data. Implement `patch` additionally to `update` if you want to separate between partial and full updates and support the `PATCH` HTTP method.

__REST__

    PATCH todo/2
    { "description": "I really have to do laundry" }

__SocketIO__

```js
socket.emit('todo::patch', 2, {
  description: 'I really have to do laundry'
}, {}, function(error, data) {
  // data -> { id: 2, description: "I really have to do laundry" }
});
```

### remove

`remove(id, params, callback)` removes the resource with `id`. The callback should be called with the removed resource.

__REST__

    DELETE todo/2

__SocketIO__

```js
socket.emit('todo::remove', 2, {}, function(error, data) {
});
```

### setup

`setup(app, path)` initializes the service passing an instance of the Feathers application and the path it has been registered on. The SocketIO server is available via `app.io`. `setup` is a great way to connect services:

```js
var todoService = {
  get: function(name, params, callback) {
    callback(null, {
      id: name,
      description: 'You have to ' + name + '!'
    });
  }
};

var myService = {
  setup: function(app) {
    this.todo = app.service('todo');
  },

  get: function(name, params, callback) {
    this.todo.get('take out trash', {}, function(error, todo) {
      callback(error, {
        name: name,
        todo: todo
      });
    });
  }
}

feathers()
    .use('todo', todoService)
    .use('my', myService)
    .listen(8000);
```

You can see the combination when going to `http://localhost:8000/my/test`.

__Pro tip:__

Bind the apps `service` method to your service to always look your services up dynamically:

```js
var myService = {
  setup: function(app) {
    this.service = app.service.bind(app);
  },

  get: function(name, params, callback) {
    this.service('todos').get('take out trash', {}, function(error, todo) {
      callback(null, {
        name: name,
        todo: todo
      });
    });
  }
}
```

## Events

Any registered service will be automatically turned into an event emitter that emits events when a resource has changed, that is a `create`, `update` or `remove` service call returned successfully. It is therefore possible to bind to the below events via `app.service(servicename).on()` and, if enabled, all events will also broadcast to all connected SocketIO clients in the form of `<servicepath> <eventname>`. Note that the service path will always be stripped of leading and trailing slashes regardless of how it has been registered (e.g. `/my/service/` will become `my/service`).

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

# Going Realtime with Feathers

## SocketIO

To expose services via [SocketIO](http://socket.io/) call `app.configure(feathers.socketio())`. It is also possible pass a `function(io) {}` when initializing the provider where `io` is the main SocketIO object. Since Feathers is only using the SocketIO default configuration, this is a good spot to initialize the [recommended production settings](https://github.com/LearnBoost/Socket.IO/wiki/Configuring-Socket.IO#recommended-production-settings):

```js
app.configure(feathers.socketio(function(io) {
  io.enable('browser client minification');  // send minified client
  io.enable('browser client etag');          // apply etag caching logic based on version number
  io.enable('browser client gzip');          // gzip the file

  // enable all transports (optional if you want flashsocket support, please note that some hosting
  // providers do not allow you to create servers that listen on a port different than 80 or their
  // default port)
  io.set('transports', [
      'websocket'
    , 'flashsocket'
    , 'htmlfile'
    , 'xhr-polling'
    , 'jsonp-polling'
  ]);
}));
```

> Note: io.set is deprecated in Socket.IO 1.0. The above configuration will still work but will be replaced with the recommended production configuration for version 1.0 (which isn't available at the moment).

This is also the place to listen to custom events or add [authorization](https://github.com/LearnBoost/socket.io/wiki/Authorizing):

```js
app.configure(feathers.socketio(function(io) {
  io.on('connection', function(socket) {
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function (data) {
      console.log(data);
    });
  });

  io.use(function (socket, next) {
    // Authorize using the /users service
    app.service('users').find({
      username: socket.request.username,
      password: socket.request.password
    }, next);
  });
}));
```

Similar than the REST middleware, the SocketIO socket `feathers` property will be extended
for service parameters:

```js
app.configure(feathers.socketio(function(io) {
  io.use(function (socket, next) {
    socket.feathers.user = { name: 'David' };
    next();
  });
}));

app.use('todos', {
  create: function(data, params, callback) {
    // When called via SocketIO:
    params.user // -> { name: 'David' }
  }
});
```

Once the server has been started with `app.listen()` the SocketIO object is available as `app.io`.

## Primus

[Primus](https://github.com/primus/primus) is a universal wrapper for real-time frameworks and allows you to transparently use Engine.IO, WebSockets, BrowserChannel, SockJS and Socket.IO. Set it up with `feathers.primus(configuration [, fn])` where `configuration` is the [Primus server configuration](https://github.com/primus/primus#getting-started) and `fn` an optional callback with the Primus server instance that can e.g. be used for setting up [authorization](https://github.com/primus/primus#authorization):

```js
// Set up Primus with SockJS
app.configure(feathers.primus({
  transformer: 'sockjs'
}, function(primus) {
  // Set up Primus authorization here
  primus.authorize(function (req, done) {
    var auth;

    try { auth = authParser(req.headers['authorization']) }
    catch (ex) { return done(ex) }

    // Do some async auth check
    authCheck(auth, done);
  });
}));
```

In the Browser you can connect like this:

```html
<script type="text/javascript" src="primus/primus.js"></script>
<script type="text/javascript">
  var primus = new Primus(url);

  primus.on('todos created', function(todo) {
    console.log('Someone created a Todo', todo);
  });

  primus.send('todos::create', { description: 'Do something' }, {}, function() {
    primus.send('todos::find', {}, function(error, todos) {
      console.log(todos);
    });
  });
</script>
```

Just like REST and SocketIO, the Primus request object can be extended with a `feathers` parameter during authorization which will extend the `params` for any service request:

```js
app.configure(feathers.primus({
  transformer: 'sockjs'
}, function(primus) {
  // Set up Primus authorization here
  primus.authorize(function (req, done) {
    req.feathers = {
      user: { name: 'David' }
    }

    done();
  });
}));
```

## Event filtering

By default all service events will be dispatched to all connected clients.
In many cases you probably want to be able to only dispatch events for certain clients.
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

# The Socket.io Provider

The [feathers-socketio](https://github.com/feathersjs/feathers-socketio) provider adds support for [Socket.io](http://socket.io/) which enables real-time bidirectional event-based communication. It works on every platform, browser or device, focusing equally on reliability and speed.

## Usage

Install the provider module with:

```
npm install feathers-socketio --save
```

Then import the module and pass it to `app.configure`. The following example will start a server on port 3030 and also set up Socket.io:

```js
import feathers from 'feathers';
import socketio from 'feathers-socketio';

const app = feathers().configure(socketio());

app.listen(3030);
```

In the Browser you can connect, call service methods and listen to events like this:

```html
<script src="socket.io/socket.io.js"></script>
<script>
  var socket = io();

  socket.on('todos created', function(todo) {
    console.log('Got a new Todo!', todo);
  });

  socket.emit('todos::create', { description: 'Do something' }, {}, function() {
    socket.emit('todos::find', {}, function(error, todos) {
      console.log(todos);
    });
  });
</script>
```

> A detailed description of the usage on a client can be found in [the Feathers client](../../clients/readme.md) chapter.

## Configuration

Once the server has been started with `app.listen()` the Socket.io object is available as `app.io`. It is also possible to pass a function that gets called with the initialized `io` server object (for more details see the [Socket.io server documentation](http://socket.io/docs/server-api/)). This is a good place to listen to custom events or add [authorization](https://github.com/LearnBoost/socket.io/wiki/Authorizing):

```js
import feathers from 'feathers';
import socketio from 'feathers-socketio';

const app = feathers()
  .configure(socketio(function(io) {
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

app.listen(3030);
```

## Middleware and service parameters

Similar to [REST provider](../rest.md) middleware, Socket.io middleware can modify the `feathers` property on the `socket` which will then be used as the service parameters:

```js
app.configure(socketio(function(io) {
  io.use(function (socket, next) {
    socket.feathers.user = { name: 'David' };
    next();
  });
}));

app.use('todos', {
  create(data, params, callback) {
    // When called via SocketIO:
    params.provider // -> socketio
    params.user // -> { name: 'David' }
  }
});
```

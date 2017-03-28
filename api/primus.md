# Primus

[![GitHub stars](https://img.shields.io/github/stars/feathersjs/feathers-primus.png?style=social&label=Star)](https://github.com/feathersjs/feathers-primus/)
[![npm version](https://img.shields.io/npm/v/feathers-primus.png?style=flat-square)](https://www.npmjs.com/package/feathers-primus)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.png?style=flat-square)](https://github.com/feathersjs/feathers-primus/blob/master/CHANGELOG.md)

```
$ npm install feathers-primus --save
```

The [feathers-primus](https://github.com/feathersjs/feathers-primus) module allows to call [service methods](./services.md) and receive [real-time events](./events.md) via [Primus](https://github.com/primus/primus), a universal wrapper for real-time frameworks that supports Engine.IO, WebSockets, Faye, BrowserChannel, SockJS and Socket.IO.

| Service method  | Method event name   | Real-time event    |
|-----------------|---------------------|--------------------|
| .find()         | `messages::find`    | -                  |
| .get()          | `messages::get`     | -                  |
| .create()       | `messages::create`  | `messages created` |
| .update()       | `messages::update`  | `messages updated` |
| .patch()        | `messages::patch`   | `messages patched` |
| .remove()       | `messages::removed` | `messages removed` |

> **Important:** Primus is also used to *call* service methods. Using sockets for both, calling methods and receiving real-time events is generally faster than using [REST](rest.md) and there is usually no need to use both, REST and Socket.io in the same client application at the same time.

## Server

Additionally to `feathers-primus` your websocket library of choice also has to be installed.

```
$ npm install ws --save
```

### `app.configure(primus(options [, callback]))`

Sets up the Primus transport with the given [Primus options](https://github.com/primus/primus) and optionally calls the callback with the Primus server instance.

> **Pro tip:** Once the server has been started with `app.listen()` or `app.setup(server)` the Primus server object is available as `app.primus`.

```js
const feathers = require('feathers');
const primus = require('feathers-primus');

const app = feathers();

// Set up Primus with SockJS
app.configure(feathers.primus({
  transformer: 'sockjs'
}, function(primus) {
  // Do something with primus object
}));
```

### `params.provider`

For any [service method call](./services.md) made through `params.provider` will be set to `primus`. In a [hook](./hooks.md) this can for example be used to prevent external users from making a service method call:

```js
app.service('users').hooks({
  before: {
    remove(hook) {
      // check for if(hook.params.provider) to prevent any external call
      if(hook.params.provider === 'primus') {
        throw new Error('You can not delete a user via Primus');
      }
    }
  }
});
```

### `params.query`

`params.query` will contain the query parameters sent from the client.

> **Important:** Only `params.query` is passed between the server and the client, other parts of `params` are not. This is for security reasons so that a client can't set things like `params.user` or the database options. You can always map from `params.query` to `params` in a before [hook](./hooks.md).

### Middleware and service parameters

The Primus request object has a `feathers` property that can be extended with additional service `params` during authorization:

```js
app.configure(primus({
  transformer: 'sockjs'
}, function(primus) {
  // Do something with primus
  primus.use('todos::create', function(socket, done){
    // Exposing a request property to services and hooks
    socket.request.feathers.referrer = socket.request.referrer;
    done();
  });
}));

app.use('messages', {
  create(data, params, callback) {
    // When called via Primus:
    params.provider // -> primus
    params.user // -> { name: 'David' }
  }
});
```

## Client

The `client` module in `feathers-primus` (`require('feathers-primus/client')`) allows to connect to services exposed through the [Primus server](#server) via a client socket.

> **Very important:** The examples below assume you are using Feathers either in Node or in the browser with a module loader like Webpack or Browserify. For using Feathers with a `<script>` tag, AMD modules or with React Native see the [client chapter](./client.md).

<!-- -->

> **Note:** A client application can only use a single transport (either REST, Socket.io or Primus). Using two transports in the same client application is normally not necessary.

### Loading the Primus client library

In the browser the Primus client library (usually at `primus/primus.js`) always has to be loaded using a `<script>` tag:

```html
<script type="text/javascript" src="primus/primus.js"></script>
```

> **Important:** This will make the `Primus` object globally available. Module loader options are currently not available.

### Client use in NodeJS

In NodeJS a Primus client can be initialized as follows:

```js
const Primus = require('primus');
const Emitter = require('primus-emitter');
const Socket = Primus.createSocket({
  transformer: 'websockets',
  plugin: {
    'emitter': Emitter
  }
});
const socket = new Socket('http://api.feathersjs.com');
```

### `primus(socket)`

Initialize the Socket.io client using a given socket and the default options.

```js
const feathers = require('feathers');
const primus = require('feathers-primus/client');
const socket = new Primus('http://api.my-feathers-server.com');

const app = feathers();

app.configure(primus(socket));

// Receive real-time events through Socket.io
app.service('messages')
  .on('created', message => console.log('New message created', message));

// Call the `messages` service
app.service('messages').create({
  text: 'A message from a REST client'
});
```

### `primus(socket, options)`

Initialize the Socket.io client using a given socket and the given options. 

Options can be:

- `timeout` (default: 5000ms) - The time after which a method call fails and times out. This usually happens when calling a service or service method that does not exist.

```js
const feathers = require('feathers');
const primus = require('feathers-primus/client');
const socket = new Primus('http://api.my-feathers-server.com');

const app = feathers();

app.configure(primus(socket, { timeout: 2000 }));
```

### Changing the socket client timeout

Currently, the only way for clients to determine if a service or service method exists is through a timeout. You can set the timeout either through the option above or on a per-service level by setting the `timeout` property:

```javascript
app.service('messages').timeout = 3000;
```

## Direct connection

In the browser, the connection can be established by loading the client from `primus/primus.js` and instantiating a new `Primus` instance. Unlike HTTP calls, websockets do not have a cross-origin restriction in the browser so it is possible to connect to any Feathers server.

See the [Primus docs](https://github.com/primus/primus#connecting-from-the-browser) for more details.

> **ProTip**: The socket connection URL has to point to the server root which is where Feathers will set up Primus.

```html
<script src="primus/primus.js">
<script>
  var socket = new Primus('http://api.my-feathers-server.com');
</script>
```

### Calling service methods

Service methods can be called by emitting a `<servicepath>::<methodname>` event with the method parameters. `servicepath` is the name the service has been registered with (in `app.use`) without leading or trailing slashes. An optional callback following the `function(error, data)` Node convention will be called with the result of the method call or any errors that might have occurred.

`params` will be set as `params.query` in the service method call. Other service parameters can be set through a [Primus middleware](../real-time/primus.md).

#### `find`

Retrieves a list of all matching resources from the service

```js
primus.send('messages::find', { status: 'read', user: 10 }, (error, data) => {
  console.log('Found all messages', data);
});
```

Will call `messages.find({ query: { status: 'read', user: 10 } })` on the server.

#### `get`

Retrieve a single resource from the service.

```js
primus.send('messages::get', 1, (error, message) => {
  console.log('Found message', message);
});
```

Will call `messages.get(1, {})` on the server.

```js
primus.send('messages::get', 1, { fetch: 'all' }, (error, message) => {
  console.log('Found message', message);
});
```

Will call `messages.get(1, { query: { fetch: 'all' } })` on the server.

#### `create`

Create a new resource with `data` which may also be an array.

```js
primus.send('messages::create', {
  "text": "I really have to iron"
}, (error, message) => {
  console.log('Message created', message);
});
```

Will call `messages.create({ "text": "I really have to iron" }, {})` on the server.

```js
primus.send('messages::create', [
  { "text": "I really have to iron" },
  { "text": "Do laundry" }
]);
```

Will call `messages.create` on the server with the array.

#### `update`

Completely replace a single or multiple resources.

```js
primus.send('messages::update', 2, {
  "text": "I really have to do laundry"
}, (error, message) => {
  console.log('Message updated', message);
});
```

Will call `messages.update(2, { "text": "I really have to do laundry" }, {})` on the server. The `id` can also be `null` to update multiple resources:

```js
primus.send('messages::update', null, {
  complete: true
}, { complete: false });
```

Will call `messages.update(null, { "complete": true }, { query: { complete: 'false' } })` on the server.

> **ProTip:** `update` is normally expected to replace an entire resource which is why the database adapters only support `patch` for multiple records.

#### `patch`

Merge the existing data of a single or multiple resources with the new `data`.

```js
primus.send('messages::patch', 2, {
  read: true
}, (error, message) => {
  console.log('Patched message', message);
});
```

Will call `messages.patch(2, { "read": true }, {})` on the server. The `id` can also be `null` to update multiple resources:

```js
primus.send('messages::patch', null, {
  complete: true
}, {
  complete: false
}, (error, message) => {
  console.log('Patched message', message);
});
```

Will call `messages.patch(null, { complete: true }, { query: { complete: false } })` on the server to change the status for all read messages.

This is supported out of the box by the Feathers [database adapters](../databases/readme.md) 

#### `remove`

Remove a single or multiple resources:

```js
primus.send('messages::remove', 2, { cascade: true }, (error, message) => {
  console.log('Removed a message', message);
});
```

Will call `messages.remove(2, { query: { cascade: true } })` on the server. The `id` can also be `null` to remove multiple resources:

```js
primus.send('messages::remove', null, { read: true });
```

Will call `messages.remove(null, { query: { read: 'true' } })` on the server to delete all read messages.


### Listening to events

Listening to service events allows real-time behaviour in an application. [Service events](../real-time/readme.md) are sent to the socket in the form of `servicepath eventname`.

#### created

The `created` event will be published with the callback data when a service `create` returns successfully.

```js
primus.on('messages created', function(message) {
  console.log('Got a new Message!', message);
});
```

#### updated, patched

The `updated` and `patched` events will be published with the callback data when a service `update` or `patch` method calls back successfully.

```js
primus.on('my/messages updated', function(message) {
  console.log('Got an updated Message!', message);
});

primus.send('my/messages::update', 1, {
  text: 'Updated text'
}, {}, function(error, callback) {
 // Do something here
});
```

#### removed

The `removed` event will be published with the callback data when a service `remove` calls back successfully.

```js
primus.on('messages removed', function(message) {
  // Remove element showing the Message from the page
  $('#message-' + message.id).remove();
});
```

# Primus Client

> **Note:** We recommend using Feathers and the `@feathersjs/primus-client` module on the client if possible. To use a direct Primus connection without using Feathers on the client however see the [Direct connection](#direct-connection) section.

## Loading the Primus client library

In the browser the Primus client library (usually at `primus/primus.js`) always has to be loaded using a `<script>` tag:

```html
<script type="text/javascript" src="primus/primus.js"></script>
```

> **Important:** This will make the `Primus` object globally available. Module loader options are currently not available.

## Client use in NodeJS

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

## @feathersjs/primus-client

[![npm version](https://img.shields.io/npm/v/@feathersjs/client.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/primus-client)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.svg?style=flat-square)](https://github.com/feathersjs/feathers/blob/crow/packages/primus-client/CHANGELOG.md)

```
npm install @feathersjs/primus-client --save
```

The `@feathersjs/primus-client` module allows to connect to services exposed through the [Primus server](../primus.md) via the configured websocket library.

> **Important:** Primus sockets are also used to *call* service methods. Using sockets for both, calling methods and receiving real-time events is generally faster than using [REST](../express.md) and there is no need to use both, REST and websockets in the same client application at the same time.

### `primus(socket)`

Initialize the Primus client using a given socket and the default options.

:::: tabs :options="{ useUrlFragment: false }"

::: tab "Modular"
``` javascript
const feathers = require('@feathersjs/feathers');
const primusClient = require('@feathersjs/primus-client');
const socket = new Primus('http://api.my-feathers-server.com');

const app = feathers();

app.configure(primusClient(socket));

// Receive real-time events through Primus
app.service('messages')
  .on('created', message => console.log('New message created', message));

// Call the `messages` service
app.service('messages').create({
  text: 'A message from a REST client'
});
```
:::

::: tab "@feathersjs/client"
``` html
<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/core-js/2.1.4/core.min.js"></script>
<script src="//unpkg.com/@feathersjs/client@^3.0.0/dist/feathers.js"></script>
<script type="text/javascript" src="primus/primus.js"></script>
<script>
  // Socket.io is exposed as the `io` global.
  var socket = new Primus('http://api.my-feathers-server.com');
  // @feathersjs/client is exposed as the `feathers` global.
  var app = feathers();

  app.configure(feathers.primus(socket));

  // Receive real-time events through Primus
  app.service('messages')
    .on('created', message => console.log('New message created', message));

  // Call the `messages` service
  app.service('messages').create({
    text: 'A message from a REST client'
  });
</script>
```
:::

::::

### `primus(socket, options)`

Initialize the Primus client using a given socket and the given options. 

Options can be:

- `timeout` (default: 5000ms) - The time after which a method call fails and times out. This usually happens when calling a service or service method that does not exist.

```js
const feathers = require('@feathersjs/feathers');
const Primus = require('@feathersjs/primus-client');
const socket = new Primus('http://api.my-feathers-server.com');

const app = feathers();

app.configure(primus(socket, { timeout: 2000 }));
```

The timeout per service can be changed like this:

```js
app.service('messages').timeout = 3000;
```

### app.primus

`app.primus` contains a reference to the `socket` object passed to `primus(socket [, options])`

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

Service methods can be called by emitting a `<servicepath>::<methodname>` event with the method parameters. `servicepath` is the name the service has been registered with (in `app.use`) without leading or trailing slashes. An optional callback following the `function(error, data)` Node convention will be called with the result of the method call or any errors that might have occurred.

`params` will be set as `params.query` in the service method call. Other service parameters can be set through a [Primus middleware](../primus.md).

### Authentication

Sockets will be authenticated automatically by calling [.create](#create) on the [authentication service](../authentication/service.md):

```js
socket.send('create', 'authentication', {
  strategy: 'local',
  email: 'hello@feathersjs.com',
  password: 'supersecret'
}, function(error, authResult) {
  console.log(authResult); 
  // authResult will be {"accessToken": "your token", "user": user }
  // You can now send authenticated messages to the server
});
```

> __Important:__ When a socket disconnects and then reconnects, it has to be authenticated again before making any other request that requires authentication. This is usually done with the [jwt strategy](../authentication/jwt.md) using the `accessToken` from the `authResult`. The [authentication client](../authentication/client.md) handles this already automatically.

### `find`

Retrieves a list of all matching resources from the service

```js
socket.send('find', 'messages', { status: 'read', user: 10 }, (error, data) => {
  console.log('Found all messages', data);
});
```

Will call `app.service('messages').find({ query: { status: 'read', user: 10 } })` on the server.

### get

Retrieve a single resource from the service.

```js
socket.send('get', 'messages', 1, (error, message) => {
  console.log('Found message', message);
});
```

Will call `app.service('messages').get(1, {})` on the server.

```js
socket.send('get', 'messages', 1, { fetch: 'all' }, (error, message) => {
  console.log('Found message', message);
});
```

Will call `app.service('messages').get(1, { query: { fetch: 'all' } })` on the server.

### create

Create a new resource with `data` which may also be an array.

```js
socket.send('create', 'messages', {
  text: 'I really have to iron'
}, (error, message) => {
  console.log('Message created', message);
});
```

Will call `app.service('messages').create({ "text": "I really have to iron" }, {})` on the server.

```js
socket.send('create', 'messages', [
  { text: 'I really have to iron' },
  { text: 'Do laundry' }
]);
```

Will call `app.service('messages').create` on the server with the array.

### update

Completely replace a single or multiple resources.

```js
socket.send('update', 'messages', 2, {
  text: 'I really have to do laundry'
}, (error, message) => {
  console.log('Message updated', message);
});
```

Will call `app.service('messages').update(2, { "text": "I really have to do laundry" }, {})` on the server. The `id` can also be `null` to update multiple resources:

```js
socket.send('update', 'messages', null, {
  complete: true
}, { complete: false });
```

Will call `app.service('messages').update(null, { complete: true }, { query: { complete: false } })` on the server.

> **ProTip:** `update` is normally expected to replace an entire resource which is why the database adapters only support `patch` for multiple records.

### patch

Merge the existing data of a single or multiple resources with the new `data`.

```js
socket.send('patch', 'messages', 2, {
  read: true
}, (error, message) => {
  console.log('Patched message', message);
});
```

Will call `app.service('messages').patch(2, { "read": true }, {})` on the server. The `id` can also be `null` to update multiple resources:

```js
socket.send('patch', 'messages', null, {
  complete: true
}, {
  complete: false
}, (error, message) => {
  console.log('Patched message', message);
});
```

Will call `app.service('messages').patch(null, { complete: true }, { query: { complete: false } })` on the server to change the status for all read app.service('messages').

### remove

Remove a single or multiple resources:

```js
socket.send('remove', 'messages', 2, { cascade: true }, (error, message) => {
  console.log('Removed a message', message);
});
```

Will call `app.service('messages').remove(2, { query: { cascade: true } })` on the server. The `id` can also be `null` to remove multiple resources:

```js
socket.send('remove', 'messages', null, { read: true });
```

Will call `app.service('messages').remove(null, { query: { read: 'true' } })` on the server to delete all read app.service('messages').


### Listening to events

Listening to service events allows real-time behaviour in an application. [Service events](../events.md) are sent to the socket in the form of `servicepath eventname`.

#### created

The `created` event will be published with the callback data when a service `create` returns successfully.

```js
socket.on('messages created', function(message) {
  console.log('Got a new Message!', message);
});
```

#### updated, patched

The `updated` and `patched` events will be published with the callback data when a service `update` or `patch` method calls back successfully.

```js
socket.on('my/messages updated', function(message) {
  console.log('Got an updated Message!', message);
});

socket.send('update', 'my/messages', 1, {
  text: 'Updated text'
}, {}, function(error, callback) {
 // Do something here
});
```

#### removed

The `removed` event will be published with the callback data when a service `remove` calls back successfully.

```js
socket.on('messages removed', function(message) {
  // Remove element showing the Message from the page
  $('#message-' + message.id).remove();
});
```

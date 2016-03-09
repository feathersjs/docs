# Primus client use

Primus works very similar to [Socket.io](socket-io.md) but supports a number of different real-time libraries. [Once configured on the server](../real-time/primus.md) service methods and events will be available through a Primus socket connection. 

## Establishing the connection

In the browser, the connection can be established by loading the client from `primus/primus.js` and instantiating a new `Primus` instance. Unlike HTTP calls, websockets do not have a cross-origin restriction in the browser so it is possible to connect to any Feathers server. See below for platform specific examples.

> **ProTip**: The socket connection URL has to point to the server root which is where Feathers will set up Primus.

## Browser Usage

Using [the Feathers client](feathers.md), the `feathers-primus/client` module can be configured to use the Primus connection:

```html
<script type="text/javascript" src="primus/primus.js"></script>
<script type="text/javascript" src="https://rawgit.com/feathersjs/feathers-client/master/dist/feathers.js"></script>
<script type="text/javascript">
  var primus = new Primus('http://api.my-feathers-server.com');
  var app = feathers()
    .configure(feathers.hooks())
    .configure(feathers.primus(primus));

  var messageService = app.service('messages');
  
  messageService.on('created', function(message) {
    console.log('Someone created a message', message);
  });
  
  messageService.create({
    text: 'Message from client'
  });
</script>
```

## Server Usage

This sets up Primus as a stand alone client in NodeJS using the websocket transport. If you are integrating with a separate server instance you can also connect without needing to require `primus-emitter`. You can read more in the [Primus documentation](https://github.com/primus/primus#connecting-from-the-server).

```bash
$ npm install feathers feathers-primus feathers-hooks primus primus-emitter ws
```

```js
const feathers = require('feathers');
const primus = require('feathers-primus/client');
const Primus = require('primus');
const Emitter = require('primus-emitter');
const Socket = Primus.createSocket({
  transformer: 'websockets',
  plugin: {
    'emitter': Emitter
  }
});
const socket = new Socket('http://api.feathersjs.com');
const app = feathers()
  .configure(feathers.hooks())
  .configure(primus(socket));

// Get the message service that uses a websocket connection
const messageService = app.service('messages');

messageService.on('created', message => console.log('Someone created a message', message));
```

## React Native Usage

TODO (EK): Add some of the specific React Native things we needed to change to properly support websockets. I'm pretty sure this doesn't completely work so it's still a WIP. PR's welcome!

```bash
$ npm install feathers feathers-primus feathers-hooks primus
```

```js
import React from 'react-native';
import hooks from 'feathers-hooks';
import {client as feathers} from 'feathers';
import {client as primus} from 'feathers-primus';

let Socket = primus.socket;

// A hack so that you can still debug. Required because react native debugger runs in a web worker, which doesn't have a window.navigator attribute.
if (window.navigator && Object.keys(window.navigator).length === 0) {
  window.navigator.userAgent = 'ReactNative';
}

const socket = new Socket('http://api.feathersjs.com');
const app = feathers()
  .configure(feathers.hooks())
  .configure(primus(socket));

// Get the message service that uses a websocket connection
const messageService = app.service('messages');

messageService.on('created', message => console.log('Someone created a message', message));
```

## Direct socket events

A service can also be used by sending and receiving events through the Primus connection. This works with any client that can connect to a websocket. In the following example we will just re-use the Primus connection that we set up at the beginning of this chapter.

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

Will call `messages.find({ query: { status: 'read', user: 10 } })`.

#### `get`

Retrieve a single resource from the service.

```js
primus.send('messages::get', 1, (error, message) => {
  console.log('Found message', message);
});
```

Will call `messages.get(1, {})`.

```js
primus.send('messages::get', 1, { fetch: 'all' }, (error, message) => {
  console.log('Found message', message);
});
```

Will call `messages.get(1, { query: { fetch: 'all' } })`.

#### `create`

Create a new resource with `data` which may also be an array.

```js
primus.send('messages::create', {
  "text": "I really have to iron"
}, (error, message) => {
  console.log('Message created', message);
});
```

Will call `messages.create({ "text": "I really have to iron" }, {})`.

```js
primus.send('messages::create', [
  { "text": "I really have to iron" },
  { "text": "Do laundry" }
]);
```

Will call `messages.create` with the array.

### `update`

Completely replace a single or multiple resources.

```js
primus.send('messages::update', 2, {
  "text": "I really have to do laundry"
}, (error, message) => {
  console.log('Message updated', message);
});
```

Will call `messages.update(2, { "text": "I really have to do laundry" }, {})`. The `id` can also be `null` to update multiple resources:

```js
primus.send('messages::update', null, {
  complete: true
}, { complete: false });
```

Will call `messages.update(null, { "complete": true }, { query: { complete: 'false' } })`.

> __Note:__ `update` is normally expected to replace an entire resource which is why the database adapters only support `patch` for multiple records.

### `patch`

Merge the existing data of a single or multiple resources with the new `data`.

```js
primus.send('messages::patch', 2, {
  read: true
}, (error, message) => {
  console.log('Patched message', message);
});
```

Will call `messages.patch(2, { "read": true }, {})`. The `id` can also be `null` to update multiple resources:

```js
primus.send('messages::patch', null, {
  complete: true
}, {
  complete: false
}, (error, message) => {
  console.log('Patched message', message);
});
```

Will call `messages.patch(null, { complete: true }, { query: { complete: false } })` to change the status for all read messages.

This is supported out of the box by the Feathers [database adapters](../databases/readme.md) 

### `remove`

Remove a single or multiple resources:

```js
primus.send('messages::remove', 2, { cascade: true }, (error, message) => {
  console.log('Removed a message', message);
});
```

Will call `messages.remove(2, { query: { cascade: true } })`. The `id` can also be `null` to remove multiple resources:

```js
primus.send('messages::remove', null, { read: true });
```

Will call `messages.remove(null, { query: { read: 'true' } })` to delete all read messages.


### Listening to events

Listening to service events allows real-time behaviour in an application. [Service events](..//real-time/readme.md) are sent to the socket in the form of `servicepath eventname`.

#### created

The `created` event will be published with the callback data when a service `create` returns successfully.

```html
<script>
  primus.on('messages created', function(message) {
    console.log('Got a new Message!', message);
  });
</script>
```

#### updated, patched

The `updated` and `patched` events will be published with the callback data when a service `update` or `patch` method calls back successfully.

```html
<script>
  primus.on('my/messages updated', function(message) {
    console.log('Got an updated Message!', message);
  });

  primus.send('my/messages::update', 1, {
    text: 'Updated text'
  }, {}, function(error, callback) {
   // Do something here
  });
</script>
```

#### removed

The `removed` event will be published with the callback data when a service `remove` calls back successfully.

```html
<script>
  primus.on('messages removed', function(message) {
    // Remove element showing the Message from the page
    $('#message-' + message.id).remove();
  });
</script>
```

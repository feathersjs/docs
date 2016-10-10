# Feathers Client + Socket.io

[With Socket.io configured on the server](../real-time/socket-io.md) service methods and events will be available through a websocket connection. While using the REST API and just listening to real-time events on a socket is possible, Feathers also allows to call service methods through a websocket which, in most cases will be faster than REST HTTP.

## Establishing the connection

Feathers sets up a normal Socket.io server that you can connect to using the [Socket.io client](http://socket.io/docs/client-api/) either by loading the `socket.io-client` module or `/socket.io/socket.io.js` from the server. Unlike HTTP calls, websockets do not have a cross-origin restriction in the browser so it is possible to connect to any Feathers server. See below for platform specific examples.

> **ProTip**: The socket connection URL has to point to the server root which is where Feathers will set up Socket.io.

## Client options

The Socket.io configuration (`socketio(socket [, options])`) can take settings which currently support:

- `timeout` (default: 5000ms) - The time after which a method call fails and times out. This usually happens when calling a service or service method that does not exist.

### Changing the default timeout value

```javascript
app.service('messages').timeout = 3000;
```

## Browser Usage

Using [the Feathers client](feathers.md), the `feathers-socketio/client` module can be configured to use that socket as the connection:

```html
<script type="text/javascript" src="socket.io/socket.io.js"></script>
<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/core-js/2.1.4/core.min.js"></script>
<script type="text/javascript" src="//unpkg.com/feathers-client@^1.0.0/dist/feathers.js"></script>
<script type="text/javascript">
  var socket = io('http://api.feathersjs.com');
  var app = feathers()
    .configure(feathers.hooks())
    .configure(feathers.socketio(socket));
  
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

Here's how to use the Feathers socket.io client in NodeJS. A great use case would be workers that need to update the server or broadcast to all connected clients.

```bash
$ npm install feathers feathers-socketio feathers-hooks socket.io-client
```

```js
const feathers = require('feathers/client');
const socketio = require('feathers-socketio/client');
const io = require('socket.io-client');

const socket = io('http://api.feathersjs.com');
const app = feathers().configure(socketio(socket));

// Get the message service that uses a websocket connection
const messageService = app.service('messages');

messageService.on('created', message => console.log('Someone created a message', message));
```

## React Native Usage

Here's how you can use Feathers client with websockets in React Native.

```bash
$ npm install feathers feathers-socketio feathers-hooks socket.io-client
```

```js
import React from 'react-native';
import hooks from 'feathers-hooks';
import feathers from 'feathers/client';
import socketio from 'feathers-socketio/client';

if(!global._babelPolyfill) { require('babel-polyfill'); }

// A hack so that you can still debug. Required because react native debugger runs in a web worker, which doesn't have a window.navigator attribute.
window.navigator.userAgent = 'ReactNative';

// Need to require instead of import so we can set the user agent first
const io = require('socket.io-client/socket.io');
const socket = io('http://api.feathersjs.com', { transports: ['websocket'] });
const app = feathers()
  .configure(feathers.hooks())
  .configure(socketio(socket));

// Get the message service that uses a websocket connection
const messageService = app.service('messages');

messageService.on('created', message => console.log('Someone created a message', message));
```

## Debugging

Socket.io and feathers uses [debug](https://github.com/visionmedia/debug) to deliver the messages. You can use it in the Browser by setting the filter in the localStorage: `localStorage.debug = '*';`

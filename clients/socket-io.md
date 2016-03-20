# Feathers Client + Socket.io

[With Socket.io configured on the server](../real-time/socket-io.md) service methods and events will be available through a websocket connection. While using the REST API and just listening to real-time events on a socket is possible, Feathers also allows to call service methods through a websocket which, in most cases will be faster than REST HTTP.

## Establishing the connection

Feathers sets up a normal Socket.io server that you can connect to using the [Socket.io client](http://socket.io/docs/client-api/) either by loading the `socket.io-client` module or `/socket.io/socket.io.js` from the server. Unlike HTTP calls, websockets do not have a cross-origin restriction in the browser so it is possible to connect to any Feathers server. See below for platform specific examples.

> **ProTip**: The socket connection URL has to point to the server root which is where Feathers will set up Socket.io.

## Browser Usage

Using [the Feathers client](feathers.md), the `feathers-socketio/client` module can be configured to use that socket as the connection:

```html
<script type="text/javascript" src="socket.io/socket.io.js"></script>
<script type="text/javascript" src="//cdn.rawgit.com/feathersjs/feathers-client/v1.0.0/dist/feathers.js"></script>
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
import {client as feathers} from 'feathers';
import {client as socketio} from 'feathers-socketio';
import {socket.io as io} from 'socket.io-client';

// A hack so that you can still debug. Required because react native debugger runs in a web worker, which doesn't have a window.navigator attribute.
if (window.navigator && Object.keys(window.navigator).length == 0) {
  window = Object.assign(window, { navigator: { userAgent: 'ReactNative' }});
}

const socket = io('http://api.feathersjs.com', { transports: ['websocket'] });
const app = feathers()
  .configure(feathers.hooks())
  .configure(socketio(socket));

// Get the message service that uses a websocket connection
const messageService = app.service('messages');

messageService.on('created', message => console.log('Someone created a message', message));
```

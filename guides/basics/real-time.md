# Real-time APIs

In the [services](./services.md) chapter we saw that Feathers services automatically send `created`, `updated`, `patched` and `removed` events when a `create`, `update`, `patch` or `remove` service method returns. Real-time means that those events are also published to connected clients so that they can react accordingly, e.g. update their UI.

To allow real-time communication with clients we need a transport that supports bi-directional communication. In Feathers those are the [Socket.io](../../api/socketio.md) and [Primus](../../api/primus.md) transport both of which use [websockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) to receive real-time events _and also_ call service methods.

> __Important:__ The [REST transport](./rest.md) does not support real-time updates. Since socket transports also allow to call service methods and generally perform better, we recommend using a real-time transport whenever possible.

In this chapter we will use Socket.io and create a [database backed](./databases.md) real-time API that also still supports a [REST endpoint](./rest.md).

## Using the transport

After installing

```
npm install @feathersjs/socketio --save
```

The Socket.io transport can be configured and used with a standard configuration like this:

```js
const feathers = require('@feathersjs/feathers');
const socketio = require('@feathersjs/socketio');

// Create a Feathers application
const app = feathers();

// Configure the Socket.io transport
app.configure(socketio());

// Start the server on port 3030
app.listen(3030);
```

It also works in combination with a REST API setup:

```js
const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');

// This creates an app that is both, an Express and Feathers app
const app = express(feathers());

// Turn on JSON body parsing for REST services
app.use(express.json())
// Turn on URL-encoded body parsing for REST services
app.use(express.urlencoded({ extended: true }));
// Set up REST transport using Express
app.configure(express.rest());
// Set up an error handler that gives us nicer errors
app.use(express.errorHandler());

// Configure the Socket.io transport
app.configure(socketio());

// Start the server on port 3030
app.listen(3030);
```

## Channels

Channels determine which real-time events should be sent to which client. For example, we want to only send messages to authenticated users or users in the same room. For this example we will just enable real-time functionality for all connections however:

```js
// On any real-time connection, add it to the `everybody` channel
app.on('connection', connection => app.channel('everybody').join(connection));

// Publish all events to the `everybody` channel
app.publish(() => app.channel('everybody'));
```

> __Note:__ More information about channels can be found in the [channel API documentation](../../api/channels.md).

## A messages API

Putting it all together, our REST and real-time API with a messages service `app.js` looks like this:

```js
const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');
const memory = require('feathers-memory');

// This creates an app that is both, an Express and Feathers app
const app = express(feathers());

// Turn on JSON body parsing for REST services
app.use(express.json())
// Turn on URL-encoded body parsing for REST services
app.use(express.urlencoded({ extended: true }));
// Set up REST transport using Express
app.configure(express.rest());

// Configure the Socket.io transport
app.configure(socketio());

// On any real-time connection, add it to the `everybody` channel
app.on('connection', connection => app.channel('everybody').join(connection));

// Publish all events to the `everybody` channel
app.publish(() => app.channel('everybody'));

// Initialize the messages service
app.use('messages', memory({
  paginate: {
    default: 10,
    max: 25
  }
}));

// Set up an error handler that gives us nicer errors
app.use(express.errorHandler());

// Start the server on port 3030
const server = app.listen(3030);

server.on('listening', () => console.log('Feathers API started at localhost:3030'));
```

As always, we can start our server again by running

```
node app.js
```

## Using the API

The real-time API can be used by establishing a websocket connection. For that we need the Socket.io client which we can included by updating `public/index.html` to:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Feathers Basics</title>
</head>
<body>
  <h1>Welcome to Feathers</h1>
  <p>Open up the console in your browser.</p>
  <script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.4/socket.io.js"></script>
  <script type="text/javascript" src="//unpkg.com/@feathersjs/client@^3.0.0/dist/feathers.js"></script>
  <script type="text/javascript" src="//unpkg.com/feathers-memory@^2.0.0/dist/feathers-memory.js"></script>
  <script src="client.js"></script>
</body>
</html>
```

Then we can initialize and use the socket directly making some calls and listening to real-time events by updating `public/client.js` to this:

```js
/* global io */

// Create a websocket connecting to our Feathers server
const socket = io('http://localhost:3030');

// Listen to new messages being created
socket.on('messages created', message =>
  console.log('Someone created a message', message)
);

socket.emit('create', 'messages', {
  text: 'Hello from socket'
}, (error, result) => {
  if (error) throw error
  socket.emit('find', 'messages', (error, messageList) => {
    if (error) throw error
    console.log('Current messages', messageList);
  });
});
```

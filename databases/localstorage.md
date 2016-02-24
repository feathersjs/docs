# LocalStorage or AsyncStorage

[feathers-localstorage](https://github.com/feathersjs/feathers-localstorage/) is a service adapter that stores its data in localstorage in the browser or NodeJS (using a shim) or [AsyncStorage](https://facebook.github.io/react-native/docs/asyncstorage.html) in React Native. It is great for storing temporary data and can be used server side as well as in [client-side Feathers](../clients/readme.md) applications.

```bash
$ npm install --save feathers-localstorage
```

## Getting Started

You can easily create an localstorage service with no options:

```js
const localstorage = require('feathers-localstorage');
app.use('/messages', localstorage());
```

This will create a `messages` datastore with the default configuration.

## Options

The following options can be passed when creating a new localstorage service:

- `idField` (default: 'id') [optional] - The name of the id field property.
- `startId` (default: 0) [optional] - An id number to start with that will be incremented for new record.
- `name` (default: 'feathers') [optional] - The key to store data under in local or async storage.
- `storage` (default: 'window.localStorage') [optional] - The local storage engine. You can pass in a server side localstorage module or AsyncStorage on React Native.
- `store` [optional] - An object with id to item assignments to pre-initialize the data store
- `paginate` [optional] - A pagination object containing a `default` and `max` page size (see the [Pagination chapter](databases/pagination.md))

## Browser Usage

```html
<script type="text/javascript" src="socket.io/socket.io.js"></script>
<script type="text/javascript" src="node_modules/feathers-client/dist/feathers.js"></script>
<script type="text/javascript" src="node_modules/feathers-localstorage/dist/localstorage.js"></script>
<script type="text/javascript">
  var socket = io('http://api.my-feathers-server.com');
  var app = feathers()
    .configure(feathers.hooks())
    .configure(feathers.socketio(socket))
    .use('messages', localstorage());

  var localMessageService = app.service('messages');

  localMessageService.on('created', function(message) {
    console.log('Someone created a message', message);
  });

  localMessageService.create({
    text: 'Message from client'
  });
</script>
```

## Server Usage

Here is an example of a Feathers server with a `messages` localstorage service that supports pagination:

```bash
$ npm install feathers body-parser feathers-rest feathers-socketio feathers-localstorage localstorage-memory
```

```js
var feathers = require('feathers');
var bodyParser = require('body-parser');
var rest = require('feathers-rest');
var socketio = require('feathers-socketio');
var localstorage = require('feathers-localstorage');
var storage = require('localstorage-memory');

// Create a feathers instance.
const app = feathers()
  // Enable REST services
  .configure(rest())
  // Enable Socket.io services
  .configure(socketio())
  // Turn on JSON parser for REST services
  .use(bodyParser.json())
  // Turn on URL-encoded parser for REST services
  .use(bodyParser.urlencoded({ extended: true }));

// Create an in-memory localstorage Feathers service with a default page size of 2 items and a maximum size of 4
app.use('/messages', localstorage({
  storage: storage,
  paginate: {
    default: 2,
    max: 4
  }
}));

// Start the server.
var port = 3030;

app.listen(port, function() {
  console.log(`Feathers server listening on port ${port}`);
});
```

Run the example with `npm start` and go to [localhost:3030/messages](http://localhost:3030/messages). You will see the test Message that we created at the end of that file.

## React Native Usage

TODO (EK): Make sure this actually works. Still a WIP.

```bash
$ npm install feathers feathers-socketio feathers-hooks feathers-localstorage socket.io-client
```

```js
import React from 'react-native';
import localstorage from 'feathers-localstorage';
import feathers from 'feathers';
import hooks from 'feathers-hooks';
import localstorage from 'feathers-localstorage';
import {client as socketio} from 'feathers-socketio';
import {socket.io as io} from 'socket.io-client';

let { AsyncStorage } = React;

// A hack so that you can still debug. Required because react native debugger runs in a web worker, which doesn't have a window.navigator attribute.
if (window.navigator && Object.keys(window.navigator).length == 0) {
  window = Object.assign(window, { navigator: { userAgent: 'ReactNative' }});
}

const socket = io('http://api.feathersjs.com', { transports: ['websocket'] });
const app = feathers()
  .configure(feathers.hooks())
  .configure(socketio(socket))
  .use('messages', localstorage({ storage: AsyncStorage }));

const localMessageService = app.service('messages');

localMessageService.on('created', function(message) {
  console.log('Someone created a message', message);
});

localMessageService.create({
  text: 'Message from client'
});
```

# Universal Feathers

The Feathers client (`feathers/client`) module provides Feathers core functionality (registering and retrieving services, events etc.) without relying on Express. This makes it possible to use Feathers in any JavaScript environment like the browser, [React Native](https://facebook.github.io/react-native/) or other NodeJS servers and to transparently connect to and use services from a Feathers API server.

If they are not universally usable already (like [feathers-hooks](../hooks/readme.md)), many plugins provide their own client modules:

- [`feathers-socketio/client`](socket-io.md)
- [`feathers-primus/client`](primus.md)
- [`feathers-authentication/client`](../authentication/client.md) with support for:
  - Local authentication (username/password)
  - Token authentication (JWT)
  - OAuth2 (Facebook, LinkedIn, etc)
- [`feathers-rest/client`](rest.md) with support for:
  - [jQuery](https://jquery.com/)
  - [Superagent](http://visionmedia.github.io/superagent/)
  - [request](https://github.com/request/request)
  - Fetch: works in supported browsers, React Native or modules like [node-fetch](https://github.com/bitinn/node-fetch).

## Usage in NodeJS or React Native

For module loaders that support [NPM](https://www.npmjs.com/) like [Browserify](http://browserify.org/), [Webpack](https://webpack.github.io/) or [StealJS](http://stealjs.com) the Feathers client modules can be loaded individually. The following example sets up a Feathers client that uses a local Socket.io connection to communicate with remote services:

```bash
$ npm install feathers feathers-socketio feathers-hooks socket.io-client
```

```js
const feathers = require('feathers/client')
const socketio = require('feathers-socketio/client');
const hooks = require('feathers-hooks');
const io = require('socket.io-client');

const socket = io('http://api.my-feathers-server.com');
const app = feathers()
  .configure(hooks())
  .configure(socketio(socket));

const messageService = app.service('messages');

messageService.on('created', message => console.log('Created a message', message));

// Use the messages service from the server
messageService.create({
  text: 'Message from client'
});
```

## feathers-client

[feathers-client](https://github.com/feathersjs/feathers-client) consolidates a standard set of client plugins into a single distributable that can be used standalone in the browser or with other module loaders (like [RequireJS](http://requirejs.org/)) that don't support NPM. The following modules are included:

- *feathers* as `feathers` (or the default module export)
- *feathers-hooks* as `feathers.hooks`
- *feathers-rest* as `feathers.rest`
- *feathers-socketio* as `feathers.socketio`
- *feathers-primus* as `feathers.primus`
- *feathers-authentication* as `feathers.authentication`

In the browser a client that connects to the local server via websockets can be initialized like this:

```html
<script type="text/javascript" src="socket.io/socket.io.js"></script>
<script type="text/javascript" src="https://rawgit.com/feathersjs/feathers-client/master/dist/feathers.js"></script>
<script type="text/javascript">
  var socket = io('http://api.my-feathers-server.com');
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

In the following chapters we will discuss the different ways to connect to a Feathers server via [REST](rest.md), [Socket.io](socket-io.md) and [Primus](primus.md).

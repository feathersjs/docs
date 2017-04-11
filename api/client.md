# Client

One of the most notable features of Feathers is that it can also be used as the client. The difference to many other frameworks and services is that it isn't a separate library, you instead get the exact same functionality as on the server. This means you can use [services](./services.md) and [hooks](./hooks.md) and configure plugins. By default a Feathers client automatically creates services that talk to a Feathers server. How to initialize a connection can be found in

- The [REST transport client chapter](./rest.md#client)
- The [Socket.io transport client chapter](./socketio.md#client) (real-time)
- The [Primus transport client chapter](./primus.md#client) (real-time)

This chapter describes how to use Feathers as the client in Node, React Native and in the browser with a module loader like Webpack, Browserify, StealJS or through a `<script>` tag.

> __Important:__ The Feathers client libraries come transpiled to ES5 but require ES6 shims either through the [babel-polyfill](https://www.npmjs.com/package/babel-polyfill) module or by including [core.js](https://github.com/zloirock/core-js) in older browsers e.g. via `<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/core-js/2.1.4/core.min.js"></script>`

<!-- -->

> __Important:__ If you are not using a module loader you can load the [feathers-client](#feathers-client) directly through a script tag in the browser.

| Server package            | Client package                   | API page            |
| ------------------------- | -------------------------------- | ------------------- |
| `feathers`                | `feathers/client`                | [Application API](./application.md) |
| `feathers-hooks`          | `feathers-hooks`                 | [Hooks API](./hooks.md) |
| `feathers-errors`         | `feathers-errors`                | [Errors API](./errors.md) |
| `feathers-rest`           | `feathers-rest/client`           | [REST Transport API](./rest.md) |
| `feathers-socketio`       | `feathers-socketio/client`       | [Socket.io Transport API](./socketio.md) |
| `feathers-primus`         | `feathers-primus/client`         | [Primus Transport API](./primus.md) |
| `feathers-authentication` | `feathers-authentication/client` | [Feathers Authentication Client API]() |

## Universal (Isomorphic) API

The Feathers Client uses the same [Application API](./application.md) as is available on the server.  It is extremely lightweight, however, with Express having been replaced by a [thin wrapper](https://github.com/feathersjs/feathers/blob/master/src/client/express.js).  There are differences between the client and server APIs.  Learn more under each method on the [Application API page](./application.md).


## Node and npm loaders

The client utilities can be used directly on the server.  Just `require` each individual package or the `feathers-client` and use it the same way as shown for in the browser examples, below.  Node.js natively supports the CommonJS module syntax.  Here's an example of setting up the client in Node:

```js
const feathers = require('feathers/client');
const socketio = require('feathers-socketio/client');
const hooks = require('feathers-hooks');
const errors = require('feathers-errors'); // An object with all of the custom error types.
const auth = require('feathers-authentication-client/dist/socket.io');
const io = require('socket.io-client');

const socket = io('http://localhost:3030', {
  transports: ['websocket']
});

const feathersClient = feathers()
  .configure(socketio(socket))
  .configure(hooks())
  .configure(auth())

module.exports = feathersClient;
```

## Browserify, StealJS, and Webpack

Both, Browserify and StealJS support npm modules and require no additional configuration.  The client modules are all JavaScript, and should also work with any Webpack configuration.  Here's the same example from above, rewritten in ES Module syntax:

```js
import feathers from 'feathers/client';
import socketio from 'feathers-socketio/client';
import hooks from 'feathers-hooks';
import errors from 'feathers-errors'; // An object with all of the custom error types.
import auth from 'feathers-authentication-client/dist/socket.io';
import io from 'socket.io-client';

const socket = io('http://localhost:3030', {
  transports: ['websocket']
});

const feathersClient = feathers()
  .configure(socketio(socket))
  .configure(hooks())
  .configure(auth())

export default feathersClient;
```

## React Native

Install the required packages into your [React Native](https://facebook.github.io/react-native/) project.

```bash
$ npm install feathers feathers-socketio feathers-hooks socket.io-client babel-polyfill
```

Then in the main application file:

```js
import 'babel-polyfill';
import io from 'socket.io-client';
import feathers from 'feathers/client';
import socketio from 'feathers-socketio/client';
import hooks from 'feathers-hooks';

const socket = io('http://api.my-feathers-server.com', {
  transports: ['websocket'],
  forceNew: true
});
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

[![GitHub stars](https://img.shields.io/github/stars/feathersjs/feathers-client.png?style=social&label=Star)](https://github.com/feathersjs/feathers-client/)
[![npm version](https://img.shields.io/npm/v/feathers-client.png?style=flat-square)](https://www.npmjs.com/package/feathers-client)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.png?style=flat-square)](https://github.com/feathersjs/feathers-client/blob/master/CHANGELOG.md)

```
$ npm install feathers-client --save
```

`feathers-client` is a module that bundles the separate Feathers client side modules into one. It also provides a distributable file with everything you need to use Feathers in the browser through a `<script>` tag. Here is a table of which Feathers client module is included in `feathers-client`:

| Feathers module                 | feathers-client         |
|---------------------------------|-------------------------|
| feathers/client                 | feathers (default)      |
| feathers-hooks                  | feathers.hooks          |
| feathers-errors                 | feathers.errors         |
| feathers-rest/client            | feathers.rest           |
| feathers-socketio/client        | feathers.socketio       |
| feathers-primus/client          | feathers.primus         |
| feathers-authentication/client  | feathers.authentication |

### Load from CDN with `<script>`

 Below is an example of the scripts you would use to load `feathers-client` from `unpkg.com`.  It's possible to use it with a module loader,  but using individual client packages will allow you to take advantage of Feathers' modularity.

```html
<script src="//unpkg.com/feathers-client@2.0.0-pre.2/dist/feathers.js"></script>
<script src="//unpkg.com/socket.io-client@1.7.3/dist/socket.io.js"></script>
<script>
  // Socket.io is exposed as the `io` global.
  var socket = io('http://localhost:3030', {transports: ['websocket']});
  // feathers-client is exposed as the `feathers` global.
  var feathersClient = feathers()
    .configure(feathers.hooks())
    .configure(feathers.socketio(socket))
    .configure(feathers.authentication())

  // feathers.errors is an object with all of the custom error types.
</script>
```

### When to use `feathers-client`

- If you want to use Feathers in the browser with a `<script>` tag
- With a module loader that does not support npm packages (like RequireJS)


You can use `feathers-client` in NodeJS or with a browser module loader/bundler but it will include packages you may not use. It is also important to note that - except for this section - all other Feathers client examples assume you are using Node or a module loader.

### RequireJS

Here's an example of loading feathers-client using RequireJS Syntax:

```js
define(function (require) {
  const feathers = require('feathers-client');
  const socketio = feathers.socketio;
  const hooks = feathers.hooks;
  const errors = feathers.errors; // An object with all of the custom error types.
  const auth = feathers.auth;
  const io = require('socket.io-client');

  const socket = io('http://localhost:3030', {
    transports: ['websocket']
  });

  const feathersClient = feathers()
    .configure(socketio(socket))
    .configure(hooks())
    .configure(auth())

  return feathersClient;
});
```

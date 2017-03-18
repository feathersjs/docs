# Client

One of the most notable features of Feathers is that it can also be used as the client. The difference to many other frameworks and services is that it isn't a separate library, you instead get the exact same Feathers as on the server. This means you can use [services](./services.md) and [hooks](./hooks.md) and configure plugins. By default a Feathers client automatically creates services that talk to a Feathers server. How to initialize a connection can be found in

- The [REST transport client chapter](./rest.md#client)
- The [Socket.io transport client chapter](./socketio.md#client) (real-time)
- The [Primus transport client chapter](./primus.md#client) (real-time)

This chapter describes how to use Feathers as the client in Node, React Native and in the browser with a module loader like Webpack, Browserify, StealJS or through a `<script>` tag.

> __Important:__ The Feathers client libraries come transpiled to ES5 but require ES6 shims either through the [babel-polyfill](https://www.npmjs.com/package/babel-polyfill) module or by including [core.js](https://github.com/zloirock/core-js) in older browsers e.g. via `<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/core-js/2.1.4/core.min.js"></script>`

## Node and npm loaders

## Webpack

## Browserify, StealJS

Both, Browserify and StealJS support npm modules and require no additional configuration. 

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

### When to use `feathers-client`



- If you want to use Feathers in the browser with a `<script>` tag
- With a module loader that does not support npm packages (like RequireJS)


You can use `feathers-client` in NodeJS or with a browser module loader/bundler but it will include packages you may not use. It is also important to note that - except for this section - all other Feathers client examples assume you are using Node or a module loader.

### `<script>` tag

### RequireJS

# LocalStorage and AsyncStorage

[![GitHub stars](https://img.shields.io/github/stars/feathersjs/feathers-localstorage.svg?style=social&label=Star)](https://github.com/feathersjs/feathers-localstorage/)
[![npm version](https://img.shields.io/npm/v/feathers-localstorage.svg?style=flat-square)](https://www.npmjs.com/package/feathers-localstorage)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.svg?style=flat-square)](https://github.com/feathersjs/feathers-localstorage/blob/master/CHANGELOG.md)

[feathers-localstorage](https://github.com/feathersjs/feathers-localstorage/) is a database service adapter that extends [feathers-memory](./memory.md) and stores data in [localStorage](https://developer.mozilla.org/en/docs/Web/API/Window/localStorage) in the browser or [AsyncStorage](https://facebook.github.io/react-native/docs/asyncstorage.html) in React Native.

```bash
$ npm install --save feathers-localstorage
```

> **Important:** To use this adapter you also want to be familiar with the [common interface](./common.md) for database adapters.


## API

### `service([options])`

Returns a new service instance intitialized with the given options.

```js
const service = require('feathers-localstorage');

app.use('/messages', service({
  storage: window.localStorage || AsyncStorage
}));
app.use('/messages', service({ storage, id, startId, name, store, paginate }));
```

__Options:__

- `storage` (**required**) - The local storage engine. You can pass in the browsers `window.localStorage`, React Native's `AsyncStorage` or a NodeJS localstorage module.
- `id` (*optional*, default: `'id'`) - The name of the id field property.
- `startId` (*optional*, default: `0`) - An id number to start with that will be incremented for new record.
- `name` (*optional*, default: `'feathers'`) - The key to store data under in local or async storage.
- `store` (*optional*) - An object with id to item assignments to pre-initialize the data store
- `paginate` (*optional*) - A [pagination object](pagination.md) containing a `default` and `max` page size


## Example

See the [clients](../clients/readme.md) chapter for more information about using Feathers in the browser and React Native.

### Browser

```html
<script type="text/javascript" src="socket.io/socket.io.js"></script>
<script type="text/javascript" src="//unpkg.com/feathers-client@^1.0.0/dist/feathers.js"></script>
<script type="text/javascript" src="//unpkg.com/feathers-localstorage@^1.0.0/dist/localstorage.js"></script>
<script type="text/javascript">
  var service = feathers.localstorage({
    storage: window.localStorage
  });
  var app = feathers().use('/messages', service);

  var messages = app.service('messages');

  messages.on('created', function(message) {
    console.log('Someone created a message', message);
  });

  messages.create({
    text: 'Message created in browser',
    completed: false
  });
</script>
```

### React Native

```bash
$ npm install feathers feathers-localstorage --save
```

```js
import React from 'react-native';
import localstorage from 'feathers-localstorage';
import feathers from 'feathers';

const { AsyncStorage } = React;

const app = feathers()
  .use('/messages', localstorage({ storage: AsyncStorage }));

const messages = app.service('messages');

messages.on('created', function(message) {
  console.log('Someone created a message', message);
});

messages.create({
  text: 'Message from React Native',
  completed: false
});
```

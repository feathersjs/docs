# In Memory

[![GitHub stars](https://img.shields.io/github/stars/feathersjs/feathers-memory.svg?style=social&label=Star)](https://github.com/feathersjs/feathers-memory/)
[![npm version](https://img.shields.io/npm/v/feathers-memory.svg?style=flat-square)](https://www.npmjs.com/package/feathers-memory)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.svg?style=flat-square)](https://github.com/feathersjs/feathers-memory/blob/master/CHANGELOG.md)

A database service adapter for in-memory data storage that works on all platforms.

```bash
$ npm install --save feathers-memory
```

> **Important:** To use this adapter you also want to be familiar with [services](../services/readme.md) and the [common interface](./common.md) for database adapters.

## API

### `service([options])`

Returns a new service instance intitialized with the given options.

```js
const service = require('feathers-memory');

app.use('/messages', service());
app.use('/messages', service({ id, startId, store, paginate }));
```

__Options:__

- `id` (*optional*, default: `'id'`) - The name of the id field property.
- `startId` (*optional*, default: `0`) - An id number to start with that will be incremented for every new record (unless it is already set).
- `store` (*optional*) - An object with id to item assignments to pre-initialize the data store
- `paginate` (*optional*) - A [pagination object](pagination.md) containing a `default` and `max` page size


## Example

Here is an example of a Feathers server with a `messages` in-memory service that supports pagination:

```
$ npm install feathers body-parser feathers-rest feathers-socketio feathers-memory
```

In `app.js`:

```js
const feathers = require('feathers');
const bodyParser = require('body-parser');
const rest = require('feathers-rest');
const socketio = require('feathers-socketio');
const memory = require('feathers-memory');

// Create a feathers instance.
const app = feathers()
  // Enable REST services
  .configure(rest())
  // Enable REST services
  .configure(socketio())
  // Turn on JSON parser for REST services
  .use(bodyParser.json())
  // Turn on URL-encoded parser for REST services
  .use(bodyParser.urlencoded({ extended: true }));

// Create an in-memory Feathers service with a default page size of 2 items
// and a maximum size of 4
app.use('/messages', memory({
  paginate: {
    default: 2,
    max: 4
  }
}));

// Create a dummy Message
app.service('messages').create({
  text: 'Server message',
  complete: false
}).then(function(message) {
  console.log('Created message', message);
});

// Start the server.
const port = 3030;

app.listen(port, function() {
  console.log(`Feathers server listening on port ${port}`);
});
```

Run the example with `node app` and go to [localhost:3030/messages](http://localhost:3030/messages).

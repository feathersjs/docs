# In Memory

[![GitHub stars](https://img.shields.io/github/stars/feathersjs/feathers-memory.png?style=social&label=Star)](https://github.com/feathersjs/feathers-memory/)
[![npm version](https://img.shields.io/npm/v/feathers-memory.png?style=flat-square)](https://www.npmjs.com/package/feathers-memory)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.png?style=flat-square)](https://github.com/feathersjs/feathers-memory/blob/master/CHANGELOG.md)

[feathers-memory](https://github.com/feathersjs/feathers-memory/) is a database service adapter for in-memory data storage that works on all platforms.

```bash
$ npm install --save feathers-memory
```

> **Important:** To use this adapter you also want to be familiar with the [database adapter common API](./common.md) and [querying mechanism](./querying.md).


## API

### `service([options])`

Returns a new service instance intitialized with the given options.

```js
const service = require('feathers-memory');

app.use('/messages', service());
app.use('/messages', service({ id, startId, store, events, paginate }));
```

__Options:__

- `id` (*optional*, default: `'id'`) - The name of the id field property.
- `startId` (*optional*, default: `0`) - An id number to start with that will be incremented for every new record (unless it is already set).
- `store` (*optional*) - An object with id to item assignments to pre-initialize the data store
- `events` (*optional*) - A list of [custom service events](../real-time/events.md#custom-events) sent by this service
- `paginate` (*optional*) - A [pagination object](./pagination.md) containing a `default` and `max` page size


## Example

Here is an example of a Feathers server with a `messages` in-memory service that supports pagination:

```
$ npm install feathers body-parser feathers-rest feathers-socketio feathers-memory
```

In `app.js`:

```js
const feathers = require('feathers');
const errorHandler = require('feathers-errors/handler');
const bodyParser = require('body-parser');
const rest = require('feathers-rest');
const socketio = require('feathers-socketio');
const memory = require('feathers-memory');
const handler = require('feathers-errors/handler');

// Create a feathers instance.
const app = feathers()
  // Enable REST services
  .configure(rest())
  // Enable REST services
  .configure(socketio())
  // Turn on JSON parser for REST services
  .use(bodyParser.json())
  // Turn on URL-encoded parser for REST services
  .use(bodyParser.urlencoded({ extended: true }))
  // Create an in-memory Feathers service with a default page size of 2 items
  // and a maximum size of 4
  .use('/messages', memory({
    paginate: {
      default: 2,
      max: 4
    }
  }))
  // Set up default error handler
  .use(errorHandler());

// Create a dummy Message
app.service('messages').create({
  text: 'Message created on server'
}).then(message => console.log('Created message', message));

// Start the server.
const port = 3030;

app.listen(port, () => {
  console.log(`Feathers server listening on port ${port}`)
});
```

Run the example with `node app` and go to [localhost:3030/messages](http://localhost:3030/messages).

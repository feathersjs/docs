# NeDB

[![GitHub stars](https://img.shields.io/github/stars/feathersjs/feathers-nedb.svg?style=social&label=Star)](https://github.com/feathersjs/feathers-nedb/)
[![npm version](https://img.shields.io/npm/v/feathers-nedb.svg?style=flat-square)](https://www.npmjs.com/package/feathers-nedb)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.svg?style=flat-square)](https://github.com/feathersjs/feathers-nedb/blob/master/CHANGELOG.md)

[feathers-nedb](https://github.com/feathersjs/feathers-nedb/) is a database service adapter for [NeDB](https://github.com/louischatriot/nedb), an embedded datastore with a [MongoDB](https://www.mongodb.org/) like API. NeDB can store data in-memory or on the filesystem which makes it useful as a persistent storage without a separate database server.

```bash
$ npm install --save nedb feathers-nedb
```

> **Important:** To use this adapter you also want to be familiar with the [common interface](./common.md) for database adapters.

## API

### `service([options])`

Returns a new service instance intitialized with the given options. `Model` has to be an NeDB database instance.

```js
const NeDB = require('nedb');
const service = require('feathers-nedb');

// Create a NeDB instance
const Model = new NeDB({
  filename: './data/messages.db',
  autoload: true
});

app.use('/messages', service({ Model }));
app.use('/messages', service({ Model, id, events, paginate }));
```

__Options:__

- `Model` (**required**) - The NeDB database instance. See the [NeDB API](https://github.com/louischatriot/nedb#api) for more information.
- `id` (*optional*, default: `'_id'`) - The name of the id field property.
- `events` (*optional*) - A list of [custom service events](../real-time/events.md#custom-events) sent by this service
- `paginate` (*optional*) - A [pagination object](pagination.md) containing a `default` and `max` page size

## Example

Here is an example of a Feathers server with a `messages` NeDB service that supports pagination and persists to `db-data/messages`:

```
$ npm install feathers feathers-errors feathers-rest feathers-socketio feathers-nedb nedb body-parser
```

In `app.js`:

```js
const NeDB = require('nedb');
const feathers = require('feathers');
const errorHandler = require('feathers-errors/handler');
const rest = require('feathers-rest');
const socketio = require('feathers-socketio');
const bodyParser = require('body-parser');
const service = require('feathers-nedb');

const db = new NeDB({
  filename: './db-data/messages',
  autoload: true
});

// Create a feathers instance.
const app = feathers()
  // Enable REST services
  .configure(rest())
  // Enable Socket.io services
  .configure(socketio())
  // Turn on JSON parser for REST services
  .use(bodyParser.json())
  // Turn on URL-encoded parser for REST services
  .use(bodyParser.urlencoded({extended: true}))
  // Connect to the db, create and register a Feathers service.
  .use('/messages', service({
    Model: db,
    paginate: {
      default: 2,
      max: 4
    }
  }))
  // Set up default error handler
  .use(errorHandler());

// Create a dummy Message
app.service('messages').create({
  text: 'Message created on server',
  completed: false
}).then(message => console.log('Created message', message));

// Start the server.
const port = 3030;

app.listen(port, () => {
  console.log(`Feathers server listening on port ${port}`);
});
```

Run the example with `node app` and go to [localhost:3030/messages](http://localhost:3030/messages).

# KnexJS

[![GitHub stars](https://img.shields.io/github/stars/feathersjs-ecosystem/feathers-knex.png?style=social&label=Star)](https://github.com/feathersjs-ecosystem/feathers-knex/)
[![npm version](https://img.shields.io/npm/v/feathers-knex.png?style=flat-square)](https://www.npmjs.com/package/feathers-knex)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.png?style=flat-square)](https://github.com/feathersjs-ecosystem/feathers-knex/blob/master/CHANGELOG.md)

[feathers-knex](https://github.com/feathersjs-ecosystem/feathers-knex) is a database adapter for [KnexJS](http://knexjs.org/), an SQL query builder for Postgres, MSSQL, MySQL, MariaDB, SQLite3, and Oracle.

```bash
npm install --save mysql knex feathers-knex
```

> **Important:** To use this adapter you also want to be familiar with the [database adapter common API](./common.md) and [querying mechanism](./querying.md).

> **Note:** You also need to [install the database driver](http://knexjs.org/#Installation-node) for the DB you want to use.

## API

### `service(options)`

Returns a new service instance initialized with the given options.

```js
const knex = require('knex');
const service = require('feathers-knex');

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: './db.sqlite'
  }
});

// Create the schema
db.schema.createTable('messages', table => {
  table.increments('id');
  table.string('text');
});

app.use('/messages', service({
  Model: db,
  name: 'messages'
}));
app.use('/messages', service({ Model, name, id, events, paginate }));
```

__Options:__

- `Model` (**required**) - The KnexJS database instance
- `name` (**required**) - The name of the table
- `id` (*optional*, default: `'id'`) - The name of the id field property.
- `events` (*optional*) - A list of [custom service events](../real-time/events.md#custom-events) sent by this service
- `paginate` (*optional*) - A [pagination object](./pagination.md) containing a `default` and `max` page size

### `adapter.createQuery(query)`

Returns a KnexJS query with the [common filter criteria](./querying.md) (without pagination) applied.

### params.knex

When making a [service method](./services.md) call, `params` can contain an `knex` property which allows to modify the options used to run the KnexJS query. See [customizing the query](#customizing-the-query) for an example.


## Example

Here's a complete example of a Feathers server with a `messages` SQLite service. We are using the [Knex schema builder](http://knexjs.org/#Schema) and [SQLite](https://sqlite.org/) as the database.

```
$ npm install @feathersjs/feathers @feathersjs/errors @feathersjs/express @feathersjs/socketio feathers-knex knex sqlite3
```

In `app.js`:

```js
const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');

const service = require('feathers-knex');
const knex = require('knex');

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: './db.sqlite'
  }
});

// Create a feathers instance.
const app = express(feathers());
// Turn on JSON parser for REST services
app.use(express.json());
// Turn on URL-encoded parser for REST services
app.use(express.urlencoded({ extended: true }));
// Enable REST services
app.configure(express.rest());
// Enable Socket.io services
app.configure(socketio());
// Create Knex Feathers service with a default page size of 2 items
// and a maximum size of 4
app.use('/messages', service({
  Model: db,
  name: 'messages',
  paginate: {
    default: 2,
    max: 4
  }
}))
app.use(express.errorHandler());

// Clean up our data. This is optional and is here
// because of our integration tests
db.schema.dropTableIfExists('messages').then(() => {
  console.log('Dropped messages table');

  // Initialize your table
  return db.schema.createTable('messages', table => {
    console.log('Creating messages table');
    table.increments('id');
    table.string('text');
  });
}).then(() => {
  // Create a dummy Message
  app.service('messages').create({
    text: 'Message created on server'
  }).then(message => console.log('Created message', message));
});

// Start the server.
const port = 3030;

app.listen(port, () => {
  console.log(`Feathers server listening on port ${port}`);
});
```

Run the example with `node app` and go to [localhost:3030/messages](http://localhost:3030/messages).

## Querying

In addition to the [common querying mechanism](./querying.md), this adapter also supports:

### $like

Find all records where the value matches the given string pattern. The following query retrieves all messages that start with `Hello`:

```js
app.service('messages').find({
  query: {
    text: {
      $like: 'Hello%'
    }
  }
});
```

Through the REST API:

```
/messages?text[$like]=Hello%
```

### $ilike

For PostgreSQL only, the keywork $ilike can be used instead of $like to make the match case insensitive. The following query retrieves all messages that start with `hello` (case insensitive):

```js
app.service('messages').find({
  query: {
    text: {
      $ilike: 'hello%'
    }
  }
});
```

Through the REST API:

```
/messages?text[$ilike]=hello%
```


## Transaction Support

The Knex adapter comes with three hooks that allows to run service method calls in a transaction. They can be used as application wide (`app.hooks.js`) hooks or per service like this:

```javascript
// A common hooks file
const { hooks } = require('feathers-knex');

const { transaction } = hooks;

module.exports = {
  before: {
    all: [ transaction.start() ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [ transaction.end() ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [ transaction.rollback() ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
```

To use the transactions feature, you must ensure that the three hooks (start, commit and rollback) are being used.

At the start of any request, a new transaction will be started. All the changes made during the request to the services that are using the `feathers-knex` will use the transaction. At the end of the request, if sucessful, the changes will be commited. If an error occurs, the changes will be forfeit, all the `creates`, `patches`, `updates` and `deletes` are not going to be commited.

The object that contains `transaction` is stored in the `params.transaction` of each request.

> __Important:__ If you call another Knex service within a hook and want to share the transaction you will have to pass `context.params.transaction` in the parameters of the service call.


## Customizing the query

In a `find` call, `params.knex` can be passed a KnexJS query (without pagination) to customize the find results.

Combined with `.createQuery({ query: {...} })`, which returns a new KnexJS query with the [common filter criteria](./querying.md) applied, this can be used to create more complex queries. The best way to customize the query is in a [before hook](../hooks.md) for `find`.

```js
app.service('mesages').hooks({
  before: {
    find(context) {
      const query = this.createQuery({ query: context.params.query });

      // do something with query here
      query.orderBy('name', 'desc');

      context.params.knex = query;
    }
  }
});
```

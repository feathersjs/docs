# RethinkDB

[![GitHub stars](https://img.shields.io/github/stars/feathersjs/feathers-rethinkdb.png?style=social&label=Star)](https://github.com/feathersjs/feathers-rethinkdb/)
[![npm version](https://img.shields.io/npm/v/feathers-rethinkdb.png?style=flat-square)](https://www.npmjs.com/package/feathers-rethinkdb)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.png?style=flat-square)](https://github.com/feathersjs/feathers-rethinkdb/blob/master/CHANGELOG.md)

[feathers-rethinkdb](https://github.com/feathersjs/feathers-rethinkdb) is a database adapter for [RethinkDB](https://rethinkdb.com), a real-time database.

```bash
$ npm install --save rethinkdbdash feathers-rethinkdb
```

> **Important:** To use this adapter you also want to be familiar with the [database adapter common API](./common.md) and [querying mechanism](./querying.md).

> This adapter requires a running [RethinkDB](https://www.rethinkdb.com/) server.

## API

### `service(options)`

Returns a new service instance initialized with the given options. For more information on initializing the driver see the [RehinktDBdash documentation](https://github.com/neumino/rethinkdbdash).

```js
const r = require('rethinkdbdash')({
  db: 'feathers'
});
const service = require('feathers-rethinkdb');

app.use('/messages', service({
  Model: r,
  db: 'someotherdb' //must be on the same connection as rethinkdbdash
  name: 'messages',
  // Enable pagination
  paginate: {
    default: 2,
    max: 4
  }
}));
```

> **Note:** By default, `watch` is set to `true` which means this adapter monitors the database for changes and automatically sends real-time events. This means that, unlike other databases and services, you will also get events if the database is changed directly.

__Options:__

- `Model` (**required**) - The `rethinkdbdash` instance, already initialized with a configuration object. [see options here](https://github.com/neumino/rethinkdbdash#importing-the-driver)
- `name` (**required**) - The name of the table
- `watch` (*options*, default: `true`) - Listen to table changefeeds and send according [real-time events](../real-time/events.md) on the adapter.
- `db` (*optional*, default: `none`) - Specify and alternate rethink database for the service to use. Must be on the same server/connection used by rethinkdbdash. It will be auto created if you call init() on the service and it does not yet exist.
- `id` (*optional*, default: `'id'`) - The name of the id field property. Needs to be set as the primary key when creating the table.
- `events` (*optional*) - A list of [custom service events](../real-time/events.md#custom-events) sent by this service
- `paginate` (*optional*) - A [pagination object](./pagination.md) containing a `default` and `max` page size

### `adapter.init([options])`

Create the database and table if it does not exists. `options` can be the RethinkDB [tableCreate options](https://rethinkdb.com/api/javascript/table_create/).

```js
// Initialize the `messages` table with `messageId` as the primary key
app.service('messages').init({
  primaryKey: 'messageId'
}).then(() => {
  // Use service here
});
```

### `adapter.createQuery(query)`

Returns a RethinkDB query with the [common filter criteria](./querying.md) (without pagination) applied.

### params.rethinkdb

When making a [service method](./services.md) call, `params` can contain an `rethinkdb` property which allows to pass additional RethinkDB options. See [customizing the query](#customizing-the-query) for an example.


## Example

To run the complete RethinkDB example we need to install

```
$ npm install feathers feathers-errors feathers-rest feathers-socketio feathers-rethinkdb rethinkdbdash body-parser
```

We also need access to a RethinkDB server. You can install a local server on your local development machine by downloading one of the packages [from the RethinkDB website](https://rethinkdb.com/docs/install/). It might also be helpful to review their docs on [starting a RethinkDB server](http://rethinkdb.com/docs/start-a-server/).

Then add the following into `app.js`:

```js
const rethink = require('rethinkdbdash');
const feathers = require('feathers');
const errorHandler = require('feathers-errors/handler');
const rest = require('feathers-rest');
const socketio = require('feathers-socketio');
const bodyParser = require('body-parser');
const service = require('feathers-rethinkdb');

// Connect to a local RethinkDB server.
const r = rethink({
  db: 'feathers'
});

// Create a feathers instance.
var app = feathers()
  // Enable the REST provider for services.
  .configure(rest())
  // Enable the socketio provider for services.
  .configure(socketio())
  // Turn on JSON parser for REST services
  .use(bodyParser.json())
  // Turn on URL-encoded parser for REST services
  .use(bodyParser.urlencoded({extended: true}))
  // Register the service
  .use('messages', service({
    Model: r,
    name: 'messages',
    paginate: {
      default: 10,
      max: 50
    }
  }))
  .use(errorHandler());

// Initialize database and messages table if it does not exists yet
app.service('messages').init().then(() => {
  // Create a message on the server
  app.service('messages').create({
    text: 'Message created on server'
  }).then(message => console.log('Created message', message));

  const port = 3030;
  app.listen(port, function() {
    console.log(`Feathers server listening on port ${port}`);
  });
});
```

Run the example with `node app` and go to [localhost:3030/messages](http://localhost:3030/messages).


## Querying

In addition to the [common querying mechanism](./querying.md), this adapter also supports:

### `$search`

Return all matches for a property using the [RethinkDB match syntax](https://www.rethinkdb.com/api/javascript/match/).

```js
// Find all messages starting with Hello
app.service('messages').find({
  query: {
    text: {
      $search: '^Hello'
    }
  }
});

// Find all messages ending with !
app.service('messages').find({
  query: {
    text: {
      $search: '!$'
    }
  }
});
```

```
GET /messages?text[$search]=^Hello
GET /messages?text[$search]=!$
```

### `$contains`

Matches if the property is an array that contains the given entry.


```js
// Find all messages tagged with `nodejs`
app.service('messages').find({
  query: {
    tags: {
      $contains: 'nodejs'
    }
  }
});
```

```
GET /messages?tags[$contains]=nodejs
```


## Customizing the query

In a `find` call, `params.rethinkdb` can be passed a RethinkDB query (without pagination) to customize the find results.

Combined with `.createQuery(query)`, which returns a new RethinkDB query with the [common filter criteria](./querying.md) applied, this can be used to create more complex queries. The best way to customize the query is in a [before hook](../hooks/index.md) for `find`. The following example adds a `getNearest` condition for [RethinkDB geospatial queries](https://www.rethinkdb.com/docs/geo-support/javascript/).

```js
app.service('mesages').hooks({
  before: {
    find(hook) {
      const query = this.createQuery(hook.params.query);
      const r = this.options.r;

      const point = r.point(-122.422876, 37.777128);  // San Francisco

      // Update the query with an additional `getNearest` condition
      hook.params.rethinkdb = query.getNearest(point, { index: 'location' });
    }
  }
});
```


## Changefeeds

`.createQuery(query)` can also be used to listen to changefeeds and then send [custom events](../real-time/events.md).

Since the service already sends real-time events for all changes the recommended way to listen to changes is with [feathers-reactive](../ecosystem/feathers-reactive.md) however.

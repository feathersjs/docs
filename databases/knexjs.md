# KnexJS

[feathers-knex](https://github.com/feathersjs/feathers-knex) is a database adapter for [KnexJS](http://knexjs.org/), an SQL query builder for Postgres, MSSQL, MySQL, MariaDB, SQLite3, and Oracle designed to be flexible, portable, and fun to use.

```bash
npm install --save mysql knex feathers-knex
```

> **ProTip:** You also need to [install the database driver](http://knexjs.org/#Installation-node) for the DB you want to use. If you used the Feathers generator then this was already done for you. 

## Getting Started

You can create a SQL Knex service like this:

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
  table.boolean('read');
});

app.use('/messages', service({
  Model: db,
  name: 'messages'
}));
```

This will create a `messages` endpoint and connect to a local `messages` table on an SQLite database in `data.db`.

## Options

The following options can be passed when creating a Knex service:

- `Model` (**required**) - The KnexJS database instance
- `name` (**required**) - The name of the table
- `id` (default: `id`) [optional] - The name of the id property.
- `paginate` [optional] - A pagination object containing a `default` and `max` page size (see the [Pagination chapter](pagination.md))

## Complete Example

Here's a complete example of a Feathers server with a `messages` SQLite service. We are using the [Knex schema builder](http://knexjs.org/#Schema)

```
$ npm install feathers feathers-rest feathers-socketio body-parser feathers-knex knex sqlite3
```

```js
// app.js
const feathers = require('feathers');
const rest = require('feathers-rest');
const socketio = require('feathers-socketio');
const bodyParser = require('body-parser');
const service = require('feathers-knex');
const knex = require('knex');

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: './db.sqlite'
  }
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
  .use(bodyParser.urlencoded({ extended: true }));

// Create Knex Feathers service with a default page size of 2 items
// and a maximum size of 4
app.use('/messages', service({
  Model: db,
  name: 'messages',
  paginate: {
    default: 2,
    max: 4
  }
}));

// Clean up our data. This is optional and is here
// because of our integration tests
db.schema.dropTableIfExists('messages').then(function() {
  console.log('Dropped messages table');

  // Initialize your table
  return db.schema.createTable('messages', function(table) {
    console.log('Creating messages table');
    table.increments('id');
    table.string('text');
    table.boolean('complete');
  });
}).then(function() {
  // Create a dummy Message
  app.service('messages').create({
    text: 'Server message',
    complete: false
  }).then(function(message) {
    console.log('Created message', message);
  });
});

// Start the server.
const port = 3030;

app.listen(port, function() {
  console.log(`Feathers server listening on port ${port}`);
});
```

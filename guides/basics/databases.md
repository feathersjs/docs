# Databases

In the [services chapter](./services.md) we created a custom in-memory messages service that can create, update and delete messages. You can probably imagine how we could implement the same thing talking to any database instad of storing it in memory so there isn't really a database that Feathers doesn't support.

Writing all that code yourself is pretty repetitive and cumbersome though which is why Feathers has a collection of pre-built services for different databases. They offer most the basic functionality and can always be fully customized to your requirements using [hooks](./hooks.md). Feathers database adapters support a common [usage API](../../api/databases/common.md), pagination and [querying syntax](../../api/databases/querying.md) for many popular databases and NodeJS ORMs:

| Database | Adapter |
|---|---|
| In memory | [feathers-memory](https://github.com/feathersjs-ecosystem/feathers-memory), [feathers-nedb](https://github.com/feathersjs-ecosystem/feathers-nedb) |
| Localstorage, AsyncStorage | [feathers-localstorage](https://github.com/feathersjs-ecosystem/feathers-localstorage) |
| Filesystem | [feathers-nedb](https://github.com/feathersjs-ecosystem/feathers-nedb) |
| MongoDB | [feathers-mongodb](https://github.com/feathersjs-ecosystem/feathers-mongodb), [feathers-mongoose](https://github.com/feathersjs-ecosystem/feathers-mongoose) |
| MySQL, PostgreSQL, MariaDB, SQLite, MSSQL | [feathers-knex](https://github.com/feathersjs-ecosystem/feathers-knex), [feathers-sequelize](https://github.com/feathersjs-ecosystem/feathers-sequelize) |
| Elasticsearch | [feathers-elasticsearch](https://github.com/feathersjs-ecosystem/feathers-elasticsearch) |
| RethinkDB | [feathers-rethinkdb](https://github.com/feathersjs-ecosystem/feathers-rethinkdb) |

> __Pro tip:__ Each one of the the linked adapters has a complete REST API example in their readme.

In this chapter we will look at the basic usage of the in-memory database adapter and create a persistent REST API using [NEDB](https://github.com/louischatriot/nedb).

> __Important:__ You should be familiar with the database technology and ORM ([Sequelize](http://docs.sequelizejs.com/), [KnexJS](http://knexjs.org/) or [Mongoose](http://mongoosejs.com/)) before using a Feathers database adapter.

## An in-memory database

[feathers-memory](https://github.com/feathersjs-ecosystem/feathers-memory) is a Feathers database adapter that - similar to our messages service - stores its data in memory. We will use it for the examples because it also works in the browser. Let's install it with:

```
npm install feathers-memory --save
```

We can use the adapter by requiring it and initializing it with the options we want. Here we enable pagination showing 10 entries by default and a maximum of 25 (so that clients can't just request all data at once and crash our server):

```js
const feathers = require('@feathersjs/feathers');
const memory = require('feathers-memory');

const app = feathers();

app.use('messages', memory({
  paginate: {
    default: 10,
    max: 25
  }
}));
```

That's it. We have a complete CRUD service for our messages with querying functionality.

## In the browser

We can also include `feathers-memory` in the browser, most easily by loading its browser build which will add it as `feathers.memory`. In `public/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Feathers Basics</title>
</head>
<body>
  <h1>Welcome to Feathers</h1>
  <p>Open up the console in your browser.</p>
  <script type="text/javascript" src="//unpkg.com/@feathersjs/client@^3.0.0/dist/feathers.js"></script>
  <script type="text/javascript" src="//unpkg.com/feathers-memory@^2.0.0/dist/feathers-memory.js"></script>
  <script src="client.js"></script>
</body>
</html>
```

And `public/client.js`:

```js
const app = feathers();

app.use('messages', feathers.memory({
  paginate: {
    default: 10,
    max: 25
  }
}));
```

## Querying

As mentioned, all database adapters support a common way of querying the data in a `find` method call using `params.query`. You can find a complete list in the [querying syntax API](../../api/databases/querying.md).

With pagination enabled, the `find` method will return an object with the following properties:

- `data` - The current list of data
- `limit` - The page size
- `skip` - The number of entries that were skipped
- `total` - The total number of entries for this query

The following example automatically creates a couple of messages and makes some queries. You can add it at the end of both, `app.js` and `public/client.js` to see it in Node and the browser:

```js
async function createAndFind() {
  // Stores a reference to the messages service so we don't have to call it all the time
  const messages = app.service('messages');

  for(let counter = 0; counter < 100; counter++) {
    await messages.create({
      counter,
      message: `Message number ${counter}`
    });
  }

  // We show 10 entries by default. By skipping 10 we go to page 2
  const page2 = await messages.find({
    query: { $skip: 10 }
  });

  console.log('Page number 2', page2);

  // Show 20 items per page
  const largePage = await messages.find({
    query: { $limit: 20 }
  });

  console.log('20 items', largePage);

  // Find the first 10 items with counter greater 50 and less than 70
  const counterList = await messages.find({
    query: {
      counter: { $gt: 50, $lt: 70 }
    }
  });

  console.log('Counter greater 50 and less than 70', counterList);

  // Find all entries with text "Message number 20"
  const message20 = await messages.find({
    query: {
      message: 'Message number 20'
    }
  });

  console.log('Entries with text "Message number 20"', message20);
}

createAndFind();
```

## As a REST API

In the [REST API chapter](./rest.md) we created a REST API from our custom messages service. Using a database adapter instead will make our `app.js` a lot shorter:

```js
const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const memory = require('feathers-memory');

const app = express(feathers());

// Turn on JSON body parsing for REST services
app.use(express.json())
// Turn on URL-encoded body parsing for REST services
app.use(express.urlencoded({ extended: true }));
// Set up REST transport using Express
app.configure(express.rest());
// Set up an error handler that gives us nicer errors
app.use(express.errorHandler());

// Initialize the messages service
app.use('messages', memory({
  paginate: {
    default: 10,
    max: 25
  }
}));

// Start the server on port 3030
const server = app.listen(3030);

// Use the service to create a new message on the server
app.service('messages').create({
  text: 'Hello from the server'
});

server.on('listening', () => console.log('Feathers REST API started at localhost:3030'));
```

After starting the server with `node app.js` we can pass a query e.g. by going to [localhost:3030/messages?$limit=2](http://localhost:3030/messages?$limit=2).

> __Note:__ The [querying syntax API documentation](../../api/databases/querying.md) has more examples how URLs should look like.

## What's next?

Feathers database adapters are a quick way to get an API and up and running. The great thing is that [hooks](./hooks.md) still give us all the flexibility we need to customize how they work. We already saw how we can easily create a database backed REST API, in the [next chapter](./real-time.md) we will make our API real-time.

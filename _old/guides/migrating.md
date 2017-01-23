# Migrating to Feathers 2

Feathers 2 has become even smaller and more modular. There are no changes in the service API although we recommend using ES6 Promises instead of callbacks. This guide describes how to migrate from previous versions to Feathers v2.

## Provider modules

The biggest breaking API change for Feathers 2 core is that the providers which used to be available in `feathers.rest`, `feathers.socketio` and `feathers.primus` are now in their own modules:

- `feathers.rest` in [feathers-rest](../rest/readme.md)
- `feathers.socketio` in [feathers-socketio](../real-time/socket-io.md)
- `feathers.primus` in [feathers-primus](../real-time/primus.md)

To migrate, install the provider module you want to use:

```
$ npm install feathers-rest
$ npm install feathers-socketio
$ npm install feathers-primus
```

And then change any configuration that used to look like this:

```js
// app.js
var feathers = require('feathers');
var app = feathers();

// Add REST API support
app.configure(feathers.rest());
// Configure Socket.io real-time APIs
app.configure(feathers.socketio());
// Configure Primus real-time APIs
app.configure(feathers.primus());
```

To

```js
// app.js
var feathers = require('feathers');
var rest = require('feathers-rest');
var socketio = require('feathers-socketio');
var primus = require('feathers-primus');

var app = feathers();

// Add REST API support
app.configure(rest());
// Configure Socket.io real-time APIs
app.configure(socketio());
// Configure Primus real-time APIs
app.configure(primus());
```

All configuration options are still the same.

> **ProTip:** One additional small difference is that `feathers-socketio` now sets up the connection as a service mixin in the services `setup`. This means `app.configure(socketio())` has to be called **before** registering any services.

## Database adapters

If you are using an older version of a database adapter, it will continue to work just the same with Feathers 2 since the service interface didn't change.

The usage of the latest database adapters has been unified to support a common way for [extension](../databases/extending.md), [querying](../databases/querying.md) and [pagination](../databases/pagination.md). They now require establishing a connection outside of the adapter and you now pass the database connection instance or ORM model to the service. For detailed information follow up in the adapter, ORM or database chapters below:

- **Memory** - [feathers-memory](../databases/memory.md)
- **MongoDB** - [feathers-mongoose](../databases/mongoose.md)
- **NeDB** - [feathers-nedb](../databases/nedb.md)
- **PostgreSQL, MySQL, MariaDB, and SQLite**
  - [feathers-knex](../databases/knexjs.md)
  - [feathers-sequelize](../databases/sequelize.md)
- **Oracle** - [feathers-knex](../databases/knexjs.md)
- **Microsoft SQL Server** - [feathers-sequelize](../databases/sequelize.md)
- **Waterline** - [feathers-waterline](../databases/waterline.md)

## Feathers client

[Feathers client](https://github.com/feathersjs/feathers-client) is now universal! Meaning it can be used in the browser, NodeJS, and in React Native. However, it can still be used almost the same way but it is now a module that consolidates all the individual [client side modules of Feathers 2](../clients/feathers.md).

The main API difference is that [REST clients](../clients/rest.md) changed from an initialization like:

```js
var app = feathers('http://baseUrl');

app.configure(feathers.jquery());
app.configure(feathers.request(request));
app.configure(feathers.superagent(superagent));
app.configure(feathers.fetch(fetch));
```

To:

```js
var app = feathers();
var rest = feathers.rest('http://api.my-feathers-app.com');

// jQuery now always needs to be passed
app.configure(rest.jquery(window.jQuery));

app.configure(rest.request(request));
app.configure(rest.superagent(superagent));
app.configure(rest.fetch(fetch));
```

This will configure a default service provider which will use one of those HTTP client libraries to connect to a remote service.

```js
// will use the service at http://api.my-feathers-app.com/todos
var todoService = app.service('todos');

todoService.find().then(function(todos) {
  console.log('Found todos', todos);
});
```

Because a client `app` is now the same as a normal Feathers application it is possible to use Feathers functionality like [hooks](../hooks/readme.md) (`app.configure(feathers.hooks())`), [custom services](../services/readme.md) and [client side authentication](../authentication/readme.md) on the client.

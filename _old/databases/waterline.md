# Waterline

[feathers-waterline](https://github.com/feathersjs/feathers-waterline) is a database adapter for the [Waterline ORM](https://github.com/balderdashy/waterline), the ORM used by [SailsJS](http://sailsjs.org/). For detailed Waterline documentation, see the [waterline-docs repository](https://github.com/balderdashy/waterline-docs). Currently Waterline supports the following data stores:

- [PostgreSQL](https://github.com/balderdashy/sails-postgresql) - *0.9+ compatible*
- [MySQL](https://github.com/balderdashy/sails-mysql) - *0.9+ compatible*
- [MongoDB](https://github.com/balderdashy/sails-mongo) - *0.9+ compatible*
- [Memory](https://github.com/balderdashy/sails-memory) - *0.9+ compatible*
- [Disk](https://github.com/balderdashy/sails-disk) - *0.9+ compatible*
- [Microsoft SQL Server](https://github.com/cnect/sails-sqlserver)
- [Redis](https://github.com/balderdashy/sails-redis)
- [Riak](https://github.com/balderdashy/sails-riak)
- [IRC](https://github.com/balderdashy/sails-irc)
- [Twitter](https://github.com/balderdashy/sails-twitter)
- [JSDom](https://github.com/mikermcneil/sails-jsdom)
- [Neo4j](https://github.com/natgeo/sails-neo4j)
- [OrientDB](https://github.com/appscot/sails-orientdb)
- [ArangoDB](https://github.com/rosmo/sails-arangodb)
- [Apache Cassandra](https://github.com/dtoubelis/sails-cassandra)
- [GraphQL](https://github.com/wistityhq/waterline-graphql)
- [Solr](https://github.com/sajov/sails-solr)

## Installation

```bash
npm install --save sails-postgresql waterline feathers-waterline
```

> **ProTip:** You also need to install the waterline database adapter for the DB you want to use.

## Getting Started

`feathers-waterline` hooks a Waterline Model up to a configured data store as a feathers service.

```js
const Message = require('./models/message');
const config = require('./config/waterline');
const Waterline = require('waterline');
const service = require('feathers-waterline');

const ORM = new Waterline();

ORM.loadCollection(Message);
ORM.initialize(config, function(error, data) {
    app.use('/messages', waterlineService({
      Model: data.collections.message
    }));
});
```

## Options

Creating a new Waterline service currently offers the following options:

- `Model` (**required**) - The Waterline model definition
- `id` (default: `id`) [optional] - The name of the id property
- `paginate` [optional] - A pagination object containing a `default` and `max` page size (see the [Pagination chapter](pagination.md))

## Complete Example

Here is an example of a Feathers server with a `messages` Waterline Model using the [Disk](https://github.com/balderdashy/sails-disk) store:

```
$ npm install feathers feathers-rest feathers-socketio body-parser waterline sails-disk feathers-waterline
```

```js
const feathers = require('feathers');
const rest = require('feathers-rest');
const socketio = require('feathers-socketio');
const bodyParser = require('body-parser');
const Waterline = require('waterline');
const diskAdapter = require('sails-disk');
const service = require('feathers-waterline');

const ORM = new Waterline();
const config = {
  adapters: {
    'default': diskAdapter,
    disk: diskAdapter
  },
  connections: {
    myLocalDisk: {
      adapter: 'disk'
    }
  },
  defaults: {
    migrate: 'alter'
  }
};
const Message = Waterline.Collection.extend({
  identity: 'message',
  schema: true,
  connection: 'myLocalDisk',
  attributes: {
    text: {
      type: 'string',
      required: true
    },

    complete: {
      type: 'boolean'
    }
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

ORM.loadCollection(Message);
ORM.initialize(config, (error, data) => {
  if (error) {
    console.error(error);
  }

  // Create a Waterline Feathers service with a default page size of 2 items
  // and a maximum size of 4
  app.use('/messages', service({
    Model: data.collections.message,
    paginate: {
      default: 2,
      max: 4
    }
  }));

  app.use(function(error, req, res, next){
    res.json(error);
  });

  // Create a dummy Message
  app.service('messages').create({
    text: 'Server message',
    complete: false
  }).then(function(message) {
    console.log('Created message', message.toJSON());
  });

  // Start the server
  const server = app.listen(3030);
  server.on('listening', function() {
    console.log('Feathers Message waterline service running on 127.0.0.1:3030');
    resolve(server);
  });
});
```

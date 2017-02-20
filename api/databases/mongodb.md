# MongoDB

[![GitHub stars](https://img.shields.io/github/stars/feathersjs/feathers-mongodb.png?style=social&label=Star)](https://github.com/feathersjs/feathers-mongodb/)
[![npm version](https://img.shields.io/npm/v/feathers-mongodb.png?style=flat-square)](https://www.npmjs.com/package/feathers-mongodb)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.png?style=flat-square)](https://github.com/feathersjs/feathers-mongodb/blob/master/CHANGELOG.md)

[feathers-mongodb](https://github.com/feathersjs/feathers-mongodb) is a database adapter for [MongoDB](https://www.mongodb.org/). It uses the [official NodeJS driver for MongoDB](https://www.npmjs.com/package/mongodb).

```bash
$ npm install --save mongodb feathers-mongodb
```

> **Important:** To use this adapter you also want to be familiar with the [database adapter common API](./common.md) and [querying mechanism](./querying.md).

> This adapter also requires a [running MongoDB](https://docs.mongodb.com/getting-started/shell/#) database server.


## API

### `service(options)`

Returns a new service instance initialized with the given options. `Model` has to be a MongoDB collection.

```js
const MongoClient = require('mongodb').MongoClient;
const service = require('feathers-mongodb');

MongoClient.connect('mongodb://localhost:27017/feathers').then(db => {
  app.use('/messages', service({
    Model: db.collection('messages')
  }));
  app.use('/messages', service({ Model, id, events, paginate }));
});
```

__Options:__

- `Model` (**required**) - The MongoDB collection instance
- `id` (*optional*, default: `'_id'`) - The name of the id field property. By design, MongoDB will always add an `_id` property.
- `events` (*optional*) - A list of [custom service events](../real-time/events.md#custom-events) sent by this service
- `paginate` (*optional*) - A [pagination object](./pagination.md) containing a `default` and `max` page size


## Example

Here is an example of a Feathers server with a `messages` endpoint that writes to the `feathers` database and the `messages` collection.

```
$ npm install feathers feathers-errors feathers-rest feathers-socketio feathers-mongodb mongodb body-parser
```

In `app.js`:

```js
const feathers = require('feathers');
const errorHandler = require('feathers-errors/handler');
const rest = require('feathers-rest');
const socketio = require('feathers-socketio');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const service = require('feathers-mongodb');

// Create a feathers instance.
const app = feathers()
  // Enable Socket.io
  .configure(socketio())
  // Enable REST services
  .configure(rest())
  // Turn on JSON parser for REST services
  .use(bodyParser.json())
  // Turn on URL-encoded parser for REST services
  .use(bodyParser.urlencoded({extended: true}));

// Connect to your MongoDB instance(s)
MongoClient.connect('mongodb://localhost:27017/feathers').then(function(db){
  // Connect to the db, create and register a Feathers service.
  app.use('/messages', service({
    Model: db.collection('messages'),
    paginate: {
      default: 2,
      max: 4
    }
  }));

  // A basic error handler, just like Express
  app.use(errorHandler());

  // Create a dummy Message
  app.service('messages').create({
    text: 'Message created on server'
  }).then(message => console.log('Created message', message));

  // Start the server.
  const port = 3030;

  app.listen(port, () => {
    console.log(`Feathers server listening on port ${port}`);
  });
}).catch(error => console.error(error));
```

Run the example with `node app` and go to [localhost:3030/messages](http://localhost:3030/messages).


## Querying

Additionally to the [common querying mechanism](./querying.md) this adapter also supports [MongoDB's query syntax](https://docs.mongodb.com/v3.2/tutorial/query-documents/) and the `update` method also supports MongoDB [update operators](https://docs.mongodb.com/v3.2/reference/operator/update/).

## Collation Support

This adapter includes support for [collation and case insensitive indexes available in MongoDB v3.4](https://docs.mongodb.com/manual/release-notes/3.4/#collation-and-case-insensitive-indexes). Collation parameters may be passed using the special `collation` parameter to the `find()`, `remove()` and `patch()` methods.

### Example: Patch records with case-insensitive alphabetical ordering.
The example below would patch all student records with grades of `'c'` or `'C'` and above (a natural language ordering). Without collations this would not be as simple, since the comparison `{ $gt: 'c' }` would not include uppercase grades of `'C'` because the code point of `'C'` is less than that of `'c'`.

```js
const patch = { shouldStudyMore: true };
const query = { grade: { $gte: 'c' } };
const collation = { locale: 'en', strength: 1 };
students.patch(null, patch, { query, collation }).then( ... );
```

### Example: Find records with a case-insensitive search.

Similar to the above example, this would find students with a grade of `'c'` or greater, in a case-insensitive manner.

```js
const query = { grade: { $gte: 'c' } };
const collation = { locale: 'en', strength: 1 };
students.find({ query, collation }).then( ... );
```

For more information on MongoDB's collation feature, visit the [collation reference page](https://docs.mongodb.com/manual/reference/collation/).

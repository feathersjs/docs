# LevelUP

[feathers-levelup](https://github.com/feathersjs/feathers-levelup) is a database adapter for the fast and simple [LevelDB](https://github.com/google/leveldb), though many other backing stores are supported by supplying options to your [LevelUP](https://github.com/Level/levelup) instances.

LevelUP backing store &rarr; LevelUP instance &rarr; Feathers service

LevelDB is a key-value database that stores its keys in lexicographical order, allowing for efficient range queries. Because LevelDB can only stream results in the order they are stored, avoid using `$sort` in your `find` calls, as the entire keyspace may be loaded for an in-memory sort. Read further to learn about ordering your LevelDB keys and designing your application around efficient range queries.

LevelUP currently supports the following backing stores:

- LevelDB
- Amazon DynamoDB
- AsyncStorage
- Basho's LevelDB Fork
- Google Sheets
- localStorage
- In-memory LRU Cache
- IndexedDB
- JSON Files
- Knex (sqlite3, postgres, mysql, websql)
- Medea
- Memory
- MongoDB
- MySQL
- Redis
- Riak
- RocksDB
- Windows Azure Table Storage

## Installation

```bash
npm install levelup leveldown feathers-levelup --save
```

## Getting Started

Creating a LevelUP service:

```js
const levelup = require('levelup');
const levelupService = require('feathers-levelup');

// this will create a database on disk under ./todos
const db = levelup('./todos', { valueEncoding: 'json' });

app.use('/todos', levelupService({ db: db }));
```

See the [LevelUP Guide](https://github.com/Level/levelup) for more information on configuring your database, including selecting a backing store.

## Key Order

By default, LevelDB stores records on disk [sorted by key](http://leveldb.org/). Storing sorted keys is one of the distinguishing features of LevelDB, and the LevelUP interface is designed around it.

When records are created, a key is generated based on a the value of `options.sortField`, plus a uuid. By default, `_createdAt` is automatically set on each record and its value is prepended to the key (id).

Change the `sortField` option to the field of your choice to configure your database's key ordering:

```js
app.use('todos', service({
  db: db,
  sortField: '_createdAt', // this field value will be prepended to the db key
  paginate: {
    default: 2,
    max: 4
  }
}));

const todos = app.service('todos');

todos
  .create({task: 'Buy groceries'})
  .then(console.log);
```

```js
{ task: 'Buy groceries',
  _createdAt: 1457923734510,
  id: '1457923734510:0:d06afc7e-f4cf-4381-a9f9-9013a6955562' }
```

## Range Queries

Avoid memory-hungry `_find` calls that load the entire key set for processing by not specifying `$sort`, or by setting it to the same field as `options.sortField`. This way `_find` can take advantage of the natural sort order of the keys in the database to traverse the fewest rows.

Use `$gt`, `$gte`, `$lt`, `$lte` and `$limit` to perform fast range queries over your data.

```js
app.use('todos', service({
  db: db,
  sortField: '_createdAt' // db keys are sorted by this field value
  paginate: {
    default: 2,
    max: 4
  }
}));

const todos = app.service('todos');

todos
  .find({
    query: {
      _createdAt: {
        $gt: '1457923734510'    // keys starting with this _createdAt
      },
      $limit: 10,               // load the first ten
      $sort: {
        _createdAt: 1           // sort by options.sortField (or don't pass $sort at all)
      }
    }
  })
```


## Complete Example

Here's a complete example of a Feathers server with a `message` levelup service.

```js
const service = require('./lib');
const levelup = require('levelup');
const feathers = require('feathers');
const rest = require('feathers-rest');
const bodyParser = require('body-parser');
const socketio = require('feathers-socketio');

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

// Connect to the db, create and register a Feathers service.
app.use('messages', service({
  db: levelup('./messages', { valueEncoding: 'json' }),
  paginate: {
    default: 2,
    max: 4
  }
}));

app.listen(3030);
console.log('Feathers Message levelup service running on 127.0.0.1:3030');
```


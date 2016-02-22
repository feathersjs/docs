# NeDB

[feathers-nedb](https://github.com/feathersjs/feathers-nedb) is a database adapter for [NeDB](https://github.com/louischatriot/nedb), an embedded datastore with a [MongoDB](https://www.mongodb.org/) like API. By default NeDB persists data locally to a file. This is very useful if you do not want to run a separate database server. To use the adapter we have to install both, `feathers-nedb` and the `nedb` package itself:

```bash
$ npm install --save nedb feathers-nedb
```

## Getting Started

The following example creates a NeDB `messages` service. It will create a `messages.db` datastore file in the `db-data` directory and automatically load it. If you delete that file, the data will be deleted. For a list of all the available options when creating an NeDB instance check out the [NeDB documentation](https://github.com/louischatriot/nedb#creatingloading-a-database).

```js
const NeDB = require('nedb');
const service = require('feathers-nedb');

// Create a NeDB instance
const db = new NeDB({
  filename: './data/messages.db',
  autoload: true
});

app.use('/messages', service({
  // Use it as the service `Model`
  Model: db,
  // Enable pagination
  paginate: {
    default: 2,
    max: 4
  }
}));
```

## Options

The following options can be passed when creating a new NeDB service:

- `Model` (**required**) - The NeDB database instance
- `paginate` [optional] - A pagination object containing a `default` and `max` page size (see the [Pagination chapter](databases/pagination.md))

## Complete Example

To run the complete NeDB example we need to install

```
$ npm install feathers feathers-rest feathers-socketio feathers-nedb nedb body-parser
```

Then add the following into `app.js`:

```js
const NeDB = require('nedb');
const feathers = require('feathers');
const rest = require('feathers-rest');
const socketio = require('feathers-socketio');
const bodyParser = require('body-parser');
const service = require('feathers-nedb');

const db = new NeDB({
  filename: './db-data/messages',
  autoload: true
});

// Create a feathers instance.
var app = feathers()
  // Enable REST services
  .configure(rest())
  // Enable Socket.io services
  .configure(socketio())
  // Turn on JSON parser for REST services
  .use(bodyParser.json())
  // Turn on URL-encoded parser for REST services
  .use(bodyParser.urlencoded({extended: true}));

// Connect to the db, create and register a Feathers service.
app.use('/messages', service({
  Model: db,
  paginate: {
    default: 2,
    max: 4
  }
}));

// Create a dummy Message
app.service('messages').create({
  text: 'Oh hai!',
  complete: false
}).then(function(message) {
  console.log('Created message', message);
});

// Start the server.
const port = 3030;

app.listen(port, function() {
  console.log(`Feathers server listening on port ${port}`);
});
```

You can run this example [from the GitHub repository](https://github.com/feathersjs/feathers-nedb/blob/master/examples/app.js) with `npm start` and going to [localhost:3030/messages](http://localhost:3030/messages). You should see an empty array. That's because you don't have any messages yet but you now have full CRUD for your new messages service.

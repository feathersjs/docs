# RethinkDB

[feathers-rethinkdb](https://github.com/feathersjs/feathers-rethinkdb) is a database adapter for [RethinkDB](https://rethinkdb.com), the open-source database for the real-time web.  To use the adapter we have to install both, `feathers-rethinkdb` and the `rethinkdbdash` package:

```bash
$ npm install --save rethinkdbdash feathers-rethinkdb
```

## Getting Started

The following example creates a RethinkDB `messages` service. After connecting to the database server, it creates a database named `feathers` and a table named `messages`.  For a list of all the available options for connecting to a RethinkDB server, check out the [rethinkdbdash documentation](https://github.com/neumino/rethinkdbdash#importing-the-driver).

```js
const r = require('rethinkdbdash')({
  db: 'feathers'
});
const service = require('feathers-rethinkdb');

app.use('/messages', service({
  Model: r,
  name: 'messages',
  // Enable pagination
  paginate: {
    default: 2,
    max: 4
  }
}));
```

## Options

The following options can be passed when creating a new RethinkDB service:

- `Model` (**required**) - The `rethinkdbdash` instance, already initialized with a configuration object. [see options here](https://github.com/neumino/rethinkdbdash#importing-the-driver)
- `name` (**required**) - The name of the database table.
- `paginate` [optional] - A pagination object containing a `default` and `max` page size (see the [Pagination chapter](databases/pagination.md))

## Complete Example

To run the complete RethinkDB example we need to install

```
$ npm install feathers feathers-rest feathers-socketio feathers-rethinkdb rethinkdbdash body-parser
```

We also need access to a RethinkDB server.  You can install a local server on your local development machine by downloading one of the packages [from the RethinkDB website](https://rethinkdb.com/docs/install/).  It might also be helpful to review their docs on [starting a RethinkDB server](http://rethinkdb.com/docs/start-a-server/).

Then add the following into `app.js`:

```js
const rethink = require('rethinkdbdash');
const feathers = require('feathers');
const rest = require('feathers-rest');
const socketio = require('feathers-socketio');
const bodyParser = require('body-parser');
const service = require('../lib');

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
  .use(bodyParser.urlencoded({extended: true}));

// Create your database if it doesn't exist.
r.dbList().contains('feathers')
  .do(dbExists => r.branch(dbExists, {created: 0}, r.dbCreate('feathers'))).run()
  // Create the table if it doesn't exist.
  .then(() => r.db('feathers').tableList().contains('messages')
    .do(tableExists => r.branch( tableExists, {created: 0}, r.dbCreate('messages'))).run())
  // Create and register a Feathers service.
  .then(() => {
    app.use('messages', service({
      Model: r,
      name: 'messages',
      paginate: {
        default: 10,
        max: 50
      }
    }));

    // Create a dummy Message
    app.service('messages').create({
      text: 'Oh hai!',
      complete: false
    }).then(message => console.log('Created message', message));
  })
  .catch(err => console.log(err));

const port = 3030;
app.listen(port, function() {
  console.log(`Feathers server listening on port ${port}`);
});
```

You can run this example [from the GitHub repository](https://github.com/feathersjs/feathers-rethinkdb/blob/master/example/app.js) with `npm start` and going to [localhost:3030/messages](http://localhost:3030/messages). You should see an empty array. That's because you don't have any messages yet but you now have full CRUD for your new messages service.

# NeDB

[feathers-nedb](https://github.com/feathersjs/feathers-nedb) is a database adapter for [NeDB](https://github.com/louischatriot/nedb), an embedded datastore with a [MongoDB](https://www.mongodb.org/) like API. By default NeDB persists data locally to a file. This is very useful if you do not want to run a separate database server. To use the adapter we have to install both, `feahters-nedb` and the `nedb` package itself:

```bash
npm install nedb feathers-nedb --save
```

## Getting Started

The following example creates an NeDB `todos` service. It will create a `todos.db` datastore file in the `db-data` directory and automatically load it. If you delete that file, the data will be deleted. For the complete available options when creating an NeDB instance please follow up in the [NeDB documentation](https://github.com/louischatriot/nedb#creatingloading-a-database).

```js
import NeDB from 'nedb';
import service from 'feathers-nedb';

// Create a NeDB instance
const db = new NeDB({
  filename: './data/todos.db',
  autoload: true
});

app.use('/todos', service({
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

The following options can be passed when creating a new memory service:

- `Model` - The NeDB database instance
- `paginate` - A pagination object containing a `default` and `max` page size (see the [Pagination chapter](databases/pagination.md))

## Complete Example

```js
import NeDB from 'nedb';
import feathers from 'feathers';
import bodyParser from 'body-parser';
import service from '../lib';

const db = new NeDB({
  filename: './db-data/todos',
  autoload: true
});

// Create a feathers instance.
var app = feathers()
  // Enable REST services
  .configure(rest())
  // Turn on JSON parser for REST services
  .use(bodyParser.json())
  // Turn on URL-encoded parser for REST services
  .use(bodyParser.urlencoded({extended: true}));

// Connect to the db, create and register a Feathers service.
app.use('todos', service({
  Model: db,
  paginate: {
    default: 2,
    max: 4
  }
}));

// Start the server.
var port = 3030;
app.listen(port, function() {
  console.log(`Feathers server listening on port ${port}`);
});
```

You can run this example [from the GitHub repository](https://github.com/feathersjs/feathers-nedb/blob/master/example/app.js) with `npm run example` and going to [localhost:3030/todos](http://localhost:3030/todos). You should see an empty array. That's because you don't have any Todos yet but you now have full CRUD for your new todos service.

# Sequelize

[feathers-sequelize](https://github.com/feathersjs/feathers-sequelize) is a database adapter for [Sequelize](http://sequelizejs.com), and ORM for Node.js. It supports the dialects PostgreSQL, MySQL, MariaDB, SQLite and MSSQL and features solid transaction support, relations, read replication and more.

```bash
npm install feathers-sequelize
```

## Getting Started

`feathers-sequelize` hooks a [Sequelize Model](http://docs.sequelizejs.com/en/latest/docs/models-definition/) up as a service. For more information about models and general Sequelize usage, follow up in the [Sequelize documentation](http://docs.sequelizejs.com/en/latest/).

```js
const Model = require('./models/mymodel');
const sequelize = require('feathers-sequelize');

app.use('/todos', sequelize({ Model }));
```

## Options

Creating a new Sequelize service currently offers the following options:

- `Model` (**required**) - The Sequelize model definition
- `id` (default: `id`) [optional] - The name of the id property
- `paginate` - A pagination object containing a `default` and `max` page size (see the [Pagination chapter](databases/pagination.md))

### Complete Example

Here is an example of a Feathers server with a `todos` SQLite Sequelize Model:

```
$ npm install feathers feathers-rest body-parser sequelize feathers-sequelize sqlite3
```

```js
// app.js
const path = require('path');
const feathers = require('feathers');
const rest = require('feathers-rest');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const service = require('feathers-sequelize');

const sequelize = new Sequelize('sequelize', '', '', {
  dialect: 'sqlite',
  storage: path.join(__dirname, 'db.sqlite'),
  logging: false
});
const Todo = sequelize.define('todo', {
  text: {
    type: Sequelize.STRING,
    allowNull: false
  },
  complete: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
}, {
  freezeTableName: true
});

// Create a feathers instance.
const app = feathers()
  // Enable REST services
  .configure(rest())
  // Turn on JSON parser for REST services
  .use(bodyParser.json())
  // Turn on URL-encoded parser for REST services
  .use(bodyParser.urlencoded({ extended: true }));

// Removes all database content
Todo.sync({ force: true });

// Create an in-memory Feathers service with a default page size of 2 items
// and a maximum size of 4
app.use('/todos', service({
  Model: Todo,
  paginate: {
    default: 2,
    max: 4
  }
}));

// This clears the database
Todo.sync({ force: true }).then(() => {
  // Create a dummy Todo
  app.service('todos').create({
    text: 'Server todo',
    complete: false
  }).then(function(todo) {
    console.log('Created todo', todo.toJSON());
  });
});

// Start the server
const port = 3030;

app.listen(port, function() {
  console.log(`Feathers server listening on port ${port}`);
});
```

Now there is an SQLite todos API running at `http://localhost:3030/todos`, including validation according to the model definition.

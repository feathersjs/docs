# Sequelize

[feathers-sequelize](https://github.com/feathersjs/feathers-sequelize) is a database adapter for [Sequelize](http://sequelizejs.com), and ORM for Node.js. It supports the dialects PostgreSQL, MySQL, MariaDB, SQLite and MSSQL and features solid transaction support, relations, read replication and more.

```bash
npm install feathers-sequelize --save
```

## Getting Started

`feathers-sequelize` hooks a [Sequelize Model](http://docs.sequelizejs.com/en/latest/docs/models-definition/) up as a service. For more information about models and general Sequelize usage, follow up in the [Sequelize documentation](http://docs.sequelizejs.com/en/latest/).

```js
var SequelizeModel = require('./models/mymodel');
var sequelize = require('feathers-sequelize');

app.use('/todos', sequelize({
  Model: SequelizeModel
}));
```

## Options

Creating a new Sequelize service currently offers the following options:

- `Model` (**required**) - The Sequelize model definition
- `id` (default: `id`) [optional] - The name of the id property
- `paginate` - A pagination object containing a `default` and `max` page size (see the [Pagination chapter](databases/pagination.md))

### Complete Example

Here is an example of a Feathers server with a `todos` SQLite Sequelize Model:

```js
import path from 'path';
import feathers from 'feathers';
import rest from 'feathers-rest';
import bodyParser from 'body-parser';
import Sequelize from 'sequelize';
import service from 'feathers-sequelize';

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

// Start the server
app.listen(3030);

console.log('Feathers Todo Sequelize service running on 127.0.0.1:3030');
```

Now there is an SQLite todos API running at `http://localhost:3030/todos`, including validation according to the model definition.

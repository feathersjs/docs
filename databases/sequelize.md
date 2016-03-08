# Sequelize

[feathers-sequelize](https://github.com/feathersjs/feathers-sequelize) is a database adapter for [Sequelize](http://sequelizejs.com), and ORM for Node.js. It supports the PostgreSQL, MySQL, MariaDB, SQLite and MSSQL dialects and features solid transaction support, relations, read replication and more.

```bash
npm install --save feathers-sequelize
```

And one of the following:
```bash
npm install --save pg pg-hstore
npm install --save mysql // For both mysql and mariadb dialects
npm install --save sqlite3
npm install --save tedious // MSSQL
```

> **ProTip:** If you are using the Feathers generator this has already been done for you. For a full list of available drivers, check out [Sequelize documentation](http://docs.sequelizejs.com/en/latest/docs/getting-started/).

## Getting Started

`feathers-sequelize` hooks a [Sequelize Model](http://docs.sequelizejs.com/en/latest/docs/models-definition/) up as a service. For more information about models and general Sequelize usage, follow up in the [Sequelize documentation](http://docs.sequelizejs.com/en/latest/).

```js
const Model = require('./models/mymodel');
const sequelize = require('feathers-sequelize');

app.use('/messages', sequelize({ Model }));
```

## Options

Creating a new Sequelize service currently offers the following options:

- `Model` (**required**) - The Sequelize model definition
- `id` (default: `id`) [optional] - The name of the id property
- `paginate` [optional] - A pagination object containing a `default` and `max` page size (see the [Pagination chapter](databases/pagination.md))

### Complete Example

Here is an example of a Feathers server with a `messages` SQLite Sequelize Model:

```
$ npm install feathers feathers-rest feathers-socketio body-parser sequelize feathers-sequelize sqlite3
```

```js
// app.js
const path = require('path');
const feathers = require('feathers');
const rest = require('feathers-rest');
const socketio = require('feathers-socketio');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const service = require('feathers-sequelize');

const sequelize = new Sequelize('sequelize', '', '', {
  dialect: 'sqlite',
  storage: path.join(__dirname, 'db.sqlite'),
  logging: false
});
const Message = sequelize.define('message', {
  text: {
    type: Sequelize.STRING,
    allowNull: false
  },
  read: {
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
  // Enable Socket.io services
  .configure(socketio())
  // Turn on JSON parser for REST services
  .use(bodyParser.json())
  // Turn on URL-encoded parser for REST services
  .use(bodyParser.urlencoded({ extended: true }));

// Removes all database content
Message.sync({ force: true });

// Create an in-memory Feathers service with a default page size of 2 items
// and a maximum size of 4
app.use('/messages', service({
  Model: Message,
  paginate: {
    default: 2,
    max: 4
  }
}));

// This clears the database
Message.sync({ force: true }).then(() => {
  // Create a dummy Message
  app.service('messages').create({
    text: 'Server message',
    read: false
  }).then(function(message) {
    console.log('Created message', message.toJSON());
  });
});

// Start the server
const port = 3030;

app.listen(port, function() {
  console.log(`Feathers server listening on port ${port}`);
});
```

Now there is an SQLite messages API running at `http://localhost:3030/messages`, including validation according to the model definition.

## Validation

Sequelize by default gives you the ability to [add validations at the model level](http://docs.sequelizejs.com/en/latest/docs/models-definition/#validations). Using an error handler like the one that comes with [comes with Feathers](https://github.com/feathersjs/feathers-errors/blob/master/src/error-handler.js) your validation errors will be formatted nicely right out of the box!

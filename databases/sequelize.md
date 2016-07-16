# Sequelize

[feathers-sequelize](https://github.com/feathersjs/feathers-sequelize) is a database adapter for [Sequelize](http://sequelizejs.com), an ORM for Node.js. It supports the PostgreSQL, MySQL, MariaDB, SQLite and MSSQL dialects and features solid transaction support, relations, read replication and more.

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

> **ProTip:** If you are using the Feathers CLI generator this has already been done for you. For a full list of available drivers, check out [Sequelize documentation](http://docs.sequelizejs.com/en/latest/docs/getting-started/).

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

Sequelize by default gives you the ability to [add validations at the model level](http://docs.sequelizejs.com/en/latest/docs/models-definition/#validations). Using an error handler like the one that [comes with Feathers](https://github.com/feathersjs/feathers-errors/blob/master/src/error-handler.js) your validation errors will be formatted nicely right out of the box!

## Migrations

Migrations with feathers and sequelize are quite simple and we have provided some [sample code](https://github.com/feathersjs/feathers-demos/blob/master/examples/migrations/sequelize) to get you started. This guide will follow the directory structure used by the sample code, but you are free to rearrange things as you see fit. The following assumes you have a `migrations` folder in the root of your app.

### Initial Setup: one-time tasks

1. Install the [sequelize CLI](https://github.com/sequelize/cli):

	```
	npm install sequelize-cli --save
	```
1. Create a `.sequelizerc` file in your project root with the following content:

	```js
	const path = require('path');
	
	module.exports = {
	  'config': path.resolve('migrations/config/config.js'),
	  'migrations-path': path.resolve('migrations'),
	  'seeders-path': path.resolve('migrations/seeders'),
	  'models-path': path.resolve('migrations/models')
	};
	```
1. Create the migrations config in `migrations/config/config.js`:

	```js
	const app = require('../../src/app');
	const env = process.env.NODE_ENV || 'development';
	
	module.exports = {
		[env]: {
			url: app.get('db_url'),
			dialect: app.get('db_dialect'),
			migrationStorageTableName: '_migrations'
		}
	};
	```
1. Register your models. The following assumes you have defined your models using the method [described here](https://github.com/feathersjs/generator-feathers/issues/94#issuecomment-204165134).

	```js
	const Sequelize = require('sequelize');
	const app = require('../../src/app');
	const models = app.get('models');
	const sequelize = app.get('sequelize');
	
	// The export object must be a dictionary of model names -> models
	// It must also include sequelize (instance) and Sequelize (constructor) properties
	module.exports = Object.assign({
		Sequelize,
		sequelize
	}, models);
	```

___
### Migrations workflow

The migration commands will load your application and it is therefore required that you define the same environment variables as when running you application. For example, many applications will define the database connection string in the startup command:

```
DATABASE_URL=postgres://user:pass@host:port/dbname npm start
```
All of the following commands assume that you have defined the same environment variables used by your application.

> **ProTip:** To save typing, you can export environment variables for your current bash/terminal session:

> ```
export DATABASE_URL=postgres://user:pass@host:port/db
```

###Create a new migration

To create a new migration file, run the following command and provide a meaningful name:

```
sequelize migration:create --name="meaningful-name"
```

This will create a new file in the migrations folder. All migration file names will be prefixed with a sortable data/time string: `20160421135254-meaninful-name.js`. This prefix is crucial for making sure your migrations are executed in the proper order.

> **NOTE:** The order of your migrations is determined by the alphabetical order of the migration scripts in the file system. The file names generated by the CLI tools will always ensure that the most recent migration comes last. 

####Add the up/down scripts:

Open the newly created migration file and write the code to both apply and undo the migration. Please refer to the [sequelize migration functions](http://docs.sequelizejs.com/en/latest/docs/migrations/#functions) for available operations. **Do not be lazy - write the down script too and test!** Here is an example of converting a `NOT NULL` column accept null values:

```js
'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.changeColumn('tableName', 'columnName', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.changeColumn('tableName', 'columnName', {
      type: Sequelize.STRING,
      allowNull: false
    });
  }
};
```

> **ProTip:** As of this writing, if you use the `changeColumn` method you must **always** specify the `type`, even if the type is not changing.
 
> **ProTip:** Down scripts are typically easy to create and should be nearly identical to the up script except with inverted logic and inverse method calls.

####Keeping your app code in sync with migrations

The application code should always be up to date with the migrations. This allows the app to be freshly installed with everything up-to-date without running the migration scripts. Your migrations should also never break a freshly installed app. This often times requires that you perform any necessary checks before executing a task. For example, if you update a model to include a new field, your migration should first check to make sure that new field does not exist:

```js
'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.describeTable('tableName').then(attributes => {
      if ( !attributes.columnName ) {
        return queryInterface.addColumn('tableName', 'columnName', {
          type: Sequelize.INTEGER,
          defaultValue: 0
        });
      }
    })
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.describeTable('tableName').then(attributes => {
      if ( attributes.columnName ) {
        return queryInterface.removeColumn('tableName', 'columnName');
      }
    });
  }
};
```

###Apply a migration

The CLI tools will always run your migrations in the correct order and will keep track of which migrations have been applied and which have not. This data is stored in the database under the `_migrations` table. To ensure you are up to date, simply run the following:

```
sequelize db:migrate 
```

> **ProTip:** You can add the migrations script to your application startup command to ensure that all migrations have run every time your app is started. Try updating your package.json `scripts` attribute and run `npm start`:

> ```
sripts: {
    start: "sequelize db:migrate && node src/"
}
```

###Undo the previous migration

To undo the last migration, run the following command:

```
sequelize db:migrate:undo 
```
Continue running the command to undo each migration one at a time - the migrations will be undone in the proper order.

> **Note:** - You shouldn't really have to undo a migration unless you are the one developing a new migration and you want to test that it works. Applications rarely have to revert to a previous state, but when they do you will be glad you took the time to write and test your `down` scripts!

###Reverting your app to a previous state

In the unfortunate case where you must revert your app to a previous state, it is important to take your time and plan your method of attack. Every application is different and there is no one-size-fits-all strategy for rewinding an application. However, most applications should be able to follow these steps (order is important):

1. Stop your application (kill the process)
1. Find the last stable version of your app
1. Count the number of migrations which have been added since that version
1. Undo your migrations one at a time until the db is in the correct state
1. Revert your code back to the previous state 
1. Start your app

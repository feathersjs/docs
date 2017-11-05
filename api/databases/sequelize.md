# Sequelize

[![GitHub stars](https://img.shields.io/github/stars/feathersjs-ecosystem/feathers-sequelize.png?style=social&label=Star)](https://github.com/feathersjs-ecosystem/feathers-sequelize/)
[![npm version](https://img.shields.io/npm/v/feathers-sequelize.png?style=flat-square)](https://www.npmjs.com/package/feathers-sequelize)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.png?style=flat-square)](https://github.com/feathersjs-ecosystem/feathers-sequelize/blob/master/CHANGELOG.md)

[feathers-sequelize](https://github.com/feathersjs-ecosystem/feathers-sequelize) is a database adapter for [Sequelize](http://sequelizejs.com), an ORM for Node.js. It supports PostgreSQL, MySQL, MariaDB, SQLite and MSSQL and features transaction support, relations, read replication and more.

```bash
npm install --save feathers-sequelize
```

And [one of the following](http://docs.sequelizejs.com/en/latest/docs/getting-started/):

```bash
npm install --save pg pg-hstore
npm install --save mysql // For both mysql and mariadb dialects
npm install --save sqlite3
npm install --save tedious // MSSQL
```

> **Important:** To use this adapter you also want to be familiar with the [database adapter common API](./common.md) and [querying mechanism](./querying.md).

> For more information about models and general Sequelize usage, follow up in the [Sequelize documentation](http://docs.sequelizejs.com/en/latest/).

## A quick note about `raw` queries

By default, all `feathers-sequelize` operations will return `raw` data (using `raw: true` when querying the database). This results in faster execution and allows feathers-sequelize to interoperate with feathers-common hooks and other 3rd party integrations. However, this will bypass some of the "goodness" you get when using Sequelize as an ORM: 

 - custom getters/setters will be bypassed
 - model-level validations are bypassed
 - associated data loads a bit differently
 - ...and several other issues that one might not expect
 
Don't worry! The solution is easy. Please read the guides about [working with model instances](#working-with-sequelize-model-instances).


## API

### `service(options)`

Returns a new service instance initialized with the given options.

```js
const Model = require('./models/mymodel');
const service = require('feathers-sequelize');

app.use('/messages', service({ Model }));
app.use('/messages', service({ Model, id, events, paginate }));
```

__Options:__

- `Model` (**required**) - The Sequelize model definition
- `id` (*optional*, default: `'_id'`) - The name of the id field property.
- `raw` (*optional*, default: `true`) - Runs queries faster by returning plain objects instead of Sequelize models.
- `events` (*optional*) - A list of [custom service events](../real-time/events.md#custom-events) sent by this service
- `paginate` (*optional*) - A [pagination object](./pagination.md) containing a `default` and `max` page size

### params.sequelize

When making a [service method](./services.md) call, `params` can contain an `sequelize` property which allows to pass additional Sequelize options. This can e.g. be used to **retrieve associations**. Normally this wil be set in a before [hook](./hooks.md):

```js
app.service('messages').hooks({
  before: {
    find(hook) {
      // Get the Sequelize instance. In the generated application via:
      const sequelize = hook.app.get('sequelizeClient');
      
      hook.params.sequelize = {
        include: [ User ]
      }
    }
  }
});
```

## Example

Here is an example of a Feathers server with a `messages` SQLite Sequelize Model:

```
$ npm install @feathersjs/feathers @feathersjs/errors @feathersjs/express @feathersjs/socketio sequelize feathers-sequelize sqlite3
```

In `app.js`:

```js
const path = require('path');
const feathers = require('@feathersjs/feathers');
const errorHandler = require('@feathersjs/express/errors')
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');

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
  }
}, {
  freezeTableName: true
});

// Create an Express compatible Feathers application instance.
const app = express(feathers());

// Turn on JSON parser for REST services
app.use(express.json());
// Turn on URL-encoded parser for REST services
app.use(express.urlencoded({ extended: true }));
// Enable REST services
app.configure(express.rest());
// Enable Socket.io services
app.configure(socketio());
// Create an in-memory Feathers service with a default page size of 2 items
// and a maximum size of 4
app.use('/messages', service({
  Model: Message,
  paginate: {
    default: 2,
    max: 4
  }
}));
app.use(errorHandler());

Message.sync({ force: true }).then(() => {
  // Create a dummy Message
  app.service('messages').create({
    text: 'Message created on server'
  }).then(message => console.log('Created message', message));
});

// Start the server
const port = 3030;

app.listen(port, () => {
  console.log(`Feathers server listening on port ${port}`);
});
```

Run the example with `node app` and go to [localhost:3030/messages](http://localhost:3030/messages).


## Querying

Additionally to the [common querying mechanism](./querying.md) this adapter also supports all [Sequelize query operators](http://docs.sequelizejs.com/manual/tutorial/querying.html).


## Associations and relations

Follow up in the [Sequelize documentation for associations](http://docs.sequelizejs.com/manual/tutorial/associations.html), [this issue](https://github.com/feathersjs-ecosystem/feathers-sequelize/issues/20) and [this Stackoverflow answer](https://stackoverflow.com/questions/42841810/feathers-js-sequelize-service-with-relations-between-two-models/42846215#42846215).

## Working with Sequelize Model instances

It is highly recommended to use `raw` queries, which is the default. However, there are times when you will want to take advantage of [Sequelize Instance](http://docs.sequelizejs.com/en/latest/api/instance/) methods. There are two ways to tell feathers to return Sequelize instances:

1. Set `{ raw: false }` in a "before" hook:
    ```js
    function rawFalse(hook) {
        if (!hook.params.sequelize) hook.params.sequelize = {};
        Object.assign(hook.params.sequelize, { raw: false });
        return hook;
    }
    hooks.before.find = [rawFalse];
    ```
1. Use the new `hydrate` hook in the "after" phase:

    ```js
    const hydrate = require('feathers-sequelize/hooks/hydrate');
    hooks.after.find = [hydrate()];
    
    // Or, if you need to include associated models, you can do the following:
     function includeAssociated (hook) {
         return hydrate({
            include: [{ model: hook.app.services.fooservice.Model }]
         }).call(this, hook);
     }
     hooks.after.find = [includeAssociated];
     ```

  For a more complete example see this [gist](https://gist.github.com/sicruse/bfaa17008990bab2fd1d76a670c3923f).

> **Important:** When working with Sequelize Instances, most of the feathers-hooks-common will no longer work. If you need to use a common hook or other 3rd party hooks, you should use the "dehydrate" hook to convert data back to a plain object:
> ```js
> const hydrate = require('feathers-sequelize/hooks/hydrate');
> const dehydrate = require('feathers-sequelize/hooks/dehydrate');
> const { populate } = require('feathers-hooks-common');
> 
> hooks.after.find = [hydrate(), doSomethingCustom(), dehydrate(), populate()];
> ```
    
## Validation

Sequelize by default gives you the ability to [add validations at the model level](http://docs.sequelizejs.com/en/latest/docs/models-definition/#validations). Using an error handler like the one that [comes with Feathers](https://github.com/feathersjs/feathers-errors/blob/master/src/error-handler.js) your validation errors will be formatted nicely right out of the box!


## Migrations

Migrations with feathers and sequelize are quite simple. This guide will walk you through creating the recommended file structure, but you are free to rearrange things as you see fit. The following assumes you have a `migrations` folder in the root of your app.

### Initial Setup: one-time tasks

- Install the [sequelize CLI](https://github.com/sequelize/cli):

```
npm install sequelize-cli --save -g
```

- Create a `.sequelizerc` file in your project root with the following content:

```js
const path = require('path');

module.exports = {
  'config': path.resolve('migrations/config/config.js'),
  'migrations-path': path.resolve('migrations'),
  'seeders-path': path.resolve('migrations/seeders'),
  'models-path': path.resolve('migrations/models')
};
```

- Create the migrations config in `migrations/config/config.js`:

```js
const app = require('../../src/app');
const env = process.env.NODE_ENV || 'development';
const dialect = 'mysql'|'sqlite'|'postgres'|'mssql';

module.exports = {
  [env]: {
    dialect,
    url: app.get(dialect),
    migrationStorageTableName: '_migrations'
  }
};
```

- Define your models config in `migrations/models/index.js`:

```js
const Sequelize = require('sequelize');
const app = require('../../src/app');
const sequelize = app.get('sequelizeClient');
const models = sequelize.models;

// The export object must be a dictionary of model names -> models
// It must also include sequelize (instance) and Sequelize (constructor) properties
module.exports = Object.assign({
  Sequelize,
  sequelize
}, models);
```

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

### Create a new migration

To create a new migration file, run the following command and provide a meaningful name:

```
sequelize migration:create --name="meaningful-name"
```

This will create a new file in the migrations folder. All migration file names will be prefixed with a sortable data/time string: `20160421135254-meaninful-name.js`. This prefix is crucial for making sure your migrations are executed in the proper order.

> **NOTE:** The order of your migrations is determined by the alphabetical order of the migration scripts in the file system. The file names generated by the CLI tools will always ensure that the most recent migration comes last. 

#### Add the up/down scripts:

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

#### Keeping your app code in sync with migrations

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

### Apply a migration

The CLI tools will always run your migrations in the correct order and will keep track of which migrations have been applied and which have not. This data is stored in the database under the `_migrations` table. To ensure you are up to date, simply run the following:

```
sequelize db:migrate 
```

> **ProTip:** You can add the migrations script to your application startup command to ensure that all migrations have run every time your app is started. Try updating your package.json `scripts` attribute and run `npm start`:

> ```
scripts: {
    start: "sequelize db:migrate && node src/"
}
```

### Undo the previous migration

To undo the last migration, run the following command:

```
sequelize db:migrate:undo 
```
Continue running the command to undo each migration one at a time - the migrations will be undone in the proper order.

> **Note:** - You shouldn't really have to undo a migration unless you are the one developing a new migration and you want to test that it works. Applications rarely have to revert to a previous state, but when they do you will be glad you took the time to write and test your `down` scripts!

### Reverting your app to a previous state

In the unfortunate case where you must revert your app to a previous state, it is important to take your time and plan your method of attack. Every application is different and there is no one-size-fits-all strategy for rewinding an application. However, most applications should be able to follow these steps (order is important):

1. Stop your application (kill the process)
1. Find the last stable version of your app
1. Count the number of migrations which have been added since that version
1. Undo your migrations one at a time until the db is in the correct state
1. Revert your code back to the previous state 
1. Start your app

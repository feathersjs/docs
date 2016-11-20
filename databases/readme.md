# Databases

Feathers database adapters are [services](../services/readme.md) that write to a database. Instead of coming up with our own ORM and validation system our official database adapters simply wrap many of the great ORM/ODM solutions that already exist.

Every official database adapter supports [common functionality](common.md) for initialization, [pagination and sorting](pagination.md) and [advanced querying](querying.md) out of the box and can be [extended](extending.md) with custom functionality. Errors from the adapters (like ORM validation errors) will be passed seamlessly to clients.

This allows you to swap databases whenever the need arises **without having to change any of your querying code or validation hooks** and you can even use multiple databases within the same app.

> **Important:** If your database of choice is not officially supported you can still implement it as [your own service](../service/readme.md) and get hooks and real-time updates for that database. Also, have a look at the [Ecosystem](../ecosystem/readme.md) section to see if there isn't a community supported adapter for the database already.

The following databases are supported:

- **Memory** - [feathers-memory](memory.md)
- **MongoDB**
  - [feathers-mongoose](mongoose.md)
  - [feathers-mongodb](mongodb.md)
- **NeDB** - [feathers-nedb](nedb.md)
- **RethinkDB** - [feathers-rethinkdb](rethinkdb.md)
- **PostgreSQL, MySQL, MariaDB, and SQLite**
  - [feathers-knex](knexjs.md)
  - [feathers-sequelize](sequelize.md)
- **Oracle** - [feathers-knex](knexjs.md)
- **Microsoft SQL Server** - [feathers-sequelize](sequelize.md)
- **AsyncStorage** - [feathers-localstorage](localstorage.md)
- **localStorage** - [feathers-localstorage](localstorage.md)

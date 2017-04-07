# Databases

The [service interface](../services/readme.md) makes it easy to implement a wrapper that connects to a database. Which is exactly what we have done with the Feathers database adapters. Using those adapters it is possible to create a database-backed REST and real-time API endpoint, including validation in a few minutes!

Instead of coming up with our own ORM and validation system our official database adapters simply wrap many of the great ORM/ODM solutions that already exist. Feathers currently supports [Mongoose](mongoose.md), [Sequelize](sequelize.md), [KnexJS](knexjs.md), [Waterline](waterline.md) and [LevelUP](levelup.md) as well as standalone adapters for [in-memory](memory.md) and [NeDB](nedb.md). This allows you to use the following databases, among many others:

![Feathers supports a lot of databases](/img/services-data-store.jpg)

- **AsyncStorage** - [feathers-localstorage](localstorage.md)
- **localStorage** - [feathers-localstorage](localstorage.md)
- **Elasticsearch** - [feathers-elasticsearch](elasticsearch.md)
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
- **Waterline** - [feathers-waterline](waterline.md) adds support for the following data stores (among others):
  - Redis
  - Riak
  - Neo4j
  - OrientDB
  - ArangoDB
  - Apache Cassandra
  - GraphQL
- **LevelUP** - [feathers-levelup](levelup.md) adds support for [many backing stores](https://github.com/Level/levelup/wiki/Modules#storage) including:
  - LevelDB
  - Amazon DynamoDB
  - Windows Azure Table Storage
  - Redis
  - Riak
  - Google Sheets

Every database adapter supports a common syntax for [pagination, sorting and selecting](pagination.md) and [advanced querying](querying.md) out of the box and can be [easily extended](extending.md) with custom functionality. Errors from the adapters (like ORM validation errors) will be passed seamlessly to clients.

This allows you to swap databases whenever the need arises **without having to change any of your querying code or validation hooks** and you can even use multiple databases within the same app!

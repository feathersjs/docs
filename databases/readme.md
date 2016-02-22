# Databases

The [service interface](../services/readme.md) makes it easy to implement a wrapper that connects to a database. Which is exactly what we have done with the Feathers database adapters. Using those adapters it is possible to create a database backed REST and real-time API endpoint, including validation in a few minutes!

Instead of coming up with our own ORM and validation system our official database adapters simply wrap many of the great ORM/ODM solutions that already exist. Feathers currently supports [Mongoose](mongoose.md), [Sequelize](sequelize.md), [KnexJS](knexjs.md) and [Waterline](waterline.md) as well as standalone adapters for [in-memory](memory.md) and [NeDB](nedb.md). This allows you to use the following databases:

- **Memory** - [feathers-memory](memory.md)
- **MongoDB**
  - [feathers-mongoose](mongoose.md)
  - [feathers-mongodb](mongodb.md)
- **NeDB** - [feathers-nedb](nedb.md)
- **PostgreSQL, MySQL, MariaDB, and SQLite**
  - [feathers-knex](knex.md)
  - [feathers-sequelize](sequelize.md)
- **Oracle** - [feathers-knex](knex.md)
- **Microsoft SQL Server** - [feathers-sequelize](sequelize.md)
- **Waterline** - [feathers-waterline](waterline.md) adds support for the following data stores (among others):
  - Redis
  - Riak
  - Neo4j
  - OrientDB
  - ArangoDB
  - Apache Cassandra
  - GraphQL

Every database adapter supports a common way for [pagination, sorting and selecting](pagination.md) and [advanced querying](querying.md) out of the box and can be [easily extended](extending.md) with custom functionality. Errors from the adapters (like ORM validation errors) will be passed seamlessly to clients.

**This allows you to swap databases whenever the need arises without having to change any of your querying code and you can even use multiple databases within the same app!**

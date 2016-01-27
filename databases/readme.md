# Databases

After learning more about [Services](services.md) you probably already guessed that it is easy to implement a service that connects to a database and that is exactly what we have done with the Feathers database adapters. Using those adapters it is possible to create a complete REST and real-time API endpoint, including validation in a few minutes!

Instead of coming up with our own [ORM](https://en.wikipedia.org/wiki/Object-relational_mapping) and validation system our official database adapters simply wrap many of the great ORM/ODM solutions that already exist. Feathers currently supports [Mongoose](mongoose.md), [Sequelize](sequelize.md), [KnexJS](knexjs.md) and [Waterline](waterline.md) as well as standalone adapters for [in-memory](memory.md) and [NeDB](nedb.md). This allows to use the following databases:

- **Memory** - [feathers-memory](memory.md)
- **MongoDB** - [feathers-mongoose](mongoose.md)
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

Every database adapters supports [pagination, sorting and selecting](pagination.md) and [advanced querying](querying.md) out of the box and can be [easily extended](extending.md) with custom functionality. Any error (like validation errors) will also be converted to Feathers errors and passed to the client automatically.

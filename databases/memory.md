# In Memory

[feathers-memory](https://github.com/feathersjs/feathers-memory/) is a service adapters that stores its data in-memory. It can be used for temporary data that doesn't need to be persisted and testing purposes. It also works great with [client-side Feathers](../clients/readme.md) applications.

```bash
$ npm install --save feathers-memory
```

## Getting Started

You can create an in-memory service with no options:

```js
const memory = require('feathers-memory');

app.use('/todos', memory());
```

This will create a `todos` datastore with the default configuration.

## Options

The following options can be passed when creating a new memory service:

- `idField` - The name of the id field property. Default is `id`
- `startId` - An id number to start with that will be incremented for new record (default: `0`)
- `store` - An object with id to item assignments to pre-initialize the data store
- `paginate` - A pagination object containing a `default` and `max` page size (see the [Pagination chapter](databases/pagination.md))

## Complete Example

Here is an example of a Feathers server with a `todos` in-memory service that supports pagination:

```
$ npm install feathers body-parser feathers-rest feathers-memory
```

```js
// app.js
const feathers = require('feathers');
const bodyParser = require('body-parser');
const rest = require('feathers-rest');
const memory = require('feathers-memory');

// Create a feathers instance.
const app = feathers()
  // Enable REST services
  .configure(rest())
  // Turn on JSON parser for REST services
  .use(bodyParser.json())
  // Turn on URL-encoded parser for REST services
  .use(bodyParser.urlencoded({ extended: true }));

// Create an in-memory Feathers service with a default page size of 2 items
// and a maximum size of 4
app.use('/todos', memory({
  paginate: {
    default: 2,
    max: 4
  }
}));

// Create a dummy Todo
app.service('todos').create({
  text: 'Server todo',
  complete: false
}).then(function(todo) {
  console.log('Created todo', todo);
});

// Start the server.
const port = 3030;

app.listen(port, function() {
  console.log(`Feathers server listening on port ${port}`);
});
```

Run the example with `node app.js` and go to [localhost:3030/todos](http://localhost:3030/todos). You will see the test Todo that we created at the end of that file.

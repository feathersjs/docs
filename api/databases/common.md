# Common API

All database adapters implement a common interface for initialization, pagination, extending and querying. This chapter describes the common adapter initialization and options, how to enable and use pagination, the details on how specific service methods behave and how to extend an adapter with custom functionality.

> **Important:** Every database adapter is an implementation of the [Feathers service interface](../services.md). We recommend being familiar with services, service events and hooks before using a database adapter.

## Initialization

### `service([options])`

Returns a new service instance initialized with the given options.

```js
const service = require('feathers-<adaptername>');

app.use('/messages', service());
app.use('/messages', service({ id, events, paginate }));
```

__Options:__

- `id` (*optional*) - The name of the id field property (usually set by default to `id` or `_id`).
- `events` (*optional*) - A list of [custom service events](../events#custom-events) sent by this service
- `paginate` (*optional*) - A [pagination object](#pagination) containing a `default` and `max` page size


## Pagination

When initializing an adapter you can set the following pagination options in the `paginate` object:

- `default` - Sets the default number of items when `$limit` is not set
- `max` - Sets the maximum allowed number of items per page (even if the `$limit` query parameter is set higher)

When `paginate.default` is set, `find` will return an *page object* (instead of the normal array) in the following form:

```
{
  "total": "<total number of records>",
  "limit": "<max number of items per page>",
  "skip": "<number of skipped items (offset)>",
  "data": [/* data */]
}
```

The pagination options can be set as follows:

```js
const service = require('feathers-<db-name>');

// Set the `paginate` option during initialization
app.use('/todos', service({
  paginate: {
    default: 5,
    max: 25
  }
}));

// override pagination in `params.paginate` for this call
app.service('todos').find({
  paginate: {
    default: 100,
    max: 200
  }
});

// disable pagination for this call
app.service('todos').find({
  paginate: false
});
```

> **Note:** Disabling or changing the default pagination is not available in the client. Only `params.query` is passed to the server (also see a [workaround here](https://github.com/feathersjs/feathers/issues/382#issuecomment-238407741))

> **Pro tip:** To just get the number of available records set `$limit` to `0`. This will only run a (fast) counting query against the database.


## Service methods

This section describes specifics on how the [service methods](../services.md) are implemented for all adapters.

#### `adapter.find(params) -> Promise`

Returns a list of all records matching the query in `params.query` using the [common querying mechanism](./querying.md). Will either return an array with the results or a page object if [pagination is enabled](#pagination).

> **Important**: When used via REST URLs all query values are strings. Depending on the database the values in `params.query` might have to be converted to the right type in a [before hook](../hooks.md).

```js
// Find all messages for user with id 1
app.service('messages').find({
  query: {
    userId: 1
  }
}).then(messages => console.log(messages));

// Find all messages belonging to room 1 or 3
app.service('messages').find({
  query: {
    roomId: {
      $in: [ 1, 3 ]
    }
  }
}).then(messages => console.log(messages));
```

Find all messages for user with id 1

```
GET /messages?userId=1
```

Find all messages belonging to room 1 or 3

```
GET /messages?roomId[$in]=1&roomId[$in]=3
```

#### `adapter.get(id, params) -> Promise`

Retrieve a single record by its unique identifier (the field set in the `id` option during initialization).

```js
app.service('messages').get(1)
  .then(message => console.log(message));
```

```
GET /messages/1
```

#### `adapter.create(data, params) -> Promise`

Create a new record with `data`. `data` can also be an array to create multiple records.

```js
app.service('messages').create({
    text: 'A test message'
  })
  .then(message => console.log(message));

app.service('messages').create([{
    text: 'Hi'
  }, {
    text: 'How are you'
  }])
  .then(messages => console.log(messages));
```

```
POST /messages
{
  "text": "A test message"
}
```

#### `adapter.update(id, data, params) -> Promise`

Completely replaces a single record identified by `id` with `data`. Does not allow replacing multiple records (`id` can't be `null`). `id` can not be changed.

```js
app.service('messages').update(1, {
    text: 'Updates message'
  })
  .then(message => console.log(message));
```

```
PUT /messages/1
{ "text": "Updated message" }
```

#### `adapter.patch(id, data, params) -> Promise`

Merges a record identified by `id` with `data`. `id` can be `null` to allow replacing multiple records (all records that match `params.query` the same as in `.find`). `id` can not be changed.

```js
app.service('messages').update(1, {
    text: 'A patched message'
  })
  .then(message => console.log(message));

const params = {
  query: { read: false }
};

// Mark all unread messages as read
app.service('messages').patch(null, {
  read: true
}, params);
```

```
PATCH /messages/1
{ "text": "A patched message" }
```

Mark all unread messages as read

```
PATCH /messages?read=false
{ "read": true }
```

#### `adapter.remove(id, params) -> Promise`

Removes a record identified by `id`. `id` can be `null` to allow removing multiple records (all records that match `params.query` the same as in `.find`).

```js
app.service('messages').remove(1)
  .then(message => console.log(message));

const params = {
  query: { read: true }
};

// Remove all read messages
app.service('messages').remove(null, params);
```

```
DELETE /messages/1
```

Remove all read messages

```
DELETE /messages?read=true
```


## Extending Adapters

There are two ways to extend existing database adapters. Either by extending the ES6 base class or by adding functionality through hooks.

> **ProTip:** Keep in mind that calling the original service methods will return a Promise that resolves with the value.

### Hooks

The most flexible option is weaving in functionality through [hooks](../hooks.md). For example, `createdAt` and `updatedAt` timestamps could be added like this:

```js
const feathers = require('feathers');
const hooks = require('feathers-hooks');

// Import the database adapter of choice
const service = require('feathers-<adapter>');

const app = feathers()
  .configure(hooks())
  .use('/todos', service({
    paginate: {
      default: 2,
      max: 4
    }
  }));

app.service('todos').hooks({
  before: {
    create: [
      (hook) => hook.data.createdAt = new Date()
    ],
    
    update: [
      (hook) => hook.data.updatedAt = new Date()
    ]
  }
});

app.listen(3030);
```

### Classes (ES6)

All modules also export an [ES6 class](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Classes) as `Service` that can be directly extended like this:

```js
'use strict';

const Service = require( 'feathers-<database>').Service;

class MyService extends Service {
  create(data, params) {
    data.created_at = new Date();

    return super.create(data, params);
  }

  update(id, data, params) {
    data.updated_at = new Date();

    return super.update(id, data, params);
  }
}

app.use('/todos', new MyService({
  paginate: {
    default: 2,
    max: 4
  }
}));
```

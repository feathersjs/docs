# Common Interface

All database adapters implement the [service interface](../services/readme.md) and a common mechanism for initialization, [pagination and sorting](./pagination.md), [querying](./querying.md) and [extending](./extending.md).

This chapter describes the common adapter initialization and options as well as details on how service methods behave.

## API

### `service([options])`

Returns a new service instance intitialized with the given options.

```js
const service = require('feathers-<adaptername>');

app.use('/messages', service());
app.use('/messages', service({ id, events, paginate }));
```

__Options:__

- `id` (*optional*) - The name of the id field property (usually set by default to `id` or `_id`).
- `events` (*optional*) - A list of [custom service events](../real-time/events.md#custom-events) sent by this service
- `paginate` (*optional*) - A [pagination object](./pagination.md) containing a `default` and `max` page size


## Service methods

Once registered, the [service methods](../services/readme.md) of the adapter can be called as follows.

#### `adapter.find(params) -> Promise`

Returns a list of all records matching the query in `params.query` using the [common querying mechanism](./querying.md). Will either return an array with the results or a page object if [pagination is enabled](./pagination.md).

> **Important**: When used via REST URLs all query values are strings. Depending on the database the values in `params.query` might have to be converted to the right type in a `before` [hook](../hooks/readme.md).

```js
// Find all messages for user with id 1
app.service('messages').find({
  query: {
    userId: 1
  }
});

// Find all messages belonging to room 1 or 3
app.service('messages').find({
  query: {
    roomId: {
      $in: [ 1, 3 ]
    }
  }
});
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

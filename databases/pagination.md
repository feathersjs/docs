# Pagination, Sorting and limiting

All official database adapters support a common way for sorting, limiting, selecting, and paginating `find` method calls as part of `params.query`.

## Pagination

When initializing an adapter you can set the following pagination options in the `paginate` object:

- `default` - Sets the default number of items
- `max` - Sets the maximum allowed number of items per page (even if the `$limit` query parameter is set higher)

When `paginate.default` is set, `find` will return an object (instead of the normal array) in the following form:

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

// override pagination in `params.paginate`
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

> **Note:** Disabling or changing the default pagination is not available in the client. Only `params.query` is passed to the server. ([Workaround](https://github.com/feathersjs/feathers/issues/382#issuecomment-238407741))

> **Pro tip:** To just get the number of available records set `$limit` to `0`. This will only run a (fast) counting query against the database.


## Sorting and limiting

The `find` API also allows the use of `$limit`, `$skip` and `$sort` in the query.

### `$limit`

`$limit` will return only the number of results you specify:

```js
// Retrieves the first two unread messages
app.service('messages').find({
  query: {
    $limit: 2,
    read: false
  }
});
```

```
GET /messages?$limit=2&read=false
```

### `$skip`

`$skip` will skip the specified number of results:

```js
// Retrieves the next two unread messages
app.service('messages').find({
  query: {
    $limit: 2,
    $skip: 2,
    read: false
  }
});
```

```
GET /messages?$limit=2&$skip=2&read=false
```

### `$sort`

`$sort` will sort based on the object you provide. It can contain a list of properties by which to sort mapped to the order (`1` ascending, `-1` descending).


```js
// Find the 10 newest messages
app.service('messages').find({
  query: {
    $limit: 10,
    $sort: {
      createdAt: -1
    }
  }
});
```

```
/messages?$limit=10&$sort[createdAt]=-1
```

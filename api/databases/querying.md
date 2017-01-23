# Querying

In addition to [Pagination and Sorting](pagination.md), data can also be filtered by criteria .

> **Important**: When used via REST URLs all query values are strings. Depending on the service the values in `params.query` might have to be converted to the right type in a [before hook](../hooks/readme.md).

### `$select`

`$select` allows to pick which fields to include in the result.

```js
// Only return the `text` and `userId` field in a message
app.service('messages').find({
  query: {
    $select: [ 'text', 'userId' ]
  }
});

app.service('messages').get(1, {
  query: {
    $select: [ 'text' ]
  }
});
```

```
GET /messages?$select=text&$select=userId
GET /messages/1?$select=text
```

To exclude fields from a result the [remove hook](../hooks/common.md) can be used.

### Equality

All fields that do not contain special query parameters are compared directly for equality.

```js
// Find all unread messages in room #2
app.service('messages').find({
  query: {
    read: false,
    roomId: 2
  }
});
```

```
GET /messages?read=false&roomId=2
```

### `$in`, `$nin`

Find all records where the property does (`$in`) or does not (`$nin`) match any of the given values. 

```js
// Find all messages in room 2 or 5
app.service('messages').find({
  query: {
    roomId: {
      $in: [ 2, 5 ]
    }
  }
});
```

```
GET /messages?roomId[$in]=2&roomId[$in]=5
```

### `$lt`, `$lte`

Find all records where the value is less (`$lt`) or less and equal (`$lte`) to a given value. 

```js
// Find all messages older than a day
const DAY_MS = 24 * 60 * 60 * 1000;

app.service('messages').find({
  query: {
    createdAt: {
      $lt: new Date().getTime() - DAY_MS
    }
  }
});
```

```
GET /messages?createdAt[$lt]=1479664146607
```

### `$gt`, `$gte`

Find all records where the value is more (`$gt`) or more and equal (`$gte`) to a given value. 

```js
// Find all messages within the last day
const DAY_MS = 24 * 60 * 60 * 1000;

app.service('messages').find({
  query: {
    createdAt: {
      $gt: new Date().getTime() - DAY_MS
    }
  }
});
```

```
GET /messages?createdAt[$gt]=1479664146607
```

### `$ne`

Find all records that do not equal the given property value.

```js
// Find all messages that are not marked as archived
app.service('messages').find({
  query: {
    archived: {
      $ne: true
    }
  }
});
```

```
GET /messages?archived[$ne]=true
```

### `$or`

Find all records that match any of the given criteria.

```js
// Find all messages that are not marked as archived
// or any message from room 2
app.service('messages').find({
  query: {
    $or: [
      { archived: { $ne: true } },
      { roomId: 2 }
    ]
  }
});
```

```
GET /messages?$or[0][archived][$ne]=true&$or[1][roomId]=2
```

# Querying

In addition to [Pagination and Sorting](pagination.md), data can also be filtered by criteria. Standard criteria can just be added to the query. For example, the following finds all users with the name `Alice`:

```js
query: {
  name: 'Alice'
}
```

Additionally, the following advanced criteria are supported for each property.

> **ProTip:** Just like with [Pagination and Sorting](pagination.md) you won't want to use `$in`, `$nin`, `$lt`, `$lte`, `$gt`, `$gte`, `$ne` and `$or` as field names for documents in your database.

### $in, $nin

Find all records where the property does (`$in`) or does not (`$nin`) contain the given values. For example, the following query finds every user with the name of `Alice` or `Bob`:

```js
query: {
  name: {
    $in: ['Alice', 'Bob']
  }
}
```

### $lt, $lte

Find all records where the value is less (`$lt`) or less and equal (`$lte`) to a given value. The following query retrieves all users 25 or younger:

```js
query: {
  age: {
    $lte: 25
  }
}
```

### $gt, $gte

Find all records where the value is more (`$gt`) or more and equal (`$gte`) to a given value. The following query retrieves all users older than 25:

```js
query: {
  age: {
    $gt: 25
  }
}
```

### $ne

Find all records that do not contain the given property value, for example anybody not age 25:

```js
query: {
  age: {
    $ne: 25
  }
}
```

### $or

Find all records that match any of the given objects. For example, find all users name Bob or Alice:

```js
query: {
  $or: [
    { name: 'Alice' },
    { name: 'Bob' }
  ]
}
```

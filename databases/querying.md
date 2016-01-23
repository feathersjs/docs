# Querying and Pagination

## Pagination

## Sorting, limiting and selecting

The `find` API allows the use of `$limit`, `$skip`, `$sort`, and `$select` in the query.  These special parameters can be passed directly inside the query object:

```js
// Find all recipes that include salt, limit to 10, only include name field.
{"ingredients":"salt", "$limit":10, "$select": ["name"] } } // JSON

GET /?ingredients=salt&$limit=10&$select[]=name // HTTP
```

As a result of allowing these to be put directly into the query string, you won't want to use `$limit`, `$skip`, `$sort`, or `$select` as the name of fields in your document schema.

### `$limit`

`$limit` will return only the number of results you specify:

```
// Retrieves the first two records found where age is 37.
query: {
  age: 37,
  $limit: 2
}
```

### `$skip`

`$skip` will skip the specified number of results:

```
// Retrieves all except the first two records found where age is 37.
query: {
  age: 37,
  $skip: 2
}
```

### `$sort`

`$sort` will sort based on the object you provide:

```
// Retrieves all where age is 37, sorted ascending alphabetically by name.
query: {
  age: 37,
  $sort: { name: 1 }
}

// Retrieves all where age is 37, sorted descending alphabetically by name.
query: {
  age: 37,
  $sort: { name: -1}
}
```

### `$select`

`$select` support in a query allows you to pick which fields to include or exclude in the results.

```
// Only retrieve name.
query: {
  name: 'Alice',
  $select: {'name': 1}
}

// Retrieve everything except age.
query: {
  name: 'Alice',
  $select: {'age': 0}
}
```


## Filter criteria

In addition to sorting and pagination, properties can also be filtered by criteria. Standard criteria can just be added to the query. For example, the following find all users with the name `Alice`:

```js
query: {
  name: 'Alice'
}
```

Additionally, the following advanced criteria are supported for each property.

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
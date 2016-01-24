# Sorting an Pagination

All official database adapters support a common way for sorting, limiting and paginating `find` method calls as part of `params.query`.

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

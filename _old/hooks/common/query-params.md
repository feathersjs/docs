# Query Params

Hooks to manipulate the query parameters.

* [removeQuery](#removequery)
* [pluckQuery](#pluckquery)

### removeQuery
`removeQuery(...fieldNames?: string[]): HookFunc`

Remove the given fields from the query params.

- Used as a `before` hook.
- Field names support dot notation
- Supports multiple data items, including paginated `find`.

```js
const hooks = require('feathers-hooks-common');

// Remove _id from the query for all service methods
app.service('users').before({
  all: hooks.removeQuery('_id')
});
```

> **ProTip:** This hook will only fire when `params.provider` has a value, i.e. when it is an external request over REST or Sockets.

Options

- `fieldNames` [optional] - The fields that you want to remove from the query object.

### pluckQuery
`pluckQuery(...fieldNames?: string[]): HookFunc`

Discard all other fields except for the given fields from the query params.

- Used as a `before` hook.
- Field names support dot notation.
- Supports multiple data items, including paginated `find`.

```js
const hooks = require('feathers-hooks-common');

// Discard all other fields except for _id from the query
// for all service methods
app.service('users').before({
  all: hooks.pluckQuery('_id')
});
```

> **ProTip:** This hook will only fire when `params.provider` has a value, i.e. when it is an external request over REST or Sockets.

Options

- `fieldNames` [optional] - The fields that you want to retain from the query object. All other fields will be discarded.

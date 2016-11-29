# Database

Hooks that interact with the database.

* [softDelete](#softdelete)

### softDelete
`softDelete(fieldName = 'deleted'): HookFunc`

Marks items as `{ deleted: true }` instead of physically removing them.
This is useful when you want to discontinue use of, say, a department,
but you have historical information which continues to refer to the discontinued department.

- Used as a `before.all` hook to handle all service methods.
- Supports multiple data items, including paginated `find`.

```js
const hooks = require('feathers-hooks-common');
const dept = app.service('departments');

dept.before({
  all: hooks.softDelete(),
});

// will throw if item is marked deleted.
dept.get(0).then()

// methods can be run avoiding softDelete handling
dept.get(0, { query: { $disableSoftDelete: true }}).then()
```
Options

- `fieldName` [optional. default: `deleted`] - The name of the field holding the deleted flag.

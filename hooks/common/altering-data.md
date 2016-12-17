# Altering Data

Hooks to manipulate your data either before it is passed to the service method,
or after it has been retrieved.

* [remove](#remove)
* [pluck](#pluck)
* [lowercase](#lowercase)
* [setCreatedAt](#setcreatedat)
* [setUpdatedAt](#setupdatedat)
* [traverse](#traverse)

### remove
`remove(fieldName: string, ...fieldNames?: string[]): HookFunc`

Remove the given fields either from the data submitted or from the result. If the data is an array or a paginated `find` result the hook will remove the field(s) for every item.

- Used as a `before` hook for `create`, `update` or `patch`.
- Used as an `after` hook.
- Field names support dot notation e.g. `name.address.city`.
- Supports multiple data items, including paginated `find`.

```js
const hooks = require('feathers-hooks-common');

// Remove the hashed `password` and `salt` field after all method calls
app.service('users').after(hooks.remove('password', 'salt'));

// Remove _id for `create`, `update` and `patch`
app.service('users').before({
  create: hooks.remove('_id'),
  update: hooks.remove('_id'),
  patch: hooks.remove('_id')
})
```

> **ProTip:** This hook will only fire when `params.provider` has a value, i.e. when it is an external request over REST or Sockets.

Options

- `fieldName` [required] - The first field that you want to remove from the object(s).
- `fieldNames` [optional] - Other fields that you want to remove.

### pluck
`pluck(fieldName: string, ...fieldNames?: string[]): HookFunc`

Discard all other fields except for the provided fields either from the data submitted or from the result. If the data is an array or a paginated `find` result the hook will remove the field(s) for every item.

- Used as a `before` hook for `create`, `update` or `patch`.
- Used as an `after` hook.
- Field names support dot notation.
- Supports multiple data items, including paginated `find`.

```js
const hooks = require('feathers-hooks-common');

// Only retain the hashed `password` and `salt` field after all method calls
app.service('users').after(hooks.pluck('password', 'salt'));

// Only keep the _id for `create`, `update` and `patch`
app.service('users').before({
  create: hooks.pluck('_id'),
  update: hooks.pluck('_id'),
  patch: hooks.pluck('_id')
})
```

> **ProTip:** This hook will only fire when `params.provider` has a value, i.e. when it is an external request over REST or Sockets.

Options

- `fieldName` [required] - The fields that you want to retain from the object(s).
- `fieldNames` [optional] - The other fields that you want to retain.

 All other fields will be discarded.

### lowerCase
`lowerCase(fieldName: string, ...fieldNames?: string[]): HookFunc`

Lower cases the given fields either in the data submitted or in the result. If the data is an array or a paginated `find` result the hook will lowercase the field(s) for every item.

- Used as a `before` hook for `create`, `update` or `patch`.
- Used as an `after` hook.
- Field names support dot notation.
- Supports multiple data items, including paginated `find`.

```js
const hooks = require('feathers-hooks-common');

// lowercase the `email` and `password` field before a user is created
app.service('users').before({
  create: hooks.lowerCase('email', 'username')
});
```

Options

- `fieldName` [required] - The fields that you want to lowercase from the retrieved object(s).
- `fieldNames` [optional] - The other fields that you want to lowercase.

### setCreatedAt
`setCreatedAt(fieldName = 'createdAt', ...fieldNames?: string[])`

Add the fields with the current date-time.

- Used as a `before` hook for `create`, `update` or `patch`.
- Used as an `after` hook.
- Field names support dot notation.
- Supports multiple data items, including paginated `find`.

```js
const hooks = require('feathers-hooks-common');

// set the `createdAt` field before a user is created
app.service('users').before({
  create: [ hooks.setCreatedAt('createdAt') ]
};
```

Options

- `fieldName` [optional. default: `createdAt`] - The field that you want to add with the current date-time to the retrieved object(s).
- `fieldNames` [optional] - Other fields to add with the current date-time.

### setUpdatedAt
`setUpdatedAt(fieldName = 'updatedAt', ...fieldNames?: string[]): HookFunc`

Add or update the fields with the current date-time.

- Used as a `before` hook for `create`, `update` or `patch`.
- Used as an `after` hook.
- Field names support dot notation.
- Supports multiple data items, including paginated `find`.

```js
const hooks = require('feathers-hooks-common');

// set the `updatedAt` field before a user is created
app.service('users').before({
  create: [ hooks.setCreatedAt('updatedAt') ]
};
```

Options

- `fieldName` [optional. default: `updatedAt`] - The fields that you want to add or update in the retrieved object(s).
- `fieldNames` [optional] - Other fields to add or update with the current date-time.


### traverse
`traverse(transformer: Function, getObject?: Function): HookFunc`

Traverse and transform objects in place by visiting every node on a recursive walk.

- Used as a `before` or `after` hook.
- Supports multiple data items, including paginated `find`.
- Any object in the hook may be traversed, **including the query object**.
- `transformer` has access to powerful methods and context.

```js
// Trim strings
const trimmer = function (node) {
  if (typeof node === 'string') { this.update(node.trim()); }
};
service.before({ create: traverse(trimmer) });
```
```javascript
// REST HTTP request may use the string 'null' in its query string.
// Replace these strings with the value null.
const nuller = function (node) {
  if (node === 'null') { this.update(null); }
};
service.before({ find: traverse(nuller, hook => hook.params.query) });
```

> **ProTip:** GitHub's `substack/js-traverse` documents the extensive methods and context available to the transformer function.

Options

- `transformer` [required] - Called for every node and may change it in place.
- `getObject` [optional, defaults to hook.data or hook.result as appropriate] - 
Function with signature (hook) which returns the object to traverse.
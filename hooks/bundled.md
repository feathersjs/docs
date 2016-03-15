# Built-in hooks

When it makes sense to do so, some plugins include their own hooks. The following plugins come bundled with useful hooks:

- `feathers-hooks` (see below)
- [`feathers-mongoose`](../databases/mongoose.md)
- [`feathers-authentication`](../authorization/bundled-hooks.md)

There are two hooks included in the `feathers-hooks` module that are available on the hooks module.

## `disable(providers)`

Disable access to a service method completely or for a specific provider. All providers ([REST](../rest/readme.md), [Socket.io](../real-time/socket-io.md) and [Primus](../real-time/primus.md)) set the `params.provider` property which is what `disable` checks for. `disable('external')`  will disable access from all providers making a service method only usable internally.

```js
const hooks = require('feathers-hooks');

app.service('users').before({
  // Users can not be created by external access
  create: hooks.disable('external'),
  // A user can not be deleted through the REST provider
  remove: hooks.disable('rest'),
  // Disable calling `update` completely (e.g. to only support `patch`)
  update: hooks.disable()
})
```

> __ProTip:__ Service methods that are not implemented do not need to be disabled.

## `remove(fields)`

Remove the given fields either from the data submitted (as a `before` hook for `create`, `update` or `patch`) or from the result (as an `after` hook). If the data is an array or a paginated `find` result the hook will remove the field for every item.

```js
const hooks = require('feathers-hooks');

// Remove the hashed `password` and `salt` field after all method calls
app.service('users').after(hooks.remove('password', 'salt'));

// Remove _id for `create`, `update` and `patch`
app.service('users').before({
  create: hooks.remove('_id'),
  update: hooks.remove('_id'),
  patch: hooks.remove('_id')
})
```

## `lowerCase(fields)`

Lowercase the given fields either in the data submitted (as a `before` hook for `create`, `update` or `patch`) or in the result (as an `after` hook). If the data is an array or a paginated `find` result the hook will lower case the field for every item.

```js
const hooks = require('feathers-hooks');

// lowercase the `email` and `password` field before a user is created
app.service('users').before({
  create: hooks.lowerCase('email', 'username')
});
```

## `populate(options)`

Populate related objects by ID onto other objects. Can be used either as a before hook or an after hook. `field` is optional and will fallback default to the field name that will be populated.

```js
const hooks = require('feathers-hooks');

// populate the user `sentBy` attribute by looking
// up a user in the `users` service by `userId`.
app.service('messages').after({
  get: hooks.populate('sentBy', { service: 'users', field: 'userId' })
});
```

# Bundled Hooks (Deprecated)

> **ProTip:** The built-in hooks are being deprecated in favor of [Common Hooks](./common.md). All of these are currently available as part of `feathers-hooks-common`. Please start using that module.

`feathers-hooks` comes with some bundled hooks to provide common functionality.

## populate

`populate(fieldName, { service: service, field: sourceField })`

The `populate` hook uses a property from the result (or every item if it is a list) to retrieve a single related object from a service and add it to the original object. It is meant to be used as an **after** hook on any service method.

```js
const hooks = require('feathers-hooks');

// Given a `user_id` in a message, retrieve the user and
// add it in the `user` field.
app.service('messages').after(hooks.populate('user', {
  service: 'users',
  field: 'user_id'  
}));
```

#### Options

- `fieldName` (**required**) - The field name you want to populate the related object on to.
- `service` (**required**) - The service you want to populate the object from.
- `field` (default: 'fieldName') [optional] - The field you want to look up the related object by from the `service`. By default it is the same as the target `fieldName`.

## disable

Disables access to a service method completely or for a specific provider. All providers ([REST](../rest/readme.md), [Socket.io](../real-time/socket-io.md) and [Primus](../real-time/primus.md)) set the `params.provider` property which is what `disable` checks for. There are several ways to use the disable hook:

```js
const hooks = require('feathers-hooks');

app.service('users').before({
  // Users can not be created by external access
  create: hooks.disable('external'),
  // A user can not be deleted through the REST provider
  remove: hooks.disable('rest'),
  // Disable calling `update` completely (e.g. to only support `patch`)
  update: hooks.disable(),
  // Disable the remove hook if the user is not an admin
  remove: hooks.disable(function(hook) {
    return !hook.params.user.isAdmin
  })
});
```

> **ProTip:** Service methods that are not implemented do not need to be disabled.

#### Options

- `providers` (default: _disables everything_) [optional] - The transports that you want to disable this service method for. Options are:
  - `socketio` - will disable the method for the Socket.IO provider
  - `primus` - will disable the method for the Primus provider
  - `rest` - will disable the method for the REST provider
  - `external` - will disable access from all providers making a service method only usable internally.
- `callback` (default: _runs when not called internally_) [optional] - A function that receives the `hook` object where you can put your own logic to determine whether this hook should run. Returns either `true` or `false`.

## remove

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

// remove `email` field for all methods unless the
// requesting user is an admin.
app.service('users').after({
  all: hooks.remove('email', function(hook){
    return !hook.params.user.isAdmin;
  })
})
```

> **ProTip:** This hook will only fire when `params.provider` has a value (ie. when it is an external request over REST or Sockets.) or if you have passed your own custom condition function.

#### Options

- `fields` (**required**) - The fields that you want to remove from the object(s).
- `callback` (default: _runs when not called internally_) [optional] - A function that receives the `hook` object where you can put your own logic to determine whether this hook should run. Returns either `true` or `false`.

## removeQuery

Remove the given fields from the query params. Can be used as a **before** hook for any service method.

```js
const hooks = require('feathers-hooks');

// Remove _id from the query for all service methods
app.service('users').before({
  all: hooks.removeQuery('_id')
});

// remove `email` field for all methods unless the
// requesting user is an admin.
app.service('users').after({
  all: hooks.removeQuery('email', function(hook){
    return !hook.params.user.isAdmin;
  })
})
```

> **ProTip:** This hook will only fire when `params.provider` has a value (ie. when it is an external request over REST or Sockets.) or if you have passed your own custom condition function.

#### Options

- `fields` (**required**) - The fields that you want to remove from the query object.
- `callback` (default: _runs when not called internally_) [optional] - A function that receives the `hook` object where you can put your own logic to determine whether this hook should run. Returns either `true` or `false`.

## pluck

Discard all other fields except for the provided fields either from the data submitted (as a `before` hook for `create`, `update` or `patch`) or from the result (as an `after` hook). If the data is an array or a paginated `find` result the hook will remove the field for every item.

```js
const hooks = require('feathers-hooks');

// Only retain the hashed `password` and `salt` field after all method calls
app.service('users').after(hooks.pluck('password', 'salt'));

// Only keep the _id for `create`, `update` and `patch`
app.service('users').before({
  create: hooks.pluck('_id'),
  update: hooks.pluck('_id'),
  patch: hooks.pluck('_id')
})

// Only keep the `email` field for all methods unless the
// requesting user is an admin.
app.service('users').after({
  all: hooks.pluck('email', function(hook){
    return !hook.params.user.isAdmin;
  })
})
```

> **ProTip:** This hook will only fire when `params.provider` has a value (ie. when it is an external request over REST or Sockets.) or if you have passed your own custom condition function.

#### Options

- `fields` (**required**) - The fields that you want to retain from the object(s). All other fields will be discarded.
- `callback` (default: _runs when not called internally_) [optional] - A function that receives the `hook` object where you can put your own logic to determine whether this hook should run. Returns either `true` or `false`.

## pluckQuery

Discard all other fields except for the given fields from the query params. Can be used as a **before** hook for any service method.

```js
const hooks = require('feathers-hooks');

// Discard all other fields except for _id from the query
// for all service methods
app.service('users').before({
  all: hooks.pluckQuery('_id')
});

// only retain the `email` field for all methods unless the
// requesting user is an admin.
app.service('users').after({
  all: hooks.pluckQuery('email', function(hook){
    return !hook.params.user.isAdmin;
  })
})
```

> **ProTip:** This hook will only fire when `params.provider` has a value (ie. when it is an external request over REST or Sockets.) or if you have passed your own custom condition function.

#### Options

- `fields` (**required**) - The fields that you want to retain from the query object. All other fields will be discarded.
- `callback` (default: _runs when not called internally_) [optional] - A function that receives the `hook` object where you can put your own logic to determine whether this hook should run. Returns either `true` or `false`.

## lowerCase

Lowercases the given fields either in the data submitted (as a `before` hook for `create`, `update` or `patch`) or in the result (as an `after` hook). If the data is an array or a paginated `find` result the hook will lowercase the field for every item.

```js
const hooks = require('feathers-hooks');

// lowercase the `email` and `password` field before a user is created
app.service('users').before({
  create: hooks.lowerCase('email', 'username')
});
```

#### Options

- `fields` (**required**) - The fields that you want to lowercase from the retrieved object(s).
# Altering Data

Hooks to manipulate your data either before it is passed to the service method,
or after it has been retrieved.

* [populate](#populate)
* [remove](#remove)
* [pluck](#pluck)
* [lowercase](#lowercase)
* [setCreatedAt](#setcreatedat)
* [setUpdatedAt](#setupdatedat)


### populate
`populate(fieldName: string, { service: ServiceName, field = fieldName }): HookFunc`

The `populate` hook uses a property from the result (or every item if it is a list) to retrieve a single related object from a service and add it to the original object. 

- Used as an **after** hook on any service method.
- Supports multiple result items, including paginated `find`.
- Supports an array of keys in `field`.

```javascript
const hooks = require('feathers-hooks-common');

// Given a `user_id` in a message, retrieve the user and
// add it in the `user` field.
app.service('messages').after({
  find: hooks.populate('user', {
    service: 'users',
    field: 'user_id'  
  })
});
```
```javascript
/*
 If the object from the message service is
   { _id: '1...1', senderId: 'a...a', text: 'Jane, are you there?' }
 when the hook is run during a find method
   hooks.populate('senderId', { service: '/users', field: 'user' })
 the result will contain
   { _id: '1...1', senderId : 'a...a', text: 'Jane, are you there?',
     user: { _id: 'a...a', name: 'John Doe'} }
 If `senderId` is an array of keys, then `user` will be an array of populated items.
*/
```

Options

- `fieldName` [required] - The field name you want to populate the related object on to.
- `service` [required] - The service you want to populate the object from.
- `field` [optional. default: `fieldName`] - The field you want to look up the related object by from the service. That is, the foreign key we have for the service.

If `field` is an array of keys, then `fieldName` will contain an array of service objects.

If `field` is not provided, then `fieldName` is used,
in which case the value(s) of `fieldName` will first be used to look up the service,
and then `fieldName` will be set to the service object(s) selected.


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

# Authentication hooks

[![GitHub stars](https://img.shields.io/github/stars/feathersjs/feathers-authentication-hooks.png?style=social&label=Star)](https://github.com/feathersjs/feathers-authentication-hooks/)
[![npm version](https://img.shields.io/npm/v/feathers-authentication-hooks.png?style=flat-square)](https://www.npmjs.com/package/feathers-authentication-hooks)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.png?style=flat-square)](https://github.com/feathersjs/feathers-authentication-hooks/blob/master/CHANGELOG.md)

```
$ npm install feathers-authentication-hooks --save
```

`feathers-authentication-hooks` is a package containing some useful hooks for authentication and authorization. For more information about hooks, refer to the [chapter on hooks](../hooks.md). 

> **Note:** Restricting authentication hooks will only run when `params.provider` is set (as in when the method is accessed externally through a transport like [REST](../rest.md) or [Socketio](../socketio.md)).


## queryWithCurrentUser

The `queryWithCurrentUser` **before** hook will automatically add the user's `id` as a parameter in the query. This is useful when you want to only return data, for example "messages", that were sent by the current user.

```js
const hooks = require('feathers-authentication-hooks');

app.service('messages').before({
  find: [
    hooks.queryWithCurrentUser({ idField: 'id', as: 'sentBy' })
  ]
});
```

#### Options

- `idField` (default: '_id') [optional] - The id field on your user object.
- `as` (default: 'userId') [optional] - The id field for a user on the resource you are requesting.
- `expandPaths` (default: true) [optional] - Prevent path expansion when the DB Adapter doesn't support it. Ex: With this option set to false, a value like 'foo.userId' won't be expanded to a nested `{ "foo": { "userId": 51 } }` but instead be set as `{ "foo.userId": 51 }`.

When using this hook with the default options the `User._id` will be copied into `hook.params.query.userId`.


## restrictToOwner

`restrictToOwner` is meant to be used as a **before** hook. It only allows the user to retrieve or modify resources that are owned by them. It will return a _Forbidden_ error without the proper permissions. It can be used on *any* method.

For `find` method calls and `patch`, `update` and `remove` of many (with `id` set to `null`), the [queryWithCurrentUser](#queryWithCurrentUser) hook will be called to limit the query to the current user. For all other cases it will retrieve the record and verify the owner before continuing.

```js
const hooks = require('feathers-authentication-hooks');

app.service('messages').before({
  remove: [
    hooks.restrictToOwner({ idField: 'id', ownerField: 'sentBy' })
  ]
});
```

#### Options

- `idField` (default: '_id') [optional] - The id field on your user object.
- `ownerField` (default: 'userId') [optional] - The id field for a user on your resource.
- `expandPaths` (default: true) [optional] - Prevent path expansion when the DB Adapter doesn't support it. Also see [queryWithCurrentUser](#queryWithCurrentUser).


## restrictToAuthenticated

The `restrictToAuthenticated` hook throws an error if there isn't a logged-in user by checking for the `hook.params.user` object. It can be used on **any** service method and is intended to be used as a **before** hook. It doesn't take any arguments.

```js
const hooks = require('feathers-authentication-hooks');

app.service('user').before({
  get: [
    hooks.restrictToAuthenticated()
  ]
});
```

#### Options

- `entity` (default: 'user') [optional] - The property name on `hook.params` to check for


## associateCurrentUser

The `associateCurrentUser` **before** hook is similar to the `queryWithCurrentUser`, but works on the incoming **data** instead of the **query** params. It's useful for automatically adding the userId to any resource being created. It can be used on `create`, `update`, or `patch` methods.

```js
const hooks = require('feathers-authentication-hooks');

app.service('messages').before({
  create: [
    hooks.associateCurrentUser({ idField: 'id', as: 'sentBy' })
  ]
});
```

#### Options

- `idField` (default: '_id') [optional] - The id field on your user object.
- `as` (default: 'userId') [optional] - The id field for a user that you want to set on your resource.


## restrictToRoles

`restrictToRoles` is meant to be used as a **before** hook. It only allows the user to retrieve resources that are owned by them or protected by certain roles. It will return a _Forbidden_ error without the proper permissions. It can be used on `all` methods when the **owner** option is set to 'false'.  When the **owner** option is set to `true` the hook can only be used on `get`, `update`, `patch`, and `remove` service methods.

```js
const hooks = require('feathers-authentication-hooks');

app.service('messages').before({
  remove: [
    hooks.restrictToRoles({
        roles: ['admin', 'super-admin'],
        fieldName: 'permissions',
        idField: 'id',
        ownerField: 'sentBy',
        owner: true
    })
  ]
});
```

#### Options

- `roles` (**required**) - An array of roles, or a role string that a user must have at least one of in order to access the resource.
- `fieldName` (default: 'roles') [optional] - The field on your user object that denotes their role or roles.
- `idField` (default: '_id') [optional] - The id field on your user object.
- `ownerField` (default: 'userId') [optional] - The id field for a user on your resource.
- `owner` (default: 'false') [optional] - Denotes whether it should also allow owners regardless of their role (ie. the user has the role **or** is an owner).


## hasRoleOrRestrict

`hasRoleOrRestrict` is meant to be used as a **before** hook for any service on the **find** or **get** methods. Unless the user has one of the roles provided, it will add a restriction onto the query to limit what resources return.

```js
const hooks = require('feathers-authentication-hooks');

app.service('messages').before({
  find: [
    hooks.hasRoleOrRestrict({
        roles: ['admin', 'super-admin'],
        fieldName: 'permissions',
        restrict: { approved: true }
    })
  ]
});
```

#### Options

- `roles` (**required**) - An array of roles that a user must have at least one of in order to access the resource.
- `fieldName` (default: 'roles') [optional] - The field on your user object that denotes their roles.
- `restrict` (default: undefined) - The query to merge into the client query to limit what resources are accessed

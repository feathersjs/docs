# Authorization Hooks

These hooks come bundled with the [Feathers authentication](https://github.com/feathersjs/feathers-authentication) plugin.

Implementing authorization is not automatic, but is easy to set up with the included hooks.  You can also create your own hooks to handle your app's custom business logic.  For more information about hooks, refer to the [chapter on hooks](../hooks/readme.md).

The `feathers-authentication` plug-in includes the following hooks to help with the authorization process. The most common scenario is that you simply want to restrict a service to only authenticated users. That can be done like so:

```js
const hooks = require('feathers-authentication').hooks;

// Must be logged in do anything with messages.
app.service('messages').before({
  all: [
    hooks.verifyToken(),
    hooks.populateUser(),
    hooks.restrictToAuthenticated()
  ]
});
```

> **ProTip:** All bundled authorization hooks will automatically pull values from your `auth` config. You can override them explicitly by passing them to the hook.

## hashPassword

The `hashPassword` hook will automatically hash the data coming in on the provided `passwordField`. It is intended to be used as a **before** hook on the user service for the `create`, `update`, or `patch` methods.

```js
const hooks = require('feathers-authentication').hooks;

app.service('user').before({
  create: [
    hooks.hashPassword()
  ]
});
```

#### Options

- `passwordField` (default: 'password') [optional] - The field you use to denote the password on your user object.

## verifyToken

The `verifyToken` hook will attempt to verify a token. If the token is missing or is invalid it returns an error. If the token is valid it adds the decrypted payload to `hook.params.payload` which contains the user id. It is intended to be used as a **before** hook on **any** of the service methods.

```js
const hooks = require('feathers-authentication').hooks;

app.service('user').before({
  get: [
    hooks.verifyToken()
  ]
});
```

#### Options

- `secret` (default: the one from your config) [optional] - Your secret used to encrypt and decrypt JWT's on the server. If this gets compromised you need to rotate it immediately!
- `issuer` (default: 'feathers') [optional] - The JWT issuer field
- `algorithm` (default: 'HS512') [optional] - The accepted JWT hash algorithm
- `expiresIn` (default: '1d') [optional] - The time a token is valid for

You can view the all available options in the [node-jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) repo.

## populateUser

The `populateUser` hook is for populating a user based on an id. It can be used on **any** service method as either a **before** or **after** hook. It is called internally after a token is created.

```js
const hooks = require('feathers-authentication').hooks;

app.service('user').before({
  get: [
    hooks.populateUser()
  ]
});
```

#### Options

- `userEndpoint` (default: '/user') [optional] - The endpoint for the user service.
- `idField` (default: '_id') [optional] - The database field containing the user id.

## restrictToAuthenticated

The `restrictToAuthenticated` hook throws an error if there isn't a logged-in user by checking for the `hook.params.user` object. It can be used on **any** service method and is intended to be used as a **before** hook. It doesn't take any arguments.

```js
const hooks = require('feathers-authentication').hooks;

app.service('user').before({
  get: [
    hooks.restrictToAuthenticated()
  ]
});
```

## queryWithCurrentUser

The `queryWithCurrentUser` **before** hook will automatically add the user's `id` as a parameter in the query. This is useful when you want to only return data, for example "messages", that were sent by the current user.

```js
const hooks = require('feathers-authentication').hooks;

app.service('messages').before({
  get: [
    hooks.queryWithCurrentUser({ idField: 'id', as: 'sentBy' })
  ]
});
```

#### Options

- `idField` (default: '_id') [optional] - The id field on your user object.
- `as` (default: 'userId') [optional] - The id field for a user on the resource you are requesting.

When using this hook with the default options the `User._id` will be copied into `hook.params.query.userId`.

## associateCurrentUser

The `associateCurrentUser` **before** hook is similar to the `queryWithCurrentUser`, but works on the incoming **data** instead of the **query** params. It's useful for automatically adding the userId to any resource being created. It can be used on `create`, `update`, or `patch` methods.

```js
const hooks = require('feathers-authentication').hooks;

app.service('messages').before({
  create: [
    hooks.associateCurrentUser({ idField: 'id', as: 'sentBy' })
  ]
});
```

#### Options

- `idField` (default: '_id') [optional] - The id field on your user object.
- `as` (default: 'userId') [optional] - The id field for a user that you want to set on your resource.

## restrictToOwner

`restrictToOwner` is meant to be used as a **before** hook. It only allows the user to retrieve resources that are owned by them. It will return a _Forbidden_ error without the proper permissions. It can be used on `get`, `create`, `update`, `patch` or `remove` methods.

```js
const hooks = require('feathers-authentication').hooks;

app.service('messages').before({
  remove: [
    hooks.restrictToOwner({ idField: 'id', ownerField: 'sentBy' })
  ]
});
```

#### Options

- `idField` (default: '_id') [optional] - The id field on your user object.
- `ownerField` (default: 'userId') [optional] - The id field for a user on your resource.

## restrictToRoles

`restrictToRoles` is meant to be used as a **before** hook. It only allows the user to retrieve resources that are owned by them or protected by certain roles. It will return a _Forbidden_ error without the proper permissions. It can be used on `all` methods.

```js
const hooks = require('feathers-authentication').hooks;

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

- `roles` (**required**) - An array of roles that a user must have at least one of in order to access the resource.
- `fieldName` (default: 'roles') [optional] - The field on your user object that denotes their roles.
- `idField` (default: '_id') [optional] - The id field on your user object.
- `ownerField` (default: 'userId') [optional] - The id field for a user on your resource.
- `owner` (default: 'false') [optional] - Denotes whether it should also allow owners regardless of their role (ie. the user has the role **or** is an owner).

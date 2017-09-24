# Common Hooks

[![GitHub stars](https://img.shields.io/github/stars/feathersjs/feathers-hooks-common.png?style=social&label=Star)](https://github.com/feathersjs/feathers-hooks-common/)
[![npm version](https://img.shields.io/npm/v/feathers-hooks-common.png?style=flat-square)](https://www.npmjs.com/package/feathers-hooks-common)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.png?style=flat-square)](https://github.com/feathersjs/feathers-hooks-common/blob/master/CHANGELOG.md)

```
$ npm install feathers-hooks-common --save
```

`feathers-hooks-common` is a collection of common [hooks](./hooks.md) and utilities.

[Authentication hooks](./authentication/hooks.md) are documented separately.

> **Note:** Many hooks are just a few lines of code to implement from scratch. If you can't find a hook here but are unsure how to implement it or have an idea for a generally useful hook create a new issue [here](https://github.com/feathersjs/feathers-hooks-common/issues/new).


## client

### `client(... whitelist)` [source](https://github.com/feathersjs/feathers-hooks-common/blob/master/src/services/client.js)

A hook for passing params from the client to the server.

- Used as a `before` hook.

> **ProTip** Use the `paramsFromClient` hook instead.
It does exactly the same thing as `client` but is less likely to be deprecated.

Only the `hook.params.query` object is transferred to the server from a Feathers client,
for security among other reasons.
However if you can include a `hook.params.query.$client` object, e.g.

```js
service.find({
  query: {
    dept: 'a',
    $client: {
      populate: 'po-1',
      serialize: 'po-mgr'
    }
  }
});
```

the `client` hook will move that data to `hook.params` on the server.

```js
service.before({ all: [ client('populate', 'serialize', 'otherProp'), myHook ]});
// myHook's hook.params will be
// { query: { dept: 'a' }, populate: 'po-1', serialize: 'po-mgr' } }
```

__Options:__

- `whitelist` (*optional*) Names of the potential props to transfer from `query.client`.
Other props are ignored. This is a security feature.

> **ProTip** You can use the same technique for service calls made on the server.

See `Util: paramsForServer` and `paramsFromClient`.


## combine

### `combine(... hookFuncs)` [source](https://github.com/feathersjs/feathers-hooks-common/blob/master/src/services/combine.js)

Sequentially execute multiple hooks within a custom hook function.

```javascript
function (hook) { // an arrow func cannot be used because we need 'this'
  // ...
  hooks.combine(hook1, hook2, hook3).call(this, hook)
    .then(hook => {});
}
```

__Options:__

- `hooks` (*optional*) - The hooks to run.

> **ProTip:** `combine` is primarily intended to be used within your custom hooks,
not when [registering hooks.](./hooks.md#registering-hooks).
Its more convenient to use the following when registering hooks:
```javascript
const workflow = [hook1(), hook2(), ...];
app.service(...).hooks({
  before: {
    update: [...workflow],
    patch: [...workflow],
  },
});
```


## debug

### `debug(label)` [source](https://github.com/feathersjs/feathers-hooks-common/blob/master/src/services/debug.js)

Display current info about the hook to console.

- Used as a `before` or `after` hook.

```javascript
const { debug } = require('feathers-hooks-common');

debug('step 1')
// * step 1
// type: before, method: create
// data: { name: 'Joe Doe' }
// query: { sex: 'm' }
// result: { assigned: true }
```

__Options:__

- `label` (*optional*) - Label to identify the debug listing.


## dePopulate

### `dePopulate()` [source](https://github.com/feathersjs/feathers-hooks-common/blob/master/src/services/de-populate.js)

Removes joined and [computed](#added-properties) properties, as well any profile information.
Populated and serialized items may, after dePopulate, be used in `service.patch(id, items)` calls.

- Used as a **before** or **after** hook on any service method.
- Supports multiple result items, including paginated `find`.
- Supports an array of keys in `field`.

See also populate, serialize.


## disallow

### `disallow(...providers)` [source](https://github.com/feathersjs/feathers-hooks-common/blob/master/src/services/disallow.js)

Disallows access to a service method completely or for specific providers. All providers
(REST, Socket.io and Primus) set the hook.params.provider property, and disallow checks this.

- Used as a `before` hook.

```js
app.service('users').before({
  // Users can not be created by external access
  create: hooks.disallow('external'),
  // A user can not be deleted through the REST provider
  remove: hooks.disallow('rest'),
  // disallow calling `update` completely (e.g. to allow only `patch`)
  update: hooks.disallow(),
  // disallow the remove hook if the user is not an admin
  remove: hooks.when(hook => !hook.params.user.isAdmin, hooks.disallow())
});
```

> **ProTip** Service methods that are not implemented do not need to be disallowed.

__Options:__

- `providers` (*optional*, default: disallows everything) - The transports that you want to disallow this service method for. Options are:
    - `socketio` - will disallow the method for the Socket.IO provider
    - `primus` - will disallow the method for the Primus provider
    - `rest` - will disallow the method for the REST provider
    - `external` - will disallow access from all providers other than the server.
    - `server` - will disallow access for the server


## disableMultiItemChange

### `disableMultiItemChange()` [source](https://github.com/feathersjs/feathers-hooks-common/blob/master/src/services/disable-multi-item-change.js)

Disables update, patch and remove methods from using null as an id, e.g. remove(null).
A null id affects all the items in the DB, so accidentally using it may have undesirable results.

- Used as a `before` hook.

```js
app.service('users').before({
  update: hooks.disableMultiItemChange(),
});
```


## discard

### `discard(... fieldNames)` [source](https://github.com/feathersjs/feathers-hooks-common/blob/master/src/services/discard.js)

Delete the given fields either from the data submitted or from the result. If the data is an array or a paginated `find` result the hook will Delete the field(s) for every item.

- Used as a `before` hook for `create`, `update` or `patch`.
- Used as an `after` hook.
- Field names support dot notation e.g. `name.address.city`.
- Supports multiple data items, including paginated `find`.

```js
const { discard } = require('feathers-hooks-common');

// Delete the hashed `password` and `salt` field after all method calls
app.service('users').after(discard('password', 'salt'));

// Delete _id for `create`, `update` and `patch`
app.service('users').before({
  create: discard('_id', 'password'),
  update: discard('_id'),
  patch: discard('_id')
})
```

> **ProTip:** This hook will always delete the fields,
unlike the `remove` hook which only deletes the fields if the service call was made by a client.

---

> **ProTip:** You can replace `remove('name')` with `iff(isProvider('external'), discard('name'))`.
The latter does not contains any hidden "magic".

__Options:__

- `fieldNames` (*required*) - One or more fields you want to remove from the object(s).

See also remove.


## else

### `iff(...).else(...hookFuncs)` [source](https://github.com/feathersjs/feathers-hooks-common/blob/master/src/common/iff.js#L10)

`iff().else()` is similar to `iff` and `iffElse`.
Its syntax is more suitable for writing nested conditional hooks.
If the predicate in the `iff()` is falsey, run the hooks in `else()` sequentially.

- Used as a `before` or `after` hook.
- Hooks to run may be sync, Promises or callbacks.
- `feathers-hooks` catches any errors thrown in the predicate or hook.

```javascript
service.before({
  create:
    hooks.iff(isProvider('server'),
      hookA,
      hooks.iff(isProvider('rest'), hook1, hook2, hook3)
        .else(hook4, hook5),
      hookB
    )
      .else(
        hooks.iff(hook => hook.path === 'users', hook6, hook7)
      )
});
```
or: 

```javascript
service.before({
  create:
    hooks.iff(isServer, [
      hookA,
      hooks.iff(isProvider('rest'), [hook1, hook2, hook3])
        .else([hook4, hook5]),
      hookB
    ])
      .else([
        hooks.iff(hook => hook.path === 'users', [hook6, hook7])
      ])
});
```

__Options:__

- `hookFuncs` (*optional*) - Zero or more hook functions.
They may include other conditional hooks.
Or you can use an array of hook functions as the second parameter.

See also iff, iffElse, when, unless, isNot, isProvider.

> **This** The predicate and hook functions in the if, else and iffElse hooks
will not be called with `this` set to the service.
Use `hook.service` instead.


## every

### `every(... hookFuncs)` [source](https://github.com/feathersjs/feathers-hooks-common/blob/master/src/common/every.js)

Run hook functions in parallel.
Return `true` if every hook function returned a truthy value.

- Used as a predicate function with conditional hooks.
- The current `hook` is passed to all the hook functions, and they are run in parallel.
- Hooks to run may be sync or Promises only.
- `feathers-hooks` catches any errors thrown in the predicate.

```javascript
service.before({
  create: hooks.iff(hooks.every(hook1, hook2, ...), hookA, hookB, ...)
});
```
```javascript
hooks.every(hook1, hook2, ...).call(this, currentHook)
  .then(bool => { ... });
```

__Options:__

- `hookFuncs` (*required*) Functions which take the current hook as a param and return a boolean result.

See also some.


## iff

### `iff(predicate: boolean|Promise|function, ...hookFuncs: HookFunc[]): HookFunc` [source](https://github.com/feathersjs/feathers-hooks-common/blob/master/src/common/iff.js)

Resolve the predicate to a boolean.
Run the hooks sequentially if the result is truthy.

- Used as a `before` or `after` hook.
- Predicate may be a sync or async function.
- Hooks to run may be sync, Promises or callbacks.
- `feathers-hooks` catches any errors thrown in the predicate or hook.

```javascript
const { iff, populate } = require('feathers-hooks-common');
const isNotAdmin = adminRole => hook => hook.params.user.roles.indexOf(adminRole || 'admin') === -1;

app.service('workOrders').after({
  // async predicate and hook
  create: iff(
    () => new Promise((resolve, reject) => { ... }),
    populate('user', { field: 'authorisedByUserId', service: 'users' })
  )
});

app.service('workOrders').after({
  // sync predicate and hook
  find: [ iff(isNotAdmin(), hooks.remove('budget')) ]
});
```

or with the array syntax:

```javascript
app.service('workOrders').after({
  find: [ iff(isNotAdmin(), [hooks.remove('budget'), hooks.remove('password')]
});
```
__Options:__

- `predicate` (*required*) - Determines if hookFuncs should be run or not.
If a function, `predicate` is called with the hook as its param.
It returns either a boolean or a Promise that evaluates to a boolean
- `hookFuncs` (*optional*) - Zero or more hook functions. 
They may include other conditional hooks. 
Or you can use an array of hook functions as the second parameter.

See also iffElse, else, when, unless, isNot, isProvider.

> **This** The predicate and hook functions in the if, else and iffElse hooks
will not be called with `this` set to the service.
Use `hook.service` instead.

## iffElse

### `iffElse(predicate, trueHooks, falseHooks)` [source](https://github.com/feathersjs/feathers-hooks-common/blob/master/src/common/iff-else.js)

Resolve the predicate to a boolean.
Run the first set of hooks sequentially if the result is truthy,
the second set otherwise.

- Used as a `before` or `after` hook.
- Predicate may be a sync or async function.
- Hooks to run may be sync, Promises or callbacks.
- `feathers-hooks` catches any errors thrown in the predicate or hook.

```javascript
const { iffElse, populate, serialize } = require('feathers-hooks-common');
app.service('purchaseOrders').after({
  create: iffElse(() => { ... },
    [populate(poAccting), serialize( ... )],
    [populate(poReceiving), serialize( ... )]
  )
});
```

__Options:__

- `predicate` (*required*) - Determines if hookFuncs should be run or not.
If a function, `predicate` is called with the hook as its param.
It returns either a boolean or a Promise that evaluates to a boolean
- `trueHooks` (*optional*) - Zero or more hook functions run when `predicate` is truthy.
- `falseHooks` (*optional*) - Zero or more hook functions run when `predicate` is false.

See also iff, else, when, unless, isNot, isProvider.

> **This** The predicate and hook functions in the if, else and iffElse hooks
will not be called with `this` set to the service.
Use `hook.service` instead.

## isNot

### `isNot(predicate)` [source](https://github.com/feathersjs/feathers-hooks-common/blob/master/src/common/is-not.js)

Negate the `predicate`.

- Used as a predicate with conditional hooks.
- Predicate may be a sync or async function.
- `feathers-hooks` catches any errors thrown in the predicate.

```javascript
import hooks, { iff, isNot, isProvider } from 'feathers-hooks-common';
const isRequestor = () => hook => new Promise(resolve, reject) => ... );

app.service('workOrders').after({
  iff(isNot(isRequestor()), hooks.remove( ... ))
});
```

__Options:__

- `predicate` (*required*) - A function which returns either a boolean or a Promise that resolves to a boolean.

See also iff, iffElse, else, when, unless, isProvider.


## isProvider

### `isProvider(provider)` [source](https://github.com/feathersjs/feathers-hooks-common/blob/master/src/services/is-provider.js)

Check which transport called the service method.
All providers ([REST](./rest.md), [Socket.io](./socketio.md) and [Primus](./primus.md)) set the `params.provider` property which is what `isProvider` checks for.

 - Used as a predicate function with conditional hooks.

```javascript
import { iff, isProvider, remove } from 'feathers-hooks-common';

app.service('users').after({
  iff(isProvider('external'), remove( ... ))
});
```

__Options:__

- `provider` (*required*) - The transport that you want this hook to run for. Options are:
  - `server` - Run the hook if the server called the service method.
  - `external` - Run the hook if any transport other than the server called the service method.
  - `socketio` - Run the hook if the Socket.IO provider called the service method.
  - `primus` - If the Primus provider.
  - `rest` - If the REST provider.
- `providers` (*optional*) - Other transports that you want this hook to run for.

See also iff, iffElse, else, when, unless, isNot, isProvider.


## lowerCase

### `lowerCase(... fieldNames)` [source](https://github.com/feathersjs/feathers-hooks-common/blob/master/src/services/lower-case.js)

Lower cases the given fields either in the data submitted or in the result. If the data is an array or a paginated `find` result the hook will lowercase the field(s) for every item.

- Used as a `before` hook for `create`, `update` or `patch`.
- Used as an `after` hook.
- Field names support dot notation.
- Supports multiple data items, including paginated `find`.

```js
const { lowerCase } = require('feathers-hooks-common');

// lowercase the `email` and `password` field before a user is created
app.service('users').before({
  create: lowerCase('email', 'username')
});
```

__Options:__

- `fieldNames` (*required*) - One or more fields that you want to lowercase from the retrieved object(s).

See also upperCase.


## paramsFromClient

### `paramsFromClient(... whitelist)` [source](https://github.com/feathersjs/feathers-hooks-common/blob/master/src/services/params-from-client.js)

A hook, on the server, for passing `params` from the client to the server.

- Used as a `before` hook.
- Companion to the client utility function `paramsForServer`.

By default, only the `hook.params.query` object is transferred
to the server from a Feathers client,
for security among other reasons.
However you can explicitly transfer other `params` props with
the client utility function `paramsForServer` in conjunction with
the hook function `paramsFromClient` on the server.

```js
// client
import { paramsForServer } from 'feathers-hooks-common';
service.patch(null, data, paramsForServer({
  query: { dept: 'a' }, populate: 'po-1', serialize: 'po-mgr'
}));

// server
const { paramsFromClient } = require('feathers-hooks-common');
service.before({ all: [
  paramsFromClient('populate', 'serialize', 'otherProp'), myHook
]});

// hook.params will now be
// { query: { dept: 'a' }, populate: 'po-1', serialize: 'po-mgr' } }
```

__Options:__

- `whitelist` (*optional*) Names of the permitted props;
other props are ignored. This is a security feature.

> **ProTip** You can use the same technique for service calls made on the server.

See `util: paramsForServer`.


## pluck

### `pluck(... fieldNames)` [source](https://github.com/feathersjs/feathers-hooks-common/blob/master/src/services/pluck.js)

Discard all other fields except for the provided fields either from the data submitted or from the result. If the data is an array or a paginated `find` result the hook will remove the field(s) for every item.

- Used as a `before` hook for `create`, `update` or `patch`.
- Used as an `after` hook.
- Field names support dot notation.
- Supports multiple data items, including paginated `find`.

```js
const { pluck } = require('feathers-hooks-common');

// Only retain the hashed `password` and `salt` field after all method calls
app.service('users').after(pluck('password', 'salt'));

// Only keep the _id for `create`, `update` and `patch`
app.service('users').before({
  create: pluck('_id'),
  update: pluck('_id'),
  patch: pluck('_id')
})
```

> **ProTip:** This hook will only fire when `params.provider` has a value, i.e. when it is an external request over REST or Sockets.

__Options:__

- `fieldNames` (*required*) - One or more fields that you want to retain from the object(s).

All other fields will be discarded.


## pluckQuery

`pluckQuery(... fieldNames)` [source](https://github.com/feathersjs/feathers-hooks-common/blob/master/src/services/pluck-query.js)

Discard all other fields except for the given fields from the query params.

- Used as a `before` hook.
- Field names support dot notation.
- Supports multiple data items, including paginated `find`.

```js
const { pluckQuery } = require('feathers-hooks-common');

// Discard all other fields except for _id from the query
// for all service methods
app.service('users').before({
  all: pluckQuery('_id')
});
```

> **ProTip:** This hook will only fire when `params.provider` has a value, i.e. when it is an external request over REST or Sockets.

__Options:__

- `fieldNames` (*optional*) - The fields that you want to retain from the query object. All other fields will be discarded.



## populate

### `populate(options: Object): HookFunc` [source](https://github.com/feathersjs/feathers-hooks-common/blob/master/src/services/populate.js)

Populates items *recursively* to any depth. Supports 1:1, 1:n and n:1 relationships.

- Used as a **before** or **after** hook on any service method.
- Supports multiple result items, including paginated `find`.
- Permissions control what a user may see.
- Provides performance profile information.
- Backward compatible with the old FeathersJS `populate` hook.

#### Examples

- 1:1 relationship

```javascript
// users like { _id: '111', name: 'John', roleId: '555' }
// roles like { _id: '555', permissions: ['foo', bar'] }
import { populate } from 'feathers-hooks-common';

const userRoleSchema = {
  include: {
    service: 'roles',
    nameAs: 'role',
    parentField: 'roleId',
    childField: '_id'
  }
};

app.service('users').hooks({
  after: {
    all: populate({ schema: userRoleSchema })
  }
});

// result like
// { _id: '111', name: 'John', roleId: '555',
//   role: { _id: '555', permissions: ['foo', bar'] } }
```

- 1:n relationship

```javascript
// users like { _id: '111', name: 'John', roleIds: ['555', '666'] }
// roles like { _id: '555', permissions: ['foo', 'bar'] }
const userRolesSchema = {
  include: {
    service: 'roles',
    nameAs: 'roles',
    parentField: 'roleIds',
    childField: '_id'
  }
};

usersService.hooks({
  after: {
    all: populate({ schema: userRolesSchema })
  }
});

// result like
// { _id: '111', name: 'John', roleIds: ['555', '666'], roles: [
//   { _id: '555', permissions: ['foo', 'bar'] }
//   { _id: '666', permissions: ['fiz', 'buz'] }
// ]}
```

- n:1 relationship

```javascript
// posts like { _id: '111', body: '...' }
// comments like { _id: '555', text: '...', postId: '111' }
const postCommentsSchema = {
  include: {
    service: 'comments',
    nameAs: 'comments',
    parentField: '_id',
    childField: 'postId'
  }
};

postService.hooks({
  after: {
    all: populate({ schema: postCommentsSchema })
  }
});

// result like
// { _id: '111', body: '...' }, comments: [
//   { _id: '555', text: '...', postId: '111' }
//   { _id: '666', text: '...', postId: '111' }
// ]}
```

- Multiple and recursive includes

```javascript
const schema = {
  service: '...',
  permissions: '...',
  include: [
    {
      service: 'users',
      nameAs: 'authorItem',
      parentField: 'author',
      childField: 'id',
      include: [ ... ],
    },
    {
      service: 'comments',
      parentField: 'id',
      childField: 'postId',
      query: {
        $limit: 5,
        $select: ['title', 'content', 'postId'],
        $sort: {createdAt: -1}
      },
      select: (hook, parent, depth) => ({ $limit: 6 }),
      asArray: true,
      provider: undefined,
    },
    {
      service: 'users',
      permissions: '...',
      nameAs: 'readers',
      parentField: 'readers',
      childField: 'id'
    }
  ],
};

module.exports.after = {
  all: populate({ schema, checkPermissions, profile: true })
};
```

- Flexible relationship, similar to the n:1 relationship example above

```javascript
// posts like { _id: '111', body: '...' }
// comments like { _id: '555', text: '...', postId: '111' }
const postCommentsSchema = {
  include: {
    service: 'comments',
    nameAs: 'comments',
    select: (hook, parentItem) => ({ postId: parentItem._id }),
  }
};

postService.hooks({
  after: {
    all: populate({ schema: postCommentsSchema })
  }
});

// result like
// { _id: '111', body: '...' }, comments: [
//   { _id: '555', text: '...', postId: '111' }
//   { _id: '666', text: '...', postId: '111' }
// ]}
```

#### Options

- `schema` (*required*, object or function) How to populate the items. [Details are below.](#schema)
    - Function signature `(hook: Hook, options: Object): Object`
    - `hook` The hook.
    - `options` The `options` passed to the populate hook.
- `checkPermissions` [optional, default () => true] Function to check if the user is allowed to perform this populate,
or include this type of item. Called whenever a `permissions` property is found.
    - Function signature `(hook: Hook, service: string, permissions: any, depth: number): boolean`
    - `hook` The hook.
    - `service` The name of the service being included, e.g. users, messages.
    - `permissions` The value of the permissions property.
    - `depth` How deep the include is in the schema. Top of schema is 0.
    - Return truesy to allow the include.
- `profile` [optional, default false] If `true`, the populated result is to contain a performance profile.
Must be `true`, truesy is insufficient.

#### Schema

The data currently in the hook will be populated according to the schema. The schema starts with:

```javascript
const schema = {
  service: '...',
  permissions: '...',
  include: [ ... ]
};
```

- `service` (*optional*) The name of the service this schema is to be used with.
This can be used to prevent a schema designed to populate 'blog' items
from being incorrectly used with `comment` items.
- `permissions` (*optional*, any type of value) Who is allowed to perform this populate. See `checkPermissions` above.
- `include` (*optional*) Which services to join to the data.

##### Include

The `include` array has an element for each service to join. They each may have:

```javascript
{ service: 'comments',
  nameAs: 'commentItems',
  permissions: '...',
  parentField: 'id',
  childField: 'postId',
  query: {
    $limit: 5,
    $select: ['title', 'content', 'postId'],
    $sort: {createdAt: -1}
  },
  select: (hook, parent, depth) => ({ $limit: 6 }),
  asArray: true,
  paginate: false,
  provider: undefined,
  useInnerPopulate: false,
  include: [ ... ]
}
```

> **ProTip** Instead of setting `include` to a 1-element array,
you can set it to the include object itself,
e.g. `include: { service: ..., nameAs: ..., ... }`.

- `service` [required, string] The name of the service providing the items.
- `nameAs` [optional, string, default is service] Where to place the items from the join.
Dot notation is allowed.
- `permissions` [optional, any type of value] Who is allowed to perform this join. See `checkPermissions` above.
- `parentField` [required if neither query nor select, string] The name of the field in the parent item for the [relation](#relation).
Dot notation is allowed.
- `childField` [required if neither query nor select, string] The name of the field in the child item for the [relation](#relation).
Dot notation is allowed and will result in a query like `{ 'name.first': 'John' }`
which is not suitable for all DBs.
You may use `query` or `select` to create a query suitable for your DB.
- `query` [optional, object] An object to inject into the query in `service.find({ query: { ... } })`.
- `select` [optional, function] A function whose result is injected into the query.
    - Function signature `(hook: Hook, parentItem: Object, depth: number): Object`
    - `hook` The hook.
    - `parentItem` The parent item to which we are joining.
    - `depth` How deep the include is in the schema. Top of schema is 0.
- `asArray` [optional, boolean, default false] Force a single joined item to be stored as an array.
- `paginate` {optional, boolean or number, default false]
Controls pagination for this service.
    - `false` No pagination. The default.
    - `true` Use the configuration provided when the service was configured/
    - A number. The maximum number of items to include.
- `provider` [optional] `find` calls are made to obtain the items to be joined.
These, by default, are initialized to look like they were made
by the same provider as that getting the base record.
So when populating the result of a call made via `socketio`,
all the join calls will look like they were made via `socketio`.
Alternative you can set `provider: undefined` and the calls for that join will
look like they were made by the server.
The hooks on the service may behave differently in different situations.
- `useInnerPopulate` [optional] Populate, when including records from a child service,
ignores any populate hooks defined for that child service.
The useInnerPopulate option will run those populate hooks.
This allows the populate for a base record to include child records
containing their own immediate child records,
without the populate for the base record knowing what those grandchildren populates are.
- `include` [optional] The new items may themselves include other items. The includes are recursive.

Populate forms the query `[childField]: parentItem[parentField]` when the parent value is not an array.
This will include all child items having that value.

Populate forms the query `[childField]: { $in: parentItem[parentField] }` when the parent value is an array.
This will include all child items having any of those values.

A populate hook for, say, `posts` may include items from `users`.
Should the `users` hooks also include a populate,
that `users` populate hook will not be run for includes arising from `posts`.

> **ProTip** The populate interface only allows you to directly manipulate `hook.params.query`.
You can manipulate the rest of `hook.params` by using the
[`client`](https://docs.feathersjs.com/v/auk/hooks/common/utils.html#client) hook,
along with something like `query: { ..., $client: { paramsProp1: ..., paramsProp2: ... } }`.

#### Added properties

Some additional properties are added to populated items. The result may look like:

```javascript
{ ...
  _include: [ 'post' ],
  _elapsed: { post: 487947, total: 527118 },
  post:
    { ...
      _include: [ 'authorItem', 'commentsInfo', 'readersInfo' ],
      _elapsed: { authorItem: 321973, commentsInfo: 469375, readersInfo: 479874, total: 487947 },
      _computed: [ 'averageStars', 'views' ],
      authorItem: { ... },
      commentsInfo: [ { ... }, { ... } ],
      readersInfo: [ { ... }, { ... } ]
} }
```

- `_include` The property names containing joined items.
- `_elapsed` The elapsed time in nano-seconds (where 1,000,000 ns === 1 ms) taken to perform each include,
as well as the total taken for them all.
This delay is mostly attributed to your DB.
- `_computed` The property names containing values computed by the `serialize` hook.

The [depopulate](#depopulate) hook uses these fields to remove all joined and computed values.
This allows you to then `service.patch()` the item in the hook.

#### Joining without using related fields

Populate can join child records to a parent record using the related columns
`parentField` and `childField`.
However populate's `query` and `select` options may be used to related the
records without needing to use the related columns.
This is a more flexible, non-SQL-like way of relating records.
It easily supports dynamic, run-time schemas since the `select` option may be
a function.

#### Populate examples

##### Selecting schema based on UI needs

Consider a Purchase Order item.
An Accounting oriented UI will likely want to populate the PO with Invoice items.
A Receiving oriented UI will likely want to populate with Receiving Slips.

Using a function for `schema` allows you to select an appropriate schema based on the need.
The following example shows how the client can ask for the type of schema it needs.

```javascript
// on client
import { paramsForServer } from 'feathers-hooks-common';
purchaseOrders.get(id, paramsForServer({ schema: 'po-acct' })); // pass schema name to server
// or
purchaseOrders.get(id, paramsForServer({ schema: 'po-rec' }));
```

```javascript
// on server
import { paramsFromClient } from 'feathers-hooks-common';
const poSchemas = {
  'po-acct': /* populate schema for Accounting oriented PO e.g. { include: ... } */,
  'po-rec': /* populate schema for Receiving oriented PO */
};

purchaseOrders.before({
  all: paramsfromClient('schema')
});

purchaseOrders.after({
  all: populate({ schema: hook => poSchemas[hook.params.schema] }),
});
```

##### Using permissions

For a simplistic example,
assume `hook.params.users.permissions` is an array of the service names the user may use,
e.g. `['invoices', 'billings']`.
These can be used to control which types of items the user can see.

The following populate will only be performed for users whose `user.permissions` contains `'invoices'`.

```javascript
const schema = {
  include: [
    {
      service: 'invoices',
      permissions: 'invoices',
      ...
    }
  ]
};

purchaseOrders.after({
  all: populate(schema, (hook, service, permissions) => hook.params.user.permissions.includes(service))
});
```

See also dePopulate, serialize.


## preventChanges

### `preventChanges(... fieldNames)` [source](https://github.com/feathersjs/feathers-hooks-common/blob/master/src/services/prevent-changes.js)

Prevents the specified fields from being patched.

- Used as a `before` hook for `patch`.
- Field names support dot notation e.g. `name.address.city`.

```js
const { preventChanges } = require('feathers-hooks-common');

app.service('users').before({
  patch: preventChanges('security.badge')
})
```

__Options:__

- `fieldNames` (*required*) - One or more fields which may not be patched.

> Consider using `validateSchema` if you would rather specify which fields are allowed to change.


## remove

### `remove(... fieldNames)` [source](https://github.com/feathersjs/feathers-hooks-common/blob/master/src/services/remove.js)

Remove the given fields either from the data submitted or from the result. If the data is an array or a paginated `find` result the hook will remove the field(s) for every item.

- Used as a `before` hook for `create`, `update` or `patch`.
- Used as an `after` hook.
- Field names support dot notation e.g. `name.address.city`.
- Supports multiple data items, including paginated `find`.

```js
const { remove } = require('feathers-hooks-common');

// Remove the hashed `password` and `salt` field after all method calls
app.service('users').after(remove('password', 'salt'));

// Remove _id for `create`, `update` and `patch`
app.service('users').before({
  create: remove('_id', 'password'),
  update: remove('_id'),
  patch: remove('_id')
})
```

> **ProTip:** This hook will only fire when `params.provider` has a value, i.e. when it is an external request over REST or Sockets.

__Options:__

- `fieldNames` (*required*) - One or more fields you want to remove from the object(s).

See also discard.


## removeQuery

`removeQuery(... fieldNames)` [source](https://github.com/feathersjs/feathers-hooks-common/blob/master/src/services/remove-query.js)

Remove the given fields from the query params.

- Used as a `before` hook.
- Field names support dot notation
- Supports multiple data items, including paginated `find`.

```js
const { removeQuery } = require('feathers-hooks-common');

// Remove _id from the query for all service methods
app.service('users').before({
  all: removeQuery('_id')
});
```

> **ProTip:** This hook will only fire when `params.provider` has a value, i.e. when it is an external request over REST or Sockets.

__Options:__

- `fieldNames` (*optional*) - The fields that you want to remove from the query object.


## serialize

### `serialize(schema: Object|Function): HookFunc` [source](https://github.com/feathersjs/feathers-hooks-common/blob/master/src/services/serialize.js)

Remove selected information from populated items. Add new computed information.
Intended for use with the `populate` hook.

```javascript
const schema = {
  only: 'updatedAt',
  computed: {
    commentsCount: (recommendation, hook) => recommendation.post.commentsInfo.length,
  },
  post: {
    exclude: ['id', 'createdAt', 'author', 'readers'],
    authorItem: {
      exclude: ['id', 'password', 'age'],
      computed: {
        isUnder18: (authorItem, hook) => authorItem.age < 18,
      },
    },
    readersInfo: {
      exclude: 'id',
    },
    commentsInfo: {
      only: ['title', 'content'],
      exclude: 'content',
    },
  },
};
purchaseOrders.after({
  all: [ populate( ... ), serialize(schema) ]
});
```

Options

- `schema` [required, object or function] How to serialize the items.
    - Function signature `(hook: Hook): Object`
    - `hook` The hook.
    
The schema reflects the structure of the populated items.
The base items for the example above have [included](#include) `post` items,
which themselves have included `authorItem`, `readersInfo` and `commentsInfo` items.

The schema for each set of items may have

- `only` [optional, string or array of strings] The names of the fields to keep in each item.
The names for included sets of items plus `_include` and `_elapsed` are not removed by `only`.
- `exclude` [optional, string or array of strings] The names of fields to drop in each item.
You may drop, at your own risk, names of included sets of items, `_include` and `_elapsed`.
- `computed` [optional, object with functions] The new names you want added and how to compute their values.
    - Object is like `{ name: func, ...}`
    - `name` The name of the field to add to the items.
    - `func` Function with signature `(item, hook)`.
        - `item` The item with all its initial values, plus all of its included items.
        The function can still reference values which will be later removed by `only` and `exclude`.
        - `hook` The hook passed to serialize.

#### Serialize examples

##### A simple serialize

The populate [example above](#a-simple-populate) produced the result

```javascript
{ id: 9, title: 'The unbearable ligthness of FeathersJS', author: 5, yearBorn: 1990,
  authorItem: { id: 5, email: 'john.doe@gmail.com', name: 'John Doe' },
  _include: ['authorItem']
}
```

We could tailor the result more to what we need with:

```javascript
const serializeSchema = {
  only: ['title'],
  authorItem: {
    only: ['name']
    computed: {
      isOver18: (authorItem, hook) => new Date().getFullYear() - authorItem.yearBorn >= 18,
    },
  }
};
app.service('posts').before({
  get: [ hooks.populate({ schema }), serialize(serializeSchema) ],
  find: [ hooks.populate({ schema }), serialize(serializeSchema) ]
});
```

The result would now be

```javascript
{ title: 'The unbearable ligthness of FeathersJS',
  authorItem: { name: 'John Doe', isOver18: true, _computed: ['isOver18'] },
  _include: ['authorItem'],
}
```


##### Using permissions

Consider an Employee item.
The Payroll Manager would be permitted to see the salaries of other department heads.
No other person would be allowed to see them.

Using a function for `schema` allows you to select an appropriate schema based on the need.

Assume `hook.params.user.roles` contains an array of roles which the user performs.
The Employee item can be serialized differently for the Payroll Manager than for anyone else.

```javascript
const payrollSerialize = {
  'payrollMgr': { /* serialization schema for Payroll Manager */},
  'payroll': { /* serialization schema for others */}
};

employees.after({
  all: [
    populate( ... ),
    serialize(hook => payrollSerialize[
      hook.params.user.roles.contains('payrollMgr') ? 'payrollMgr' : 'payroll'
    ])    
  ]
});
```


## setCreatedAt

### `setCreatedAt(fieldName = 'createdAt', ... fieldNames)` [source](https://github.com/feathersjs/feathers-hooks-common/blob/master/src/services/set-created-at.js)

Add the fields with the current date-time.

- Used as a `before` hook for `create`, `update` or `patch`.
- Used as an `after` hook.
- Field names support dot notation.
- Supports multiple data items, including paginated `find`.

> **ProTip** `setCreatedAt` will be deprecated, so use `setNow` instead.

```js
const { setCreatedAt } = require('feathers-hooks-common');

// set the `createdAt` field before a user is created
app.service('users').before({
  create: [ setCreatedAt() ]
});
```

__Options:__

- `fieldName` (*optional*, default: `createdAt`) - The field that you want to add with the current date-time to the retrieved object(s).
- `fieldNames` (*optional*) - Other fields to add with the current date-time.

See also setUpdatedAt.


## setNow

### `setNow(... fieldNames)` [source](https://github.com/feathersjs/feathers-hooks-common/blob/master/src/services/set-now.js)

Add the fields with the current date-time.

- Used as a `before` hook for `create`, `update` or `patch`.
- Used as an `after` hook.
- Field names support dot notation.
- Supports multiple data items, including paginated `find`.

```js
const { setNow } = require('feathers-hooks-common');

app.service('users').before({
  create: setNow('createdAt', 'updatedAt')
});
```

__Options:__

- `fieldNames` (*required*, at least one) - The fields that you want to add with the current date-time to the retrieved object(s).

> **ProTip** Use `setNow` rather than `setCreatedAt` or `setUpdatedAt`.


## setSlug

### `setSlug(slug, fieldName = 'query.' + slug)` [source](https://github.com/feathersjs/feathers-hooks-common/blob/master/src/services/set-slug.js)

A service may have a slug in its URL, e.g. `storeId` in
`app.use('/stores/:storeId/candies', new Service());`.
The service gets slightly different values depending on the transport used by the client.

| transport | `hook.data.storeId` | `hook.params.query` | code run on client |
| -- | -- | -- | -- |
| socketio | `undefined` | `{ size: 'large', storeId: '123' }` | `candies.create({ name: 'Gummi', qty: 100 }, { query: { size: 'large', storeId: '123' } })` |
| rest | `:storeId` | ... same as above | ... same as above |
| raw HTTP | `123` | `{ size: 'large' }` | `fetch('/stores/123/candies?size=large', ..` |

This hook normalizes the difference between the transports. A hook of
`all: [ hooks.setSlug('storeId') ]`
provides a normalized `hook.params.query` of
`{ size: 'large', storeId: '123' }` for the above cases.

- Used as a `before` hook.
- Field names support dot notation.

```js
const { setSlug } = require('feathers-hooks-common');

app.service('stores').before({
  create: [ setSlug('storeId') ]
});
```

__Options:__

- `slug` (*required*) - The slug as it appears in the route, e.g. `storeId` for `/stores/:storeId/candies` .
- `fieldName` (*optional*, default: `query[slugId]`) - The field to contain the slug value.


## setUpdatedAt

### `setUpdatedAt(fieldName = 'updatedAt', ...fieldNames)` [source](https://github.com/feathersjs/feathers-hooks-common/blob/master/src/services/set-updated-at.js)

Add or update the fields with the current date-time.

- Used as a `before` hook for `create`, `update` or `patch`.
- Used as an `after` hook.
- Field names support dot notation.
- Supports multiple data items, including paginated `find`.

> **ProTip** `setUpdatedAt` will be deprecated, so use `setNow` instead.

```js
const { setUpdatedAt } = require('feathers-hooks-common');

// set the `updatedAt` field before a user is created
app.service('users').before({
  create: [ setUpdatedAt() ]
});
```

__Options:__

- `fieldName` (*optional*, default: `updatedAt`) - The fields that you want to add or update in the retrieved object(s).
- `fieldNames` (*optional*) - Other fields to add or update with the current date-time.

See also setCreatedAt.


## sifter

### `sifter(mongoQueryFunc))` [source](https://github.com/feathersjs/feathers-hooks-common/blob/master/src/services/sifter.js)

All official Feathers database adapters support a common way for querying,
sorting, limiting and selecting find method calls.
These are limited to what is commonly supported by all the databases.

The `sifter` hook provides an extensive MongoDB-like selection capabilities,
and it may be used to more extensively select records.

- Used as an `after` hook for `find`.
- SProvides extensive MongoDB-like selection capabilities.

> **ProTip** `sifter` filters the result of a `find` call.
Therefore more records will be physically read than needed.
You can use the Feathers database adapters `query` to reduce this number.

```js
const sift = require('sift');
const { sifter } = require('feathers-hooks-common');

const selectCountry = hook => sift({ 'address.country': hook.params.country });

app.service('stores').after({
  find: sifter(selectCountry),
});
```

```js
const sift = require('sift');
const { sifter } = require('feathers-hooks-common');

const selectCountry = country => () => sift({ address : { country: country } });

app.service('stores').after({
  find: sifter(selectCountry('Canada')),
});
```

__Options:__

- `mongoQueryFunc` (*required*) - Function similar to `hook => sift(mongoQueryObj)`.
Information about the `mongoQueryObj` syntax is available at
[sift](https://github.com/crcn/sift.js).


## softDelete

### `softDelete(fieldName = 'deleted')` [source](https://github.com/feathersjs/feathers-hooks-common/blob/master/src/services/soft-delete.js)

Marks items as `{ deleted: true }` instead of physically removing them.
This is useful when you want to discontinue use of, say, a department,
but you have historical information which continues to refer to the discontinued department.

- Used as a `before.all` hook to handle all service methods.
- Supports multiple data items, including paginated `find`.

```js
const { softDelete } = require('feathers-hooks-common');
const dept = app.service('departments');

dept.before({
  all: softDelete(),
});

// will throw if item is marked deleted.
dept.get(0).then()

// methods can be run avoiding softDelete handling
dept.get(0, { query: { $disableSoftDelete: true }}).then()
```
__Options:__

- `fieldName` (*optional*, default: `deleted`) - The name of the field holding the deleted flag.


## some

### `some(... hookFuncs)` [source](https://github.com/feathersjs/feathers-hooks-common/blob/master/src/common/some.js)

Run hook functions in parallel.
Return `true` if any hook function returned a truthy value.

- Used as a predicate function with conditional hooks.
- The current `hook` is passed to all the hook functions, and they are run in parallel.
- Hooks to run may be sync or Promises only.
- `feathers-hooks` catches any errors thrown in the predicate.

```javascript
service.before({
  create: hooks.iff(hooks.some(hook1, hook2, ...), hookA, hookB, ...)
});
```
```javascript
hooks.some(hook1, hook2, ...).call(this, currentHook)
  .then(bool => { ... });
```

__Options:__

- `hookFuncs` (*required*) Functions which take the current hook as a param and return a boolean result.

See also every.


## stashBefore

### `stashBefore(name)` [source](https://github.com/feathersjs/feathers-hooks-common/blob/master/src/services/stash-before.js)

Stash current value of record before mutating it.

- Used as a `before` hook for `get`, `update`, `patch` or `remove`.
- An `id` is required in the method call.

```javascript
service.before({
  patch: stashBefore()
});
```

__Options:__

- `name` (*optional* defaults to 'before') The name of the params property
to contain the current record value.


## traverse

### `traverse(transformer, getObject)` [source](https://github.com/feathersjs/feathers-hooks-common/blob/master/src/services/traverse.js)

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

> **ProTip:** GitHub's [substack/js-traverse](https://github.com/substack/js-traverse) documents the extensive methods and context available to the transformer function.

__Options:__

- `transformer` (*required*) - Called for every node and may change it in place.
- `getObject` (*optional*, defaults to `hook.data` or `hook.result`) -  Function with signature (hook) which returns the object to traverse.


## unless

### `unless(predicate, ...hookFuncs)` [source](https://github.com/feathersjs/feathers-hooks-common/blob/master/src/common/unless.js)

Resolve the predicate to a boolean.
Run the hooks sequentially if the result is falsey.

- Used as a `before` or `after` hook.
- Predicate may be a sync or async function.
- Hooks to run may be sync, Promises or callbacks.
- `feathers-hooks` catches any errors thrown in the predicate or hook.

```javascript
service.before({
  create:
    unless(isProvider('server'),
      hookA,
      unless(isProvider('rest'), hook1, hook2, hook3),
      hookB
    )
});
```

__Options:__

- `predicate` (*required*) - Determines if hookFuncs should be run or not.
If a function, `predicate` is called with the hook as its param.
It returns either a boolean or a Promise that evaluates to a boolean.
- `hookFuncs` (*optional*) - Zero or more hook functions.
They may include other conditional hook functions.

See also iff, iffElse, else, when, isNot, isProvider.


## validate

### `validate(validator)` [source](https://github.com/feathersjs/feathers-hooks-common/blob/master/src/services/validate.js)

Call a validation function from a `before` hook. The function may be sync or return a Promise.

- Used as a `before` hook for `create`, `update` or `patch`.

> **ProTip:** If you have a different signature for the validator then pass a wrapper as the validator e.g. `(values) => myValidator(..., values, ...)`.

<!-- -->

> **ProTip:** Wrap your validator in `callbackToPromise` if it uses a callback.

```javascript
const { callbackToPromise, validate } = require('feathers-hooks-common');

// function myCallbackValidator(values, cb) { ... }
const myValidator = callbackToPromise(myCallbackValidator, 1); // function requires 1 param
app.service('users').before({ create: validate(myValidator) });
```
   
__Options:__

- `validator` (*required*) - Validation function with signature `function validator(formValues, hook)`.

Sync functions return either an error object like `{ fieldName1: 'message', ... }` or null.
Validate will throw on an error object with `throw new errors.BadRequest({ errors: errorObject });`.

Promise functions should throw on an error or reject with
`new errors.BadRequest('Error message', { errors: { fieldName1: 'message', ... } });`
Their `.then` returns either sanitized values to replace `hook.data`, or null.

#### Example

Comprehensive validation may include the following:

- Object schema validation. Checking the item object contains the expected properties with values in the expected format. The values might get sanitized. Knowing the item is well formed makes further validation simpler.
- Re-running any validation supposedly already done on the front-end. It would an asset if the server can re-run the same code the front-end used.
- Performing any validation and sanitization unique to the server.

A full featured example of such a process appears below. It validates and sanitizes a new user before adding the user to the database.

- The form expects to be notified of errors in the format `{ email: 'Invalid email.', password: 'Password must be at least 8 characters.' }`.
- The form calls the server for async checking of selected fields when control leaves those fields. This for example could check that an email address is not already used by another user.
- The form does local sync validation when the form is submitted.
- The code performing the validations on the front-end is also used by the server.
- The server performs schema validation using Walmart's [Joi](https://github.com/hapijs/joi).
- The server does further validation and sanitization.

#### Validation using Validate

```javascript
// file /server/services/users/hooks/index.js
const auth = require('feathers-authentication').hooks;
const { callbackToPromise, remove, validate } = require('feathers-hooks-common');
const validateSchema = require('feathers-hooks-validate-joi');

const clientValidations = require('/common/usersClientValidations');
const serverValidations = require('/server/validations/usersServerValidations');
const schemas = require('/server/validations/schemas');

const serverValidationsSignup = callbackToPromise(serverValidations.signup, 1);

exports.before = {
  create: [
    validateSchema.form(schemas.signup, schemas.options), // schema validation
    validate(clientValidations.signup), // re-run form sync validation
    validate(values => clientValidations.signupAsync(values, 'someMoreParams')), // re-run form async
    validate(serverValidationsSignup), // run server validation
    remove('confirmPassword'),
    auth.hashPassword()
  ]
};
```

#### Validation routines for front and back-end.

Validations used on front-end. They are re-run by the server.

```javascript
// file /common/usersClientValidations
// Validations for front-end. Also re-run on server.
const clientValidations = {};

// sync validation of signup form on form submit
clientValidations.signup = values => {
  const errors = {};

  checkName(values.name, errors);
  checkUsername(values.username, errors);
  checkEmail(values.email, errors);
  checkPassword(values.password, errors);
  checkConfirmPassword(values.password, values.confirmPassword, errors);

  return errors;
};

// async validation on exit from some fields on form
clientValidations.signupAsync = values =>
  new Promise((resolve, reject) => {
    const errs = {};

    // set a dummy error
    errs.email = 'Already taken.';

    if (!Object.keys(errs).length) {
      resolve(null); // 'null' as we did not sanitize 'values'
    }
    reject(new errors.BadRequest('Values already taken.', { errors: errs }));
  });

module.exports = clientValidations;

function checkName(name, errors, fieldName = 'name') {
  if (!/^[\\sa-zA-Z]{8,30}$/.test((name || '').trim())) {
    errors[fieldName] = 'Name must be 8 or more letters or spaces.';
  }
}
```

Schema definitions used by the server.

```javascript
// file /server/validations/schemas
const Joi = require('joi');

const username = Joi.string().trim().alphanum().min(5).max(30).required();
const password = Joi.string().trim().regex(/^[\sa-zA-Z0-9]+$/, 'letters, numbers, spaces')
  .min(8).max(30).required();
const email = Joi.string().trim().email().required();

module.exports = {
  options: { abortEarly: false, convert: true, allowUnknown: false, stripUnknown: true },
  signup: Joi.object().keys({
    name: Joi.string().trim().min(8).max(30).required(),
    username,
    password,
    confirmPassword: password.label('Confirm password'),
    email
  })
};
```

Validations run by the server.

```javascript
// file /server/validations/usersServerValidations
// Validations on server. A callback function is used to show how the hook handles it.
module.exports = {
  signup: (data, cb) => {
    const formErrors = {};
    const sanitized = {};

    Object.keys(data).forEach(key => {
      sanitized[key] = (data[key] || '').trim();
    });

    cb(Object.keys(formErrors).length > 0 ? formErrors : null, sanitized);
  }
};
```

See also validateSchema.


## validateSchema

### `validateSchema(schema, ajv, options)` [source](https://github.com/feathersjs/feathers-hooks-common/blob/master/src/services/validate-schema.js)

Validate an object using [JSON-Schema](http://json-schema.org/) through [AJV](https://github.com/epoberezkin/ajv)

> **ProTip** There are some
[good tutorials](https://code.tutsplus.com/tutorials/validating-data-with-json-schema-part-1--cms-25343)
on using JSON-Schema with [ajv](https://github.com/epoberezkin/ajv).

- Used as a `before` or `after` hook.
- The hook will throw if the data does not match the JSON-Schema.
`error.errors` will, by default, contain an array of error messages.

> **ProTip** You may customize the error message format with a custom formatting function.
You could, for example, return `{ name1: message, name2: message }`
which could be more suitable for a UI.
        
> **ProTip** If you need to customize `ajv` with new keywords, formats or schemas, then instead of passing the `Ajv` constructor, you may pass in an instance of `Ajv` as the second parameter. In this case you need to pass `ajv` options to the `ajv` instance when `new`ing, rather than passing them in the third parameter of `validateSchema`. See the second example below. 

```javascript
const Ajv = require('ajv');
const createSchema = { /* JSON-Schema */ };
module.before({
  create: validateSchema(createSchema, Ajv)
});
```

```javascript
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true, $data: true });
ajv.addFormat('allNumbers', '^\d+$');
const createSchema = { /* JSON-Schema */ };
module.before({
  create: validateSchema(createSchema, ajv)
});
```

__Options:__

- `schema` (*required*) - The JSON-Schema.
- `ajv` (*required*) - The `ajv` validator. Could be either the `Ajv` constructor or an instance of it.
- `options` (*optional*) - Options. 
    - Any `ajv` options. Only effective when the second parameter is the `Ajv` constructor.
    - `addNewError` (*optional*) - Custom message formatter.
    Its a reducing function which works similarly to `Array.reduce()`.
    Its signature is
    `{ currentFormattedMessages: any, ajvError: AjvError, itemsLen: number, index: number }: newFormattedMessages`
        - `currentFormattedMessages` - Formatted messages so far. Initially `null`.
        - `ajvError` - [ajv error](https://github.com/epoberezkin/ajv#error-objects).
        - `itemsLen` - How many data items there are. 1-based.
        - `index` - Which item this is. 0-based.
        - `newFormattedMessages` - The function returns the updated formatted messages.

> **ProTip:** You can consider using [ajv-i18n](https://github.com/epoberezkin/ajv-i18n),
together with the [messages](https://github.com/epoberezkin/ajv#advanced-options)
option, to internationalize your error messages.

## when

An alias for [iff](#iff) [source](https://github.com/feathersjs/feathers-hooks-common/blob/master/src/common/iff.js)


## Util: callbackToPromise

### `callbackToPromise(callbackFunc, paramsCount)` [source](https://github.com/feathersjs/feathers-hooks-common/blob/master/src/services/callback-to-promise.js)

Wrap a function calling a callback into one that returns a Promise.

- Promise is rejected if the function throws.

```javascript
const { callbackToPromise } = require('feathers-hooks-common');

function tester(data, a, b, cb) {
  if (data === 3) { throw new Error('error thrown'); }
  cb(data === 1 ? null : 'bad', data);
} 
const wrappedTester = callbackToPromise(tester, 3); // because func call requires 3 params

wrappedTester(1, 2, 3); // tester(1, 2, 3, wrapperCb)
wrappedTester(1, 2); // tester(1, 2, undefined, wrapperCb)
wrappedTester(); // tester(undefined, undefined undefined, wrapperCb)
wrappedTester(1, 2, 3, 4, 5); // tester(1, 2, 3, wrapperCb)

wrappedTester(1, 2, 3).then( ... )
  .catch(err => { console.log(err instanceof Error ? err.message : err); });
```

__Options:__

- `callbackFunc` (*required*) - A function which uses a callback as its last param.
- `paramsCount` (*required*) - The number of parameters `callbackFunc` expects. This count does not include the callback param itself.

The wrapped function will always be called with that many params, preventing potential bugs.

See also promiseToCallback.


## Util: checkContext

### `checkContext(hook, type, methods, label)` [source](https://github.com/feathersjs/feathers-hooks-common/blob/master/src/services/check-context.js)

Restrict the hook to a hook type (before, after) and a set of
hook methods (find, get, create, update, patch, remove).

```javascript
const { checkContext } = require('feathers-hooks-common');

function myHook(hook) {
  checkContext(hook, 'before', ['create', 'remove']);
  ...
}

app.service('users').after({
  create: [ myHook ] // throws
});

// checkContext(hook, 'before', ['update', 'patch'], 'hookName');
// checkContext(hook, null, ['update', 'patch']);
// checkContext(hook, 'before', null, 'hookName');
// checkContext(hook, 'before');
```

__Options:__

- `hook` (*required*) - The hook provided to the hook function.
- `type` (*optional*) - The hook may be run in `before` or `after`. `null` allows the hook to be run in either.
- `methods` (*optional*) - The hook may be run for these methods.
- `label` (*optional*) - The label to identify the hook in error messages, e.g. its name.


## Util: deleteByDot

### `deleteByDot(obj, path)` [source](https://github.com/feathersjs/feathers-hooks-common/blob/master/src/common/delete-by-dot.js)

`deleteByDot` deletes a property from an object using dot notation, e.g. `employee.address.city`.

```javascript
import { deleteByDot } from 'feathers-hooks-common';

const discardPasscode = () => (hook) => {
  deleteByDot(hook.data, 'security.passcode');
}

app.service('directories').before = {
  find: discardPasscode()
};
```

__Options:__

- `obj` (*required*) - The object containing the property we want to delete.
- `path` (*required*) - The path to the data, e.g. `security.passcode`. Array notion is _not_ supported, e.g. `order.lineItems[1].quantity`.

See also existsByDot, getByDot, setByDot.


## Util: existsByDot

### `existsByDot(obj, path)` [source](https://github.com/feathersjs/feathers-hooks-common/blob/master/src/common/exists-by-dot.js)

`existsByDot` checks if a property exists in an object using dot notation, e.g. `employee.address.city`.
Properties with a value of `undefined` are considered to exist.

```javascript
import { discard, existsByDot, iff } from 'feathers-hooks-common';

const discardBadge = () => iff(!existsByDot('security.passcode'), discard('security.badge'));

app.service('directories').before = {
  find: discardBadge()
};
```

__Options:__

- `obj` (*required*) - The object containing the property.
- `path` (*required*) - The path to the property, e.g. `security.passcode`. Array notion is _not_ supported, e.g. `order.lineItems[1].quantity`.

See also existsByDot, getByDot, setByDot.


## Util: getByDot, setByDot

### `getByDot(obj, path)` [source](https://github.com/feathersjs/feathers-hooks-common/blob/master/src/common/get-by-dot.js)

### `setByDot(obj, path, value, ifDelete)` [source](https://github.com/feathersjs/feathers-hooks-common/blob/master/src/common/set-by-dot.js)

`getByDot` gets a value from an object using dot notation, e.g. `employee.address.city`. It does not differentiate between non-existent paths and a value of `undefined`.

`setByDot` is the companion to `getByDot`. It sets a value in an object using dot notation.

```javascript
import { getByDot, setByDot } from 'feathers-hooks-common';

const setHomeCity = () => (hook) => {
  const city = getByDot(hook.data, 'person.address.city');
  setByDot(hook, 'data.person.home.city', city);
}

app.service('directories').before = {
  create: setHomeCity()
};
```

__Options:__

- `obj` (*required*) - The object we get data from or set data in.
- `path` (*required*) - The path to the data, e.g. `person.address.city`. Array notion is _not_ supported, e.g. `order.lineItems[1].quantity`.
- `value` (*required*) - The value to set the data to.

See also existsByDot, deleteByDot.


## Util: getItems, replaceItems

### `getItems(hook)` [source](https://github.com/feathersjs/feathers-hooks-common/blob/master/src/services/get-items.js)

### `replaceItems(hook, items)` [source](https://github.com/feathersjs/feathers-hooks-common/blob/master/src/services/replace-items.js)

`getItems` gets the data items in a hook. The items may be `hook.data`, `hook.result` or `hook.result.data` depending on where the hook is used, the method its used with and if pagination is used. `undefined`, an object or an array of objects may be returned.

`replaceItems` is the companion to `getItems`. It updates the data items in the hook.

- Handles before and after hooks.
- Handles paginated and non-paginated results from `find`.

```javascript
import { getItems, replaceItems } from 'feathers-hooks-common';

const insertCode = (code) => (hook) {
    const items = getItems(hook);
    !Array.isArray(items) ? items.code = code : (items.forEach(item => { item.code = code; }));
    replaceItems(hook, items);
  }

app.service('messages').before = { 
  create: insertCode('a')
};
```

The common hooks usually mutate the items in place, so a `replaceItems` is not required.

```javascript
const items = getItems(hook);
(Array.isArray(items) ? items : [items]).forEach(item => { item.setCreateAt = new Date(); });
```

__Options:__

- `hook` (*required*) - The hook provided to the hook function.
- `items` (*required*) - The updated item or array of items.


## Util: paramsForServer

### `paramsForServer(params, ... whitelist)` [source](https://github.com/feathersjs/feathers-hooks-common/blob/master/src/services/params-to-server.js)

A client utility to pass selected `params` properties to the server.

- Companion to the server-side hook `paramsFromClient`.

By default, only the `hook.params.query` object is transferred
to the server from a Feathers client,
for security among other reasons.
However you can explicitly transfer other `params` props with
the client utility function `paramsForServer` in conjunction with
the hook function `paramsFromClient` on the server.

```js
// client
import { paramsForServer } from 'feathers-hooks-common';
service.patch(null, data, paramsForServer({
  query: { dept: 'a' }, populate: 'po-1', serialize: 'po-mgr'
}));

// server
const { paramsFromClient } = require('feathers-hooks-common');
service.before({ all: [
  paramsFromClient('populate', 'serialize', 'otherProp'),
  myHook
]});

// myHook's `hook.params` will now be
// { query: { dept: 'a' }, populate: 'po-1', serialize: 'po-mgr' } }
```

__Options:__

- `params` (*optional*) The `params` object to pass to the server, including any `query` prop.
- `whitelist` (*optional*) Names of the props in `params` to transfer to the server.
This is a security feature. All props are transferred if no whitelist is specified.

See `paramsFromClient`.


## Util: promiseToCallback

### `promiseToCallback(promise)(callbackFunc)` [source](https://github.com/feathersjs/feathers-hooks-common/blob/master/src/services/promise-to-callback.js)

Wrap a Promise into a function that calls a callback.

- The callback does not run in the Promise's scope. The Promise's `catch` chain is not invoked if the callback throws.

```javascript
import { promiseToCallback } from 'feathers-hooks-common'

function (cb) {
  const promise = new Promise( ...).then( ... ).catch( ... );
  ...
  promiseToCallback(promise)(cb);
  promise.then( ... ); // this is still possible
}
```

__Options:__

- `promise` (*required*) - A function returning a promise.

See also callbackToPromise.


## FAQ: Coerce data types

A common need is converting fields coming in from query params.
These fields are provided as string values by default and you may need them as numbers, boolenas, etc.
  
The [`validateSchema`](#validateSchema) does a wide selection of
[type coercions](https://github.com/epoberezkin/ajv/blob/master/COERCION.md),
as well as checking for missing and unexpected fields.


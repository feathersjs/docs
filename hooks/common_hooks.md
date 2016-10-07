# Common hooks

When it makes sense to do so, some plug-ins include their own hooks. The following plug-ins come bundled with useful hooks:

- `feathers-hooks` (see note below)
- [`feathers-mongoose`](../databases/mongoose.md)
- [`feathers-authentication`](../authorization/bundled-hooks.md)

The next version of feathers-hooks (1.6.0) will export feathers-hooks-common instead of the previous bundled hooks. This will provide backward compatibility.

Feathers-hooks in Feathers 3.0 will become part of core and you will have to import feathers-hooks-common separately.

dr;tl Start using feathers-hooks-common now.

# feathers-hooks-common

Useful hooks for use with Feathersjs services.

* [Data Items](#data-items)
* [Query Params](#query-params)
* [Authorization](#authorization)
* [Database](#database)
* [Utilities](#utilities)
* [Running hooks conditionally](#running-hooks-conditionally)
* [Utilities for Writing Hooks](#utilities-for-writing-hooks)
* [Things that are deprecated](#things-that-are-deprecated)

## Data items

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
app.service('messages').after(
  hooks.populate('user', {
    service: 'users',
    field: 'user_id'  
  })
);
```
```javascript
/*
 If the object from the message service is
   { _id: '1...1', senderId: 'a...a', text: 'Jane, are you there?' }
 when the hook is run
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

#### Options

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

#### Options

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

#### Options

- `fieldName` [required] - The fields that you want to lowercase from the retrieved object(s).
- `fieldNames` [optional] - The other fields that you want to lowercase.

### setCreatedAt
`setCreatedAt(fieldName = 'createdAt', ...fieldNames?: string[])`

Add the fields with the current date-time.

- Used as a `before` hook for `create`, `update` or `patch`.
- Used as an `after` hook.
- Field names support dot notation.
- Supports multiple data items, including paginated `find`.

```javascript
const hooks = require('feathers-hooks-common');

// set the `createdAt` field before a user is created
app.service('users').before({
  create: [ hooks.setCreatedAt('createdAt') ]
};
```

#### Options

- `fieldName` [optional. default: `createdAt`] - The field that you want to add with the current date-time to the retrieved object(s).
- `fieldNames` [optional] - Other fields to add with the current date-time.

### setUpdatedAt
`setUpdatedAt(fieldName = 'updatedAt', ...fieldNames?: string[]): HookFunc`

Add or update the fields with the current date-time.

- Used as a `before` hook for `create`, `update` or `patch`.
- Used as an `after` hook.
- Field names support dot notation.
- Supports multiple data items, including paginated `find`.

```javascript
const hooks = require('feathers-hooks-common');

// set the `updatedAt` field before a user is created
app.service('users').before({
  create: [ hooks.setCreatedAt('updatedAt') ]
};
```

#### Options

- `fieldName` [optional. default: `updatedAt`] - The fields that you want to add or update in the retrieved object(s).
- `fieldNames` [optional] - Other fields to add or update with the current date-time.

## Query Params

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

#### Options

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

#### Options

- `fieldNames` [optional] - The fields that you want to retain from the query object. All other fields will be discarded.


## Authorization

Most hooks dealing with authentication and authorization come bundled with `feathers-authentication`.

### disable
`disable(provider?: string, ...providers: string[]): HookFunc`

Disables access to a service method completely or for specific providers. All providers ([REST](../rest/readme.md), [Socket.io](../real-time/socket-io.md) and [Primus](../real-time/primus.md)) set the `params.provider` property which is what `disable` checks for.

- Used as a `before` hook.
- Disable service completely, for all external providers, or for certain providers.

```js
const hooks = require('feathers-hooks-common');

app.service('users').before({
  // Users can not be created by external access
  create: hooks.disable('external'),
  // A user can not be deleted through these two web socket providers
  remove: hooks.disable('socketio', 'primus'),
  // Disable calling `update` completely (e.g. to only support `patch`)
  update: hooks.disable(),
});
```

> **ProTip:** Service methods that are not implemented do not need to be disabled.

#### Options

- `provider` [optional. default: _disables everything] - The transport that you want to disable this service method for. Options are:
  - `socketio` - will disable the method for the Socket.IO provider
  - `primus` - will disable the method for the Primus provider
  - `rest` - will disable the method for the REST provider
  - `external` - will disable access from all providers making a service method only usable internally.
- `providers` [optional] - Other transports you want to disable.

## Database

### softDelete
`softDelete(fieldName = 'deleted'): HookFunc`

On `remove`, marks an object as deleted rather than removing the object.
Instead of `remove`, a `patch` is performed to mark the object as deleted.
On `find`, removes such marked objects from the results.

- Used as a `before` hook for `remove` to mark objects as deleted.
- Used as a `before` hook for `find` to ignore objects marked as deleted.
- Field names support dot notation.
- Supports multiple data items, including paginated `find`.

```js
const hooks = require('feathers-hooks-common');

app.service('stockItems').before({
  // Ignore any objects marked as deleted.
  find: hooks.softDelete(),
  // Mark an object as deleted rather than physically deleting it.
  remove: hooks.softDelete(),
});
```
#### Options

- `fieldName` [optional. default: `deleted`] - The name of the field holding the deleted flag.

## Utilities

### setSlug
`setSlug(slug: string, fieldName = 'query.' + slug): HookFunc`

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
const hooks = require('feathers-hooks-common');

app.service('stores').before({
  create: [ hooks.setSlug('storeId') ]
});
```
#### Options

- `slug` [required] - The slug as it appears in the route, e.g. `storeId` for `/stores/:storeId/candies` .
- `fieldName` [optional. default: `query[slugId]`] - The field to contain the slug value.

### debug
`debug(label?: string)`

Display current info about the hook to console.

- Used as a `before` or `after` hook.

```javascript
const hooks = require('feathers-hooks-common');

hooks.debug('step 1')
// * step 1
// type: before, method: create
// data: { name: 'Joe Doe' }
// query: { sex: 'm' }
// result: { assigned: true }
```

#### Options

- `label` [optional] - Label to identify the debug listing.

### Utilities to promisify functions

Wrap functions so they return Promises.

#### fnPromisifyCallback
`fnPromisifyCallback(callbackFunc: CallbackFunc, paramsCount?: number): PromiseFunc`

Wrap a function calling a callback into one that returns a Promise.

- Promise is rejected if the function throws.

```javascript
const fnPromisifyCallback = require('feathers-hooks-common/promisify').fnPromisifyCallback;

function tester(data, a, b, cb) {
  if (data === 3) { throw new Error('error thrown'); }
  cb(data === 1 ? null : 'bad', data);
} 
const wrappedTester = fnPromisifyCallback(tester, 3); // because func call requires 3 params

wrappedTester(1, 2, 3); // tester(1, 2, 3, wrapperCb)
wrappedTester(1, 2); // tester(1, 2, undefined, wrapperCb)
wrappedTester(); // tester(undefined, undefined undefined, wrapperCb)
wrappedTester(1, 2, 3, 4, 5); // tester(1, 2, 3, wrapperCb)

wrappedTester(1, 2, 3).then( ... )
  .catch(err => { console.log(err instanceof Error ? err.message : err); });
```

#### Options

- `callbackFunc` [required] - A function which uses a callback as its last param.
- `paramsCount` [optional. default: count is obtained by parsing func signature] - The number of parameters `callbackFunc` expects. This count does not include the callback param itself.

The wrapped function will always be called with that many params, preventing potential bugs.

The function signature is parsed to obtain the count if the number of params is not provided.

#### Parsing function signatures

Parsing function signatures turns out to be surprisingly difficult. We are using the best signature parser as of Oct 2016. It however has problems with some situations which are unlikely to occur in practice.

These bugs all involve params which have defaults, when their calculation involves parenthesis or commas, e.g.

```javascript
function abc(a, b = () => {}, c) {}
function abc(a, b = (x, y) => {}, c) {}
function abc(a, b = 5 * (1 + 2), c) {}
const abc = (a, b = 'x,y'.indexOf('y'), c) {};
```

As an aside, these cases all go away if you transpile your code with Babel.

## Running hooks conditionally

There are times when you may want to run a hook conditionally,
perhaps depending on the provider, the user authorization,
if the user created the record, etc.

A custom service may be designed to always be called with the `create` method,
with a data value specifying the action the service is to perform.
Certain actions may require authentication or authorization,
while others do not.

### iff
`iff(predicateFunc: function, hookFunc: HookFunc): HookFunc`

Run a predicate function,
which returns either a boolean, or a Promise which evaluates to a boolean.
Run the hook if the result is truesy.

- Used as a `before` or `after` hook.
- Predicate may be a sync or async function.
- Hook to run may be sync or async.
- `feathers-hooks` catches any errors thrown in the predicate or hook.

```javascript
const hooks = require('feathers-hooks-common');
const isNotAdmin = adminRole => hook => hook.params.user.roles.indexOf(adminRole || 'admin') === -1;

app.service('workOrders').after({
  // async predicate and hook
  create: hooks.iff(
    () => new Promise((resolve, reject) => { ... }),
    hooks.populate('user', { field: 'authorisedByUserId', service: 'users' })
  )
});

app.service('workOrders').after({
  // sync predicate and hook
  find: [ hooks.iff(isNotAdmin(), hooks.remove('budget')) ]
});
```

#### Options

- `predicateFunc` [required] - Function to determine if hookFunc should be run or not. `predicateFunc` is called with the hook as its param. It returns either a boolean or a Promise that evaluates to a boolean.
- `hookFunc` [required] - A hook function.

### isNot
`isNot(predicateFunc: function)`

Negate the `predicateFunc`.

- Used with `hooks.iff`.
- Predicate may be a sync or async function.
- `feathers-hooks` catches any errors thrown in the predicate.

```javascript
import hooks, { iff, isNot, isProvider } from 'feathers-hooks-common';
const isRequestor = () => hook => new Promise(resolve, reject) => ... );

app.service('workOrders').after({
  iff(isNot(isRequestor()), hooks.remove( ... ))
});
```

#### Options

- `predicateFunc` [required] - A function which returns either a boolean or a Promise that resolves to a boolean.

### isProvider
`isProvider(provider: string, providers?: string[])`

Check which transport called the service method.
All providers ([REST](../rest/readme.md), [Socket.io](../real-time/socket-io.md) and [Primus](../real-time/primus.md)) set the `params.provider` property which is what `isProvider` checks for.

 - Used as a predicate function with `hooks.iff`.
 - 

```javascript
import hooks, { iff, isProvider } from 'feathers-hooks-common';

app.service('users').after({
  iff(isProvider('external'), hooks.remove( ... ))
});
```

#### Options

- `provider` [required] - The transport that you want this hook to run for. Options are:
  - `server` - Run the hook if the server called the service method.
  - `external` - Run the hook if any transport other than the server called the service method.
  - `socketio` - Run the hook if the Socket.IO provider called the service method.
  - `primus` - If the Primus provider.
  - `rest` - If the REST provider.
- `providers` [optional] - Other transports that you want this hook to run for.
  
## Utilities for Writing Hooks

These utilities may be useful when you are writing your own hooks.
You can import them from `feathers-hooks-common/lib/utils`.

### checkContext
`checkContext(hook: Hook, type: string|null, methods?: string[]|string, label: string): void`

Restrict the hook to a hook type (before, after) and a set of
hook methods (find, get, create, update, patch, remove).

```javascript
const checkContext = require('feathers-hooks-common/lib/utils').checkContext;

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

#### Options

- `hook` [required] - The hook provided to the hook function.
- `type` [optional] - The hook may be run in `before` or `after`. `null` allows the hook to be run in either.
- `methods` [optional] - The hook may be run for these methods.
- `label` [optional] - The label to identify the hook in error messages, e.g. its name.

### getItems, replaceItems
`getItems(hook: Hook): Item[]|Item

`replaceItems(hook: Hook, items: Item[]|Item): void`

'getItems` gets the data items in a hook. The items may be `hook.data`, `hook.result` or `hook.result.data` depending on where the hook is used, the method its used with and if pagination is used. `undefined`, an object or an array of objects may be returned.

`replaceItems` is the companion to `getItems`. It updates the data items in the hook.

- Handles before and after hooks.
- Handles paginated and non-paginated results from `find`.

```javascript
import { getItems, replaceItems } from 'feathers-hooks-common/lib/utils';

const insertCode = (code) => (hook) {
    const items = getItems(hook);
    !Array.isArray(items) ? items.code = code : (items.forEach(item => { item.code = code; }));
    replaceItems(hook, items);
  }

app.service('messages').before = { 
  create: insertCode('a')
};
```

#### Options

- `hook` [required] - The hook provided to the hook function.
- `items` [required] - The updated item or array of items.

### getByDot, setByDot
`getByDot(obj: object, path: string): any`

`setByDot(obj: object, path: string, value: any, ifDelete: boolean): void`

`getItems` gets a value from an object using dot notation, e.g. `employee.address.city`. It does not differentiate between non-existent paths and a value of `undefined`.

`setByDot` is the companion to `getByDot`. It sets a value in an object using dot notation.

- Optionally deletes properties in object.

```javascript
import { getByDot, setByDot } from 'feathers-hooks-common/lib/utils';

const setHomeCity = () => (hook) => {
  const city = getByDot(hook.data, 'person.address.city');
  setByDot(hook, 'data.person.home.city', city);
}

app.service('directories').before = {
  create: setHomeCity()
};
```

#### Options

- `obj` [required] - The object we get data from or set data in.
- `path` [required] - The path to the data, e.g. `person.address.city`. Array notion is _not_ supported, e.g. `order.lineItems[1].quantity`.
- `value` [required] - The value to set the data to.
- `ifDelete` [optional. default: `false`] - Delete the property at the end of the path if `value` is `undefined`. Note that
new empty inner objects will still be created,
e.g. `setByDot({}, 'a.b.c', undefined, true)` will result in `{a: b: {} }`.


## Things that are deprecated

A few things from `feathers-hooks` have been deprecated and will be removed in a future version of `feathers-hooks-common`.

- The hooks bundled with `feathers-hooks` are deprecated. Use `feathers-hooks-common` instead.
- Many hooks allowed a predicate function as their last param, e.g. `remove('name', () => true)`. This allowed the hook to be conditionally run. `iff(predicate, hookFunc)` should be used instead.
- Instead of `restrictToRoles` use the expanded hooks bundled with the next version of `feathers-authentication`.
- The several validation hooks are deprecated. Use validate instead.




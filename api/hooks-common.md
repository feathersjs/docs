# Common Hooks

[![GitHub stars](https://img.shields.io/github/stars/feathersjs/feathers-hooks-common.png?style=social&label=Star)](https://github.com/feathersjs/feathers-hooks-common/)
[![npm version](https://img.shields.io/npm/v/feathers-hooks-common.png?style=flat-square)](https://www.npmjs.com/package/feathers-hooks-common)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.png?style=flat-square)](https://github.com/feathersjs/feathers-hooks-common/blob/master/CHANGELOG.md)

```
$ npm install feathers-hooks-common --save
```

`feathers-hooks-common` is a collection of common [hooks](./hooks.md) and utilities.

> **Note:** Many hooks are just a few lines of code to implement from scratch. If you can't find a hook here but are unsure how to implement it or have an idea for a generally useful hook create a new issue [here](https://github.com/feathersjs/feathers-hooks-common/issues/new).


## remove

### `remove(... fieldNames)`

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
  create: hooks.remove('_id', 'password'),
  update: hooks.remove('_id'),
  patch: hooks.remove('_id')
})
```

> **ProTip:** This hook will only fire when `params.provider` has a value, i.e. when it is an external request over REST or Sockets.

__Options:__

- `fieldNames` (*required*) - One or more fields you want to remove from the object(s).


## pluck

### `pluck(... fieldNames)`

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

__Options:__

- `fieldNames` (*required*) - One or more fields that you want to retain from the object(s).

All other fields will be discarded.


### removeQuery

`removeQuery(... fieldNames)`

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

__Options:__

- `fieldNames` (*optional*) - The fields that you want to remove from the query object.


## pluckQuery

`pluckQuery(... fieldNames)`

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

__Options:__

- `fieldNames` (*optional*) - The fields that you want to retain from the query object. All other fields will be discarded.


## lowerCase

### `lowerCase(... fieldNames)`

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

__Options:__

- `fieldNames` (*required*) - One or more fields that you want to lowercase from the retrieved object(s).


## setCreatedAt

### `setCreatedAt(fieldName = 'createdAt', ... fieldNames)`

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
});
```

__Options:__

- `fieldName` (*optional*, default: `createdAt`) - The field that you want to add with the current date-time to the retrieved object(s).
- `fieldNames` (*optional*) - Other fields to add with the current date-time.


## setUpdatedAt

### `setUpdatedAt(fieldName = 'updatedAt', ...fieldNames)`

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
});
```

__Options:__

- `fieldName` (*optional*, default: `updatedAt`) - The fields that you want to add or update in the retrieved object(s).
- `fieldNames` (*optional*) - Other fields to add or update with the current date-time.


## traverse

### `traverse(transformer, getObject)`

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


## iffElse

### `iffElse(predicate, trueHooks, falseHooks)`

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

## iff

### `iff(predicate: boolean|Promise|function, ...hookFuncs: HookFunc[]): HookFunc`

Resolve the predicate to a boolean.
Run the hooks sequentially if the result is truthy.

- Used as a `before` or `after` hook.
- Predicate may be a sync or async function.
- Hooks to run may be sync, Promises or callbacks.
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

__Options:__

- `predicate` (*required*) - Determines if hookFuncs should be run or not.
If a function, `predicate` is called with the hook as its param.
It returns either a boolean or a Promise that evaluates to a boolean
- `hookFuncs` (*optional*) - Zero or more hook functions.
They may include other conditional hooks.


## else

### `iff(...).else(...hookFuncs)`

`iff().else()` is similar to `iff` and `iffElse`.
Its syntax is more suitable for writing nested conditional hooks.
If the predicate in the `iff()` is falsey, run the hooks in `else()` sequentially.

- Used as a `before` or `after` hook.
- Hooks to run may be sync, Promises or callbacks.
- `feathers-hooks` catches any errors thrown in the predicate or hook.

```javascript
service.before({
  create:
    hooks.iff(isServer,
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

__Options:__

- `hookFuncs` (*optional*) - Zero or more hook functions.
They may include other conditional hooks.


## when

An alias for [iff](#iff)


## unless

### `unless(predicate, ...hookFuncs)`

Resolve the predicate to a boolean.
Run the hooks sequentially if the result is falsey.

- Used as a `before` or `after` hook.
- Predicate may be a sync or async function.
- Hooks to run may be sync, Promises or callbacks.
- `feathers-hooks` catches any errors thrown in the predicate or hook.

```javascript
service.before({
  create:
    unless(isServer,
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

## every

### `every(... hookFuncs)`

Run hook functions in parallel.
Return `true` if every hook function returned a truthy value.

- Used as a predicate function with [conditional hooks](#conditional-hooks).
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


## some

### `some(... hookFuncs)`

Run hook functions in parallel.
Return `true` if any hook function returned a truthy value.

- Used as a predicate function with [conditional hooks](#conditional-hooks).
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

## isNot

### `isNot(predicate)`

Negate the `predicate`.

- Used as a predicate with [conditional hooks](#conditional-hooks).
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


## isProvider

### `isProvider(provider)`

Check which transport called the service method.
All providers ([REST](./rest.md), [Socket.io](./socketio.md) and [Primus](./primus.md)) set the `params.provider` property which is what `isProvider` checks for.

 - Used as a predicate function with [conditional hooks](#conditional-hooks).

```javascript
import hooks, { iff, isProvider } from 'feathers-hooks-common';

app.service('users').after({
  iff(isProvider('external'), hooks.remove( ... ))
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
  
## combine

### `combine(... hookFuncs)`

Sequentially execute multiple hooks.
`combine` is usually used [within custom hook functions](./utils-hooks.md#combine).

```javascript
service.before({
  create: hooks.combine(hook1, hook2, hook3) // same as [hook1, hook2, hook3]
});
```

__Options:__

- `hooks` (*optional*) - The hooks to run.


## disableMultiItemChange

### `disableMultiItemChange()`

Disables update, patch and remove methods from using null as an id, e.g. remove(null).
A null id affects all the items in the DB, so accidentally using it may have undesirable results.

- Used as a `before` hook.

```js
app.service('users').before({
  all: hooks.disableMultiItemChange(),
});
```


## softDelete

### `softDelete(fieldName = 'deleted')`

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
__Options:__

- `fieldName` (*optional*, default: `deleted`) - The name of the field holding the deleted flag.


## checkContext

### `checkContext(hook, type, methods, label)`

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

__Options:__

- `hook` (*required*) - The hook provided to the hook function.
- `type` (*optional*) - The hook may be run in `before` or `after`. `null` allows the hook to be run in either.
- `methods` (*optional*) - The hook may be run for these methods.
- `label` (*optional*) - The label to identify the hook in error messages, e.g. its name.


## combine

### `combine(... hookFuncs)`

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

## getItems, replaceItems

### `getItems(hook)

### `replaceItems(hook, items)`

`getItems` gets the data items in a hook. The items may be `hook.data`, `hook.result` or `hook.result.data` depending on where the hook is used, the method its used with and if pagination is used. `undefined`, an object or an array of objects may be returned.

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

__Options:__

- `hook` (*required*) - The hook provided to the hook function.
- `items` (*required*) - The updated item or array of items.

## getByDot, setByDot

### `getByDot(obj, path)`

### `setByDot(obj, path, value, ifDelete)`

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

__Options:__

- `obj` (*required*) - The object we get data from or set data in.
- `path` (*required*) - The path to the data, e.g. `person.address.city`. Array notion is _not_ supported, e.g. `order.lineItems[1].quantity`.
- `value` (*required*) - The value to set the data to.
- `ifDelete` (*optional, default: `false`) - Delete the property at the end of the path if `value` is `undefined`. Note that
new empty inner objects will still be created,
e.g. `setByDot({}, 'a.b.c', undefined, true)` will result in `{a: b: {} }`.


## validateSchema

### `validateSchema(schema, ajv, options)`

Validate an object using [JSON-Schema](http://json-schema.org/) through [AJV](https://github.com/epoberezkin/ajv)

> **ProTip** There are some
[good tutorials](//code.tutsplus.com/tutorials/validating-data-with-json-schema-part-1--cms-25343)
on using JSON-Schema with [ajv](https://github.com/epoberezkin/ajv).

- Used as a `before` or `after` hook.
- The hook will throw if the data does not match the JSON-Schema.
`error.errors` will, by default, contain an array of error messages.

> **ProTip** You may customize the error message format with a custom formatting function.
You could, for example, return `{ name1: message, name2: message }`
which could be more suitable for a UI.

```javascript
const ajv = require('ajv');
const createSchema = { /* JSON-Schema */ };
module.before({
  create: validateSchema(createSchema, ajv)
});
```

__Options:__

- `schema` (*required*) - The JSON-Schema.
- `ajv` (*required*) - The `ajv` validator.
- `options` (*optional*) - Options.
    - Any `ajv` options.
    - `addNewError` (*optional*) - Custom message formatter.
    Its a reducing function which works similarly to `Array.reduce()`.
    Its signature is
    `{ currentFormattedMessages: any, ajvError: AjvError, itemsLen: number, index: number }: newFormattedMessages`
        - `currentFormattedMessages` - Formatted messages so far. Initially `null`.
        - `ajvError` - [ajv error](https://github.com/epoberezkin/ajv#error-objects).
        - `itemsLen` - How many data items there are. 1-based.
        - `index` - Which item this is. 0-based.
        - `newFormattedMessages` - The function returns the updated formatted messages.


## validate

### `validate(validator)`

Call a validation function from a `before` hook. The function may be sync or return a Promise.

- Used as a `before` hook for `create`, `update` or `patch`.

> **ProTip:** If you have a different signature for the validator then pass a wrapper as the validator e.g. `(values) => myValidator(..., values, ...)`.

<!-- -->

> **ProTip:** Wrap your validator in `callbackToPromise` if it uses a callback.

```javascript
const callbackToPromise = require('feathers-hooks-common').callbackToPromise;

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
const hooks = require('feathers-hooks-common');
const callbackToPromise = require('feathers-hooks-common/lib/promisify').callbackToPromise;
const validateSchema = require('feathers-hooks-validate-joi');

const clientValidations = require('/common/usersClientValidations');
const serverValidations = require('/server/validations/usersServerValidations');
const schemas = require('/server/validations/schemas');

const validate = hooks.validate;
const serverValidationsSignup = callbackToPromise(serverValidations.signup, 1);

exports.before = {
  create: [
    validateSchema.form(schemas.signup, schemas.options), // schema validation
    validate(clientValidations.signup), // re-run form sync validation
    validate(values => clientValidations.signupAsync(values, 'someMoreParams')), // re-run form async
    validate(serverValidationsSignup), // run server validation
    hooks.remove('confirmPassword'),
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


## disallow

### `disallow(...providers)`

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

- providers (*optional*, default: disallows everything) - The transports that you want to disallow this service method for. Options are:
    - `socketio` - will disallow the method for the Socket.IO provider
    - `primus` - will disallow the method for the Primus provider
    - `rest` - will disallow the method for the REST provider
    - `external` - will disallow access from all providers other than the server.
    - `server` - will disallow access for the server


## client

### `client(... whitelist)`

A hook for passing params from the client to the server.

- Used as a `before` hook.

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


## setSlug

### `setSlug(slug, fieldName = 'query.' + slug)`

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

__Options:__

- `slug` (*required*) - The slug as it appears in the route, e.g. `storeId` for `/stores/:storeId/candies` .
- `fieldName` (*optional*, default: `query[slugId]`) - The field to contain the slug value.


## debug

### `debug(label)`

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

__Options:__

- `label` (*optional*) - Label to identify the debug listing.

## callbackToPromise

### `callbackToPromise(callbackFunc, paramsCount)`

Wrap a function calling a callback into one that returns a Promise.

- Promise is rejected if the function throws.

```javascript
const callbackToPromise = require('feathers-hooks-common/promisify').callbackToPromise;

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


## promiseToCallback

### `promiseToCallback(promise)(callbackFunc)`

Wrap a Promise into a function that calls a callback.

- The callback does not run in the Promise's scope. The Promise's `catch` chain is not invoked if the callback throws.

```javascript
import { promiseToCallback } from 'feathers-hooks-common/promisify'

function (cb) {
  const promise = new Promise( ...).then( ... ).catch( ... );
  ...
  promiseToCallback(promise)(cb);
  promise.then( ... ); // this is still possible
}
```

__Options:__

- `promise` (*required*) - A function returning a promise.


## populate

### `populate(options: Object): HookFunc`

Populates items *recursively* to any depth. Supports 1:1, 1:n and n:1 relationships.

- Used as a **before** or **after** hook on any service method.
- Supports multiple result items, including paginated `find`.
- Permissions control what a user may see.
- Provides performance profile information.
- Backward compatible with the old FeathersJS `populate` hook.

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

Options

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
- `parentField` [required, string] The name of the field in the parent item for the [relation](#relation).
Dot notation is allowed.
- `childField` [required, string] The name of the field in the child item for the [relation](#relation).
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

#### Populate examples

##### A simple populate

Our `posts` items look like:

```javascript
{ id: 9, title: 'The unbearable ligthness of Feathersjs', author: 5, born:  }
```

Our `users` items look like:

```javascript
{ id: 5, email: 'john.doe@gmail.com', name: 'John Doe', yearBorn: 1990 }
```

We can include the author information whenever we `get` or `find` a post using:

```javascript
const schema = {
  include: [{
    service: 'users',
    nameAs: 'authorItem',
    parentField: 'author',
    childField: 'id',
  }],
};
app.service('posts').before({
  get: hooks.populate({ schema }),
  find: hooks.populate({ schema })
});
```

`app.service('posts').get(9)` would return:

```javascript
{ id: 9, title: 'The unbearable ligthness of Feathersjs', author: 5, yearBorn: 1990,
  authorItem: { id: 5, email: 'john.doe@gmail.com', name: 'John Doe' },
  _include: ['authorItem']
}
```

##### Selecting schema based on UI needs

Consider a Purchase Order item.
An Accounting oriented UI will likely want to populate the PO with Invoice items.
A Receiving oriented UI will likely want to populate with Receiving Slips.

Using a function for `schema` allows you to select an appropriate schema based on the need.
The following example shows how the client can ask for the type of schema it needs.

```javascript
// on client
purchaseOrders.get(id, { query: { $client: { schema: 'po-acct' }}}) // pass schema name to server
// or
purchaseOrders.get(id, { query: { $client: { schema: 'po-rec' }}})
```

```javascript
// on server
const poSchemas = {
  'po-acct': { /* populate schema for Accounting oriented PO */},
  'po-rec': { /* populate schema for Receiving oriented PO */}
};

purchaseOrders.before({
  all: $client('schema')
});

purchaseOrders.after({
  all: populate(() => poSchemas[hook.params.schema])
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

## serialize

### `serialize(schema: Object|Function): HookFunc`

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
{ id: 9, title: 'The unbearable ligthness of Feathersjs', author: 5, yearBorn: 1990,
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
{ title: 'The unbearable ligthness of Feathersjs',
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

## dePopulate

### `dePopulate()`

Removes joined and [computed](#added-properties) properties, as well any profile information.
Populated and serialized items may, after dePopulate, be used in `service.patch(id, items)` calls.

- Used as a **before** or **after** hook on any service method.
- Supports multiple result items, including paginated `find`.
- Supports an array of keys in `field`.

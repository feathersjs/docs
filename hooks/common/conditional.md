# Running hooks conditionally

There are times when you may want to run a hook conditionally,
perhaps depending on the provider, the user authorization,
if the user created the record, etc.

A custom service may be designed to always be called with the `create` method,
with a data value specifying the action the service is to perform.
Certain actions may require authentication or authorization,
while others do not.

* [iff](#iff)
* [isNot](#isnot)
* [isProvider](#isprovider)

### iff
`iff(predicateFunc: function, ...hookFunc: HookFunc): HookFunc`

Run a predicate function,
which returns either a boolean, or a Promise which evaluates to a boolean.
Run the hooks if the result is truesy.

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

Options

- `predicateFunc` [required] - Function to determine if hookFunc should be run or not. `predicateFunc` is called with the hook as its param. It returns either a boolean or a Promise that evaluates to a boolean.
- `hookFuncs` [one required] - One or more hook functions.

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

Options

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

Options

- `provider` [required] - The transport that you want this hook to run for. Options are:
  - `server` - Run the hook if the server called the service method.
  - `external` - Run the hook if any transport other than the server called the service method.
  - `socketio` - Run the hook if the Socket.IO provider called the service method.
  - `primus` - If the Primus provider.
  - `rest` - If the REST provider.
- `providers` [optional] - Other transports that you want this hook to run for.
  
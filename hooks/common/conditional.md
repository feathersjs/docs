# Running hooks conditionally

There are times when you may want to run a hook conditionally,
perhaps depending on the provider, the user authorization,
if the user created the record, etc.

A custom service may be designed to always be called with the `create` method,
with a data value specifying the action the service is to perform.
Certain actions may require authentication or authorization,
while others do not.

* [iff](#iff)
* [else](#else)
* [isNot](#isnot)
* [isProvider](#isprovider)
* [combine](#combine)

## Workflows

These features add decision making capabilities to your hooks.

However they may also be used to create *workflows* or *processes*.
You may, for example, have a metric service for sending time series data to a metrics cluster
and want to call it from different places to send different key/value pairs.

You could create `sendMetric` containing the hooks and conditional logic
necessary, and include it with the hooks where its needed. 

### iff
`iff(predicateFunc: function, ...hookFuncs: HookFunc[]): HookFunc`

Run a predicate function,
which returns either a boolean, or a Promise which evaluates to a boolean.
Run the hooks sequentially if the result is truesy.

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
- `hookFuncs` [optional] - Zero or more hook functions.
They may include other `iff().else()` functions.

### else
`if(...).else(...hookFuncs: HookFunc[]): HookFunc`

If the predicate in the `iff()` is falsey, run the hooks sequentially.

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
})
```

Options

- `hookFuncs` [optional] - Zero or more hook functions.
They may include other `iff().else()` functions.

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
  
  
### combine
`combine(...hooks: HookFunc[])`

Sequentially execute multiple hooks.
`combine` is usually used [within custom hook functions](./utils-hooks.md#combine).

```javascript
service.before({
  create: hooks.combine(hook1, hook2, hook3) // same as [hook1, hook2, hook3]
});
```

Options

- `hooks` [optional] - The hooks to run.
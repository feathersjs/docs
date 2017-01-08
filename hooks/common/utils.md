# Utilities

Miscellaneous hooks.

* [disable](#disable)
* [client](#client)
* [setSlug](#setslug)
* [debug](#debug)
* [callbackToPromise](#callbacktopromise)
* [promiseToCallback](#promisetocallback)

### disable
`disable(realm: Function|String, ...providers?: String[]): HookFunc`

Disables access to a service method completely or for a specific provider. All providers
(REST, Socket.io and Primus) set the params.provider property which is what disable checks for.

- Used as a `before` hook.

```js
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

> **ProTip** Service methods that are not implemented do not need to be disabled.

Options

- providers [optional. default: disables everything] - The transports that you want to disable
this service method for. Options are:
    - socketio - will disable the method for the Socket.IO provider
    - primus - will disable the method for the Primus provider
    - rest - will disable the method for the REST provider
    - external - will disable access from all providers making a service method only usable internally.
- callback () [optional. default: runs when not called internally] -
A function that receives the hook object where you can put your own logic
to determine whether this hook should run. Returns either true or false.


### client
`client(...whitelist: string[]): HookFunc`

A hook for passing params from the client to the server.

- Used as a `before` hook.

Only the `hook.params.query` object is transferred to the server from a Feathers client,
for security amoung other reasons.
However if you can include a `hook.params.query.$client` object, e.g.
```js
service.find({ query: { dept: 'a', $client: { populate: 'po-1', serialize: 'po-mgr' } } } );
```
the `client` hook will move that data to `hook.params` on the server.
```js
service.before({ all: [ client('populate', 'serialize', 'otherProp'), myHook ]});
// myHook's hook.params will be
// { query: { dept: 'a' }, populate: 'po-1', serialize: 'po-mgr' } }
```

Options

- `whitelist` [optional] Names of the potential props to transfer from `query.client`.
Other props are ignored. This is a security feature.

> **ProTip** You can use the same technique for service calls made on the server.


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
Options

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

Options

- `label` [optional] - Label to identify the debug listing.

### callbackToPromise
`callbackToPromise(callbackFunc: CallbackFunc, paramsCount?: number): PromiseFunc`

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

Options

- `callbackFunc` [required] - A function which uses a callback as its last param.
- `paramsCount` [required] - The number of parameters `callbackFunc` expects. This count does not include the callback param itself.

The wrapped function will always be called with that many params, preventing potential bugs.

### promiseToCallback
`promiseToCallback(promise: Promise)(callbackFunc: CallbackFunc)`

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

Options

- `promise` [required] - A function returning a promise.

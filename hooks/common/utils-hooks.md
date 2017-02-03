# Utilities for Writing Hooks

These utilities may be useful when you are writing your own hooks.
You can import them from `feathers-hooks-common/lib/utils`.

* [checkcontext](#checkcontext)
* [combine](#combine)
* [getItems, replaceItems](#getitems-replaceitems)
* [getByDot, setByDot](#getbydot-setbydot)

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

Options

- `hook` [required] - The hook provided to the hook function.
- `type` [optional] - The hook may be run in `before` or `after`. `null` allows the hook to be run in either.
- `methods` [optional] - The hook may be run for these methods.
- `label` [optional] - The label to identify the hook in error messages, e.g. its name.

### combine
`combine(...hooks: HookFunc[]): HookFunc`

Sequentially execute multiple hooks within a custom hook function.

```javascript
function (hook) { // an arrow func cannot be used because we need 'this'
  // ...
  hooks.combine(hook1, hook2, hook3).call(this, hook)
    .then(hook => {});
}
```

Options

- `hooks` [optional] - The hooks to run.

### getItems, replaceItems
`getItems(hook: Hook): Item[]|Item

`replaceItems(hook: Hook, items: Item[]|Item): void`

`getItems` gets the data items in a hook. The items may be `hook.data`, `hook.result` or `hook.result.data` depending on where the hook is used, the method its used with and if pagination is used. `undefined`, an object or an array of objects may be returned.

`replaceItems` is the companion to `getItems`. It updates the data items in the hook.

- Handles before and after hooks.
- Handles paginated and non-paginated results from `find`.

```javascript
import { getItems, replaceItems } from 'feathers-hooks-common/lib/utils';

const insertCode = (code) => (hook) => {
    const items = getItems(hook);
    !Array.isArray(items) ? items.code = code : (items.forEach(item => { item.code = code; }));
    replaceItems(hook, items);
  }

app.service('messages').before = { 
  create: insertCode('a')
};
```

Options

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

Options

- `obj` [required] - The object we get data from or set data in.
- `path` [required] - The path to the data, e.g. `person.address.city`. Array notion is _not_ supported, e.g. `order.lineItems[1].quantity`.
- `value` [required] - The value to set the data to.
- `ifDelete` [optional. default: `false`] - Delete the property at the end of the path if `value` is `undefined`. Note that
new empty inner objects will still be created,
e.g. `setByDot({}, 'a.b.c', undefined, true)` will result in `{a: b: {} }`.


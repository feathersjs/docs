# Writing Your Own Hooks

## Hook function template

Hook functions should be written like this:
```javascript
// Outer function initializes the hook function
function myHook(options) {
  // The hook function itself is returned.
  return context => {
    // You can use the options param to condition behavior within the hook.
  };
}
```

Feathers calls the inner function with the [context object](../../../api/hooks.md#hook-objects).

`context.result` is an object or array for all method calls other than `find`.
It is [an object](../../../api/databases/common.html#pagination) if the `find` is paginated.
Otherwise it is an array.

The hook function may either return synchronously or it may return a Promise.
The return value (sync) or resolved value from the Promise (async) may be a new context object,
or `undefined`.

> **ProTip** The context object is not changed if `undefined` is returned.
Mutating the `context` param does not change the context object.

Let's review some of the [common hooks](../../../api/hooks-common.md)
to see what hooks can do.

## debug

`debug` logs the hook to console.

```javascript
export default function (msg) {
  return context => {
    console.log(`* ${msg || ''}\ntype:${context.type}, method: ${context.method}`);
    if (context.data) { console.log('data:', context.data); }
    if (context.params && context.params.query) { console.log('query:', context.params.query); }
    if (context.result) { console.log('result:', context.result); }
    if (context.error) { console.log('error', context.error); }
  };
}
```

This hook is straightforward, simply displaying some of the `context` object properties.
The context object does not change as debug returns `undefined` by default.

`debug` is great for debugging other hooks.
You place this hook just before and just after the hook under test,
and see the context object the test hook received, and what it returned.

This example
- Shows several context properties.
- Leaves the context object unchanged with a sync `return`.

## disableMultiItemChange

`disable-multi-item-change` disables update, patch and remove methods from using null as an id,
e.g. `remove(null)`.
A null id affects all the items in the DB, so accidentally using it may have undesirable results.

```javascript
import errors from 'feathers-errors';
import checkContext from './check-context';

export default function () {
  return function (context) {
    checkContext(context, 'before', ['update', 'patch', 'remove'], 'disableMultiItemChange');

    if (context.id === null) {
      throw new errors.BadRequest(
        `Multi-record changes not allowed for ${context.path} ${context.method}. (disableMultiItemChange)`
      );
    }
  };
}
```

Some hooks may only be used `before` or `after`; some may be used only with certain methods.
The [`checkContext` utility](../../../api/hooks-common.md#util-checkcontext)
checks the hook function is being used properly.

This hook throws an error that would be properly returned to the client.
```javascript
service.patch(null, data, { query: { dept: 'acct' } })
  .then(data => ...)
  .catch(err => {
    console.log(err.message); // Multi-record changes not allowed for ...
  });
```

This example
- Introduces `checkContext`.
- Shows how to throw an error in hooks.


## pluckQuery

Discard all other fields except for the given fields from the query params
to sanitize the query.

``javascript
import _pluck from '../common/_pluck';
import checkContext from './check-context';

export default function (...fieldNames) {
  return context => {
    checkContext(context, 'before', null, 'pluckQuery');

    const query = (context.params || {}).query || {};
    context.params.query = _pluck(query, fieldNames);

    return context;
  };
}
```

The `_pluck` utility, given an object and an array of property name,
returns an object consisting of just those peoperties.
The property names may be in dot notation, e.g. `destination.address.city`.

The context object is modified and returned,
thus modifying what context is passed to the next hook.

This example
- Introduces `_pluck`.
- Modifies and synchronously returns the context object.


## pluck

Discard all other fields except for the provided fields
either from the data submitted or from the result.
If the data is an array or a paginated find result the hook will remove the field(s) for every item.

```javascript
import _pluck from '../common/_pluck';
import checkContextIf from './check-context-if';
import getItems from './get-items';
import replaceItems from './replace-items';

export default function (...fieldNames) {
  return context => {
    checkContextIf(context, 'before', ['create', 'update', 'patch'], 'pluck');

    if (context.params.provider) {
      replaceItems(context, _pluck(getItems(context), fieldNames));
    }

    return context;
  };
}
```

The [`getItems` utility](../../../api/hooks-common.md#util-getitems-replaceitems)
returns the items in either `hook.data` or `hook.result`
depending on whether the hook is being used as a before or after hook.
`hook.result.data` or `hook.result` is returned for a `find` method.
The items are always an array to simplify further processing.

The [`replaceItems` utility](../../../api/hooks-common.md#util-getitems-replaceitems)
is the reverse of `getItems`, returning the items where they came from.

This example
- Introduces the convenient `getItems` and `replaceItems` utilities.


## Simple async hook

Let's write a hook which will call an async function (returning a Promise).
That function will determine if `hook.data` contains a valid item.

```javascript
import errors from 'feathers-errors';

export default function (validator) {
  return context => {
    return validator(context.data)
      .then(() => context)
      .catch(errs => {
        throw new errors.BadRequest('Validation error', { errors: errs });
      });
  };
}
```

The hook either returns a Promise which resolves to the existing context object,
or it throws with an error object.

The next hook will not be run until this Promise resolves and this hook logically ends.

> **ProTip** Perhaps the most common error made when writing async hooks
is to **not return** the Promise.
The hook will not work as expected with `validator(context.data)`.
It must be `return validator(context.data)`.



save before record ******* write stashCurrentItem
- service call

# Common hooks

Some plug-ins include their own hooks when it makes sense to do so.
[`feathers-hooks-common`]() contains other useful hooks.

The following plug-ins come bundled with their own hooks:

- [`feathers-mongoose`](../databases/mongoose.md)
- [`feathers-authentication`](../authentication/readme.md)
<!-- - [`feathers-permissions`](../authentication/readme.md) -->

> **ProTip:** Hooks previously in `feathers-hooks` are included with the common hooks.
> As of v1.6.0, `feathers-hooks` instead exports `feathers-hooks-common` to provide backward compatibility.
> `feathers-hooks` will become part of core in Feathers 3.0 and you will have to import `feathers-hooks-common` separately.

<!-- -->

> **ProTip** Database adapters that use an ORM like `feathers-sequelize` and `feathers-mongoose` return ORM instances instead of plain objects.  You may need to convert them to plain objects for some hooks to work properly.  Check the documentation for your database adapter to see how to get plain objects.
> 

## Deprecations

A few things from `feathers-hooks` have been deprecated and will be removed in a future version of `feathers-hooks-common`.

- Some hooks allowed a predicate function as their last param, e.g. `remove('name', () => true)`. This allowed the hook to be conditionally run. Use `iff(predicate, hookFunc)` instead.
- Instead of `restrictToRoles` use the expanded hooks bundled with the next version of `feathers-authentication`.

# Migrating

This guide explains the new featuers and changes to migrate to the Feathers Crow release. Information will be added as new releases of individual modules are made.

## Feathers core

### Services at the root level

Any Feathers application now allows to register a service at the root level with a name of `/`:

```js
app.use('/', myService);
```

It will be available via `app.service('/')` through the client and directly at `http://feathers-server.com/` via REST.

### Typescript definitions included

> _Important:_ Still TBD. Use the definitions from [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) for now.

## Database adapters

The latest versions of the Feathers database adapters include some important security and usability updates by requiring to explicitly enable certain functionality that was previously available by default.

### Querying by id

All database adapters now support additional query parameters for `get`, `remove`, `update` and `patch`. If the record does not match that query, even if the `id` is valid, a `NotFound` error will be thrown. This is very useful for the common case of e.g. restricting requests to the users company the same way as you already would in a `find` method:

```js
// Will throw `NotFound` if `companyId` does not match
// Even if the `id` is available
app.service('/messages').get('<message id>', {
  query: { companyId: '<my company>' }
});
```

### Hook-less service methods

The database adapters now support calling their service methods without any hooks by adding a `_` in front of the method name as `_find`, `_get`, `_create`, `_patch`, `_update` and `_remove`. This can be useful if you need the raw data from the service and don't want to trigger any of its hooks.

```js
// Call `get` without running any hooks
const message = await app.service('/messages')._get('<message id>');
```

### Multi updates

Creating, updating or removing multiple records at once has always been part of the Feathers adapter specification but it turned out to be quite easy to miss. 

This means applications could be open to queries that a developer did not anticipate (like deleting or creating multiple records at once). Additionally, it could also lead to unexpected data in a hook that require special cases (like `context.data` or `context.result` being an array).

Now, multiple `create`, `patch` and `remove` calls (with the `id` value set to `null`) are disabled by default and have to be enabled explicitly by setting the `multi` option:

```js
const service = require('feathers-<database>');

// Allow multi create, patch and remove
service({
  multi: true
});

// Only allow create with an array
service({
  multi: [ 'create' ]
});

// Only allow multi patch and remove (with `id` set to `null`)
service({
  multi: [ 'patch', 'remove' ]
});
```

> _Important:_ When enabling multiple remove and patch requests, make sure to restrict the allowed query (e.g. based on the authenticated user id), otherwise it could be possible to delete or patch every record in the database.

### Whitelisting

Some database adapters allowed additional query parameters outside of the official Feathers query syntax. To reduce the risk of allowing malicious queries, only the standard query syntax is now allowed.

Non-standard query parameters (any query property starting with a `$`) will now throw an error. To allow them, they have to be explicitly whitelisted using the `whitelist` option:

```js
const service = require('feathers-<database>');

// Allow multi create, patch and remove
service({
  whitelist: [ '$regex' ]
});
```

> _Important:_ Be aware of potential security implications of manually whitelisted options. E.g. Enabling Mongoose `$populate` can expose fields that are normally protected at the service level (e.g. a users password) and have to be removed separately.

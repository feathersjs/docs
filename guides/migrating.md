# Migrating

This guide explains the new features and changes necessary to migrate to the Feathers v5 (Dove) release. It expects applications to be using the previous Feathers v4 (Crow). See the [v4 (Crow) migration guide](https://crow.docs.feathersjs.com/guides/migrating.html) for upgrading to the previous version.

## Deprecations and breaking changes

### Core

- The unofficial `finally` hook type is no longer available and should be replaced by the new asynchronous hooks which offer the same functionality using plain JavaScript:

```js
app.service('myservice').hooks([
  async (context, next) => {
    try {
      await next();
    } finally {
      // Do finally hook stuff here
    }
  }
]);
```

- The undocumented `service._setup` method introduced in v1 will no longer be called. It was used to circumvent middleware inconsistencies from Express 3 and is no longer necessary.
- The undocumented `app.providers` has been removed since it provided the same functionality as [`app.mixins`]()

### Authentication

- Grant upgrade
- handleConnection update

### Asynchronous setup

`service.setup`, `app.setup` and `app.listen` now run asynchronously and return a Promise. This can be used to initialize database connections, caches etc. in the correct order and before the application starts. For more dynamic initialization flows, these methods can also be used with `@feathersjs/hooks`.

### Configuration

The implicit environment variable substitution in `@feathersjs/configuration` was causing subtle and hard to debug issues. It has been removed to instead rely on the functionality already provided by the underlying [node-config](https://github.com/lorenwest/node-config), specifically the [Custom Environment Variable support](https://github.com/lorenwest/node-config/wiki/Environment-Variables#custom-environment-variables). To use existing environment variables add the following configuration file in `config/custom-environment-variables.<json|yaml|js>` like this:

```json
// config/custom-environment-variables.json
{
  "hostname": "HOSTNAME",
  "port": "PORT",
  "someSetting": {
    "apiKey": "MY_CUSTOM_API_KEY"
  }
}
```

### REST clients

- The `request` library has been deprecated and request support has been removed from the REST client.
- Since all modern browsers now support built-in [fetch](), the Angular and jQuery REST clients have been removed as well

### Primus transport

Due to low usage `@feathersjs/primus` and `@feathers/primus-client` have been removed from Feathers core and moved into [feathersjs-ecosystem/feathers-primus](). It will continue to work as is but rely on community support for future updates.

### Legacy socket format and timeouts

- The legacy `servicename::method` socket message format has been deprecated in Feathers 3 and has now been removed. Use a v3 or later [Feathers client]() or the [current Socket.io direct connection API]().
- The `timeout` setting for socket services has been removed. It was mainly intended as a fallback for the old message format and interfered with the underlying timeout and retry mechanism provided by the websocket libraries themselves.

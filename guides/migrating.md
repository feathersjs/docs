# Migrating

This guide explains the new features and changes necessary to migrate to the Feathers v5 (Dove) release. It expects applications to be using the previous Feathers v4 (Crow). See the [v4 (Crow) migration guide](https://crow.docs.feathersjs.com/guides/migrating.html) for upgrading to the previous version.

## Testing the prerelease

You can run the following to test the latest Dove pre-release in your application:

```
npx ncu --upgrade --target newest --filter /@feathersjs/
npm install
```

## Features

### Asynchronous setup

`service.setup`, `app.setup` and `app.listen` now run asynchronously and return a Promise. This can be used to initialize database connections, caches etc. in the correct order and before the application starts. For more dynamic initialization flows, these methods can also be used with `@feathersjs/hooks`.

### Custom methods

### Async hooks

## Deprecations and breaking changes

### Asynchronous setup

`service.setup`, `app.setup` and `app.listen` return a Promise:

```js
// Before
const server = app.listen(3030);

app.setup();

// Now
app.listen(3030).then(server => {
});

await app.setup();
```

### Configuration

The automatic environment variable substitution in `@feathersjs/configuration` was causing subtle and hard to debug issues. It has been removed to instead rely on the functionality already provided and battle tested by the underlying [node-config](https://github.com/lorenwest/node-config). To update your configuration:

- Relative paths are now longer relative to the configuration file but relative to where the application runs. This normally (when running from the application folder) means that paths starting with `../` and `./` have to be replaced with `./` and `./config/`.
- Configuration through environment variables should be included via the `NODE_CONFIG` JSON string or as [Custom Environment Variable support](https://github.com/lorenwest/node-config/wiki/Environment-Variables#custom-environment-variables). To use existing environment variables add the following configuration file in `config/custom-environment-variables.<json|yaml|js>` like this:

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

### Client

- The `request` library has been deprecated and request support has been removed from the REST client.
- Since all modern browsers now support built-in [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), the Angular and jQuery REST clients have been removed as well.
- The `@feathersjs/client` package now only comes with a full (`dist/feathers.js`) and core (`dist/core.js`) browser build. Using Feathers [with a module loader](../api/client.md#module-loaders) is recommended for all other use cases.

### Authentication

- Grant upgrade
- handleConnection update

### Removed primus transport

Due to low usage `@feathersjs/primus` and `@feathers/primus-client` have been removed from Feathers core. If you require continued support consider adopting it [as a sponsored module](https://github.com/sponsors/daffl).

### Legacy socket format and timeouts

- The legacy `servicename::method` socket message format has been deprecated in Feathers 3 and has now been removed. Use a v3 or later [Feathers client]() or the [current Socket.io direct connection API]().
- The `timeout` setting for socket services has been removed. It was mainly intended as a fallback for the old message format and interfered with the underlying timeout and retry mechanism provided by the websocket libraries themselves.

### Uberproto

Services are no longer Uberproto (an ES5 inheritance utility) objects and instead rely on modern JavaScript classes and extension. This means `app.service(name).mixin(data)` is no longer available which can be replaced with a basic `Object.assign(app.service(name), data)`:

```js
// Before
app.mixins.push((service, path) => {
  service.mixin({
    create (data, params) {
      // do something here
      return this._super(data, params);
    }
  });
});

// Now
app.mixins.push((service, path) => {
  const { create } = service;

  Object.assign(service, {
    create (data, params) {
      // do something here, then invoke the old method
      // through normal JavaScript functionality
      return create.call(this, data, params);
    }
  });
});
```

### `finally` hook

The undocumented `finally` hook type is no longer available and should be replaced by the new asynchronous hooks which offer the same functionality using plain JavaScript:

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

### Other internal changes

- The undocumented `service._setup` method introduced in v1 will no longer be called. It was used to circumvent middleware inconsistencies from Express 3 and is no longer necessary.
- The undocumented `app.providers` has been removed since it provided the same functionality as [`app.mixins`]()
- `app.disable`, `app.disabled`, `app.enable` and `app.enabled` have been removed from basic Feathers applications. It will still be available in an Express compatible Feathers application. `app.get()` and `app.set()` should be used instead.

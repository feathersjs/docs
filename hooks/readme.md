# Feathers Hooks

`feathers-hooks` is a powerful plugin that allows to register composable middleware functions **before** or **after** a Feathers service method executes. This makes it easy to decouple things like authorization, data pre- or post processing or sending notifications like emails or text messages after something happened from the actual service logic.

A hook is *provider independent* which means it does not matter if it has been called through REST, Socket.io, Primus or any other provider Feathers may support in the future.

If you would like to learn more about the design patterns behind hooks read up on [API service composition with hooks](https://medium.com/all-about-feathersjs/api-service-composition-with-hooks-47af13aa6c01). In this chapter we will look at the [usage of hooks](usage.md), some [examples](examples.md) and the [built-in hooks](bundled.md).

## Getting Started

To install from NPM run:

```bash
$ npm install feathers-hooks
```

Then, to use the plugin in a Feathers app:

```javascript
const feathers = require('feathers');
const hooks = require('feathers-hooks');

const app = feathers().configure(hooks());
```

Now we can register a hook for a service:

```javascript
const service = require('feathers-memory');

// Initialize our service
app.use('/users', service());

// Get our initialized service so that we can bind hooks
const userService = app.service('/users');

// Set up our before hook
userService.before({
  find(hook) {
    console.log('My custom hook ran');
  }
});
```

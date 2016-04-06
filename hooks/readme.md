# Feathers Hooks

Hooks are just small middleware functions that get applied **before** and **after** a service method executes. The concept comes from [Aspect Oriented Programming](https://en.wikipedia.org/wiki/Aspect-oriented_programming) and they are construct for implementing [Cross Cutting Concerns](https://en.wikipedia.org/wiki/Cross-cutting_concern).

A hook is *provider independent*, which means it does not matter if it has been called through REST, Socket.io, Primus or any other provider Feathers may support in the future.

They are also service agnostic, meaning they can be used with ​**any**​ service regardless of whether they have a model or not. This keeps services lighter weight and only focused on the CRUD part of an application. An added benefit of not having things like validation baked into your services is flexibility. 

Using hooks allows you to easily decouple the actual service logic from things like authorization, data pre-processing (sanitization and validation), data post processing (serialization), or sending notifications like emails or text messages after something happened.

That way you can swap databases or ORMs with minimal application code changes. You can also share validations for multiple databases in the same app, across multiple apps, and with your client. If hooks weren't completely independent of the service this would be extremely difficult to accomplish.

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
  find: function(hook) {
    console.log('My custom hook ran');
  }
});
```

# Hooks

Hooks are pluggable middleware functions that can be registered __before__, __after__ or on __error__s of a [service method](./services.md). You can register a single hook function or create a chain of them to create complex work-flows. Most of the time multiple hooks are registered so the examples show the "hook chain" array style registration.

A hook is **transport independent**, which means it does not matter if it has been called through HTTP(S) (REST), Socket.io, Primus or any other transport Feathers may support in the future. They are also service agnostic, meaning they can be used with ​**any**​ service regardless of whether they have a model or not.

Hooks are commonly used to handle things like validation, logging, populating related entities, sending notifications and more. This pattern keeps your application logic flexible, composable, and much easier to trace through and debug. For more information about the design patterns behind hooks see [this blog post](https://blog.feathersjs.com/api-service-composition-with-hooks-47af13aa6c01).

## Quick Example

The following example adds a `createdAt` and `updatedAt` property before saving the data to the database and logs any errors on the service:

```js
const feathers = require('@feathersjs/feathers');

const app = feathers();

app.service('messages').hooks({
  before: {
    create(context) {
      context.data.createdAt = new Date();
    },

    update(context) {
      context.data.updatedAt = new Date();
    },

    patch(context) {
      context.data.updatedAt = new Date();
    }
  },

  error(context) {
    console.error(`Error in ${context.path} calling ${context.method} method`, context.error);
  }
});
```

## Hook functions

A hook function can be a normal or `async` function or arrow function that takes the [hook context](#hook-context) as the parameter and can

- return a `context` object
- return nothing (`undefined`)
- `throw` an error
- for asynchronous operations return a [Promise](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise) that
  - resolves with a `context` object
  - resolves with `undefined`
  - rejects with an error

```js
// normal hook function
function(context) {
  return context;
}

// asynchronous hook function with promise
function(context) {
  return Promise.resolve(context);
}

// async hook function
async function(context) {
  return context;
}

// normal arrow function
context => {
  return context;
}

// asynchronous arrow function with promise
context => {
  return Promise.resolve(context);
}

// async arrow function
async context => {
  return context;
}
```

When an error is thrown (or the promise is rejected), all subsequent hooks - and the service method call if it didn't run already - will be skipped and only the error hooks will run.

The following example throws an error when the text for creating a new message is empty. You can also create very similar hooks to use your Node validation library of choice.

```js
app.service('messages').hooks({
  before: {
    create: [
      function(context) {
        if(context.data.text.trim() === '') {
          throw new Error('Message text can not be empty');
        }
      }
    ]
  }
});
```

## Hook context

The hook `context` is passed to a hook function and contains information about the service method call. It has __read only__ properties that should not be modified and ___writeable___ properties that can be changed for subsequent hooks.

> **Pro Tip:** The `context` object is the same throughout a service method call so it is possible to add properties and use them in other hooks at a later time.

### context.app

`context.app` is a _read only_ property that contains the [Feathers application object](./application.md). This can be used to retrieve other services (via `context.app.service('name')`) or configuration values.

### context.service

`context.service` is a _read only_ property and contains the service this hook currently runs on.

### context.path

`context.path` is a _read only_ property and contains the service name (or path) without leading or trailing slashes.

### context.method

`context.method` is a _read only_ property with the name of the [service method](./services.md) (one of `find`, `get`, `create`, `update`, `patch`, `remove`).

### context.type

`context.type` is a _read only_ property with the hook type (one of `before`, `after` or `error`).

### context.params

`context.params` is a __writeable__ property that contains the [service method](./services.md) parameters (including `params.query`).

### context.id

`context.id` is a __writeable__ property and the `id` for a `get`, `remove`, `update` and `patch` service method call. For `remove`, `update` and `patch` `context.id` can also be `null` when modifying multiple entries. In all other cases it will be `undefined`.

> __Note:__ `context.id` is only available for method types `get`, `remove`, `update` and `patch`.

### context.data

`context.data` is a __writeable__ property containing the data of a `create`, `update` and `patch` service method call.

> __Note:__ `context.data` will only be available for method types `create`, `update` and `patch`.

### context.error

`context.error` is a __writeable__ property with the error object that was thrown in a failed method call. It is only available in `error` hooks.

> __Note:__ `context.error` will only be available if `context.type` is `error`.

### context.result

`context.result` is a __writeable__ property containing the result of the successful service method call. It is only available in `after` hooks. `context.result` can also be set in

- A `before` hook to skip the actual service method (database) call
- An `error` hook to swallow the error and return a result instead

> __Note:__ `context.result` will only be available if `context.type` is `after` or if `context.result` has been set.

### context.dispatch

`context.dispatch` is a __writeable, optional__ property and contains a "safe" version of the data that should be sent to any client. If `context.dispatch` has not been set `context.result` will be sent to the client instead.

> __Note:__ `context.dispatch` only affects the data sent through a Feathers Transport like [REST](./express) or [Socket.io](./socketio.md). An internal method call will still get the data set in `context.result`.

## Asynchronous hooks

When the hook function is `async` or a Promise is returned it will wait until all asynchronous operations resolve or reject before continuing to the next hook.

> **Important:** As stated in the [hook functions](#hook-functions) section the promise has to either resolve with the `context` object (usually done with `.then(() => context)` at the end of the promise chain) or with `undefined`.

### async/await

When using Node v8.0.0 or later the use of [async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) is highly recommended. This will avoid many common issues when using Promises and asynchronous hook flows. Any hook function can be `async` in which case it will wait until all `await` operations are completed. Just like a normal hook it should return the `context` object or `undefined`.

The following example shows an async/await hook that uses another service to retrieve and populate the messages `user` when getting a single message:

```js
app.service('messages').hooks({
  after: {
    get: [
      async function(context) {
        const userId = context.result.userId;

        // Since context.app.service('users').get returns a promise we can `await` it
        const user = await context.app.service('users').get(userId);

        // Update the result (the message)
        context.result.user = user;

        // Returning will resolve the promise with the `context` object
        return context;
      }
    ]
  }
});
```

### Returning promises

The following example shows an asynchronous hook that uses another service to retrieve and populate the messages `user` when getting a single message.

```js
app.service('messages').hooks({
  after: {
    get: [
      function(context) {
        const userId = context.result.userId;

        // context.app.service('users').get returns a Promise already
        return context.app.service('users').get(userId).then(user => {
          // Update the result (the message)
          context.result.user = user;

          // Returning will resolve the promise with the `context` object
          return context;
        });
      }
    ]
  }
});
```

> __Note:__ A common issue when hooks are not running in the expected order is a missing `return` statement of a promise at the top level of the hook function.

> **Important:** Most Feathers service calls and newer Node packages already return Promises. They can be returned and chained directly. There is no need to instantiate your own `new` Promise instance in those cases.

### Converting callbacks

When the asynchronous operation is using a _callback_ instead of returning a promise you have to create and return a new Promise (`new Promise((resolve, reject) => {})`) or use [util.promisify](https://nodejs.org/api/util.html#util_util_promisify_original).

The following example reads a JSON file converting [fs.readFile](https://nodejs.org/api/fs.html#fs_fs_readfile_file_options_callback) with `util.promisify`:

```js
const fs = require('fs');
const utils = require('utils');
const readFile = utils.promisify(fs.readFile);

app.service('messages').hooks({
  after: {
    get: [
      function(context) {
        return readFile('./myfile.json').then(data => {
          context.result.myFile = data.toString();

          return context;
        });
      }
    ]
  }
});
```

> **Pro Tip:** Other tools like [Bluebird](https://github.com/petkaantonov/bluebird) also help converting between callbacks and promises.

## Registering hooks

Hook functions are registered on a service through the `app.service(<servicename>).hooks(hooks)` method. There are several options for what can be passed as `hooks`:

```js
// The standard all at once way (also used by the generator)
// an array of functions per service method name (and for `all` methods)
app.service('servicename').hooks({
  before: {
    all: [
      // Use normal functions
      function(context) { console.log('before all hook ran'); }
    ],
    find: [
      // Use ES6 arrow functions
      context => console.log('before find hook 1 ran'),
      context => console.log('before find hook 2 ran')
    ],
    get: [ /* other hook functions here */ ],
    create: [],
    update: [],
    patch: [],
    remove: []
  },
  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },
  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
});

// Register a single hook before, after and on error for all methods
app.service('servicename').hooks({
  before(context) {
    console.log('before all hook ran');
  },
  after(context) {
    console.log('after all hook ran');
  },
  error(context) {
    console.log('error all hook ran');
  }
});
```

> **Pro Tip:** When using the full object, `all` is a special keyword meaning this hook will run for all methods. `all` hooks will be registered before other method specific hooks.

> **Pro Tip:** `app.service(<servicename>).hooks(hooks)` can be called multiple times and the hooks will be registered in that order. Normally all hooks should be registered at once however to see at a glance what what the service is going to do.

## Application hooks

To add hooks to every service `app.hooks(hooks)` can be used. Application hooks are [registered in the same format as service hooks](#registering-hooks) and also work exactly the same. Note when application hooks will be executed however:

- `before` application hooks will always run _before_ all service `before` hooks
- `after` application hooks will always run _after_ all service `after` hooks
- `error` application hooks will always run _after_ all service `error` hooks

Here is an example for a very useful application hook that logs every service method error with the service and method name as well as the error stack.

```js
app.hooks({
  error(context) {
    console.error(`Error in '${context.path}' service method '${context.method}`, context.error.stack);
  }
});
```

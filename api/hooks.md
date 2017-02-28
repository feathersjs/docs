# Hooks

[![GitHub stars](https://img.shields.io/github/stars/feathersjs/feathers-hooks.png?style=social&label=Star)](https://github.com/feathersjs/feathers-hooks/)
[![npm version](https://img.shields.io/npm/v/feathers-hooks.png?style=flat-square)](https://www.npmjs.com/package/feathers-hooks)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.png?style=flat-square)](https://github.com/feathersjs/feathers-hooks/blob/master/CHANGELOG.md)

```
$ npm install feathers-hooks --save
```

Hooks are pluggable middleware functions that can be registered __before__, __after__ or on __error__s of a [service method](./services.md). You can register a single hook function or create a chain of them to create complex work-flows. Most of the time multiple hooks are registered so the examples show the "hook chain" array style registration.

A hook is **transport independent**, which means it does not matter if it has been called through HTTP(S) (REST), Socket.io, Primus or any other transport Feathers may support in the future. They are also service agnostic, meaning they can be used with ​**any**​ service regardless of whether they have a model or not.

Hooks are commonly used to handle things like validation, logging, populating related entities, sending notifications and more. This pattern keeps you application logic flexible, composable, and much easier to trace through and debug. For more information about the design patterns behind hooks see [this blog post](https://blog.feathersjs.com/api-service-composition-with-hooks-47af13aa6c01).

The following example adds a `createdAt` and `updatedAt` property before sending the data to the database.

```js
const feathers = require('feathers');
const hooks = require('feathers-hooks');

const app = feathers();

app.configure(hooks());

app.service('messages').hooks({
  before: {
    create(hook) {
      hook.data.createdAt = new Date();
    },

    update(hook) {
      hook.data.updatedAt = new Date();
    },

    patch(hook) {
      hook.data.updatedAt = new Date();
    }
  }
});
```


## Hook objects

The `hook` object is passed to a hook function and contains information about the service method call. Hook objects have __read only__ properties that should not be modified and __writeable__ properties that can be changed for subsequent hooks.

- __Read Only:__
  - `app` - The [app object](./application.md) (used to e.g. retrieve other services)
  - `service` - The service this hook currently runs on
  - `path` - The path (name) of the service
  - `method` - The service method name
  - `type` - The hook type (`before`, `after` or `error`)
- __Writeable:__
  - `params` - The service method parameters (including `params.query`)
  - `id` - The id (for `get`, `remove`, `update` and `patch`)
  - `data` - The request data (for `create`, `update` and `patch`)
  - `error` - The error that was thrown (only in `error` hooks)
  - `result` - The result of the successful method call (only in `after` hooks).

> **Pro Tip:** `hook.result` Can also be set in a `before` hook which will skip the service method call (but run all other hooks).

<!-- -->

> **Pro Tip:** `hook.id` can also be `null` for `update`, `patch` and `remove`. See the [service methods](./services.md) for more information.

<!-- -->

> **Pro Tip:** The `hook` object is the same throughout a service method call so it is possible to add properties and use them in other hooks at a later time.


## Hook functions

A hook function (or just _hook_) takes a [hook object](#hook-objects) as the parameter (`function(hook) {}` or `hook => {}`) and can

- return nothing (`undefined`)
- return the `hook` object
- `throw` an error
- for asynchronous operations return a [Promise](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise) that
  - resolves with a `hook` object
  - resolves with `undefined`
  - rejects with an error

When an error is thrown (or the promise is rejected), all subsequent hooks - and the service method call if it didn't run already - will be skipped and only the error hooks will run.

The following example throws an error when the text for creating a new message is empty. You can also create very similar hooks to use your Node validation library of choice.

```js
app.service('messages').hooks({
  before: {
    create: [
      (hook) => {
        if(hook.data.text.trim() === '') {
          throw new Error('Message text can not be empty');
        }
      }
    ]
  }
});
```


## Asynchronous hooks

When a Promise is returned the hook will wait until it resolves or rejects before continuing.

> **Important:** As stated in the [hook functions](#hook-functions) section the promise has to either resolve with the `hook` object (usually done with `.then(() => hook)` at the end of the promise chain) or with `undefined`.

The following example shows an asynchronous hook that uses another service to retrieve and populate the messages `user` when getting a single message.

```js
app.service('messages').hooks({
  after: {
    get: [
      (hook) => {
        const userId = hook.result.userId;

        // hook.app.service('users').get returns a Promise already
        return hook.app.service('users').get(userId).then(user => {
          // Update the result (the message)
          hook.result.user = user;

          // Returning will resolve the promise with the `hook` object
          return hook;
        });
      }
    ]
  }
});
```

When the asynchronous operation is using a _callback_ instead of returning a promise you have to create and return a new Promise (`new Promise((resolve, reject) => {})`).

The following example reads a JSON file with [fs.readFile](https://nodejs.org/api/fs.html#fs_fs_readfile_file_options_callback) and adds it to the message:

```js
app.service('messages').hooks({
  after: {
    get: [
      (hook) => {
        return new Promise((resolve, reject) => {
          require('fs').readFile('./myfile.json', (error, data) => {
            // Check if the callback got an error, if so reject the promise and return
            if(error) {
              return reject(error);
            }

            hook.result.myFile = JSON.parse(data.toString());

            // Resolve the promise with the `hook` object
            resolve(hook);
          });
        });
      }
    ]
  }
});
```

> **Pro Tip:** Tools like [Bluebird](https://github.com/petkaantonov/bluebird) make converting between callbacks and promises easier.

<!-- -->

> **Important:** Most Feathers service calls and newer Node packages already return Promises. They can be returned and chained directly. There is no need to instantiate your own `new` Promise instance in those cases.


## Registering hooks

Hook functions are registered on a service through the `app.service(<servicename>).hooks(hooks)` method. There are several options for what can be passed as `hooks`:

```js
// The standard all at once way (also used by the generator)
// an array of functions per service method name (and for `all` methods)
app.service('servicename').hooks({
  before: {
    all: [
      // Use normal functions
      function(hook) { console.log('before all hook ran'); }
    ],
    find: [
      // Use ES6 arrow functions
      hook => console.log('before find hook 1 ran'),
      hook => console.log('before find hook 2 ran')
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
  before(hook) {
    console.log('before all hook ran');
  },
  after(hook) {
    console.log('after all hook ran');
  },
  error(hook) {
    console.log('error all hook ran');
  }
});

// Register a hook for all types and all methods
app.service('servicename').hooks(function(hook) {
  console.log('Everything hook ran');
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
  error(hook) {
    console.error(`Error in '${hook.path}' service method '${hook.method}`, hook.error.stack);
  }
});
```

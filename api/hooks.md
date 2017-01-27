# Hooks

Hooks are pluggable middleware functions that can be registered before, after or on errors of a [service method](./services.md). 

They are a flexible way to handle things like validation, logging, populating related entities, sending notifications and more without having to change the original service. For more information about the design patterns behind hooks see [this blog post](https://blog.feathersjs.com/api-service-composition-with-hooks-47af13aa6c01).

See the the [examples](#examples) section for hook examples and the [common hooks](./hooks-common.md) documentation for a collection of useful pre-built hooks.

## Hook functions

A hook function (or just _hook_) takes a [hook object](#hook-objects) as the parameter (`function(hook) {}` or `hook => {}`) and can

- return nothing (`undefined`)
- return the `hook` object
- `throw` an error
- for asynchronous operations return a [Promise](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise) that
  - resolves with a `hook` object
  - resolves with `undefined`
  - rejects with an error

When an error is thrown (or the promise is rejected) all subsequent hooks - and the service method call if it didn't run already - will be skipped and only the error hooks will run.

### Asynchronous hooks

When a Promise is returned the hook will wait until it resolves or rejects before continuing.

When the asynchronous operation is using a _callback_ instead of returning a promise you have to create and return a new Promise like this:

```js
return new Promise((resolve, reject) => {
  require('fs').readFile('./myfile.json', (error, data) => {
    if(error) {
      return reject(error);
    }

    resolve(JSON.parse(data.toString()));
  });
});
```

> **Pro Tip:** Tools like [Bluebird](https://github.com/petkaantonov/bluebird) can make converting between callbacks and promises easier.

<!-- -->

> **Important:** Most Feathers service calls and newer Node packages already return Promises for asynchronous operations. Those promises can be returned and chained directly. There is no need to instantiate your own `new` Promise instance in those cases.

## Hook objects

The `hook` object is passed to a hook function and contains information about the service method call. Hook objects have __Read-only__ properties that should not be modified and __Writeable__ properties that can be changed for subsequent hooks and the service method call.

- __Read-only:__
  - `app` - The [app object](./application.md) (used to e.g. retrieve other services)
  - `service` - The service this hook currently runs on
  - `path` - The path (name) of the service
  - `method` - The service method name
  - `type` - The hook type (`before`, `after` or `error`)
- __Writeable:__
  - `params` - The service method parameters (including `params.query`)
  - `id` - The id (for `get`, `remove`, `update` and `patch`)
  - `data` - The request data (for `create`, `update` and `patch`)
  - `error` - The error that was thrown (only for `error` hooks)
  - `result` - The result of the successful method call (only `after` hooks).

> **Pro Tip:** `hook.result` Can also be set in a `before` hook which will skip the service method call (but run all other hooks).

<!-- -->

> **Pro Tip:** `hook.id` can also be `null` for `update`, `patch` and `remove`. See the [service methods](./services.md) for more information.

<!-- -->

> **Pro Tip:** The `hook` object is the same throughout a service method call so it is possible to add properties that and use them in other hooks at a later time.

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

// Register a hook before, after and on error for all methods
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

> **Pro Tip:** `app.service(<servicename>).hooks(hooks)` can be called multiple times and the hooks will be registered in that order. We do recommend to register all hooks at once to see how the service behaves however.

## Application hooks

To add hooks to every service (for example a global error logger) `app.hooks(hooks)` can be used. Application hooks are [registered the same way as service hooks](#registering-hooks) and also work exactly the same. Note when application hooks will be executed however:

- `before` application hooks will always run _before_ all service `before` hooks
- `after` application hooks will always run _after_ all service `after` hooks
- `error` application hooks will always run _after_ all service `error` hooks

## Examples

### Adding timestamps

Modifying `hook.data` allows to change the data that is normally sent to the database:

```js
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

### Logging all errors

A very useful application hook that logs every service method error with the service and method name as well as the error stack.

```js
app.hooks({
  error(hook) {
    console.error(`Error in '${hook.path}' service method '${hook.method}`, error.stack);
  }
})
```

### Validating data

A simple example for validation. You can also create very similar hooks that use any Node validation library.

```js
app.service('messages').hooks({
  before: {
    create(hook) {
      if(hook.data.text.trim() === '') {
        throw new Error('Message text can not be empty';)
      }
    }
  }
});
```

### Populate related entities

An asynchronous hook that uses another service to populate the messages `user` when getting a single message:

```js
app.service('messages').hooks({
  after: {
    get(hook) {
      const { userId } = hook.result;
      const message = hook.data;

      // hook.app.service('users').get returns a Promise already
      return hook.app.service('users').get(userId).then(user => {
        message.user = user;

        // Common best practise: always return the `hook` object
        return hook;
      });
    }
  }
});
```

### Filtering data

The following example filters the data returned by a `find` service call based on a users company id and checks if the current user is allowed to retrieve the data returned by `get` (that is, they have the same company id):

```js
app.service('messages').hooks({
  after: {
    find(hook) {
      // Manually filter the find results
      hook.result = hook.result.filter(current => 
        current.companyId === hook.params.user.companyId
      );
    },

    get(hook) {
      if (hook.result.companyId !== hook.params.user.companyId) {
        throw new Error('You are not authorized to access this information');
      }
    }
  }
});
```

# Feathers Hooks

## Getting Started

`feathers-hooks` allow to register composable middleware functions **before** or **after** a Feathers service method executes. This makes it easy to decouple things like authorization and pre- or post processing from your service logic.

To install from [npm](https://www.npmjs.com/package/feathers-hooks), run:

```bash
$ npm install feathers-hooks --save
```

Then, to use the plugin in your Feathers app:

```javascript
var feathers = require('feathers');
var hooks = require('feathers-hooks');

var app = feathers().configure(hooks());
```

Then, you can register the hook for a service:

```javascript
// User service
import service from 'feathers-memory';

export default function(){
  const app = this;

  let myHook = function(options) {
    return function(hook) {
      console.log('My custom hook ran!');
    }
  }

  // Initialize our service
  app.use('/users', service());

  // Get our initialize service to that we can bind hooks
  const userService = app.service('/users');

  // Set up our before hook
  userService.before({
    find: [myHook()]
  });
}
```

## Using hooks

You can add as many `before` and `after` hooks to any Feathers service method or `all` service methods (they will be executed in the order they have been registered). There are two ways to use hooks. Either after registering the service by calling `service.before(beforeHooks)` or `service.after(afterHooks)` or by adding a `before` or `after` object with your hooks to the service.

Lets assume a Feathers application initialized like this:

```js
var feathers = require('feathers');
var memory = require('feathers-memory');
var hooks = require('feathers-hooks');

var app = feathers()
    .configure(feathers.rest())
    .configure(hooks())
    .use('/todos', memory());

app.listen(8000);

// Get the wrapped service object which will be used in the other examples
var todoService = app.service('todos');
```

### `service.before(beforeHooks)`

`before` hooks allow you to pre-process service call parameters. They will be called with the hook object and a callback which should be called with any errors or no arguments or `null` and the modified hook object. The hook object contains information about the intercepted method and for `before` hooks can have the following properties:

- __method__ - The method name
- __type__ - The hook type (`before` or `after`)
- __callback__ - The original callback (can be replaced but shouldn't be called in your hook)
- __params__ - The service method parameters
- __data__ - The request data (for `create`, `update` and `patch`)
- __app__ - The `app` object
- __id__ - The id (for `get`, `remove`, `update` and `patch`)

All properties of the hook object can be modified and the modified data will be used for the actual service method call. This is very helpful for pre-processing parameters and massaging data when creating or updating.

The following example adds an authorization check (if a user has been provided in the params) to *all* service methods and also adds a `createdAt` property to a newly created todo:

```js
todoService.before({
  all: function (hook) {
    throw new Error('You are not logged in');
  },

  create: function(hook, next) {
    hook.data.createdAt = new Date();
  }
});
```

> **Note:** `all` hooks will be registered before specific hooks in that object. For the above example that means that the `all` hook will be added to the `create` service method and then the specific hook.

### `service.after(afterHooks)`

`after` hooks will be called with a similar hook object than `before` hooks but additionally contain a `result` property with the service call results:

- __method__ - The method name
- __type__ - The hook type (`before` or `after`)
- __result__ - The service call result data
- __callback__ - The original callback (can be replaced but shouldn't be called in your hook)
- __params__ - The service method parameters
- __data__ - The request data (for `create`, `update` and `patch`)
- __app__ - The `app` object
- __id__ - The id (for `get`, `remove`, `update` and `patch`)

In any `after` hook, only modifications to the `result` object will have any effect. This is a good place to filter or post-process the data retrieved by a service and also add some additional authorization that needs the actual data.

The following example filters the data returned by a `find` service call based on a users company id and checks if the current user is allowed to retrieve the data returned by `get` (that is, they have the same company id):

```js
todoService.after({
  find: function (hook) {
    // Manually filter the find results
    hook.result = _.filter(hook.result, function (current) {
      return current.companyId === params.user.companyId;
    });
  },

  get: function (hook) {
    if (hook.result.companyId !== hook.params.user.companyId) {
      throw new Error('You are not authorized to access this information');
    }
  }
});
```

After hooks also support the `all` property to register a hook for every service method.

> **Note:** `all` hooks will be registered after specific hooks in that object.

### As service properties

You can also add `before` and `after` hooks to your initial service object right away by setting the `before` and `after` properties to the hook object. The following example has the same effect as the previous examples:

```js
var TodoService = {
  todos: [],

  get: function (id, params, callback) {
    for (var i = 0; i < this.todos.length; i++) {
      if (this.todos[i].id === id) {
        return callback(null, this.todos[i]);
      }
    }

    callback(new Error('Todo not found'));
  },

  // Return all todos from this service
  find: function (params, callback) {
    callback(null, this.todos);
  },

  // Create a new Todo with the given data
  create: function (data, params, callback) {
    data.id = this.todos.length;
    this.todos.push(data);

    callback(null, data);
  },

  before: {
    find: function (hook) {
      if (!hook.params.user) {
        throw new Error('You are not logged in');
      }
    },

    create: function (hook) {
      hook.data.createdAt = new Date();
    }
  },

  after: {
    find: function (hook) {
      // Manually filter the find results
      hook.result = _.filter(hook.result, function (current) {
        return current.companyId === params.user.companyId;
      });
    },

    get: function (hook) {
      if (hook.result.companyId !== hook.params.user.companyId) {
        throw new Error('You are not authorized to access this information');
      }
    }
  }
}
```

### Promises

All hooks can return a [Promise](http://promises-aplus.github.io/promises-spec/) object instead of calling the callback.

```js
todoService.before({
  find: function (hook) {
    return new Promise(function(resolve, reject) {

    });
  }
});
```

If you want to change the hook object just chain the returned promise using `.then`:

```js
todoService.before({
  find: function (hook) {
    return this.find().then(function(data) {
      hook.params.message = 'Ran through promise hook';
      hook.data.result = result;
      // Always return the hook object
      return hook;
    });
  }
});
```

If a promise fails, the error will be propagated immediately.

### Chaining / Registering Multiple Hooks

If you want to register more than one `before` or `after` hook for the same method, there are 2 ways that you can do this:

#### Dynamic Registrations

If you register a `before` or `after` hook for a certain method in one place and then register another `before` or `after` hook for the same method, `feathers-hooks` will automatically execute them in a chained fashion **in the order that they were registered**.

> **Pro Tip:** _This works well if you have more dynamic or conditional hooks._

```js
var app = feathers().use('/users', userService);

// We need to retrieve the wrapped service object from app which has the added hook functionality
var userService = app.service('users');

userService.before({
    ...
});

// Somewhere else
userService.before({
    ...
});

```

#### Defining Arrays

You can also register multiple hooks at the same time, in the order that you want them executed, when you are registering your service.

> **Pro Tip:** _This is the preferred method because it is bit cleaner and execution order is more apparent._


```js
var hooks = require('your-hooks');

var app = feathers().use('/users', userService);

// We need to retrieve the wrapped service object from app which has the added hook functionality
var userService = app.service('users');

userService.before({
  // Auth is required.  No exceptions
  create : [hooks.requireAuth, hooks.setUserID, hooks.setCreatedAt]
});
```

## Communicating with other services.
Hooks make it convenient to work with other services. You can use the `app` object to lookup the services you need to use like this:

```js
/**
 * Check if provided account already exists.
 */
export default function(hook) {
  // Get a reference to the accounts service.
  const accounts = hook.app.service('accounts');

  return new Promise(function(resolve, reject) {

    // Do something with the accounts service here.

    hook.params.accountExists = 'yup';
    resolve(hook);
  });
}
```

# Using hooks

You can add as many `before` and `after` hooks to any Feathers service method (`find`, `create`, `update`, `patch` and `remove`) or `all` service methods. Hooks will be executed in the order they have been registered. There are two ways to use hooks. Either after registering the service by calling `service.before(beforeHooks)` or `service.after(afterHooks)` or by adding a `before` or `after` object with your hooks to the service. `this` in a hook function is the service it currently runs on.

Lets assume a Feathers application initialized like this:

```js
const feathers = require('feathers');
const memory = require('feathers-memory');
const hooks = require('feathers-hooks');

const app = feathers()
  .configure(feathers.rest())
  .configure(hooks())
  .use('/todos', memory());

app.listen(8000);

// Get the wrapped service object which will be used in the other examples
const todoService = app.service('todos');
```

## Before hooks

`service.before(beforeHooks)` hooks allow you to pre-process service call parameters. They will be called with the hook object and a callback which should be called with any errors or no arguments or `null` and the modified hook object. The hook object contains information about the intercepted method and for `before` hooks can have the following properties:

- __method__ - The method name
- __type__ - The hook type (`before` or `after`)
- __callback__ - The original callback (can be replaced but shouldn't be called in your hook)
- __params__ - The service method parameters
- __data__ - The request data (for `create`, `update` and `patch`)
- __app__ - The `app` object
- __id__ - The id (for `get`, `remove`, `update` and `patch`)

All properties of the hook object can be modified and the modified data will be used for the actual service method call. This is very helpful for pre-processing parameters and massaging data when creating or updating.

`before` hooks can set `hook.result` which will skip the original service method. This can be used to override methods (see the [soft-delete example](examples.md).

The following example adds an authorization check (if a user has been provided in the params) to *all* service methods and also adds a `createdAt` property to a newly created todo:

```js
todoService.before({
  all(hook) {
    if(!hook.params.user) {
      throw new Error('You need to be logged in');
    }
  },

  create(hook, next) {
    hook.data.createdAt = new Date();
  }
});
```

> **Note:** `all` hooks will be registered before specific hooks in that object. For the above example that means that the `all` hook will be added to the `create` service method and then the specific hook.

## After hooks

`service.after(afterHooks)` hooks will be called with a similar hook object than `before` hooks but additionally contain a `result` property with the service call results:

- __method__ - The method name
- __type__ - The hook type (`before` or `after`)
- __result__ - The service call result data
- __callback__ - The original callback (can be replaced but shouldn't be called in your hook)
- __params__ - The service method parameters
- __data__ - The request data (for `create`, `update` and `patch`)
- __app__ - The `app` object
- __id__ - The id (for `get`, `remove`, `update` and `patch`)

In any `after` hook, only modifications to the `result` object will have any effect. This is a good place to filter or post-process the data retrieved by a service.

The following example filters the data returned by a `find` service call based on a users company id and checks if the current user is allowed to retrieve the data returned by `get` (that is, they have the same company id):

```js
todoService.after({
  find(hook) {
    // Manually filter the find results
    hook.result = hook.result.filter(current => 
      current.companyId === params.user.companyId
    );
  },

  get(hook) {
    if (hook.result.companyId !== hook.params.user.companyId) {
      throw new Error('You are not authorized to access this information');
    }
  }
});
```

After hooks also support the `all` property to register a hook for every service method.

> **Note:** `all` hooks will be registered after specific hooks in that object.

## As service properties

You can also add `before` and `after` hooks to your initial service object right away by setting the `before` and `after` properties to the hook object. The following example has the same effect as the previous examples:

```js
const TodoService = {
  todos: [],

  get(id, params) {
    for (var i = 0; i < this.todos.length; i++) {
      if (this.todos[i].id === id) {
        return Promise.resolve(this.todos[i]);
      }
    }

    return Promise.reject(new Error('Todo not found'));
  },

  // Return all todos from this service
  find(params, callback) {
    return Promise.resolve(this.todos);
  },

  // Create a new Todo with the given data
  create(data, params, callback) {
    data.id = this.todos.length;
    this.todos.push(data);
    
    return Promise.resolve(data);
  },

  before: {
    find(hook) {
      if (!hook.params.user) {
        throw new Error('You are not logged in');
      }
    },

    create(hook) {
      hook.data.createdAt = new Date();
    }
  },

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
}
```

## Asynchronous hooks

Hooks also allow asynchronous processing either by returning a Promise or by calling a callback.

### Promises

All hooks can return a [Promise](http://promises-aplus.github.io/promises-spec/) object for asynchronous operations:

```js
todoService.before({
  find(hook) {
    return new Promise((resolve, reject) => {

    });
  }
});
```

If you want to change the hook object just chain the returned promise using `.then`:

```js
todoService.before({
  find(hook) {
    return this.find().then(data => {
      hook.params.message = 'Ran through promise hook';
      hook.data.result = result;
      // Always return the hook object
      return hook;
    });
  }
});
```

If a promise fails, the error will be propagated immediately.

### Continuation passing

Another way is to pass `next` callback as the second parameter that has to be called with `(error, data)`.

```js
todoService.before({
  find(hook, next) {
    this.find().then(data => {
      hook.params.message = 'Ran through promise hook';
      hook.data.result = data;
      // With no error
      callback();
      // or to change the hook object
      callback(null, hook);
    });
  }
});
```

## Chaining / Registering Multiple Hooks

If you want to register more than one `before` or `after` hook for the same method, there are 2 ways to do this.

### Dynamic Registrations

If you register a `before` or `after` hook for a certain method in one place and then register another `before` or `after` hook for the same method, `feathers-hooks` will automatically execute them in a chained fashion **in the order that they were registered**.

> **Pro Tip:** _This works well if you have more dynamic or conditional hooks._

```js
const app = feathers().use('/users', userService);

// We need to retrieve the wrapped service object from app which has the added hook functionality
const userService = app.service('users');

userService.before({
    ...
});

// Somewhere else
userService.before({
    ...
});

```

### Defining Arrays

You can also register multiple hooks at the same time, in the order that you want them executed, when you are registering your service.

> **Pro Tip:** _This is the preferred method because it is bit cleaner and execution order is more apparent._


```js
const hooks = require('your-hooks');
const app = feathers().use('/users', userService);

// We need to retrieve the wrapped service object from app which has the added hook functionality
const userService = app.service('users');

userService.before({
  // Auth is required.  No exceptions
  create : [hooks.requireAuth, hooks.setUserID, hooks.setCreatedAt]
});
```

## Communicating with other services.

Hooks make it convenient to work with other services. You can use the `hook.app` object to lookup the services you need to use like this:

```js
/**
 * Check if provided account already exists.
 */
const myHook = function(hook) {
  // Get a reference to the accounts service.
  const accounts = hook.app.service('accounts');
  
  // do something
}
```

# Using hooks

You can add as many `before` and `after` hooks as you like to any of the Feathers service methods:

- `get`
- `find`
- `create`
- `update`
- `patch`
- `remove`
- `all` (all service methods)
 
Hooks will be executed in the order they have been registered. There are two ways to use hooks. Either after registering the service by calling `service.before(beforeHooks)` or `service.after(afterHooks)` or by adding a `before` or `after` object with your hooks to the service.

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

- `method` - The method name
- `type` - The hook type (`before` or `after`)
- `callback` - The original callback (can be replaced but shouldn't be called in your hook)
- `params` - The service method parameters
- `data` - The request data (for `create`, `update` and `patch`)
- `app` - The `app` object
- `id` - The id (for `get`, `remove`, `update` and `patch`)

All properties of the hook object can be modified and the modified data will be used for the actual service method call. This is very helpful for pre-processing parameters and massaging data when creating or updating.

`before` hooks can set `hook.result` which will skip the original service method. This can be used to override methods (see the [soft-delete example](examples.md)).

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

- `method` - The method name
- `type` - The hook type (`before` or `after`)
- `result` - The service call result data
- `callback` - The original callback (can be replaced but shouldn't be called in your hook)
- `params` - The service method parameters
- `data` - The request data (for `create`, `update` and `patch`)
- `app` - The `app` object
- `id` - The id (for `get`, `remove`, `update` and `patch`)

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

> **ProTip:** `all` hooks will be registered after specific hooks in that object.
 
<!-- -->

> **ProTip:** The context for `this` in a hook function is the service it currently runs on.

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
    return this.get().then(data => {
      hook.params.message = 'Ran through promise hook';
      // Always return the hook object
      return hook;
    });
  }
});
```

> **ProTip:** If a promise fails, the error will be propagated immediately and will exit out of the promise chain.

### Continuation passing

Another way is to pass `next` callback as the second parameter that has to be called with `(error, data)`.

```js
todoService.before({
  find(hook, next) {
    this.find().then(data => {
      hook.params.message = 'Ran through promise hook';
      hook.data.result = data;
      // With no error
      next();
      // or to change the hook object
      next(null, hook);
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

> **Pro Tip:** This is the preferred method because it is bit cleaner and execution order is more apparent. As your app gets bigger it is much easier to trace and debug program execution.


```js
const hooks = require('your-hooks');
const app = feathers().use('/users', userService);

// We need to retrieve the wrapped service object from app which has the added hook functionality
const userService = app.service('users');

userService.before({
  // Auth is required.  No exceptions
  create : [hooks.requireAuth(), hooks.setUserID(), hooks.setCreatedAt()]
});
```

## Communicating with other services

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

Now that you know a bit about hooks work. Feel free to check out some [examples](examples.md) or some of the [bundled hooks](bundled.md) that we've already written for you to for common use cases.

## Customizing Built In Hooks

Sometimes you will only want to run a hook in certain circumstances or you wan to modify the functionality of the output of the hook without re-writing it. Since hooks are chainable you can simply wrap it in your own hook.

```js
import { hooks } from 'feathers-authentication';

// Your custom hashPassword hook
exports.hashPassword = function(options) {
  // Add any custom options

  return function(hook) {
    return new Promise((resolve, reject) => {
      if (myCondition !== true) {
        return resolve(hook);
      }

      // call the original hook
      hooks.hashPassword(options)(hook)
        .then(hook => {
          // do something custom
          resolve(hook);
        })
        .catch(error => {
          // do any custom error handling
          error.message = 'my custom message';
          reject(error);
        });
    });
  };
}
```

Then simply use it like you normally would:

```js
import hashPassword from './hooks/myHashPassword';

userService.before({
  create : [hashPassword()]
});
```

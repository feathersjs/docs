# Services

Services are the heart of every Feathers application. A service is simply a JavaScript object that offers one or more of the `find`, `get`, `create`, `update`, `remove` and `setup` service methods and can be used just like an [Express middleware](http://expressjs.com/en/guide/using-middleware.html) with `app.use('/path', serviceObject)`.

A Feathers application with a very simple service and the [REST provider](../rest/readme.md) set up can look like this:

```js
// app.js
const feathers = require('feathers');
const rest = require('feathers-rest');
const app = feathers();

app.configure(rest());
app.use('/todos', {
  get(id, params) {
    return Promise.resolve({
      id,
      params,
      description: `You have to do ${id}!`
    });
  }
});

app.listen(3030);
```

After running

```
npm install feathers feathers-rest
node app.js
```

When going to [localhost:3030/todos/dishes](http://localhost:3030/todos/dishes) you will see:

```json
{
  "id": "dishes",
  "description": "You have to do dishes!",
  "params": {
    "provider": "rest",
    "query": {}
  }
}
```

Adding query parameters, e.g. [localhost:3030/todos/dishes?name=David](http://localhost:3030/todos/dishes?name=David) will return this:

```json
{
  "id": "dishes",
  "description": "You have to do dishes!",
  "params": {
    "provider": "rest",
    "query": {
      "name": "David"
    }
  }
}
```

## Retrieving services

When registering a service with `app.use('/my-service', myService)` Feathers makes a shallow copy of that object and adds its own functionality. This means that to use Feathers functionality (like [real-time events](../real-time/readme), [hooks](../hooks/readme.md) etc.) that new object has to be used. That object can be retrieved with `app.service` like this:

```js
const myService = app.service('my-service');
// also works with leading/trailing slashes
const myService = app.service('/my-service');
```

> __Important:__ The original service object will not be modified and will never have any Feathers functionality.

## Service methods

The complete list of service method signatures is as follows:

```js
const myService = {
  find(params [, callback]) {},
  get(id, params [, callback]) {},
  create(data, params [, callback]) {},
  update(id, data, params [, callback]) {},
  patch(id, data, params [, callback]) {},
  remove(id, params [, callback]) {},
  setup(app, path) {}
}

app.use('/my-service', myService);
```

Or as an [ES6 class](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Classes) (in NodeJS possible by adding the `'use strict';` statement at the beginning of the file):

```js
class MyService {
  find(params [, callback]) {}
  get(id, params [, callback]) {}
  create(data, params [, callback]) {}
  update(id, data, params [, callback]) {}
  patch(id, data, params [, callback]) {}
  remove(id, params [, callback]) {}
  setup(app, path) {}
}

app.use('/my-service', new MyService());
```

Service methods should return a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) and use the following parameters:

- `id` the identifier for the resource. A resource is the data identified by a unique id.
- `data` is the resource data
- `params` can contain any extra parameters, for example the authenticated user. `params.query` contains the query parameters from the client (see the [REST](../rest/readme.md) and [real-time](../real-time/readme.md) providers).
- `callback` is an optional callback that can be called instead of returning a Promise. It is a Node-style callback function following the `function(error, data) {}` convention.

These methods basically reflect a [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) interface:

- `find(params [, callback])` retrieves a list of all resources from the service. Provider parameters will be passed as `params.query`.
- `get(id, params [, callback])` retrieves a single resource with the given `id` from the service.
- `create(data, params [, callback])` creates a new resource with `data`. The method should return a Promise with the newly created data. `data` may also be an array which creates and returns a list of resources.
- `update(id, data, params [, callback])` replaces the resource identified by `id` with `data`. The method should return a Promise with the complete updated resource data. `id` can also be `null` when updating multiple records.
- `patch(id, data, params [, callback])` merges the existing data of the resource identified by `id` with the new `data`. `id` can also be `null` indicating that multiple resources should be patched. The method should return with the complete updated resource data. Implement `patch` additionally to `update` if you want to separate between partial and full updates and support the `PATCH` HTTP method.
- `remove(id, params [, callback])` removes the resource with `id`. The method should return a Promise with the removed resource. `id` can also be `null` indicating to delete multiple resources.

## The `setup` method

`setup(app, path)` initializes the service, passing an instance of the Feathers application and the path it has been registered on. `setup` is a great way to connect services:

```js
// app.js
'use strict';

const feathers = require('feathers');
const rest = require('feathers-rest');

class TodoService {
  get(id, params) {
    return Promise.resolve({
      id,
      description: `You have to ${id}!`
    });
  }
}

class MyService {
  setup(app) {
    this.app = app;
  }

  get(name, params) {
    const todos = this.app.service('todos');
    
    return todos.get('take out trash')
      .then(todo => ({ name, todo }));
  }
}

const app = feathers()
  .configure(rest())
  .use('/todos', new TodoService())
  .use('/my-service', new MyService())

app.listen(8000);
```

You can see the combination when going to [localhost:8000/my-service/test](http://localhost:8000/my-service/test).

## Events

Any registered service will automatically turn into an event emitter that emits events when a resource has changed, that is a `create`, `update`, `patch` or `remove` service call returned successfully. For more information about events, please follow up in the [real-time events chapter](../real-time/events.md).

# Routing and Versioning

In this chapter we will look at custom URL routes and different ways for versioning a Feathers API.

## Nested routes

A quite common question is how to provide nested routes for Feathers services. In general, Feathers does not know about associations between your services. Services are usually connected by their ids so any nested route can also be expressed by query parameters. For example if you have a user service and would like to get all todos (assuming the associated user id is stored in each todo), for that user the url would be `/todos?user_id=<userid>`. This approach also makes it easier to use by non REST providers like websockets and any other protocols Feathers might support in the future.

You can however add Express style parameters to your routes when you register a service (for additional information also see the [REST chapter](../rest/readme.md)). This will then be set in the `params` object in each service call. For example a `/users/:user_id/todos` route can be provided like this:

```js
app.use('/users/:user_id/todos', {
  find: function(params, callback) {
    // params.user_id == current user id
    // e.g. 1234 for /users/1234/todos
  },
  create: function(data, params, callback) {
    data.user_id = params.user_id;
    // store the data
  }
});
```

> **ProTip:** This route should be registered after the `/users` service.

To make the user id part of `params.query` we can use a [before hook](../hooks/readme.md):

```js
app.service('users/:user_id/todos').before({
  find: function(hook) {
    // Only do the mapping for the REST provider
    if(hook.params.provider === 'rest') {
      hook.params.query.user_id = hook.params.user_id;
    }
  }
});
```

Now all `GET /users/<id>/todos` requests will make a `find` query limited to the given user id.

> **ProTip:** Think of Feathers services as their own router that can only be used directly on an application. Services can *not* be used with instances of [Express router](http://expressjs.com/en/4x/api.html#router) (`feathers.Router`).

It is important to keep in mind that those routes are only possible for the REST API of a service. The actual service name is still `users/:user_id/todos`. This means that [Socket.io](..//real-time/socket-io.md) and [Primus](..//real-time/primus.md) connections need to provide the parameter in their query. To be able to use those route parameters both, in Socket.io and REST you have to add a hook that maps those parameters to the query like this:

```js
app.service('users/:user_id/todos').before(function(hook) {
  if(hook.params.user_id) {
    hook.params.query.user_id = hook.params.user_id;
  }
});
```

Then it can be used via websockets like this:

```js
// Using the socket directly
socket.send('users/:user_id/todos::find', { user_id: 1234 }, function(error, todos) {});

// Or with a feathers client
const feathers = require('feathers/client');
const socketio = require('feathers-socketio/client');
const io = require('socket.io-client');

const socket = io();
const app = feathers().configure(socketio(socket));

app.service('users/:user_id/todos').find({
  query: { user_id: 1234 }
}).then(todos => console.log('Todos for user', todos));
```

## Versioning

It is a common practice to provide different version endpoints like `/v1/todos` for an API that evolves over time.

### As routes

The most straightforward way to do this in Feathers is to simply register services with the version in their path:

```js
app.use('/api/v1/todos', myService);
```

This setup is useful if you want to be able to access services from other versions of your API inside hooks. However, all versions will have to use share the same middleware and plugins.

## As sub-applications

Another way is to use entirely separate sub-apps on versioned paths in a parent application. For example with the following application in the `v1/` folder:

```js
// v1/todos.js
module.exports = {
  get(id) {
    return Promise.resolve({
      id,
      description: `You have to do ${id}!`
    });
  }
}

// v1/app.js
const feathers = require('feathers');
const todoService = require('./todos');

const app = feathers().use('/todos', todoService);

module.exports = app;
```

And a different application in the `/v2` folder:

```js
// v2/todos.js
module.exports = {
  get(id) {
    return Promise.resolve({
      id,
      description: `v2 todo for ${id}!`
    });
  }
}

// v2/app.js
const feathers = require('feathers');
const todoService = require('./todos');

const app = feathers().use('/todos', todoService);

module.exports = app;
```

Both applications can be versioned in a top-level `app.js` with:

```js
const feathers = require('feathers');
const v1app = require('./v1/app');
const v2app = require('./v2/app');

const app = feathers()
  .use('/v1', v1app)
  .use('/v2', v2app);
```

Now `/v1/todos/dishes` and `/v2/todos/dishes` will show a different response. For [websocket services](..//real-time/readme.md), the path to listen and send events on will now be `v1/todos` and `v2/todos`. The advantage to doing versioning as shown above (as opposed to doing it directly on the service) is that you will be able to use custom plugins and a custom configuration in each version of your API.

> **ProTip:** Currently, using `app.service('v1/todos')` does not work. You will have to use the imported applications like `v1app.service('todos')` or `v2app.service('todos')`

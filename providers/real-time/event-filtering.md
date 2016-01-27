# Event Filtering

By default all service events will be sent to all connected clients. In many cases you probably want to be able to only send events to certain clients. Both, the [Socket.io](socket-io.md) and [Primus](primus.md) provider add a `.filter` service method which can be used to filter events. A filter is a `function(data, connection, hook)` which gets passed

- the `data` to dispatch
- the `connection` for which the data is being filtered. This is the `feathers` property from the Socket.io and Primus middleware and usually contains information like the connected user
- the `hook` object from the original method call.

It either returns the data to dispatch or `false` if the event should not be dispatched to this client. Returning a Promise that resolves accordingly is also supported.

Filter functions run for every connected client on every event and should be optimized for speed and chained by granularity. That means that general and quick filters should run first to narrow down the connected clients to then run more involved checks if necessary.

## Filter examples

The following example filters all events on the `todos` service if the todo and the connection user do not belong to the same company:

```js
const todos = app.service('todos');

// Blanket filter out all connections that don't belong to the same company
todos.filter(function(data, connection) {
  if(data.company_id !== connection.user.company_id) {
    return false;
  }

  return data;
});
```

As mentioned, filters can be chained. For example, we now know the todo and the connection user belong to the same company. Now we can filter the `created` event to only be sent if the connections user and the user that created the todo are friends with each other:


```js
// After that, filter todos, if the user that created it
// and the connected user aren't friends
todos.filter('created', function(data, connection, hook) {
  // The id of the user that created the todo
  const todoUserId = hook.params.user._id;
  // The a list of ids of the connection's user friends
  const currentUserFriends = connection.user.friends;

  if(currentUserFriends.indexOf(todoUserId) === -1) {
    return false;
  }

  return data;
});
```

## Registering filters

There are several ways of registering filter functions, very similar to how [hooks](hooks.md) can be registered.


```js
const todos = app.service('todos');

// Register a filter for all events
todos.filter(function(data, connection, hook) {});

// Register a filter for the `created` event
todos.filter('created', function(data, connection, hook) {});

// Register a filter for the `created` and `updated` event
todos.filter({
  created(data, connection, hook) {},
  updated(data, connection, hook) {}
});

// Register a filter chain the `created` and `removed` event
todos.filter({
  created: [ filterA, filterB ],
  removed: [ filterA, filterB ]
});
```

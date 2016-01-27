# Real-time

In Feathers, real-time means that [services](services.md) automatically send `created`, `updated`, `patched` and `removed` events when a `create`, `update`, `patch` or `remove` [service method](services.md) returns. Clients can subscribe to those events via websockets through [Socket.io](socket-io.md) or [Primus](primus.md) and update themselves accordingly.

Another great thing about Feathers is that websockets aren't just used for those events. It is also possible to call service methods that way which is often much faster than going through the [REST](rest.md) API.

## Server-side events

Once registered through `app.use` or `app.service` (see the [API documentation](api.md) for more details), a Feathers service gets turned into an [EventEmitter](https://nodejs.org/api/events.html) that sends the events mentioned above. On the server you can listen to them by retrieving the wrapped service object and using it like a normal event emitter.

### created

The `created` event will fire with the result data when a service `create` returns successfully.

```js
app.use('/todos', {
  create(data, params) {
    return Promise.resolve(data);
  }
});

const todos = app.service('todos');

todos.on('created', todo => console.log('Created todo', todo));

todos.create({
  description: 'We have to do something!'
});

app.listen(8000);
```

### updated, patched

The `updated` and `patched` events will fire with the callback data when a service `update` or `patch` method calls back successfully.

```js
app.use('/my/todos/', {
  update(id, data) {
    return Promise.resolve(data);
  }
});

const todos = app.service('my/todos');

todos.on('updated', todo => console.log('Todo updated', todo));
todos.on('patched', todo => console.log('Todo patched', todo));

todos.update(0, {
  description: 'updated todo'
});
todos.patch(0, {
  description: 'patched todo'
});
```

### removed

The `removed` event will fire with the callback data when a service `remove` calls back successfully.

```js
app.use('/todos', {
  remove(id, params) {
    return Promise.resolve({ id: id });
  }
});

const todos = app.service('todos');

todos.on('removed', todo => console.log('Removed todo', todo));
todos.remove(1));
```

## Hooks vs events

Binding to service events is great for logging or updating internal state. However, things like sending an email when creating a new user should be implemented through [hooks](hooks.md).

The reason is that when scaling an application to multiple instances and synchronizing service events across those instances, listening to the event would execute the same action on every instance. With hooks it is also more easily possible to give feedback to the user when an error happened.

## Client-side events

To publish those events to other clients, Feathers currently supports two real-time providers. Follow the link for the detailed documentation.

* [Socket.io](socket-io.md) - Probably the most commonly used real-time library for NodeJS. It works on every platform, browser or device, focusing equally on reliability and speed.
* [Primus](primus.md) - Is a universal wrapper for real-time frameworks that supports Engine.IO, WebSockets, Faye, BrowserChannel, SockJS and Socket.IO

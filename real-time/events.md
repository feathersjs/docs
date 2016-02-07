# Service Events

Once registered through `app.use` or `app.service` (see the [API documentation](api.md) for more details), a Feathers service gets turned into an [EventEmitter](https://nodejs.org/api/events.html) that sends `created`, `updated`, `patched` and `removed` events when the respective service method returns successfully. On the server and [Feathers as the client](../clients/feathers.md) you can listen to them by getting the service object with `app.service('<servicepath>')` and using it like a normal event emitter.

### created

The `created` event will fire with the result data when a service `create` returns successfully.

```js
const feathers = require('feathers');
const app = feathers();

app.use('/messages', {
  create(data, params) {
    return Promise.resolve(data);
  }
});

// Retrieve the wrapped service object which will be an event emitter
const messages = app.service('messages');

messages.on('created', message => console.log('created', message));

messages.create({
  description: 'We have to do something!'
});
```

### updated, patched

The `updated` and `patched` events will fire with the callback data when a service `update` or `patch` method calls back successfully.

```js
const feathers = require('feathers');
const app = feathers();

app.use('/my/messages/', {
  update(id, data) {
    return Promise.resolve(data);
  },
  
  patch(id, data) {
    return Promise.resolve(data);
  }
});

const messages = app.service('my/messages');

messages.on('updated', message => console.log('updated', message));
messages.on('patched', message => console.log('patched', message));

messages.update(0, {
  description: 'updated todo'
});

messages.patch(0, {
  description: 'patched todo'
});
```

### removed

The `removed` event will fire with the callback data when a service `remove` calls back successfully.

```js
const feathers = require('feathers');
const app = feathers();

app.use('/messages', {
  remove(id, params) {
    return Promise.resolve({ id });
  }
});

const messages = app.service('messages');

messages.on('removed', messages => console.log('removed', messages));
messages.remove(1);
```

## Client-side events

To publish those events to other clients, Feathers currently supports two real-time providers (follow the links for the detailed documentation).

* [Socket.io](socket-io.md) - Probably the most commonly used real-time library for NodeJS. It works on every platform, browser or device, focusing equally on reliability and speed.
* [Primus](primus.md) - Is a universal wrapper for real-time frameworks that supports Engine.IO, WebSockets, Faye, BrowserChannel, SockJS and Socket.IO

## Hooks vs events

Binding to service events is great for logging or updating internal state. However, things like sending an email when creating a new user should be implemented through [hooks](../hooks/readme.md).

The reason is that when scaling an application to multiple instances and synchronizing service events across those instances, listening to the event would execute the same action on every instance. With hooks it is also more easily possible to give feedback to the user when an error happened.

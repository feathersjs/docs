# Events

Events are the key part of Feathers real-time functionality. All events in Feathers are provided through the [NodeJS EventEmitter](https://nodejs.org/api/events.html) interface. This section describes

- A quick overview of the [NodeJS EventEmitter interface](#eventemitters)
- The standard [service events](#service-events)
- How to [filter events](#event-filtering) so that only allowed clients receive them
- How to allow sending [custom events](#custom-events) from the server to the client

> **Very important:** [Event filters](#event-filtering) are critical for properly securing a Feathers real-time application.


## EventEmitters

Once registered, any [service](./services.md) gets turned into a standard [NodeJS EventEmitter](https://nodejs.org/api/events.html) and can be used accordingly.

```js
const messages = app.service('messages');

// Listen to a normal service event
messages.on('patched', message => console.log('message patched', message));

// Only listen to an event once
messsages.once('removed', message =>
  console.log('First time a message has been removed', message)
);

// A reference to a handler
const onCreated = message => console.log('New message created', message);

// Listen `created` with a handler reference
messages.on('created', onCreated);

// Unbind the `created` event listener
messages.removeListener('created', onCreatedListener);

// Send a custom event
messages.emit('customEvent', {
  type: 'customEvent',
  data: 'can be anything'
});
```

## Service Events

Any service automaticaly emits `created`, `updated`, `patched` and `removed` events when the respective service method returns successfully. This works on the client as well as on the server. When the client is using [Socket.io](./socketio.md) or [Primus](./primus.md), events will be pushed automatically from the server to all connected client. This is essentially how Feathers does real-time.

> **ProTip:** Events are not fired until all of your [hooks](./hooks.md) have executed.

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
  text: 'We have to do something!'
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
  text: 'updated message'
});

messages.patch(0, {
  text: 'patched message'
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


## Event Filtering

By default all service events will be sent to **all** connected clients. In many cases you probably want to be able to only send events to certain clients, say maybe only ones that are authenticated or only users that belong to the same company. The [Socket.io](socket-io.md) and [Primus](primus.md) provider add a `.filter()` service method which can be used to filter events. A filter is a `function(data, connection, hook)` that runs for every connected client and gets passed

- `data` - the data to dispatch.
- `connection` - the connected socket for which the data is being filtered. This is the `feathers` property from the Socket.io and Primus middleware and usually contains information like the connected user.
- `hook` - the hook object from the original method call.

It either returns the data to dispatch or `false` if the event should not be dispatched to this client. Returning a Promise that resolves accordingly is also supported.

> **ProTip:** Filter functions run for every connected client on every event and should be optimized for speed and chained by granularity. That means that general and quick filters should run first to narrow down the connected clients to then run more involved checks if necessary.

### Registering filters

There are several ways filter functions can be registered, very similar to how [hooks](hooks.md) can be registered.

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

### Filter examples

The following example filters all events on the `messages` service if the connection does not have an [authenticated user](../authentication/readme.md): 

```js
const messages = app.service('messages');

messages.filter(function(data, connection) {
  if(!connection.user) {
    return false;
  }
  
  return data;
});
```

As mentioned, filters can be chained. So once the previous filter passes (the connection has an authenticated user) we can now filter all connections where the data and the user do not belong to the same company:

```js
// Blanket filter out all connections that don't belong to the same company
messages.filter(function(data, connection) {
  if(data.company_id !== connection.user.company_id) {
    return false;
  }

  return data;
});
```

Now that we know the connection has an authenticated user and the data and the user belong to the same company, we can filter the `created` event to only be sent if the connections user and the user that created the Message are friends with each other:


```js
// After that, filter messages, if the user that created it
// and the connected user aren't friends
messages.filter('created', function(data, connection, hook) {
  // The id of the user that created the todo
  const messageUserId = hook.params.user._id;
  // The a list of ids of the connection's user friends
  const currentUserFriends = connection.user.friends;

  if(currentUserFriends.indexOf(messageUserId) === -1) {
    return false;
  }

  return data;
});
```

### Filtering Custom Events

[Custom events](#custom-events) can be filtered the same way:

```js
app.service('payments').filter('status', function(data, connection, hook) {
  
});
```


## Custom events

By default, real-time clients will only receive the [standard events](#service-events). However, it is possible to define a list of custom events on a service as `service.events` that should also be passed.

> **Important:** The [database adapters](./databases/commond.md) also take a list of custom events as an initialization option.

<!-- -->

> **Important:** Custom events can only be sent from the server to the client, not the other way (client to server). [Learn more](../faq/readme.md#how-do-i-create-custom-methods)

For example, a payment service that sends status events to the client while processing a payment could look like this:

```js
class PaymentService {
  constructor() {
    this.events = ['status'];
  },

  create(data, params) {
    createStripeCustomer(params.user).then(customer => {
      this.emit('status', { status: 'created' });
      return createPayment(data).then(result => {
        this.emit('status', { status: 'completed' });
      });
    });
    createPayment(data)
  }
}
```

Now clients can listen to the `<servicepath> status` event. Custom events can be [filtered](filtering.md) just like standard events.

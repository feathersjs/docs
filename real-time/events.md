![Realtime Events](/img/header-real-time-events.jpg)

# Service Events

Once registered through `app.use`, a [Feathers service](../services/readme.md) gets turned into an [EventEmitter](https://nodejs.org/api/events.html) that sends `created`, `updated`, `patched` and `removed` events when the respective service method returns successfully. On the server and with the [Feathers client](../clients/feathers.md) you can listen to them by getting the service object with `app.service('<servicepath>')` and using it like a normal event emitter.  Event behavior can also be customized or disabled using [event filters](/real-time/filtering.md).

> **ProTip:** Events are not fired until all of your _after_ hooks have executed.

![Realtime Events Diagram](/img/real-time-events-flow.jpg)

There are two types of events: Standard and Custom.

## Standard Events

Standard events are built in to every service and are enabled by default.  A standard event exists for each service method that affects data:

 * `created`
 * `updated`
 * `patched`
 * `removed`

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


## Custom events

By default, real-time clients will only receive the standard service events. However, it is possible to define a list of custom events on a service as `service.events` that should also be passed. For example, a payment service that sends status events to the client while processing a payment could look like this:

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


## Listening For Events

It is easy to listen for these events on the client or the server. Depending on the socket library you are using it is a bit different so refer to either the [Socket.io](socket-io.md) or [Primus](primus.md) docs.


## Hooks vs Events

Binding to service events is great for logging or updating internal state. However, things like sending an email when creating a new user should be implemented through [hooks](../hooks/readme.md).

The reason is that if you have multiple application instances of the same app, they will **all** be listening for, in this example, a `user created` event. All of their event handlers would be triggered and each app would send an email. Sending multiple emails to your user when they sign up (N X # of apps) is definitely not intended and not very scalable.

Furthermore, with hooks it is much easier to give feedback to the user when an error happened.

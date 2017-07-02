# Realtime with Optimistic Mutation

Realtime replication only replicates when the client has a connection to the server.
It also requires the client be connected to the server with WebSockets. 

## Using the remote service

You can start a realtime replication and mutate the records on the remote service.
```javascript
import Realtime from 'feathers-offline-realtime';
const messages = app.service('/messages');

const messagesRealtime = new Realtime(messages, { ... });

messagesRealtime.connect()
  .then(() => messages.create(...)
  .then(data => ... );
```

The remote service mutates the data; its service filter sends the event;
the realtime replicator receives that service event and updates the client replica.

> **ProTip:** This is a straight forward, effective and simple approach.

In this scenario, the replicator would emit the following
[event](https://docs.feathersjs.com/guides/offline-first/configure-realtime.html#event-information):

| action  | eventName | record | records | source | description
|---------|-----------|--------|---------|--------|--------------------------
| mutated | created   |   yes  |   yes   |    0   | remote service event

## Mutation delays

There is a delay between the client running `messages.create(...)`
and the client replica containing the new record.
The service call must be transmitted to the server via a WebSocket.
The remote service must make the database call.
The database must schedule and perform it.
The service filters on the server must transmits the event to the client.
The replicator process the service event,
and then finally updates the client replica.

Much of the time this delay is acceptable.
However sometimes it may not be,
particularly on mobile devices with their relatively slow connections.

The realtime replicator's **optimistic mutation** may be used
to produce a **snappier** response at the client.

## Optimistic mutation

Using optimistic mutation is similar to using the remote service directly.
```javascript
import Realtime from 'feathers-offline-realtime';
import optimisticMutator from 'feathers-offline-realtime/optimistic-mutator';
const messages = app.service('/messages');

const messagesRealtime = new Realtime(messages, { uuid: true });

app.use('clientMessages', optimisticMutator({ replicator: messagesRealtime }));
const clientMessages = app.service('clientMessages');

messagesRealtime.connect()
  .then(() => clientMessages.create({ ... }))
  .then(data => ... );
```

However what ensures is rather different.
The optimistic-mutator service immediately updates the client replica
to what it **optimistically** expects the final result will be,
and **the user can see the change right away**.
The replicator then emits an event.

Next, the same processing occurs as for a remote service call:
the call to the server, the database processing, the filter, the service event on the client.
Finally the replicator replaces the optimistic copy of the record
with the one provided by the server.
The replicator emits another event once this happens.

But what happens if the remote service rejects the mutation with an error?
The replicator has kept a copy of the record from before the mutation
and, once it detects the error response,
it replaces the optimistic copy of the record with the prior version.
The replicator emits a different event when this happen.

In a successful optimistic mutation, the replicator emits these
[events](https://docs.feathersjs.com/guides/offline-first/configure-realtime.html#event-information):

| action           | eventName | record | records | source | description
|------------------|-----------|--------|---------|--------|--------------------------
| mutated          |  created  |   yes  |   yes   |    1   | optimistic update
| mutated          |  created  |   yes  |   yes   |    0   | remote service event

When the remote service returns an error, the replicator emits:

| action           | eventName | record | records | source | description
|------------------|-----------|--------|---------|--------|--------------------------
| mutated          |  created  |   yes  |   yes   |    1   | optimistic update
| remove           |  removed  |   yes  |   yes   |    2   | remote service error

## Hooks

The remote service may run before and after hooks, and these may affect the data returned.
The optimistic value of the record in the client replica may end up being replaced with something
different.

> **ProTip:** This may not make a difference in many use cases.

If this is problematic, hooks can be defined **on the client** for the optimistic-mutation service
to reflect what the remote service does.

If this is still unsatisfactory,
you can always make direct remote service calls and live with the latency.

## uuid

Optimistic mutation requires that the records contain a
[uuid](https://en.wikipedia.org/wiki/Universally_unique_identifier)
property.
()Its the only way the replicator can match an optimistic create to the created service event.)

> **ProTip:** The `id` value for optimistic mutation service calls
must be the value of the `uuid` property in the data.

The optimistic mutation service's `create` method will automatically add a `uuid` property
if it does not find one.
You can configure whether an industry standard 32-char uuid is used,
or if a shorter uuid-like value is used.

> **ProTip:** There is virtually
[no chance of collision](https://github.com/dylang/shortid/issues/81#issuecomment-259812835)
with the shorter value unless you work at high scale.

You can configure use of the 32-char uuid, instead of the default shorter value, with:
```javascript
const messagesRealtime = new Realtime(messages, { ... });
messagesRealtime.useShortUuid(false);
```

> **ProTip:** The replicator can provide you with uuid's for other purposes with
`messagesRealtime.getUuid()`.

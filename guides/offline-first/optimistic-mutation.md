# Realtime with Optimistic Mutation

Realtime replication only replicates when the client has a connection to the server.

## Using the remote service

You can start a realtime replication, and mutate the records on the remote service.
```javascript
import Realtime from 'feathers-offline-realtime';
const messages = app.service('/messages');

const messagesRealtime = new Realtime(messages, { ... });

messagesRealtime.connect()
  .then(() => {
    messages.create(...);
  });
```

The remote service mutates the data; its service filter sends the event;
the realtime replicator receives that service event and updates the client replica.

This is a straight forward, effective and simple approach.

In this scenario, the replicator would emit the following
[event](https://docs.feathersjs.com/guides/offline-first/configure-realtime.html#event-information):
| action  | eventName | record | records | source | description
|---------|-----------|--------|---------|--------|--------------------------
| mutated | created   |   yes  |   yes   |    0   | remote service event

## Mutation delays

There is a delay between the client running `messages.create(...)`
and the client replica including the new record.
The service call must be transmitted to the server via REST or WebSocket.
The remote service must make the database call.
The database must schedule the mutation, perform it and return the results.
The service filters on the server must send the event to the client.
The replicator on process the service event,
and then finally update the client replica.

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

const messagesRealtime = new Realtime(messages, Object.assign({}, options, { uuid: true }));

app.use('clientMessages', optimisticMutator({ replicator: messagesRealtime }));
const clientMessages = app.service('clientMessages');

messagesRealtime.connect()
  .then(() => clientMessages.create({ ... }))
```

However what results is very different.
The optimistic-mutator service immediately updates the client replica
to what it **optimistically** expects the final result will be,
and **the user sees the change right away**.
The replicator then emits an event.

The same processing then occurs as for a remote service call:
the call to the server, the database processing, the filter, the service event on the client.
Finally the replicator replaces the optimistic copy of the record
with the one provided by the server.
The replicator emits an event once this happens.

But what happens is the remote service rejects the mutation with an error?
The replicator has kept a copy of the record from before the mutation
and, whan an error occurs, it replaces the optimistic copy of the record with the prior version.
The replicator emits an event should this happen.

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

The remote service may run before and after hooks, and these may affect the record returned.
The optimistic value of the record in the client replica may end up being replaced with something
different.

This may not make a difference in many use cases.
However if it does, hooks can be defined **on the client** for the optimistic-mutation service
to reflect what the remote service does.

If this is still unsatisfactory,
you can always make direct remote service calls and live with the latency.

# Configure Realtime, with optimistic mutation

You can keep on the client a near realtime replica of (some of) the records
in a service configured on the server.

You can optimistically create, modify and remove records in the client replica
using standard Feathers service calls.
These mutations are also asynchronously performed on the server,
and those delayed results may themselves mutate the client replica.
Any errors on the server will revert the data in the client replica. 

These features may make your client more performant, so it appears "snappier."

You can replicate just a subset of the records in the service by providing
an optional "publication" function
which, given a record, determines if the record belongs in the publication.
The publication function may be as complicated as you need though it must be synchronous.

You or some other party may update a record so that it no longer belongs to the publication,
or so that it newly belongs.
The replicator handles these situations.

Many apps have unique data for every user.
With publications, you can keep the records for all users in one table,
using the publication feature to replicate to the client
only those records belonging to the client's user.

A [snapshot replication](https://github.com/feathersjs/feathers-offline-snapshot)
is used to initially obtain the records.

The realtime replicator can notify you of data mutations by emitting an event and/or
calling a subscription function for every notification.
You can in addition periodically poll the replicator to obtain the current realtime records.


> **ProTip:** By default, the client will receive every service event.
You may however use `feathers-offline-publication`,
as mentioned below for `new Realtime(service, options)`,
to reduce the number of service events received by the client to a minimum.
This may noticeable improve performance, especially on mobile devices,
as the client will consume less bandwidth.


> **ProTip:** You can also
[filter these events](https://docs.feathersjs.com/api/events.html#event-filtering)
manually.

You can control the order of the realtime records in the client replica
by providing a sorting function compatible with `array.sort(...)`.
Two sorting functions are included in this repo for your convenience:
- `Realtime.sort(fieldName)` sorts on the `fieldName` in ascending order.
- `Realtime.multiSort({ fieldName1: 1, fieldName2: -1 })` sorts on multiple fields
in either ascending or descending order.

You can dynamically change the sort order as your needs change.
This can be useful for your UI.


#### Snapshot performance

By default, the publication function will be run against every record in the service
during a snapshot.
This may lead to inefficiencies should, for example, a service contain records for 1,000 users
and you want to replicate just the records for just one of them.

To avoid such situations, you may provide a
[Feathers query object](https://docs.feathersjs.com/api/databases/querying.html),
suitable for use in a `.find({ query })` call,
to reduce the number of records read initially.
The publication function will still be run against the returned records.

> **ProTip:** A publication function is required whenever you provide the query object,
and the publication must be at least as restrictive as the query.



> **ProTip:** You may find it convenient to use publication functions with
the same query object as their input.
For example `publication: require('sift').sift({ username: 'John' )`.


## Installation

```
npm install feathers-offline-realtime --save
```

## Documentation

Realtime read-only replication:
```javascript
import Realtime from 'feathers-offline-realtime';
const messages = app.service('/messages');

const messagesRealtime = new Realtime(messages, options);

messagesRealtime.connect()
  .then(() => {
    console.log(messagesRealtime.connected);
    messagesRealtime.changeSort(Realtime.multiSort(...));
  });
```

Realtime replication with optimistic mutation:
```javascript
import Realtime from 'feathers-offline-realtime';
import optimisticMutator from 'feathers-offline-realtime/optimistic-mutator';
const messages = app.service('/messages');

const messagesRealtime = new Realtime(messages, Object.assign({}, options, { uuid: true }));

const app = feathers() ...
app.use('clientMessages', optimisticMutator({ replicator: messagesRealtime }));
const clientMessages = app.service('clientMessages');

messagesRealtime.connect()
  .then(() => clientMessages.create({ ... }))
  .then(record => {
    console.log(messagesRealtime.connected, record);
    messagesRealtime.changeSort(Realtime.multiSort(...));
  });
```

**Options: new Realtime(service, options)** - Create a realtime replicator.
- `service` (*required*) - The service to read.
- `options` (*optional*) - The configuration object.
    - `publication` (*optional* but *required* if `query` is specified.
    Function with signature `record => boolean`.) - Function to
    determine if a record belongs to the publication.
    - `query` (*optional*) - The
    [Feathers query object](https://docs.feathersjs.com/api/databases/querying.html)
    to reduce the number of records read during the snapshot.
    The props $limit, $skip, $sort and $select are not allowed.
    - `sort` (*required* Function with signature `(a, b) => 1 || -1 || 0`) - A function
    compatible with `array.sort(...)`.
    - `subscriber` (*optional* Function with signature
    `(records, { action, eventName, source, record }) => ...`) - Function to call on mutation events.
    See example below.
    - `uuid` (*optional* boolean) - The records contain a `uuid` field
    and it should be used as the key rather than `id` or `_id`.
    `uuid: true` is required when optimistic mutation is being used.
    
> **ProTip:** You may want to use some of the common publications available in
[`feathers-offline-publication`](https://github.com/feathersjs/feathers-offline-publication/blob/master/src/common-publications.js).
    
> **ProTip:** You can use `clientPublications.addPublication(clientApp, serviceName, options)`
from `feathers-offline-publication`.
That will not only return a suitable function for `production`,
but it will also minimize the number of service events received by the client.
This may noticeable improve performance, especially on mobile devices,
as the client will consume less bandwidth.
    
**Options: connect()** - Create a new snapshot and start listening to events.

**Options: disconnect()** - Stop listening to events. The current realtime records remain.

**Options: connected** - Is the replicator listening to Feathers service events?
    
**Options: changeSort(sorter)** - Change the sort used for the records.
- `sorter` (*required*) - Same as `options.sort`.

**Options: Realtime.sort(name)** - Suitable for use with `array.sort(...)`.
Sort on a field in ascending order.
- `name` (*required*) - The name of the field to sort on.

**Options: Realtime.multiSort(sortDefn)** - Suitable for use with `array.sort(...)`.
Sort on multiple fields, in ascending or descending order.
- `sortDfn` (*required*) - Has the format `{ fieldName: order, ... }`.
    - `fieldName` (*required) - The name of the field to sort on.
    - `order` (*required*) - Use 1 for ascending order, -1 for descending.
    
**Options: app.use(path, optimisticMutator({ replicator }));** - Configure a service
to optimistically mutate the client replica while asynchronously mutating on the server.
- `replicator` (*required*) - The handle returned by the replicator.
- `paginate` (*optional*) - A
[pagination object](https://docs.feathersjs.com/api/databases/common.html#pagination)
containing a default and max page size.

> **ProTip:** The `id` value for these service calls
must be the value of the `uuid` property in the data.

The `create` method adds a `uuid` property to the data if none is provided.
By default this will be a short, but variable-length, random string.
There is virtually
[no chance of collision](https://github.com/dylang/shortid/issues/81#issuecomment-259812835)
unless you work at high scale.

You can change the default to use the standard 32-char uuid values by running
```javascript
const messagesRealtime = new Realtime(messages, { ... });
messagesRealtime.useShortUuid(false);
```

> **ProTip:** Two events are emitted for each optimistic mutation of the client replica.
The first occurs when the client replica is mutated.
It is identified by `source = 1` (see Event information below).
A successful server mutation produces another event having `source = 0`.
A failed server mutation reverts the record in the client replica back to its original value.
That produces an event having `source = 2`.


## Example using event emitters

```js
const Realtime = require('feathers-offline-realtime');

const app = ... // Configure Feathers, including the `/messages` service.
const username = ... // The username authenticated on this client
const messages = app.service('/messages');

const messagesRealtime = new Realtime(messages, {
  query: { username },
  publication: record => record.username === username && record.inappropriate === false,
  sort: Realtime.multiSort({ channel: 1, topic: 1 }),
});

messagesRealtime.on('events', (records, { action, eventName, record }) => {
  console.log('last mutation:', action, eventName, record);
  console.log('realtime records:', records);
  console.log('event listeners active:', messagesRealtime.connected);
});

messagesRealtime.connect()
  .then(() => ...);
```

## Example using a subscriber

```js
const messagesRealtime = new Realtime(messages, {
  query: { username },
  publication: record => record.username === username && record.inappropriate === false,
  sort: Realtime.multiSort({ channel: 1, topic: 1 }),
  subscriber
});

messagesRealtime.connect()
  .then(() => ...);

function subscriber(records, ({ action, eventName, record }) => {
  console.log('last mutation:', action, eventName, record);
  console.log('realtime records:', records);
  console.log('event listeners active:', messagesRealtime.connected);
}
```

## Example using periodic inspection

```js
const messagesRealtime = new Realtime(messages, {
  query: { username },
  publication: record => record.username === username && record.inappropriate === false,
  sort: Realtime.multiSort({ channel: 1, topic: 1 }),
});

setTimeout(() => {
  const { records, last: { action, eventName, record }} = messagesRealtime.store;
  console.log('last mutation:', action, eventName, record);
  console.log('realtime records:', records);
  console.log('event listeners active:', messagesRealtime.connected);
}, 5 * 60 * 1000);
```

## Example using a publication with a query object

```js
const Realtime = require('feathers-offline-realtime');
const sift = require('sift');

const app = ... // Configure Feathers, including the `/messages` service.
const username = ... // The username authenticated on this client
const messages = app.service('/messages');
const query = { username };

const messagesRealtime = new Realtime(messages, {
  query,
  publication: sift(query),
  sort: Realtime.multiSort({ channel: 1, topic: 1 }),
});

messagesRealtime.on('events', (records, { action, eventName, record }) => {
  console.log('last mutation:', action, eventName, record);
  console.log('realtime records:', records);
  console.log('event listeners active:', messagesRealtime.connected);
});

messagesRealtime.connect()
  .then(() => ...);
```

## Event information

All handlers receive the following information:

- `action` - The latest replication action.
- `eventName` - The Feathers realtime service event.
- `source` - Cause of mutation:
    - 0 = service event.
    - 1 = optimistic mutation.
    - 2 = revert to original record when an optimistic mutation results in an error on the server.
- `record` - The record associated with `eventName`.
- `records` - The realtime, sorted records.

| action           | eventName | record | records | source | description
|------------------|-----------|--------|---------|--------|--------------------------
| snapshot         |     -     |    -   |   yes   |    -   | snapshot performed
| add-listeners    |     -     |    -   |   yes   |    -   | started listening to service events
| mutated          | see below |   yes  |   yes   |   yes  | record added to or mutated within publication
| left-pub         | see below |   yes  |   yes   |   yes  | mutated record is no longer within publication
| remove           | see below |   yes  |   yes   |   yes  | record within publication has been deleted
| change-sort      |     -     |    -   |   yes   |    -   | records resorted using the new sort criteria
| remove-listeners |     -     |    -   |   yes   |    -   | stopped listening to service events

| `eventName` may be `created`, `updated`, `patched` or `removed`.

> **ProTip:** Two events are emitted for each optimistic mutation of the client replica.
The first occurs when the client replica is mutated.
It is identified by `source = 1` (see Event information below).
A successful server mutation produces another event having `source = 0`.
A failed server mutation reverts the record in the client replica back to its original value.
That produces an event having `source = 2`.

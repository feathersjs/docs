# Example using optimistic mutation

The realtime replicator's optimistic mutation may be used
to produce a snappier response at the client.

> Its also an important step towards allowing the client to continue working while its offline.

The optimistic-mutator service immediately updates the client replica
to what it **optimistically** expects the final result will be,
and **the user can see the change right away**.
The replicator then emits a replication event because the client replica data has changed.

Next, the same processing occurs as for a remote service call:
the call to the server, the database processing, the filter, the service event on the client.
Finally the replicator replaces the optimistic copy of the record
with the one provided by the server.
Then replicator emits another event because the client replica (may have) changed.

But what happens if the remote service rejects the mutation with an error?
The replicator has kept a copy of the record from before the mutation
and, once it detects the error response,
it replaces the optimistic copy of the record with the prior version.
The replicator emits a different event when this happen.

> Let's take the realtime example #1 and refactor it for optimistic mutation.

[Realtime example #1](./example-realtime.md)
mutated data by calling methods on the remote service located on the server.
The client had to wait until the server finished the call and until it received the service event.
Only then could it mutate the client replica.

Let's refactor the client so that it instead makes those same mutations by calling the
optimistic-mutator at the client.
The optimistic-mutator will immediately mutate the client replica.
It will then call the server and, after some delay, process the service event.

#### Running the example

You can run this example with:

```text
cd path/to/feathers-mobile/examples
npm install
cd ./optimistic
npm run build
npm start
```

Then point a browser at `localhost:3030`
and look at the log on the browser console.

You can see the client source
[here](https://github.com/feathersjs/feathers-docs/blob/master/examples/offline/optimistic/client/index.js),
and [here](https://github.com/feathersjs/feathers-docs/blob/master/examples/offline/optimistic/client/1-third-party.js).

#### Looking at the log

We configure the replication on the client and start it:

```javascript
import Realtime from 'feathers-offline-realtime';

const stockRemote = feathersApp.service('/stock');
stockRemote.on('created', record => console.log(`.service event. created`, record));
stockRemote.on('updated', record => console.log(`.service event. updated`, record));
stockRemote.on('patched', record => console.log(`.service event. patched`, record));
stockRemote.on('removed', record => console.log(`.service event. removed`, record));

const stockRealtime = new Realtime(stockRemote, { uuid: true, subscriber });

feathersApp.use('stockClient', optimisticMutator({ replicator: stockRealtime }));
const stockClient = feathersApp.service('stockClient');

stockRealtime.connect().then( ... );

function subscriber(records, { action, eventName, source, record }) {
  console.log(`.replicator event. action=${action} eventName=${eventName} source=${source}`, record);
}
```

A snapshot of the remote service data is sent to the client when replication starts.

```text
.replicator event. action=snapshot eventName=undefined source=undefined undefined
.replicator event. action=add-listeners eventName=undefined source=undefined undefined
===== stockRemote, before mutations
{dept: "a", stock: "a1", uuid: "a1", _id: "AHjkPclOKcf25xy2"}
{dept: "a", stock: "a2", uuid: "a2", _id: "XhnvXIvFWegBRH3G"}
{dept: "a", stock: "a3", uuid: "a3", _id: "WcaLplDzLmQYdX1E"}
{dept: "a", stock: "a4", uuid: "a4", _id: "xEVdEXBlTOzJ9HB8"}
{dept: "a", stock: "a5", uuid: "a5", _id: "oDMhPbWCfQAglHbz"}
```

```javascript
stockClient.find()
  .then(result => console.log(result.data || result);
```

> **ProTip:** The `find(data, params)` and `get(uuid, params)` methods of the
optimistic mutator are the preferred ways to obtain data from the client replica.

```text
===== client replica, before mutations
{dept: "a", stock: "a1", uuid: "a1", _id: "AHjkPclOKcf25xy2"}
{dept: "a", stock: "a2", uuid: "a2", _id: "XhnvXIvFWegBRH3G"}
{dept: "a", stock: "a3", uuid: "a3", _id: "WcaLplDzLmQYdX1E"}
{dept: "a", stock: "a4", uuid: "a4", _id: "xEVdEXBlTOzJ9HB8"}
{dept: "a", stock: "a5", uuid: "a5", _id: "oDMhPbWCfQAglHbz"}
```


We mutate the data with the optimistic-mutator

```javascript
console.log('===== mutate stockRemote')
console.log('stockRemote.patch stock: a1')
stockClient.patch('a1', { foo: 1 })
  .then(() => console.log('stockRemote.create stock: a99'))
  .then(() => stockClient.create({ dept: 'a', stock: 'a99', uuid: 'a99' }))
  .then(() => console.log('stockRemote.remove stock: a2'))
  .then(() => stockClient.remove('a2'))
```

```text
===== mutate stockRemote
stockRemote.patch stock: a1
.replicator event. action=mutated eventName=patched source=1
    {dept: "a", stock: "a1", uuid: "a1", _id: "AHjkPclOKcf25xy2", foo: 1}
stockRemote.create stock: a99
.replicator event. action=mutated eventName=created source=1
    {dept: "a", stock: "a99", uuid: "a99"}
stockRemote.remove stock: a2
.replicator event. action=remove eventName=removed source=1
    {dept: "a", stock: "a2", uuid: "a2", _id: "XhnvXIvFWegBRH3G"}
.service event. patched
    {dept: "a", stock: "a1", uuid: "a1", _id: "AHjkPclOKcf25xy2", foo: 1}
.replicator event. action=mutated eventName=patched source=0
    {dept: "a", stock: "a1", uuid: "a1", _id: "AHjkPclOKcf25xy2", foo: 1}
.service event. created
    {dept: "a", stock: "a99", uuid: "a99", _id: "tlFJB9f6mPZS2lK5"}
.replicator event. action=mutated eventName=created source=0
    {dept: "a", stock: "a99", uuid: "a99", _id: "tlFJB9f6mPZS2lK5"}
.service event. removed
    {dept: "a", stock: "a2", uuid: "a2", _id: "XhnvXIvFWegBRH3G"}
.replicator event. action=remove eventName=removed source=0
    {dept: "a", stock: "a2", uuid: "a2", _id: "XhnvXIvFWegBRH3G"}
```

You can see the replicator's optimistic mutate events `.replicator event ... source=1`
occur right after the service call.
That's because the client replica is being mutated immediately.

You then see the service events `.service event. patched` as the server responds
to the calls made to it.
This is followed by the replicator's `.replicator event ... source=0`
as it processes the service event.

> The client replica is immediately mutated.
The matching service event was handled when it arrived later.


The client replica remain synchronised with the server data.

```text
===== stockRemote, after mutations
{dept: "a", stock: "a1", uuid: "a1", _id: "AHjkPclOKcf25xy2", foo: 1}
{dept: "a", stock: "a3", uuid: "a3", _id: "WcaLplDzLmQYdX1E"}
{dept: "a", stock: "a4", uuid: "a4", _id: "xEVdEXBlTOzJ9HB8"}
{dept: "a", stock: "a5", uuid: "a5", _id: "oDMhPbWCfQAglHbz"}
{dept: "a", stock: "a99", uuid: "a99", _id: "tlFJB9f6mPZS2lK5"}
===== client replica, after mutations
{dept: "a", stock: "a3", uuid: "a3", _id: "WcaLplDzLmQYdX1E"}
{dept: "a", stock: "a5", uuid: "a5", _id: "oDMhPbWCfQAglHbz"}
{dept: "a", stock: "a4", uuid: "a4", _id: "xEVdEXBlTOzJ9HB8"}
{dept: "a", stock: "a99", uuid: "a99"}
{dept: "a", stock: "a1", uuid: "a1", _id: "AHjkPclOKcf25xy2", foo: 1}
{dept: "a", stock: "a99", uuid: "a99", _id: "tlFJB9f6mPZS2lK5"}
===== Example finished.
```

It works!

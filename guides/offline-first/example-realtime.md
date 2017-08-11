# Examples of realtime replication

Realtime starts with a snapshot of the remote service data.
Subsequent data changes made at the remote are delivered to the client as they occur in near real time.
The data changes are applied at the client in the same order as they occurred at the remote.

Replication stops when communication is lost with the server.
It can be restarted on reconnection.

## **Example 1** - All the remote service data

#### Running the example

> Let's see how mutations made on the server are handled by realtime replication,
along with disconnections and reconnections.

You can run this example with:

```text
cd path/to/feathers-mobile/examples
npm install
cd ./realtime-1
npm run build
npm start
```

Then point a browser at `localhost:3030`
and look at the log on the browser console.

You can see the client source
[here](https://github.com/feathersjs/feathers-docs/blob/master/examples/offline/realtime-1/client/index.js),
[here](https://github.com/feathersjs/feathers-docs/blob/master/examples/offline/realtime-1/client/1-third-party.js)
and [here](https://github.com/feathersjs/feathers-docs/blob/master/examples/offline/realtime-1/client/2-reconnect.js).

#### Looking at the log

Configure the replication and start it:

```javascript
import Realtime from 'feathers-offline-realtime';
const stockRemote = feathersApp.service('/stock');

const stockRealtime = new Realtime(stockRemote);

stockRealtime.connect().then( ... );
```

A snapshot of the remote service data is sent to the client when replication starts.

```text
===== stockRemote, before mutations
{dept: "a", stock: "a1", _id: "fY6ezNH9Rlw2WVzX"}
{dept: "a", stock: "a2", _id: "7a0b00diX18WO3Gm"}
{dept: "a", stock: "a3", _id: "b2wVdYJeiCNTGLc6"}
{dept: "a", stock: "a4", _id: "wtTVYE15plCOb2vW"}
{dept: "a", stock: "a5", _id: "cnWD1Yzr8WJruOfi"}
```

```javascript
stockRealtime.store.records.forEach(record => console.log(record))
```

```text
===== client replica, before mutations
{dept: "a", stock: "a2", _id: "7a0b00diX18WO3Gm"}
{dept: "a", stock: "a3", _id: "b2wVdYJeiCNTGLc6"}
{dept: "a", stock: "a5", _id: "cnWD1Yzr8WJruOfi"}
{dept: "a", stock: "a1", _id: "fY6ezNH9Rlw2WVzX"}
{dept: "a", stock: "a4", _id: "wtTVYE15plCOb2vW"}
```

We can simulate other people changing data on the remote service.

```text
===== mutate stockRemote
stockRemote.patch stock: a1
stockRemote.create stock: a99
stockRemote.remove stock: a2
```

The mutations are replicated to the client.

```text
===== stockRemote, after mutations
{dept: "a", stock: "a1", _id: "fY6ezNH9Rlw2WVzX", foo: 1}
{dept: "a", stock: "a3", _id: "b2wVdYJeiCNTGLc6"}
{dept: "a", stock: "a4", _id: "wtTVYE15plCOb2vW"}
{dept: "a", stock: "a5", _id: "cnWD1Yzr8WJruOfi"}
{dept: "a", stock: "a99", _id: "Yiu8R0fHQkEaGjPz"}
===== client replica, after mutations
{dept: "a", stock: "a3", _id: "b2wVdYJeiCNTGLc6"}
{dept: "a", stock: "a5", _id: "cnWD1Yzr8WJruOfi"}
{dept: "a", stock: "a4", _id: "wtTVYE15plCOb2vW"}
{dept: "a", stock: "a1", _id: "fY6ezNH9Rlw2WVzX", foo: 1}
{dept: "a", stock: "a99", _id: "Yiu8R0fHQkEaGjPz"}
```

We can inform the replicator of a lost connection, after which other people mutate more data.

```javascript
stockRealtime.disconnect();
```

```text
>>>>> disconnection from server
===== mutate stockRemote
stockRemote.patch stock: a3
stockRemote.create stock: a98
stockRemote.remove stock: a5
```

After we inform the replicator of a reconnection,
the client replica is brought up to data with a new snapshot.

```javascript
stockRealtime.connect();
```

```text
<<<<< reconnected to server
===== stockRemote, after reconnection
{dept: "a", stock: "a1", _id: "fY6ezNH9Rlw2WVzX", foo: 1}
{dept: "a", stock: "a3", _id: "b2wVdYJeiCNTGLc6", foo: 1}
{dept: "a", stock: "a4", _id: "wtTVYE15plCOb2vW"}
{dept: "a", stock: "a98", _id: "XCZorVYjeHBlwz93"}
{dept: "a", stock: "a99", _id: "Yiu8R0fHQkEaGjPz"}
===== client replica, after reconnection
{dept: "a", stock: "a98", _id: "XCZorVYjeHBlwz93"}
{dept: "a", stock: "a99", _id: "Yiu8R0fHQkEaGjPz"}
{dept: "a", stock: "a3", _id: "b2wVdYJeiCNTGLc6", foo: 1}
{dept: "a", stock: "a1", _id: "fY6ezNH9Rlw2WVzX", foo: 1}
{dept: "a", stock: "a4", _id: "wtTVYE15plCOb2vW"}
===== Example finished.
```

----------------------------------------

## **Example 2** - Selected remote service data

#### Running the example

> Let's see how a filter function (not a "publication")
allows you to replicate a selection of the remote service data.


> All service events are sent to the client as no "publication" is used

You can run this example with:

```text
cd path/to/feathers-mobile/examples
npm install
cd ./realtime-2
npm run build
npm start
```

Then point a browser at `localhost:3030`
and look at the log on the browser console.

You can see the client source
[here](https://github.com/feathersjs/feathers-docs/blob/master/examples/offline/realtime-2/client/index.js),
and [here](https://github.com/feathersjs/feathers-docs/blob/master/examples/offline/realtime-2/client/1-third-party.js).

#### Looking at the log

The client replica will contain those records with `record.dept === 'a'`.
All service events are sent to the client because a filter function is used,
not a "publication".
Filter functions run on the client only,
while a "publication" runs both on the server (to minimize the service events sent the client)
and on the client.

Configure the replication and start it:

```javascript
import Realtime from 'feathers-offline-realtime';

const stockRemote = feathersApp.service('/stock');
stockRemote.on('patched', record => console.log(`.service event. patched`, record));

const stockRealtime = new Realtime(stockRemote, {
  publication: record => record.dept === 'a', // this is a filter func, not a "publication"
  sort: Realtime.sort('stock'), // sort the client replica
  query: { dept: 'a' },         // makes snapshots more efficient
  subscriber                    // logs replicator events
});

stockRealtime.connect().then( ... );

function subscriber(records, { action, eventName, source }) {
  console.log(`.replicator event. action=${action} eventName=${eventName} source=${source}`);
}
```

A snapshot of part of the remote service data is sent to the client when replication starts.

```text
.replicator event. action=snapshot eventName=undefined source=undefined undefined
.replicator event. action=add-listeners eventName=undefined source=undefined undefined
===== stockRemote, before mutations
{dept: "a", stock: "a1", _id: "lwKU5HpWnumm51wK"}
{dept: "a", stock: "a2", _id: "xC2ZVq6xaUpJOBgb"}
{dept: "a", stock: "a3", _id: "Z0Y16Pn8d3RA7rXU"}
{dept: "a", stock: "a4", _id: "kfWCtTo1p2cpN9oN"}
{dept: "a", stock: "a5", _id: "JxlD78JV6S5uZHvD"}
{dept: "b", stock: "b1", _id: "meldJsoQSM80mSJM"}
{dept: "b", stock: "b2", _id: "iujwY33XVFIjLm0U"}
{dept: "b", stock: "b3", _id: "Pws5I5A8a3dC7yyJ"}
{dept: "b", stock: "b4", _id: "n4R9UxQQxR4HMbFi"}
{dept: "b", stock: "b5", _id: "lpFPGhIInYba698P"}
```

```javascript
stockRealtime.store.records.forEach(record => console.log(record))
```

```text
===== client replica of dept: a, before mutations
{dept: "a", stock: "a1", _id: "lwKU5HpWnumm51wK"}
{dept: "a", stock: "a2", _id: "xC2ZVq6xaUpJOBgb"}
{dept: "a", stock: "a3", _id: "Z0Y16Pn8d3RA7rXU"}
{dept: "a", stock: "a4", _id: "kfWCtTo1p2cpN9oN"}
{dept: "a", stock: "a5", _id: "JxlD78JV6S5uZHvD"}
```

We can simulate other people changing data on the remote service.

```text
===== mutate stockRemote
stockRemote.patch stock: a1 move to dept: b
stockRemote.patch stock: b1 move to dept: a
.service event. patched
    {dept: "b", stock: "a1", _id: "raBDpgjM4ilKa0PX"}
.replicator event. action=left-pub eventName=patched source=0
    {dept: "b", stock: "a1", _id: "raBDpgjM4ilKa0PX"}
.service event. patched
    {dept: "a", stock: "b1", _id: "RKbbo7EgaAeWqqnu"}
.replicator event. action=mutated eventName=patched source=0
    {dept: "a", stock: "b1", _id: "RKbbo7EgaAeWqqnu"}
===== patch some stockRemote records without changing their contents
.service event. patched
    {dept: "a", stock: "a2", _id: "r9VPWIdwZsYNEAvI"}
.replicator event. action=mutated eventName=patched source=0
    {dept: "a", stock: "a2", _id: "r9VPWIdwZsYNEAvI"}
.service event. patched
    {dept: "a", stock: "a3", _id: "n66vXg1lBuh3XX4O"}
.replicator event. action=mutated eventName=patched source=0
    {dept: "a", stock: "a3", _id: "n66vXg1lBuh3XX4O"}
.service event. patched
    {dept: "b", stock: "b2", _id: "77rLKbncUcxOFHJM"}
.service event. patched
    {dept: "b", stock: "b3", _id: "1IIQqVn8TYcopdzl"}
.service event. patched
    {dept: "b", stock: "b4", _id: "rSfCl9WXfTi7oa6N"}
.service event. patched
    {dept: "b", stock: "b5", _id: "LqXhzpPLidkIVGuG"}
```

Notice that the last 4 service events were not relevant to our publication filter
and so no replication events occurred for them.
**There was no need to send these 4 service events to the client.**

The mutations are replicated to the client.

```text
===== stockRemote, after mutations
{dept: "b", stock: "a1", _id: "lwKU5HpWnumm51wK"}
{dept: "a", stock: "a2", _id: "xC2ZVq6xaUpJOBgb"}
{dept: "a", stock: "a3", _id: "Z0Y16Pn8d3RA7rXU"}
{dept: "a", stock: "a4", _id: "kfWCtTo1p2cpN9oN"}
{dept: "a", stock: "a5", _id: "JxlD78JV6S5uZHvD"}
{dept: "a", stock: "b1", _id: "meldJsoQSM80mSJM"}
{dept: "b", stock: "b2", _id: "iujwY33XVFIjLm0U"}
{dept: "b", stock: "b3", _id: "Pws5I5A8a3dC7yyJ"}
{dept: "b", stock: "b4", _id: "n4R9UxQQxR4HMbFi"}
{dept: "b", stock: "b5", _id: "lpFPGhIInYba698P"}
===== client replica of dept a, after mutations
{dept: "a", stock: "a2", _id: "xC2ZVq6xaUpJOBgb"}
{dept: "a", stock: "a3", _id: "Z0Y16Pn8d3RA7rXU"}
{dept: "a", stock: "a4", _id: "kfWCtTo1p2cpN9oN"}
{dept: "a", stock: "a5", _id: "JxlD78JV6S5uZHvD"}
{dept: "a", stock: "b1", _id: "meldJsoQSM80mSJM"}
===== Example finished.
```

The `stock: 'a1'` record was removed from the client replica because it no longer satisfied
the publication filter after mutation.
The `stock: 'b1'` record was added
as its mutation caused it to now satisfied the publication filter.

----------------------------------------

## **Example 3** - Using a publication

> Let's redo Example 2 using a "publication" rather than a filter function.
We expect the "publication" to minimize the number of service events sent to the client.

#### Running the example

You can run this example with:

```text
cd path/to/feathers-mobile/examples
npm install
cd ./realtime-3
npm run build
npm start
```

Then point a browser at `localhost:3030`
and look at the log on the browser console.

You can see the key server source
[here](https://github.com/feathersjs/feathers-docs/blob/master/examples/offline/realtime-3/src/index.js).

You can see the client source
[here](https://github.com/feathersjs/feathers-docs/blob/master/examples/offline/realtime-3/client/index.js),
and [here](https://github.com/feathersjs/feathers-docs/blob/master/examples/offline/realtime-3/client/1-third-party.js).


#### The key server code

```javascript
const serverPublication = require('feathers-offline-publication/lib/server');
const commonPublications = require('feathers-offline-publication/lib/common-publications');
const { stashBefore } = require('feathers-hooks-common');

const port = app.get('port');
const server = app.listen(port);

const stockRemote = app.service('stock');
stockRemote.hooks({
  before: {
    update: stashBefore(),
    patch: stashBefore(),
    remove: stashBefore(),
  },
});

serverPublication(app, commonPublications, 'stock');
```

The `stashBefore` hooks will stash the current value of the record into `context.params`
before the record is mutated.
The service filter will use the stashed value to check if the record used to belong to the publication.

The `serverPublication` call configures the service filters,
in this case for the stock service.
You can use syntax like `['messages', 'comments']` to configure multiple services at once.

> **ProTip:** `serverPublication` must be run only after the server has started listening.

#### The key client code

```javascript
const clientPublication = require('feathers-offline-publication/lib/client');
const commonPublications = require('feathers-offline-publication/lib/common-publications');
const Realtime = require('feathers-offline-realtime');

const stockRemote = feathersApp.service('/stock');

const stockRealtime = new Realtime(stockRemote, {
  publication: clientPublication.addPublication(feathersApp, 'stock', {
    module: commonPublications,
    name: 'query',
    params: { dept: 'a' },
  }),
});

stockRealtime.connect().then( ... );
```

The `publication` option is now a "publication" rather than a filter function.
The `addPublication` emits the `name` and `params` values to the server,
while returning a filter function as the actual value for `publication`.
The server will start using `name` and `params` in the server-side service filters.

#### Looking at the log

The previous example #2 log contained

```text
===== mutate stockRemote
stockRemote.patch stock: a1 move to dept: b
stockRemote.patch stock: b1 move to dept: a
.service event. patched
    {dept: "b", stock: "a1", _id: "raBDpgjM4ilKa0PX"}
.replicator event. action=left-pub eventName=patched source=0
    {dept: "b", stock: "a1", _id: "raBDpgjM4ilKa0PX"}
.service event. patched
    {dept: "a", stock: "b1", _id: "RKbbo7EgaAeWqqnu"}
.replicator event. action=mutated eventName=patched source=0
    {dept: "a", stock: "b1", _id: "RKbbo7EgaAeWqqnu"}
===== patch some stockRemote records without changing their contents
.service event. patched
    {dept: "a", stock: "a2", _id: "r9VPWIdwZsYNEAvI"}
.replicator event. action=mutated eventName=patched source=0
    {dept: "a", stock: "a2", _id: "r9VPWIdwZsYNEAvI"}
.service event. patched
    {dept: "a", stock: "a3", _id: "n66vXg1lBuh3XX4O"}
.replicator event. action=mutated eventName=patched source=0
    {dept: "a", stock: "a3", _id: "n66vXg1lBuh3XX4O"}
.service event. patched
    {dept: "b", stock: "b2", _id: "77rLKbncUcxOFHJM"}
.service event. patched
    {dept: "b", stock: "b3", _id: "1IIQqVn8TYcopdzl"}
.service event. patched
    {dept: "b", stock: "b4", _id: "rSfCl9WXfTi7oa6N"}
.service event. patched
    {dept: "b", stock: "b5", _id: "LqXhzpPLidkIVGuG"}
```

We pointed out that the last 4 service events were not relevant to example #2's publication filter
and so no replication events occurred for them.
We also pointed out that **there was no need to send these 4 service events to the client.**

Our example #3 log contains

```text
===== mutate stockRemote
stockRemote.patch stock: a1 move to dept: b
stockRemote.patch stock: b1 move to dept: a
.service event. patched
    {dept: "b", stock: "a1", _id: "qR5KkXAP0TAdCXBm"}
.replicator event. action=left-pub eventName=patched source=0
    {dept: "b", stock: "a1", _id: "qR5KkXAP0TAdCXBm"}
.service event. patched
    {dept: "a", stock: "b1", _id: "LDtB9YvbJTHpOau2"}
.replicator event. action=mutated eventName=patched source=0
    {dept: "a", stock: "b1", _id: "LDtB9YvbJTHpOau2"}
===== patch some stockRemote records without changing their contents
.service event. patched
    {dept: "a", stock: "a2", _id: "fmMfWefDVeu9qrRt"}
.replicator event. action=mutated eventName=patched source=0
    {dept: "a", stock: "a2", _id: "fmMfWefDVeu9qrRt"}
.service event. patched
    {dept: "a", stock: "a3", _id: "WULt4o6N69G9x0Vf"}
.replicator event. action=mutated eventName=patched source=0
    {dept: "a", stock: "a3", _id: "WULt4o6N69G9x0Vf"}
```

The example #3 does not contain the last 4 `.service event` entries.
**The server-side service filters recognized those mutations were not relevant to our publication
and did not emit them to the client.**

Job done!

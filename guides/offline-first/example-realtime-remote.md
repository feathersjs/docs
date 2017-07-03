# Examples of realtime replication

Realtime starts with a snapshot of the remote service data.
Subsequent data changes made at the remote are delivered to the client as they occur in near real time.
The data changes are applied at the client in the same order as they occurred at the remote.

Replication stops when communication is lost with the server.
It can be restarted on reconnection.

## Example 1 - Replicate the entire file

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

The client replica will contain the same data as the remote service.
All service events are emitted to the client because they are all required.

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
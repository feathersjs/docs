# Snapshot replication example

| Let's look at the
[source](https://github.com/feathersjs/feathers-docs/blob/master/examples/offline/snapshot/client/2-snapshot-service.js)
needed for the snapshot strategy.

## Snapshot the entire file

#### Client code

```js
const snapshot = require('feathers-offline-snapshot');

const stockRemote = app.service('/stock');

snapshot(stockRemote)
  .then(records => {
    console.log(records);
  });
```

#### Example

You can run an example using this strategy.
```text
cd path/to/feathers-docs/examples/offline
npm install
cd ./snapshot
npm run build
npm start
```
Then point a browser at `localhost:3030`.

The entire file is read.
```text
===== Read stockRemote service directly
{dept: "a", stock: "a1", _id: "LANJQx24cg9Jy2Hr"}
{dept: "a", stock: "a2", _id: "rTk5oK6gLupjbsyP"}
{dept: "a", stock: "a3", _id: "nOxWx97QKzp89qA9"}
{dept: "a", stock: "a4", _id: "xzOwo8g671sdejg5"}
{dept: "a", stock: "a5", _id: "nEYr6D9YcQ0Ln9nW"}
{dept: "b", stock: "b1", _id: "qY8LhzTKLw4G2ld6"}
{dept: "b", stock: "b2", _id: "DBQ93zzWPNiFq6wd"}
{dept: "b", stock: "b3", _id: "xyVeDj7BRXJlPo9F"}
{dept: "b", stock: "b4", _id: "mZddKB7THrbv8dHV"}
{dept: "b", stock: "b5", _id: "4RQ5BL8PHER5DEGX"}
===== snapshot, all records
{dept: "a", stock: "a1", _id: "LANJQx24cg9Jy2Hr"}
{dept: "a", stock: "a2", _id: "rTk5oK6gLupjbsyP"}
{dept: "a", stock: "a3", _id: "nOxWx97QKzp89qA9"}
{dept: "a", stock: "a4", _id: "xzOwo8g671sdejg5"}
{dept: "a", stock: "a5", _id: "nEYr6D9YcQ0Ln9nW"}
{dept: "b", stock: "b1", _id: "qY8LhzTKLw4G2ld6"}
{dept: "b", stock: "b2", _id: "DBQ93zzWPNiFq6wd"}
{dept: "b", stock: "b3", _id: "xyVeDj7BRXJlPo9F"}
{dept: "b", stock: "b4", _id: "mZddKB7THrbv8dHV"}
{dept: "b", stock: "b5", _id: "4RQ5BL8PHER5DEGX"}
```

## Snapshot a portion of the file

#### Client code

```javascript
const snapshot = require('feathers-offline-snapshot');

const stockRemote = app.service('/stock');

snapshot(stockRemote, { dept: 'a' })
  .then(records => {
    console.log(records);
  });
```

#### Example

The above example also runs this, reading part of the file.
```text
===== snapshot, dept: 'a'
{dept: "a", stock: "a1", _id: "LANJQx24cg9Jy2Hr"}
{dept: "a", stock: "a2", _id: "rTk5oK6gLupjbsyP"}
{dept: "a", stock: "a3", _id: "nOxWx97QKzp89qA9"}
{dept: "a", stock: "a4", _id: "xzOwo8g671sdejg5"}
{dept: "a", stock: "a5", _id: "nEYr6D9YcQ0Ln9nW"}
===== Example finished.
```

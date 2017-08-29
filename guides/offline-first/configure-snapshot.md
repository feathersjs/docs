# Configure Snapshot

## Installation

```
npm install feathers-offline-snapshot --save
```

## Documentation

```javascript
import snapshot from 'feathers-offline-snapshot';
snapshot(service, query).then(records => ...);
```

- `service` (*required*) - The service to read.
- `query` (*optional*, default: `{}`) - The
[Feathers query object](https://docs.feathersjs.com/api/databases/querying.html)
selecting the records to read.
Some of the props it may include are:
    - `$limit` (*optional*, default: 200) - Records to read at a time.
    The service's configuration may limit the actual number read.
    - `$skip` (*optional*, default: 0) will initially skip this number of records.
    - `$sort` (*optional*, default: `{}`) will sort the records.
    You can sort on multiple props, for example `{ field1: 1, field2: -1 }`.


## Example

```js
const snapshot = require('feathers-offline-snapshot');

const app = ... // Configure Feathers, including the `/messages` service.
const username = ... // The username authenticated on this client
const messages = app.service('/messages');

snapshot(messages, { username, $sort: { channel: 1 } })
  .then(records => {
    console.log(records);
  });
```

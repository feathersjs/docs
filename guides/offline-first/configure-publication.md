# Configure Publication

## Publications

`publications` are objects containing multiple `publication` functions.
These functions determine if a record belongs in the publication or not.
A sample publications is:
```javascript
const publications = {
  username: username => data => data.username === username,
  active: () => data => !data.deleted,
};
```

The publication `publications.username('john')` selects all records whose `username` is `john`;
`publications.active()` selects all logically active records.

You can use the builtin `query` publication to selects records based on the
[query syntax used by MongoDB](https://docs.mongodb.com/manual/reference/operator/query/).
For example:
```javascript
import commonPublications from 'feathers-offline-publication/lib/common-publications';
commonPublications.query({ username: 'john' })
````



## Minimize service events

Once a client associates a Feathers service with
- a publications object, like the one above or commonPublications,
- a publication function name, and
- params for that function,

then that client will only be sent service events relevant to that publication.
This may improve performance, especially for mobile devices, as the bandwidth consumed by the client
is reduced.

The server-side filtering for offline-first generally needs to look at
both the previous and the new contents of the record,
to see if it used to belong or if it now belongs to the publication.

You can stash the current value of a record inside the context object, before mutating it, with:
```javascript
module.exports = {
  before: {
    update: stashBefore(),
    patch: stashBefore(),
    remove: stashBefore(),
  },
};
```

The client will receive a service event if either the previous (stashed) value of the record,
or the new value is within the publication.
This double check informs the client of records which previously belonged to the publication,
but no longer do so after the mutation.

## When records remain in the same publication

Its not uncommon, for example, for mobile apps to have unique data per user.
Each service model has a `username` field and, once that field is set on `create`, it never changes.

The client would use a publication such as the `publications.username('john')` from above
to select only the records for its user.

There is no need in this case to check the previous (stashed) value of the record,
and you can eliminate doing so by not running the `stashBefore` hook.
This would also marginally improve performance since `stashBefore` makes a `get` call.


## Example

On server:
```javascript
const serverPublication = require('feathers-offline-publication/lib/server');
const commonPublications = require('feathers-offline-publication/lib/common-publications');
const app = feathers()...

const port = app.get('port');
const server = app.listen(port);

// Configure service event filters for 2 services
serverPublication(app, commonPublications, ['messages', 'channels']);
```

> **ProTip:** `serverPublication` must be called after the server starts listening.

On client:
```javascript
const Realtime = require('feathers-offline-realtime');
const clientPublication = require('feathers-offline-publication/lib/client');
const commonPublications = require('feathers-offline-publication/lib/common-publications');
const feathersClient = feathers()...

const messages = feathersClient.service('messages');
const username = 'john';

// The only service events to arrive will be those relevant to the publication
messages.on('created', data => ...);
messages.on('updated', data => ...);
messages.on('patched', data => ...);
messages.on('remove', data => ...);

// Configure the publication
const messagesPublication = clientPublication.addPublication(feathersClient, 'messages', {
  module: commonPublications,
  name: 'query',
  params: { username },
});

// The publication's filter function is also available on the client
console.log(messagesPublication({ username: 'john' })); // true
console.log(messagesPublication({ username: 'jack' })); // false

// Configure the replicator
const messagesRealtime = new Realtime(messages, { publication: messagesPublication });
```

Note that the same `publications` object must be provided both on the server and the client.
Also note the client may use the resultant function for any of its own filtering.


## Security

An attacker may modify the `clientPublication.addPublication` call on the client
or issue one of their own.

Feathers supports multiple service events filters for a method,
and a mutation must satisfy them all before being emitted to the client.
You can therefore add filters both before and after the `serverPublication` call
to establish any additional security you need.


## Installation

```
npm install feathers-offline-publication --save
```


## Documentation

### `serverPublication(app, publications, ...serviceNames)`

Configures services on the server which may have publications.
This also configures the service event filters for you.

__Options:__

- `app` (*required*) - The Feathers server app.
- `publications` (*required*, object) - The publications object.
The same object must be used in `clientPublication.addPublication`.
- `serviceNames` (*required*, string or array of strings) -
The service name or names to configure for publications.

### `clientPublication.addPublication(clientApp, serviceName, options)`

Configures a publication on the client for a remote service.

__Options:__

- `clientApp` (*required*) - The Feathers client app.
- `serviceName` (*required*, string) - The service name for which a publication is being configured.
- `options` (*required*, objects) - Contains
    - `module` (*required*, object) - The publications object.
    The same object must be used in `serverPublication`.
    - `name` (*required*, string) - The prop name of the publication in `module`.
    - `params` (*optional*, any or array of any) - The parameters to call `name` with.
    - `ifServer` (*optional*, boolean, default true) - If false,
    no server publication is created, but the selector function is still returned to the client.


### `clientPublication.removePublication(clientApp, serviceName)`

Removes the publication for a remote service, and stops filtering on the server.

> **ProTip:** The client will receive service events for all mutations.

__Options:__

- `clientApp` (*required*) - The Feathers client app.
- `serviceName` (*required*, string) - The service name whose publication is being removed.

### `commonPublications.query(selection)`

A publication which selects records based on the
[query syntax used by MongoDB](https://docs.mongodb.com/manual/reference/operator/query/).

__Options:__

- `selection` (*required*) - The [query object](https://github.com/crcn/sift.js).
    - Supported operators: $in, $nin, $exists, $gte, $gt, $lte, $lt, $eq, $ne, $mod, $all, $and,
    $or, $nor, $not, $size, $type, $regex, $where, $elemMatch
    - Regexp searches
    - Function filtering
    - sub object searching
    - dot notation searching
    - Custom Expressions
    - filtering of immutable data structures

> **ProTip:** You can merge these common publications with your own ones using
`Object.assign({}, commonPublications, myCustomPublications)`.

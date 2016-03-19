# REST

Once [set up on the server](../rest/readme.md), there are several ways to connect to the REST API of a Feathers service. Keep in mind that while clients connected via websockets will receive real-time events from other REST API calls, you can't get real-time updates over the HTTP API without resorting to polling.

## feathers-rest clients

Using [the Feathers client](feathers.md), the `feathers-rest/client` module allows you to connect to a Feathers service via a REST API using [jQuery](https://jquery.com/), [request](https://github.com/request/request), [Superagent](http://visionmedia.github.io/superagent/) or [Fetch](https://facebook.github.io/react-native/docs/network.html) as the client library.

> **ProTip:** REST client services do emit `created`, `updated`, `patched` and `removed` events but only _locally for their own instance_. Real-time events from other clients can only be received by using a websocket connection.

<!-- -->

> **ProTip:** The base URL is relative from where services are registered. That means that a service at `http://api.feathersjs.com/api/v1/messages` with a base URL of `http://api.feathersjs.com` would be available as `app.service('api/v1/messages')`. With a base URL of `http://api.feathersjs.com/api/v1` it would be `app.service('messages')`.

<!-- -->

> **ProTip:** Notice how the REST client wrapper is always initialized using a base URL: `.configure(rest('http://api.feathersjs.com').superagent(superagent));`

### jQuery

jQuery [$.ajax](http://api.jquery.com/jquery.ajax/) requires an instance of jQuery passed to `feathers.jquery`. In most cases the global `jQuery`:

```js
const feathers = require('feathers');
const rest = require('feathers-rest/client');
const host = 'http://api.feathersjs.com';
const app = feathers()
  .configure(rest(host).jquery(window.jQuery));
```

### Request

The [request](https://github.com/request/request) object needs to be passed explicitly to `feathers.request`. Using [request.defaults](https://github.com/request/request#convenience-methods) - which creates a new request object - is a great way to set things like default headers or authentication information:

```js
const feathers = require('feathers');
const rest = require('feathers-rest/client');
const request = require('request');
const host = 'http://api.feathersjs.com';
const client = request.defaults({
  'auth': {
    'user': 'username',
    'pass': 'password',
    'sendImmediately': false
  }
});

const app = feathers()
  .configure(rest(host).request(client));
```

### Superagent

[Superagent](http://visionmedia.github.io/superagent/) currently works with a default configuration:

```js
const feathers = require('feathers');
const rest = require('feathers-rest/client');
const superagent = require('superagent');
const host = 'http://api.feathersjs.com';
const app = feathers()
  .configure(rest(host).superagent(superagent));
```

### Fetch

Fetch also uses a default configuration:

```js
const feathers = require('feathers');
const rest = require('feathers-rest/client');
const host = 'http://api.feathersjs.com';
const fetch = require('node-fetch');
const app = feathers()
  .configure(rest(host).fetch(fetch));
```

## Browser Usage

Using [the Feathers client](feathers.md), the `feathers-rest/client` module can be configured to used for any Ajax requests:

```html
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/superagent/1.2.0/superagent.min.js"></script>
<script type="text/javascript" src="//cdn.rawgit.com/feathersjs/feathers-client/v1.0.0/dist/feathers.js"></script>
<script type="text/javascript">
  const rest = feathers.rest('http://api.feathersjs.com');
  const app = feathers()
    .configure(feathers.hooks())
    .configure(rest.superagent(superagent));
  
  var messageService = app.service('messages');
  
  messageService.create({ text: 'Oh hai!'}).then(result => {
    console.log(result);
  }).catch(error => {
    console.error(error);
  });
</script>
```

## Server Usage

Here's how to use the Feathers REST client in NodeJS.

```
$ npm install feathers feathers-rest feathers-hooks superagent
```

```js
const feathers = require('feathers');
const superagent = require('superagent');
const client = require('feathers-rest/client');
const rest = client('http://my-feathers-server.com');

const app = feathers()
  .configure(hooks())
  .configure(rest.superagent(superagent));

// This will now connect to the http://my-feathers-server.com/messages API
const messageService = app.service('messages');

messageService.create({ text: 'Oh hai!'}).then(result => {
  console.log(result);
}).catch(error => {
  console.error(error);
});
```

## React Native Usage

Here's how you can use Feathers client with the Fetch provider in React Native.

```bash
$ npm install feathers feathers-rest feathers-hooks
```

```js
import React from 'react-native';
import hooks from 'feathers-hooks';
import {client as feathers} from 'feathers';
import {client as rest} from 'feathers-rest';

const app = feathers()
  .configure(feathers.hooks())
  .configure(rest.fetch(fetch));

// Get the message service that uses a websocket connection
const messageService = app.service('messages');

messageService.create({ text: 'Oh hai!'}).then(result => {
  console.log(result);
}).catch(error => {
  console.error(error);
});
```

## Direct HTTP

A Feathers service can also be used with any other HTTP REST client. The following section describes what HTTP method, body and query parameters belong to which service method call.

All query parameters in a URL will be set as `params.query`. Other service parameters can be set through [hooks](../hooks/readme.md) and [Express middleware](../middleware/express.md). URL query parameter values will always be strings. Conversion (e.g. the string `'true'` to boolean `true`) can be done in a hook as well.

The body type for `POST`, `PUT` and `PATCH` requests is determined by the Express [body-parser](https://github.com/expressjs/body-parser) middleware which has to be registered *before* any service.

### find

Retrieves a list of all matching resources from the service

```
GET /messages?status=read&user=10
```

Will call `messages.find({ query: { status: 'read', user: '10' } })`.

### get

Retrieve a single resource from the service.

```
GET /messages/1
```

Will call `messages.get(1, {})`.

```
GET /messages/1?fetch=all
```

Will call `messages.get(1, { query: { fetch: 'all' } })`.

### create

Create a new resource with `data` which may also be an array.

```
POST /messages
{ "text": "I really have to iron" }
```

Will call `messages.create({ "text": "I really have to iron" }, {})`.

```
POST /messages
[
  { "text": "I really have to iron" },
  { "text": "Do laundry" }
]
```

### update

Completely replace a single or multiple resources.

```
PUT /messages/2
{ "text": "I really have to do laundry" }
```

Will call `messages.update(2, { "text": "I really have to do laundry" }, {})`. When no `id` is given by sending the request directly to the endpoint something like:

```
PUT /messages?complete=false
{ "complete": true }
```

Will call `messages.update(null, { "complete": true }, { query: { complete: 'false' } })`.

> __Note:__ `update` is normally expected to replace an entire resource which is why the database adapters only support `patch` for multiple records.

### patch

Merge the existing data of a single or multiple resources with the new `data`.

```
PATCH /messages/2
{ "read": true }
```

Will call `messages.patch(2, { "read": true }, {})`. When no `id` is given by sending the request directly to the endpoint something like:

```
PATCH /messages?complete=false
{ "complete": true }
```

Will call `messages.patch(null, { complete: true }, { query: { complete: 'false' } })` to change the status for all read messages.

This is supported out of the box by the Feathers [database adapters](../databases/readme.md) 

### remove

Remove a single or multiple resources:

```
DELETE /messages/2?cascade=true
```

Will call `messages.remove(2, { query: { cascade: 'true' } })`. When no `id` is given by sending the request directly to the endpoint something like:

```
DELETE /messages?read=true
```

Will call `messages.remove(null, { query: { read: 'true' } })` to delete all read messages.

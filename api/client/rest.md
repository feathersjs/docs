# REST Client

> **Note:** For directly using a Feathers REST API (via HTTP) without using Feathers on the client see the [HTTP API](#http-api) section.

## @feathersjs/rest-client

[![GitHub stars](https://img.shields.io/github/stars/feathersjs/rest-client.png?style=social&label=Star)](https://github.com/feathersjs/rest-client/)
[![npm version](https://img.shields.io/npm/v/@feathersjs/rest-client.png?style=flat-square)](https://www.npmjs.com/package/@feathersjs/rest-client)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.png?style=flat-square)](https://github.com/feathersjs/rest-client/blob/master/CHANGELOG.md)

```
$ npm install @feathersjs/rest-client --save
```

`@feathersjs/rest-client` allows to connect to a service exposed through the [Express REST API](../express.md#expressrest) using [jQuery](https://jquery.com/), [request](https://github.com/request/request), [Superagent](http://visionmedia.github.io/superagent/), [Axios](https://github.com/mzabriskie/axios) or [Fetch](https://facebook.github.io/react-native/docs/network.html) as the AJAX library.

<!-- -->

> **ProTip:** REST client services do emit `created`, `updated`, `patched` and `removed` events but only _locally for their own instance_. Real-time events from other clients can only be received by using a websocket connection.

<!-- -->

> **Note:** A client application can only use a single transport (either REST, Socket.io or Primus). Using two transports in the same client application is normally not necessary.

### rest([baseUrl])

REST client services can be initialized by loading `@feathersjs/rest-client` and initializing a client object with a base URL:

:::: tabs :options="{ useUrlFragment: false }"

::: tab "Modular"
``` javascript
const feathers = require('@feathersjs/feathers');
const rest = require('@feathersjs/rest-client');

const app = feathers();

// Connect to the same as the browser URL (only in the browser)
const restClient = rest();

// Connect to a different URL
const restClient = rest('http://feathers-api.com')

// Configure an AJAX library (see below) with that client 
app.configure(restClient.fetch(window.fetch));

// Connect to the `http://feathers-api.com/messages` service
const messages = app.service('messages');
```
:::

::: tab "@feathersjs/client"
``` html
<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/core-js/2.1.4/core.min.js"></script>
<script src="//unpkg.com/@feathersjs/client@^3.0.0/dist/feathers.js"></script>
<script>
  var app = feathers();
  // Connect to a different URL
  var restClient = feathers.rest('http://feathers-api.com')

  // Configure an AJAX library (see below) with that client 
  app.configure(restClient.fetch(window.fetch));

  // Connect to the `http://feathers-api.com/messages` service
  const messages = app.service('messages');
</script>
```
:::

::::

<!-- -->

> **ProTip:** In the browser, the base URL is relative from where services are registered. That means that a service at `http://api.feathersjs.com/api/v1/messages` with a base URL of `http://api.feathersjs.com` would be available as `app.service('api/v1/messages')`. With a base URL of `http://api.feathersjs.com/api/v1` it would be `app.service('messages')`.

### params.headers

Request specific headers can be through `params.headers` in a service call:

```js
app.service('messages').create({
  text: 'A message from a REST client'
}, {
  headers: { 'X-Requested-With': 'FeathersJS' }
});
```

### params.connection

Allows to pass additional options specific to the AJAX library. `params.connection.headers` will be merged with `params.headers`:

```js
app.configure(restClient.request(request));

app.service('messages').get(1, {
  connection: {
    followRedirect: false
  }
});
```

With the `fetch` fork [yetch](https://github.com/Netflix/yetch) it can also be used to abort requests:

```js
const yetch = require('yetch');
const controller = new AbortController();

app.configure(restClient.fetch(yetch));

const promise = app.service('messages').get(1, {
  connection: {
    signal: controller.signal
  }
});

promise.abort();
```

### jQuery

Pass the instance of jQuery (`$`) to `restClient.jquery`:

```js
app.configure(restClient.jquery(window.jQuery));
```

Or with a module loader:

```js
import $ from 'jquery';

app.configure(restClient.jquery($));
```

### Request

The [request](https://github.com/request/request) object needs to be passed explicitly to `feathers.request`. Using [request.defaults](https://github.com/request/request#convenience-methods) - which creates a new request object - is a great way to set things like default headers or authentication information:

```js
const request = require('request');
const requestClient = request.defaults({
  'auth': {
    'user': 'username',
    'pass': 'password',
    'sendImmediately': false
  }
});

app.configure(restClient.request(requestClient));
```

### Superagent

[Superagent](http://visionmedia.github.io/superagent/) currently works with a default configuration:

```js
const superagent = require('superagent');

app.configure(restClient.superagent(superagent));
```

### Axios

[Axios](http://github.com/mzabriskie/axios) currently works with a default configuration:

```js
const axios = require('axios');

app.configure(restClient.axios(axios));
```

### Fetch

Fetch also uses a default configuration:

```js
// In Node
const fetch = require('node-fetch');

app.configure(restClient.fetch(fetch));

// In modern browsers
app.configure(restClient.fetch(window.fetch));
```


## HTTP API

You can communicate with a Feathers REST API using any other HTTP REST client. The following section describes what HTTP method, body and query parameters belong to which service method call.

All query parameters in a URL will be set as `params.query` on the server. Other service parameters can be set through [hooks](../hooks.md) and [Express middleware](../express.md). URL query parameter values will always be strings. Conversion (e.g. the string `'true'` to boolean `true`) can be done in a hook as well.

The body type for `POST`, `PUT` and `PATCH` requests is determined by the Express [body-parser](http://expressjs.com/en/4x/api.html#express.json) middleware which has to be registered *before* any service. You should also make sure you are setting your `Accept` header to `application/json`.

### Authentication

Authenticating HTTP (REST) requests is a two step process. First you have to obtain a JWT from the [authentication service](../authentication/server.md) by POSTing the strategy you want to use:

```json
// POST /authentication the Content-Type header set to application/json
{
  "strategy": "local",
  "email": "your email",
  "password": "your password"
}
```

Here is what that looks like with curl:

```bash
curl -H "Content-Type: application/json" -X POST -d '{"strategy":"local","email":"your email","password":"your password"}' http://localhost:3030/authentication
```

Then to authenticate subsequent requests, add the returned `accessToken` to the `Authorization` header:

```bash
curl -H "Content-Type: application/json" -H "Authorization: <your access token>" -X POST http://localhost:3030/authentication
```

Also see the [JWT](../authentication/jwt.md) and [local](../authentication/local.md) authentication chapter.

### find

Retrieves a list of all matching resources from the service

```
GET /messages?status=read&user=10
```

Will call `messages.find({ query: { status: 'read', user: '10' } })` on the server.

If you want to use any of the built-in find operands ($le, $lt, $ne, $eq, $in, etc.) the general format is as follows:

```
GET /messages?field[$operand]=value&field[$operand]=value2
```

For example, to find the records where field _status_ is not equal to **active** you could do

```
GET /messages?status[$ne]=active
```

More information about the possible parameters for official database adapters can be found [in the database querying section](../databases/querying.md).

### get

Retrieve a single resource from the service.

```
GET /messages/1
```

Will call `messages.get(1, {})` on the server.

```
GET /messages/1?fetch=all
```

Will call `messages.get(1, { query: { fetch: 'all' } })` on the server.

### create

Create a new resource with `data` which may also be an array.

```
POST /messages
{ "text": "I really have to iron" }
```

Will call `messages.create({ "text": "I really have to iron" }, {})` on the server.

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

Will call `messages.update(2, { "text": "I really have to do laundry" }, {})` on the server. When no `id` is given by sending the request directly to the endpoint something like:

```
PUT /messages?complete=false
{ "complete": true }
```

Will call `messages.update(null, { "complete": true }, { query: { complete: 'false' } })` on the server.

> **ProTip:** `update` is normally expected to replace an entire resource which is why the database adapters only support `patch` for multiple records.

### patch

Merge the existing data of a single or multiple resources with the new `data`.

```
PATCH /messages/2
{ "read": true }
```

Will call `messages.patch(2, { "read": true }, {})` on the server. When no `id` is given by sending the request directly to the endpoint something like:

```
PATCH /messages?complete=false
{ "complete": true }
```

Will call `messages.patch(null, { complete: true }, { query: { complete: 'false' } })` on the server to change the status for all read messages.

This is supported out of the box by the Feathers [database adapters](../databases/adapters.md) 

### remove

Remove a single or multiple resources:

```
DELETE /messages/2?cascade=true
```

Will call `messages.remove(2, { query: { cascade: 'true' } })`.

When no `id` is given by sending the request directly to the endpoint something like:

```
DELETE /messages?read=true
```

Will call `messages.remove(null, { query: { read: 'true' } })` to delete all read messages.

## Client

The `client` module in `feathers-rest` (`require('feathers-rest/client')`) allows to connect to a service exposed through the [REST server](#server) using [jQuery](https://jquery.com/), [request](https://github.com/request/request), [Superagent](http://visionmedia.github.io/superagent/), [Axios](https://github.com/mzabriskie/axios) or [Fetch](https://facebook.github.io/react-native/docs/network.html) as the AJAX library.

> **Very important:** The examples below assume you are using Feathers either in Node or in the browser with a module loader like Webpack or Browserify. For using Feathers with a `<script>` tag, AMD modules or with React Native see the [client chapter](./client.md).

<!-- -->

> **ProTip:** REST client services do emit `created`, `updated`, `patched` and `removed` events but only _locally for their own instance_. Real-time events from other clients can only be received by using a websocket connection.

<!-- -->

> **Note:** A client application can only use a single transport (either REST, Socket.io or Primus). Using two transports in the same client application is normally not necessary.

### `rest([baseUrl])`

REST client services can be initialized by loading `feathers-rest/client` and initializing a client object with a base URL:

```js
const feathers = require('feathers/client');
const rest = require('feathers-rest/client');

// Connect to REST endpoints
const restClient = rest();
// Connect to a different URL
const restClient = rest('http://feathers-api.com');
```

<!-- -->

> **ProTip:** The base URL is relative from where services are registered. That means that a service at `http://api.feathersjs.com/api/v1/messages` with a base URL of `http://api.feathersjs.com` would be available as `app.service('api/v1/messages')`. With a base URL of `http://api.feathersjs.com/api/v1` it would be `app.service('messages')`.


REST client wrappers are always initialized using a base URL:

```js
app.configure(restClient.superagent(superagent [, options]));
```

Default headers can be set for all libaries (except [request](#request) which has its own defaults mechanism) in the options like this:

```js
app.configure(restClient.superagent(superagent, {
  headers: { 'X-Requested-With': 'FeathersJS' }
}));
```

Then services that automatically connect to that remote URL can be retrieved as usual via [app.service](./application.md#service):

```js
app.service('messages').create({
  text: 'A message from a REST client'
});
```

Request specific headers can be through `params.headers` in a service call:

```js
app.service('messages').create({
  text: 'A message from a REST client'
}, {
  headers: { 'X-Requested-With': 'FeathersJS' }
});
```

The supported AJAX libraries can be initialized as follows.

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
const client = request.defaults({
  'auth': {
    'user': 'username',
    'pass': 'password',
    'sendImmediately': false
  }
});

app.configure(restClient.request(client));
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
const fetch = require('node-fetch');

app.configure(restClient.fetch(fetch));
```


## Direct connection

You can communicate with a Feathers server using any HTTP REST client. The following section describes what HTTP method, body and query parameters belong to which service method call.

All query parameters in a URL will be set as `params.query` on the server. Other service parameters can be set through [hooks](./hooks.md) and [Express middleware](./express.md). URL query parameter values will always be strings. Conversion (e.g. the string `'true'` to boolean `true`) can be done in a hook as well.

The body type for `POST`, `PUT` and `PATCH` requests is determined by the Express [body-parser](https://github.com/expressjs/body-parser) middleware which has to be registered *before* any service. You should also make sure you are setting your `Accept` header to `application/json`.

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

More information about the possible parameters for official database adapters can be found [in the database querying section](./databases/querying.md).

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

This is supported out of the box by the Feathers [database adapters](../databases/readme.md) 

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
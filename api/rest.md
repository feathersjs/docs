# REST

[![GitHub stars](https://img.shields.io/github/stars/feathersjs/feathers-rest.png?style=social&label=Star)](https://github.com/feathersjs/feathers-rest/)
[![npm version](https://img.shields.io/npm/v/feathers-rest.png?style=flat-square)](https://www.npmjs.com/package/feathers-rest)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.png?style=flat-square)](https://github.com/feathersjs/feathers-rest/blob/master/CHANGELOG.md)

```
$ npm install feathers-rest --save
```

The [feathers-rest](https://github.com/feathersjs/feathers-rest) module allows you to expose and consume [services](./services.md) through a [RESTful API](https://en.wikipedia.org/wiki/Representational_state_transfer). This means that you can call a service method through the `GET`, `POST`, `PUT`, `PATCH` and `DELETE` [HTTP methods](https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol):

| Service method  | HTTP method | Path        |
|-----------------|-------------|-------------|
| .find()         | GET         | /messages   |
| .get()          | GET         | /messages/1 |
| .create()       | POST        | /messages   |
| .update()       | PUT         | /messages/1 |
| .patch()        | PATCH       | /messages/1 |
| .remove()       | DELETE      | /messages/1 |


## Server

To expose services through a RESTful API we will have to configure the feathers-rest plugin and provide our own body parser middleware (usually the standard [Express 4 body-parser](https://github.com/expressjs/body-parser)) to make REST `.create`, `.update` and `.patch` calls parse the data in the HTTP body. If you would like to add other middleware _before_ the REST handler, call `app.use(middleware)` before registering any services. 

```
$ npm install body-parser --save
```

> **Important:** For additional information about middleware, routing and how the REST module works with Express middleware see the [Express chapter](./express.md).

<!-- -->

> **ProTip:** The body-parser middleware has to be registered _before_ any service. Otherwise the service method will throw a `No data provided` or `First parameter for 'create' must be an object` error.

#### `app.configure(rest())`

Configures the transport provider with a standard formatter sending JSON response via [res.json](http://expressjs.com/en/4x/api.html#res.json).

```js
const feathers = require('@feathersjs/feathers');
const bodyParser = require('body-parser');
const rest = require('@feathersjs/express/rest');
const app = feathers();

// Turn on JSON parser for REST services
app.use(bodyParser.json())
// Turn on URL-encoded parser for REST services
app.use(bodyParser.urlencoded({ extended: true }));
// Set up REST transport
app.configure(rest())
```

#### `app.configure(rest(formatter))`

The default REST response formatter is a middleware that formats the data retrieved by the service as JSON. If you would like to configure your own `formatter` middleware pass a `formatter(req, res)` function. This middleware will have access to `res.data` which is the data returned by the service. [res.format](http://expressjs.com/en/4x/api.html#res.format) can be used for content negotiation.

```js
const app = feathers();
const bodyParser = require('body-parser');
const rest = require('@feathersjs/express/rest');

// Turn on JSON parser for REST services
app.use(bodyParser.json())
// Turn on URL-encoded parser for REST services
app.use(bodyParser.urlencoded({ extended: true }));
// Set up REST transport
app.configure(rest(function(req, res) {
  // Format the message as text/plain
  res.format({
    'text/plain': function() {
      res.end(`The Message is: "${res.data.text}"`);
    }
  });  
}))
```

### `params.query`

`params.query` will contain the URL query parameters sent from the client. For the REST transport the query string is parsed using the [qs](https://github.com/ljharb/qs) module. For some query string examples see the [database querying](./databases/querying.md) chapter.

> **Important:** Only `params.query` is passed between the server and the client, other parts of `params` are not. This is for security reasons so that a client can't set things like `params.user` or the database options. You can always map from `params.query` to other `params` properties in a before [hook](./hooks.md).

### `params.provider`

For any [service method call](./services.md) made through REST `params.provider` will be set to `rest`. In a [hook](./hooks.md) this can for example be used to prevent external users from making a service method call:

```js
app.service('users').hooks({
  before: {
    remove(hook) {
      // check for if(hook.params.provider) to prevent any external call
      if(hook.params.provider === 'rest') {
        throw new Error('You can not delete a user via REST');
      }
    }
  }
});
```


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

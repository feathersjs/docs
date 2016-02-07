# REST

Once [set up on the server](../rest/readme.md), there are several ways to connect to the REST API of a Feathers service. Keep in mind that while clients connected via websockets will receive real-time events from other REST API calls, the HTTP API itself does not provide any real-time functionality.

## feathers-rest clients

Using [the Feathers client](feathers.md), the `feathers-rest/client` module allows connecting to a Feathers service via the REST API using [jQuery](https://jquery.com/), [request](https://github.com/request/request), [Superagent](http://visionmedia.github.io/superagent/) or Fetch as the client library.

> __Important__: REST client services do emit `created`, `updated`, `patched` and `removed` events but only _locally for their own instance_. Real-time events from other clients can only be received by using a websocket connection.

```
$ npm install feathers feathers-rest
```

The REST client wrapper is initialized using a base URL:

```js
const feathers = require('feathers');
const restClient = require('feathers-rest/client');

const rest = restClient('http://my-feathers-server.com');
const app = feathers()

// Now we can configure the transport library of choice
app.configure(rest.jquery(window.jQuery));
// or
app.configure(rest.fetch(fetch));
// or
app.configure(rest.request(request));
// or
app.configure(rest.superagent(superagent));

// This will now connect to the http://my-feathers-server.com/todos API
const todoService = app.service('todos');
```

The base URL is relative from where services are registered. That means that a service at `http://my-feathers-server.com/api/v1/todos` with a base URL of `http://my-feathers-server.com` would be available as `app.service('api/v1/todos')`. With a base URL of `http://my-feathers-server.com/api/v1` it would be `app.service('todos')`.

### jQuery

jQuery [$.ajax](http://api.jquery.com/jquery.ajax/) requires an instance of jQuery passed to `feathers.jquery`. In most cases the global `jQuery`:

```js
const app = feathers()
  .configure(rest.jquery(window.jQuery));
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

const app = feathers()
  .configure(rest.request(client));
```

### Superagent

[Superagent](http://visionmedia.github.io/superagent/) currently works with a default configuration:

```js
const superagent = require('superagent');
const app = feathers()
  .configure(rest.superagent(superagent));
```

### Fetch

Fetch also uses a default configuration:

```js
const fetch = require('node-fetch');
const app = feathers()
  .configure(feathers.fetch(fetch));
```

## Direct HTTP

A Feathers service can also be used with any other HTTP REST client. The following section describes what HTTP method, body and query parameters belong to which service method call.

All query parameters in a URL will be set as `params.query`. Other service parameters can be set through [hooks](../hooks/readme.md) and [Express middleware](../middleware/exprss.md). URL query parameter values will always be strings. Conversion (e.g. the string `'true'` to boolean `true`) can be done in a hook as well.

The body type for `POST`, `PUT` and `PATCH` requests is determined by the Express [body-parser](https://github.com/expressjs/body-parser) middleware which has to be registered *before* any service.

### find

Retrieves a list of all matching resources from the service

```
GET /todos?status=completed&user=10
```

Will call `todos.find({ query: { status: 'completed', user: '10' } })`.

### get

Retrieve a single resource from the service.

```
GET /todos/1
```

Will call `todos.get(1, {})`.

```
GET /todos/1?fetch=all
```

Will call `todos.get(1, { query: { fetch: 'all' } })`.

### create

Create a new resource with `data` which may also be an array.

```
POST /todos
{ "description": "I really have to iron" }
```

Will call `todos.create({ "description": "I really have to iron" }, {})`.

```
POST /todos
[
  { "description": "I really have to iron" },
  { "description": "Do laundry" }
]
```

### update

Completely replace a single or multiple resources.

```
PUT /todos/2
{ "description": "I really have to do laundry" }
```

Will call `todos.update(2, { "description": "I really have to do laundry" }, {})`. When no `id` is given by sending the request directly to the endpoint something like:

```
PUT /todos?complete=false
{ "complete": true }
```

Will call `todos.update(null, { "complete": true }, { query: { complete: 'false' } })`.

> __Note:__ `update` is normally expected to replace an entire resource which is why the database adapters only support `patch` for multiple records.

### patch

Merge the existing data of a single or multiple resources with the new `data`.

```
PATCH /todos/2
{ "completed": true }
```

Will call `todos.patch(2, { "completed": true }, {})`. When no `id` is given by sending the request directly to the endpoint something like:

```
PATCH /todos?complete=false
{ "complete": true }
```

Will call `todos.patch(null, { complete: true }, { query: { complete: 'false' } })` to change the status for all completed todos.

This is supported out of the box by the Feathers [database adapters](../databases/readme.md) 

### remove

Remove a single or multiple resources:

```
DELETE /todos/2?cascade=true
```

Will call `todos.remove(2, { query: { cascade: 'true' } })`. When no `id` is given by sending the request directly to the endpoint something like:

```
DELETE /todos?completed=true
```

Will call `todos.remove(null, { query: { completed: 'true' } })` to delete all completed todos.

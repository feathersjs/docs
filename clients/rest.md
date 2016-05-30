# Feathers Client + REST

Once [set up on the server](../rest/readme.md), there are several ways to connect to the REST API of a Feathers service. Keep in mind that while clients connected via websockets will receive real-time events from other REST API calls, you can't get real-time updates over the HTTP API without resorting to polling.

Using [the Feathers client](feathers.md), the `feathers-rest/client` module allows you to connect to a Feathers service via a REST API using [jQuery](https://jquery.com/), [request](https://github.com/request/request), [Superagent](http://visionmedia.github.io/superagent/) or [Fetch](https://facebook.github.io/react-native/docs/network.html) as the client library.

> **ProTip:** REST client services do emit `created`, `updated`, `patched` and `removed` events but only _locally for their own instance_. Real-time events from other clients can only be received by using a websocket connection.

<!-- -->

> **ProTip:** The base URL is relative from where services are registered. That means that a service at `http://api.feathersjs.com/api/v1/messages` with a base URL of `http://api.feathersjs.com` would be available as `app.service('api/v1/messages')`. With a base URL of `http://api.feathersjs.com/api/v1` it would be `app.service('messages')`.

<!-- -->

> **ProTip:** Notice how the REST client wrapper is always initialized using a base URL: `.configure(rest('http://api.feathersjs.com').superagent(superagent));`

### jQuery

jQuery [$.ajax](http://api.jquery.com/jquery.ajax/) requires an instance of jQuery passed to `feathers.jquery`. In most cases the global `jQuery`:

```js
const feathers = require('feathers/client');
const rest = require('feathers-rest/client');
const host = 'http://api.feathersjs.com';
const app = feathers()
  .configure(rest(host).jquery(window.jQuery));
```

### Request

The [request](https://github.com/request/request) object needs to be passed explicitly to `feathers.request`. Using [request.defaults](https://github.com/request/request#convenience-methods) - which creates a new request object - is a great way to set things like default headers or authentication information:

```js
const feathers = require('feathers/client');
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
const feathers = require('feathers/client');
const rest = require('feathers-rest/client');
const superagent = require('superagent');
const host = 'http://api.feathersjs.com';
const app = feathers()
  .configure(rest(host).superagent(superagent));
```

### Fetch

Fetch also uses a default configuration:

```js
const feathers = require('feathers/client');
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
<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/core-js/2.1.4/core.min.js"></script>
<script type="text/javascript" src="//npmcdn.com/feathers-client@^1.0.0/dist/feathers.js"></script>
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
import feathers from 'feathers/client';
import rest from 'feathers-rest/client';

const app = feathers()
  .configure(feathers.hooks())
  .configure(rest('http://my-feathers-server.com').fetch(fetch));

// Get the message service that uses a REST connection
const messageService = app.service('messages');

messageService.create({ text: 'Oh hai!'})
  .then(result => console.log(result))
  .catch(error => console.error(error));
```

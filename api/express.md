# Express

## Rendering views

While services primarily provide APIs for a client side application to use, they also play well with [rendering views on the server with Express](http://expressjs.com/en/guide/using-template-engines.html). For more details, please refer to the [Using a View Engine](../guides/using-a-view-engine.md) guide.

## Custom service middleware

Custom Express middleware that only should run before or after a specific service can be passed to `app.use` in the order it should run:

```js
const todoService = {
  get(id) {
    return Promise.resolve({
      id,
      description: `You have to do ${id}!`
    });
  }
};

app.use('/todos', ensureAuthenticated, logRequest, todoService, updateData);
```

Middleware that runs after the service will have `res.data` available which is the data returned by the service. For example `updateData` could look like this:

```js
function updateData(req, res, next) {
  res.data.updateData = true;
  next();
}
```

Keep in mind that shared authentication (between REST and websockets) should use a service based approach as described in the [authentication guide](../authentication/readme.md).

Information about how to use a custom formatter (e.g. to send something other than JSON) can be found in the [REST provider](../rest/readme.md) chapter.

## Setting service parameters

All middleware registered after the REST provider has been configured will have access to the `req.feathers` object to set properties on the service method `params`:

```js
app.configure(rest())
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({extended: true}))
  .use(function(req, res, next) {
    req.feathers.fromMiddleware = 'Hello world';
    next();
  });

app.use('/todos', {
  get(id, params) {
    console.log(params.provider); // -> 'rest'
    console.log(params.fromMiddleware); // -> 'Hello world'

    return Promise.resolve({
      id, params,
      description: `You have to do ${id}!`
    });
  }
});
```

We recommend not setting `req.feathers = something` directly since it may already contain information that other Feathers plugins rely on. Adding individual properties or using `Object.assign(req.feathers, something)` is the more reliable option.

> __ProTip:__ Although it may be convenient to set `req.feathers.req = req;` to have access to the request object in the service, we recommend keeping your services as provider independent as possible. There usually is a way to pre-process your data in a middleware so that the service does not need to know about the HTTP request or response.


## Query, route and middleware parameters

URL query parameters will be parsed and passed to the service as `params.query`. For example:

```
GET /messages?read=true&$sort[createdAt]=-1
```

Will set `params.query` to

```js
{
  "read": "true",
  "$sort": { "createdAt": "-1" }
}
```

> **ProTip:** Since the URL is just a string, there will be **no type conversion**. This can be done manually in a [hook](../hooks/readme.md).

<!-- -->

> **ProTip:** For REST calls, `params.provider` will be set to `rest` so you know which provider the service call came in on.

<!-- -->

> **ProTip:** It is also possible to add information directly to the `params` object by registering an Express middleware that modifies the `req.feathers` property. It must be registered **before** your services are.

<!-- -->

> **ProTip:** Route params will automatically be added to the `params` object.

<!-- -->

> **ProTip:** To get extended query parsing [set](http://expressjs.com/en/4x/api.html#app.set) `app.set('query parser', 'extended')` which will use the [qs](https://www.npmjs.com/package/qs) instead of the built-in [querystring](https://nodejs.org/api/querystring.html) module.

<!-- -->

> **ProTip:** If an array in your request consists of more than 20 items, the [qs](https://www.npmjs.com/package/qs) parser implicitly [converts](https://github.com/ljharb/qs#parsing-arrays) it  to an object with indices as keys. To extend this limit, you can set a custom query parser: `app.set('query parser', str => qs.parse(str, {arrayLimit: 1000}))`

```js
const feathers = require('feathers');
const rest = require('feathers-rest');

const app = feathers();

app.configure(rest())
  .use(function(req, res, next) {
    req.feathers.fromMiddleware = 'Hello world';
    next();
  });

app.use('/users/:userId/messages', {
  get(id, params) {
    console.log(params.query); // -> ?query
    console.log(params.provider); // -> 'rest'
    console.log(params.fromMiddleware); // -> 'Hello world'
    console.log(params.userId); // will be `1` for GET /users/1/messages

    return Promise.resolve({
      id,
      params,
      read: false,
      text: `Feathers is great!`,
      createdAt: new Date().getTime()
    });
  }
});

app.listen(3030);
```

You can see all the passed parameters by going to something like `localhost:3030/users/213/messages/23?read=false&$sort[createdAt]=-1]`. More information on how services play with Express middleware, routing and versioning can be found in the [middleware chapter](../middleware/readme.md).


## Sub-Apps

As already described in the [routing chapter](routing.md), sub-apps make it easy to provide different versions for an API. Currently, when using the Socket.io and Primus [real-time providers](../real-time/readme.md) providers, `app.setup` will be called automatically, however, with only the REST provider or when using plain Express in the parent application you will have to call the sub-apps `setup` yourself:

```js
const express = require('express');
const feathers = require('feathers');
const api = feathers().use('/service', myService);

const mainApp = express().use('/api/v1', api);

const server = mainApp.listen(3030);

// Now call setup on the Feathers app with the server
api.setup(server);
```


## HTTPS

With your Feathers application initialized it is easy to set up an HTTPS REST and SocketIO server:

```js
const fs = require('fs');
const https  = require('https');

app.configure(socketio()).use('/todos', todoService);

const server = https.createServer({
  key: fs.readFileSync('privatekey.pem'),
  cert: fs.readFileSync('certificate.pem')
}, app).listen(443);

// Call app.setup to initialize all services and SocketIO
app.setup(server);
```


# Virtual Hosts

You can use the [vhost](https://github.com/expressjs/vhost) middleware to run your Feathers app on a virtual host:

```js
const vhost = require('vhost');

app.use('/todos', todoService);

const host = feathers().use(vhost('foo.com', app));
const server = host.listen(8080);

// Here we need to call app.setup because .listen on our virtal hosted
// app is never called
app.setup(server);
```

# Express

On the server, a Feathers application acts as a drop-in replacement for any [Express](http://expressjs.com) application. This chapter describes how [services](./services.md) and the [REST transport](./rest.md) interact with Express middleware.

> **Important:** This chapter assumes that you are familiar with [Express](http://expressjs.com/en/guide/routing.html).


## Setting service `params`

All middleware registered after the [REST transport](./rest.md) will have access to the `req.feathers` object to set properties on the service method `params`:

```js
const app = require('@feathersjs/feathers')();
const rest = require('@feathersjs/express/rest');
const bodyParser = require('body-parser');

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

app.listen(3030);
```

You can see the parameters set by running the example and visiting `http://localhost:3030/todos/test`.

Avoid setting `req.feathers = something` directly since it may already contain information that other Feathers plugins rely on. Adding individual properties or using `Object.assign(req.feathers, something)` is the more reliable option.

> __Very important:__ Since the order of Express middleware matters, any middleware that sets service parameters has to be registered _before_ your services (in a generated application before `app.configure(services)` or in `middleware/index.js`).

> __ProTip:__ Although it may be convenient to set `req.feathers.req = req;` to have access to the request object in the service, we recommend keeping your services as provider independent as possible. There usually is a way to pre-process your data in a middleware so that the service does not need to know about the HTTP request or response.


## Query parameters

The query string is parsed using the [qs](https://github.com/ljharb/qs) module. URL query parameters will be parsed and passed to the service as `params.query`. For example:

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

For additional query string examples see the [database querying](./databases/querying.md) chapter.

> **ProTip:** Since the URL is just a string, there will be **no type conversion**. This can be done manually in a [hook](./hooks.md).

<!-- -->

> **ProTip:** If an array in your request consists of more than 20 items, the [qs](https://www.npmjs.com/package/qs) parser implicitly [converts](https://github.com/ljharb/qs#parsing-arrays) it  to an object with indices as keys. To extend this limit, you can set a custom query parser: `app.set('query parser', str => qs.parse(str, {arrayLimit: 1000}))`


## Route parameters

Express route placeholder parameters in a service URL will be added to the service `params`:

```js
const feathers = require('@feathersjs/feathers');
const rest = require('@feathersjs/express/rest');

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

You can see all the passed parameters by going to something like `localhost:3030/users/213/messages/23?read=false&$sort[createdAt]=-1]`.


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

Information about how to use a custom formatter (e.g. to send something other than JSON) can be found in the [REST transport](./rest.md) chapter.


## Sub-Apps

Sub-apps allow to provide different versions for an API. Currently, when using the Socket.io and Primus [real-time providers](../real-time/readme.md) providers, `app.setup` will be called automatically, however, with only the REST provider or when using plain Express in the parent application you will have to call the sub-apps `setup` yourself:

```js
const express = require('express');
const feathers = require('@feathersjs/feathers');
const api = feathers().use('/service', myService);

const mainApp = express().use('/api/v1', api);

const server = mainApp.listen(3030);

// Now call setup on the Feathers app with the server
api.setup(server);
```

> **ProTip:** We recommend avoiding complex sub-app setups because websockets and Feathers built in authentication are not fully sub-app aware.


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


## Virtual Hosts

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

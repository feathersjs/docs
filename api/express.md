# Express

[![GitHub stars](https://img.shields.io/github/stars/feathersjs/express.png?style=social&label=Star)](https://github.com/feathersjs/express/)
[![npm version](https://img.shields.io/npm/v/@feathersjs/express.png?style=flat-square)](https://www.npmjs.com/package/@feathersjs/express)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.png?style=flat-square)](https://github.com/feathersjs/express/blob/master/CHANGELOG.md)

```
$ npm install @feathersjs/express --save
```

The `@feathersjs/express` module contains the Feathers to Express framework bindings and an Express based REST API transport.

```js
const express = require('@feathersjs/express');
```

> **Important:** This chapter assumes that you are familiar with [Express](http://expressjs.com/en/guide/routing.html).

## express(app)

`express(app) -> app` is a function that turns a [Feathers application](./application.md) into a fully Express compatible application that additionally to Feathers functionality also lets you use the [Express API](http://expressjs.com/en/4x/api.html). It wil also override the Feathers application `app.use` to support both, services and [Express middleware](http://expressjs.com/en/guide/writing-middleware.html). If [a service object](./services.md) is passed it will use Feathers registration mechanism, for a middleware function Express.

```js
const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');

// Create an app that is a Feathers AND Express application
const app = express(feathers());

// Register a service
app.use('/todos', {
  get(id) {
    return Promise.resovle({ id });
  }
});

// Register an Express middleware
app.use('/test', (req, res) => {
  res.json({
    message: 'Hello world from Express middleware'
  });
});

// Listen on port 3030
app.listen(3030);
```

Note that `@feathersjs/express` (`express`) also exposes the standard [Express middleware](http://expressjs.com/en/4x/api.html#express):

- `express.json` - A JSON body parser
- `express.urlencoded` - A URL encoded form body parser
- `express.static` - To statically host files in a folder
- `express.Router` - Creates an Express router object

## express.rest

`express.rest` registers a Feathers transport mechanism that allows you to expose and consume [services](./services.md) through a [RESTful API](https://en.wikipedia.org/wiki/Representational_state_transfer). This means that you can call a service method through the `GET`, `POST`, `PUT`, `PATCH` and `DELETE` [HTTP methods](https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol):

| Service method  | HTTP method | Path        |
|-----------------|-------------|-------------|
| .find()         | GET         | /messages   |
| .get()          | GET         | /messages/1 |
| .create()       | POST        | /messages   |
| .update()       | PUT         | /messages/1 |
| .patch()        | PATCH       | /messages/1 |
| .remove()       | DELETE      | /messages/1 |


To expose services through a RESTful API we will have to configure `express.rest` and provide our own body parser middleware (usually the standard [Express 4 body-parser](https://github.com/expressjs/body-parser)) to make REST `.create`, `.update` and `.patch` calls parse the data in the HTTP body. If you would like to add other middleware _before_ the REST handler, call `app.use(middleware)` before registering any services. 

> **ProTip:** The body-parser middleware has to be registered _before_ any service. Otherwise the service method will throw a `No data provided` or `First parameter for 'create' must be an object` error.

### app.configure(express.rest())

Configures the transport provider with a standard formatter sending JSON response via [res.json](http://expressjs.com/en/4x/api.html#res.json).

```js
const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');

// Create an Express compatible Feathers application
const app = express(feathers());

// Turn on JSON parser for REST services
app.use(express.json())
// Turn on URL-encoded parser for REST services
app.use(express.urlencoded({ extended: true }));
// Set up REST transport
app.configure(express.rest())
```

### app.configure(express.rest(formatter))

The default REST response formatter is a middleware that formats the data retrieved by the service as JSON. If you would like to configure your own `formatter` middleware pass a `formatter(req, res)` function. This middleware will have access to `res.data` which is the data returned by the service. [res.format](http://expressjs.com/en/4x/api.html#res.format) can be used for content negotiation.

```js
const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');

const app = feathers();

// Turn on JSON parser for REST services
app.use(express.json())
// Turn on URL-encoded parser for REST services
app.use(express.urlencoded({ extended: true }));
// Set up REST transport
app.configure(express.rest(function(req, res) {
  // Format the message as text/plain
  res.format({
    'text/plain': function() {
      res.end(`The Message is: "${res.data.text}"`);
    }
  });  
}))
```

### Custom service middleware

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

> __ProTip:__ If you run `res.send` in a custom middleware after the service, other middleware (like the REST formatter) will be skipped.

### params

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

### params.query

`params.query` will contain the URL query parameters sent from the client. For the REST transport the query string is parsed using the [qs](https://github.com/ljharb/qs) module. For some query string examples see the [database querying](./databases/querying.md) chapter.

> **Important:** Only `params.query` is passed between the server and the client, other parts of `params` are not. This is for security reasons so that a client can't set things like `params.user` or the database options. You can always map from `params.query` to other `params` properties in a before [hook](./hooks.md).

For example:

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

> **ProTip:** Since the URL is just a string, there will be **no type conversion**. This can be done manually in a [hook](./hooks.md).

> **Note:** If an array in your request consists of more than 20 items, the [qs](https://www.npmjs.com/package/qs) parser implicitly [converts](https://github.com/ljharb/qs#parsing-arrays) it  to an object with indices as keys. To extend this limit, you can set a custom query parser: `app.set('query parser', str => qs.parse(str, {arrayLimit: 1000}))`

### `params.provider`

For any [service method call](./services.md) made through REST `params.provider` will be set to `rest`. In a [hook](./hooks.md) this can for example be used to prevent external users from making a service method call:

```js
app.service('users').hooks({
  before: {
    remove(context) {
      // check for if(context.params.provider) to prevent any external call
      if(context.params.provider === 'rest') {
        throw new Error('You can not delete a user via REST');
      }
    }
  }
});
```

### params.route

See the [routing section](#routing).

## express.errors

`expres.errors` is an [Express error handler](https://expressjs.com/en/guide/error-handling.html) middleware that formats any error response to a REST call as JSON (or HTML if e.g. someone hits our API directly in the browser) and sets the appropriate error code.

> **ProTip:** You can still use any other Express compatible [error middleware](http://expressjs.com/en/guide/error-handling.html) with Feathers. In fact, the `express.errors` is just a slightly customized one.
> **Very Important:** Just as in Express, the error handler has to be registered *after* all middleware and services.

### `app.use(handler())`

Set up the error handler with the default configuration.

```js
const errorHandler = require('@feathersjs/express/errors');
const app = feathers();

// before starting the app
app.use(errorHandler())
```

### `app.use(handler(options))`

```js
const error = require('@feathersjs/errors');
const app = feathers();

// Just like Express your error middleware needs to be
// set up last in your middleware chain.
app.use(error({
    html: function(error, req, res, next) {
      // render your error view with the error object
      res.render('error', error);
    }
}))
```

> **ProTip:** If you want to have the response in json format be sure to set the `Accept` header in your request to `application/json` otherwise the default error handler will return HTML.

The following options can be passed when creating a new localstorage service:

- `html` (Function|Object) [optional] - A custom formatter function or an object that contains the path to your custom html error pages.

> **ProTip:** `html` can also be set to `false` to disable html error pages altogether so that only JSON is returned.

## Routing

Express route placeholder parameters in a service URL will be added to the service `params.route`:

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

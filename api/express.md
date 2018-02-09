# Express

[![GitHub stars](https://img.shields.io/github/stars/feathersjs/express.png?style=social&label=Star)](https://github.com/feathersjs/express/)
[![npm version](https://img.shields.io/npm/v/@feathersjs/express.png?style=flat-square)](https://www.npmjs.com/package/@feathersjs/express)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.png?style=flat-square)](https://github.com/feathersjs/express/blob/master/CHANGELOG.md)

```
$ npm install @feathersjs/express --save
```

The `@feathersjs/express` module contains [Express](http://expressjs.com/) framework integrations for Feathers:

- The [Express framework bindings](#expressapp) to make a Feathers application Express compatible
- An Express based transport to expose services through a [REST API](#expressrest)
- An [Express error handler](#expresserrorhandler) for [Feathers errors](./errors.md)

```js
const express = require('@feathersjs/express');
```

> **Very Important:** This page describes how to set up an Express server and REST API. See the [REST client chapter](./client/rest.md) how to use this server on the client.

> **Important:** This chapter assumes that you are familiar with [Express](http://expressjs.com/en/guide/routing.html).

## express(app)

`express(app) -> app` is a function that turns a [Feathers application](./application.md) into a fully Express (4+) compatible application that additionally to Feathers functionality also lets you use the [Express API](http://expressjs.com/en/4x/api.html).

```js
const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');

// Create an app that is a Feathers AND Express application
const app = express(feathers());
```

Note that `@feathersjs/express` (`express`) also exposes the standard [Express middleware](http://expressjs.com/en/4x/api.html#express):

- `express.json` - A JSON body parser
- `express.urlencoded` - A URL encoded form body parser
- `express.static` - To statically host files in a folder
- `express.Router` - Creates an Express router object

## express()

If no Feathers application is passed, `express() -> app` returns a plain Express application just like a normal call to Express would.

## app.use(path, service|mw)

`app.use(path, service|mw) -> app` registers either a [service object](./services.md) or an [Express middleware](http://expressjs.com/en/guide/writing-middleware.html) on the given path. If [a service object](./services.md) is passed it will use Feathers registration mechanism, for a middleware function Express.

```js
// Register a service
app.use('/todos', {
  get(id) {
    return Promise.resolve({ id });
  }
});

// Register an Express middleware
app.use('/test', (req, res) => {
  res.json({
    message: 'Hello world from Express middleware'
  });
});
```

## app.listen(port)

`app.listen(port) -> HttpServer` will first call Express [app.listen](http://expressjs.com/en/4x/api.html#app.listen) and then internally also call the [Feathers app.setup(server)](./application.md#setupserver).

```js
// Listen on port 3030
const server = app.listen(3030);

server.on('listening', () => console.log('Feathers application started'));
```

## app.setup(server)

`app.setup(server) -> app` is usually called internally by `app.listen` but in the cases described below needs to be called explicitly.

### Sub-Apps

When registering an application as a sub-app, `app.setup(server)` has to be called to initialize the sub-apps services.

```js
const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');

const api = express(feathers())
  .configure(express.rest())
  .use('/service', myService);

const mainApp = express().use('/api/v1', api);

const server = mainApp.listen(3030);

// Now call setup on the Feathers app with the server
api.setup(server);
```

> **ProTip:** We recommend avoiding complex sub-app setups because websockets and Feathers built in authentication are not fully sub-app aware at the moment.

### HTTPS

HTTPS requires creating a separate server in which case `app.setup(server)` also has to be called explicitly.

```js
const fs = require('fs');
const https  = require('https');

const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');

const app = express(feathers());

const server = https.createServer({
  key: fs.readFileSync('privatekey.pem'),
  cert: fs.readFileSync('certificate.pem')
}, app).listen(443);

// Call app.setup to initialize all services and SocketIO
app.setup(server);
```

### Virtual Hosts

The [vhost](https://github.com/expressjs/vhost) Express middleware can be used to run a Feathers application on a virtual host but again requires `app.setup(server)` to be called explicitly.

```js
const vhost = require('vhost');

const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');

const app = express(feathers());

app.use('/todos', todoService);

const host = express().use(vhost('foo.com', app));
const server = host.listen(8080);

// Here we need to call app.setup because .listen on our virtal hosted
// app is never called
app.setup(server);
```

## express.rest()

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

const app = express(feathers());

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

Middleware that runs after the service has the service call information available as

- `res.data` - The data that will be sent
- `res.hook` - The [hook](./hooks.md) context of the service method call

For example `updateData` could look like this:

```js
function updateData(req, res, next) {
  res.data.updateData = true;
  next();
}
```

> __ProTip:__ If you run `res.send` in a custom middleware after the service and don't call `next`, other middleware (like the REST formatter) will be skipped. This can be used to e.g. render different views for certain service method calls.

### params

All middleware registered after the [REST transport](./rest.md) will have access to the `req.feathers` object to set properties on the service method `params`:

```js
const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const bodyParser = require('body-parser');

const app = express(feathers());

app.configure(express.rest())
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

## express.notFound()

`express.notFound()` returns middleware that returns a `NotFound` (404) [Feathers error](./errors.md). It should be used as the last middleware __before__ the error handler.

## express.errorHandler()

`expres.errorHandler` is an [Express error handler](https://expressjs.com/en/guide/error-handling.html) middleware that formats any error response to a REST call as JSON (or HTML if e.g. someone hits our API directly in the browser) and sets the appropriate error code.

> **ProTip:** You can still use any other Express compatible [error middleware](http://expressjs.com/en/guide/error-handling.html) with Feathers. In fact, the `express.errors` is just a slightly customized one.
> **Very Important:** Just as in Express, the error handler has to be registered *after* all middleware and services.

### `app.use(express.errorHandler())`

Set up the error handler with the default configuration.

```js
const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');

const app = express(feathers());

// before starting the app
app.use(express.errorHandler())
```

### `app.use(express.errorHandler(options))`

```js
const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');

const app = express(feathers());

// Just like Express your error middleware needs to be
// set up last in your middleware chain.
app.use(express.errorHandler({
    html: function(error, req, res, next) {
      // render your error view with the error object
      res.render('error', error);
    }
}));

app.use(errorHandler({
    html: {
      404: 'path/to/notFound.html',
      500: 'there/will/be/robots.html'
    }
}));
```

> **ProTip:** If you want to have the response in json format be sure to set the `Accept` header in your request to `application/json` otherwise the default error handler will return HTML.

The following options can be passed when creating a new localstorage service:

- `html` (Function|Object) [optional] - A custom formatter function or an object that contains the path to your custom html error pages.

> **ProTip:** `html` can also be set to `false` to disable html error pages altogether so that only JSON is returned.

## Routing

Express route placeholders in a service URL will be added to the services `params.route`.

> __Important:__ See the [FAQ entry on nested routes](../faq/readme.md#how-do-i-do-nested-or-custom-routes) for more details on when and when not to use nested routes.

```js
const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');

const app = express(feathers());

app.configure(express.rest())
  .use(function(req, res, next) {
    req.feathers.fromMiddleware = 'Hello world';
    next();
  });

app.use('/users/:userId/messages', {
  get(id, params) {
    console.log(params.query); // -> ?query
    console.log(params.provider); // -> 'rest'
    console.log(params.fromMiddleware); // -> 'Hello world'
    console.log(params.route.userId); // will be `1` for GET /users/1/messages

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

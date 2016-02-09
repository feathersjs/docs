# The REST API Provider

We have already seen in the [services chapter](../services/readme.md) that the [feathers-rest](https://github.com/feathersjs/feathers-rest) module allows to expose services through a [RESTful](https://en.wikipedia.org/wiki/Representational_state_transfer) interface on the services path. This means that you can call a service method through the `GET`, `POST`, `PUT`, `PATCH` and `DELETE` [HTTP methods](https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol):

```js
const messageService = {
  // GET /todos
  find(params [, callback]) {},
  // GET /todos/<id>
  get(id, params [, callback]) {},
  // POST /todos
  create(data, params [, callback]) {},
  // PUT /todos[/<id>]
  update(id, data, params [, callback]) {},
  // PATCH /todos[/<id>]
  patch(id, data, params [, callback]) {},
  // DELETE /todos[/<id>]
  remove(id, params [, callback]) {},
  setup(app, path) {}
}

app.service('/messages', messageService);
```

A full overview of which HTTP method call belongs to which service method call and parameters can be found in the [REST client use](../clients/rest.md) chapter. This chapter will talk about how to use and configure the provider module on the server.

## Usage

Install the provider with:

```
$ npm install feathers-rest body-parser
```

We will have to provide our own body parser middleware (here the standard [Express 4 body-parser](https://github.com/expressjs/body-parser)) to make REST `.create`, `.update` and `.patch` calls parse the data in the HTTP body.

> __Note:__ The body-parser middleware has to be registered *before* any service. Otherwise the service method will throw a `No data provided` or `First parameter for 'create' must be an object` error.

If you would like to add other middleware *before* the REST handler, simply call `app.use(middleware)` before registering any services. The following example creates a messages service that can save a new message and return all messages:

```js
// app.js
'use strict';

const feathers = require('feathers');
const rest = require('feathers-rest');
const bodyParser = require('body-parser');

class MessageService {
  constructor() {
    this.messages = [];
  }

  find(params) {
    return Promise.resolve(this.messages);
  }

  create(data, params) {
    this.messages.push(data);

    return Promise.resolve(data);
  }
}

const app = feathers()
  // Enable the REST provider
  .configure(rest())
  // Turn on JSON parser for REST services
  .use(bodyParser.json())
  // Turn on URL-encoded parser for REST services
  .use(bodyParser.urlencoded({ extended: true }));

app.use('/messages', new MessageService());

// Log newly created messages on the server
app.service('messages').on('created', message => 
  console.log('Created message', message)
);

app.listen(3030);
```

After starting the application with `node app.js`, we can now use CURL to create a new message:

```
curl 'http://localhost:3030/messages/' -H 'Content-Type: application/json' --data-binary '{ "text": "Learning Feathers!" }'
```

And should see the created message logged on the console. When going to [localhost:3030/messages/](http://localhost:3030/messages/) we see the newly created message.

## Query, route and middleware parameters

URL query parameters will be parsed and passed to the service as `params.query`. For example

```
GET /todos?complete=true&user[]=David&user[]=Eric&sort[name]=1
```

Will set `params.query` to

```js
{
  "complete": "true",
  "user": [ "David", "Eric" ],
  "sort": { "name": "1" }
}
```

Since the URL is just a string, there will be *no type conversion*. This can be done manually in a [hook](../hooks/readme.md).

For REST calls, `params.provider` will be set to `rest` (so you know where the service call came from). It is also possible to add information directly to the service `params` by registering Express middleware before a service that modifies the `req.feathers` property and to use URL parameters for REST API calls which will also be added to the params object:

```js
const feathers = require('feathers');
const rest = require('feathers-rest');

const app = feathers();

app.configure(rest())
  .use(function(req, res, next) {
    req.feathers.fromMiddleware = 'Hello world';
    next();
  });

app.use('/users/:userId/todos', {
  get(id, params) {
    console.log(params.query); // -> ?query
    console.log(params.provider); // -> 'rest'
    console.log(params.fromMiddleware); // -> 'Hello world'
    console.log(params.userId); // will be `1` for GET /users/1/todos

    return Promise.resolve({
      id, params,
      description: `You have to do ${id}!`
    });
  }
});

app.listen(3030);
```

You can see all the passed parameters by going to something like [localhost:3030/users/213/todos/23?complete=true&user\[\]=David&user\[\]=Eric&sort\[name\]=1](http://localhost:3030/users/213/todos/23?complete=true&user\[\]=David&user\[\]=Eric&sort\[name\]=1). More information on how services play with Express middleware, routing and versioning can be found in the [middleware chapter](../middleware/readme.md).

## Formatting the response

The default REST handler is a middleware that formats the data retrieved by the service as JSON. If you would like to configure your own `handler` middleware just pass it to `rest(handler)`. This middleware will have access to `res.data` which is the data returned by the service. [res.format](http://expressjs.com/en/4x/api.html#res.format) can be used for content negotiation. For example, a middleware that just renders plain text with the todo description:

```js
const feathers = require('feathers');
const rest = require('feathers-rest');

const app = feathers();

function restFormatter(req, res) {
  res.format({
    'text/plain': function() {
      res.end(`The todo is: ${res.data.description}`);
    }
  });
}
  
app.configure(rest(restFormatter))
  .use('/todos', {
    get(id, params) {
      return Promise.resolve({
        description: `You have to do ${id}`
      });
    }
  });
  
app.listen(3030);
```

Now going to [localhost:3030/todos/laundry](http://localhost:3030/todos/laundry) will print the plain text `The todo is: You have to do laundry`.

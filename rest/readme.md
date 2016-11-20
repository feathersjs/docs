![feathers-rest](/img/header-provider-rest.jpg)

# The REST API Provider

We have already seen in the [services chapter](../services/readme.md) that the [feathers-rest](https://github.com/feathersjs/feathers-rest) module allows to expose services through a [RESTful](https://en.wikipedia.org/wiki/Representational_state_transfer) interface on the services path. This means that you can call a service method through the `GET`, `POST`, `PUT`, `PATCH` and `DELETE` [HTTP methods](https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol):

```js
const messageService = {
  // GET /messages
  find(params [, callback]) {},
  // GET /messages/<id>
  get(id, params [, callback]) {},
  // POST /messages
  create(data, params [, callback]) {},
  // PUT /messages[/<id>]
  update(id, data, params [, callback]) {},
  // PATCH /messages[/<id>]
  patch(id, data, params [, callback]) {},
  // DELETE /messages[/<id>]
  remove(id, params [, callback]) {},
  setup(app, path) {}
}

app.use('/messages', messageService);
```

A full overview of which HTTP method call belongs to which service method call and parameters can be found in the [REST client use](../clients/rest.md) chapter. This chapter will talk about how to use and configure the provider module on the server.

## Usage

Install the provider with:

```
$ npm install feathers-rest body-parser
```

We will have to provide our own body parser middleware (here the standard [Express 4 body-parser](https://github.com/expressjs/body-parser)) to make REST `.create`, `.update` and `.patch` calls parse the data in the HTTP body.

> **ProTip:** The body-parser middleware has to be registered _before_ any service. Otherwise the service method will throw a `No data provided` or `First parameter for 'create' must be an object` error.

If you would like to add other middleware _before_ the REST handler, simply call `app.use(middleware)` before registering any services. The following example creates a messages service that can save a new message and return all messages:

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

## Customizing The Response Format

The default REST response formatter is a middleware that formats the data retrieved by the service as JSON. If you would like to configure your own `formatter` middleware just pass it to `rest(formatter)`. This middleware will have access to `res.data` which is the data returned by the service. [res.format](http://expressjs.com/en/4x/api.html#res.format) can be used for content negotiation. For example, a middleware that just renders plain text with the Message text:

```js
const feathers = require('feathers');
const rest = require('feathers-rest');

const app = feathers();

function restFormatter(req, res) {
  res.format({
    'text/plain': function() {
      res.end(`The Message is: "${res.data.text}"`);
    }
  });
}
  
app.configure(rest(restFormatter))
  .use('/messages', {
    get(id, params) {
      return Promise.resolve({
        text: `Feathers is great!`
      });
    }
  });
  
app.listen(3030);
```

Now going to [localhost:3030/messages/1](http://localhost:3030/messages/1) will print the plain text `The message is: "Feathers is great!"`.

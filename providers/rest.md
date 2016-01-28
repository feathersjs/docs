# The REST API Provider

The [feathers-rest](https://github.com/feathersjs/feathers-rest) provider allows to expose services through a [RESTful](https://en.wikipedia.org/wiki/Representational_state_transfer) interface on the services path. This means that you can call a service method through the `GET`, `POST`, `PUT`, `PATCH` and `DELETE` [HTTP methods](https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol):

```js
const myService = {
  // GET /todos
  find: function(params [, callback]) {},
  // GET /todos/<id>
  get: function(id, params [, callback]) {},
  // POST /todos
  create: function(data, params [, callback]) {},
  // PUT /todos[/<id>]
  update: function(id, data, params [, callback]) {},
  // PATCH /todos[/<id>]
  patch: function(id, data, params [, callback]) {},
  // DELETE /todos[/<id>]
  remove: function(id, params [, callback]) {},
  setup: function(app, path) {}
}

app.service('/todos', myService);
```

A full overview of which HTTP method call belongs to which service method call can be found in the [services](services.md) chapter.

## Usage

Install the provider module with:

```
npm install feathers-rest --save
```

We will have to provide our own body parser middleware like the standard [Express 4 body-parser](https://github.com/expressjs/body-parser) to make REST `.create`, `.update` and `.patch` calls parse the data in the HTTP body. This middleware has to be registered *before* any service (otherwise the service method will throw a `No data provided` or `First parameter for 'create' must be an object` error). If you would like to add other middleware *before* the REST handler, simply call `app.use(middleware)` before configuring the provider. The following example creates a Todo service that can save a new todo and return all todos:

```js
import feathers from 'feathers';
import rest from 'feathers-rest';
import bodyParser from 'body-parser';

class TodoService {
  constructor() {
    this.todos = [];
  }

  find(params) {
    return Promise.resolve(this.todos);
  }

  create(data, params) {
    this.todos.push(data);

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

app.use('/todos', new TodoService());

app.listen(3030);
```

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

Since the URL is just a string, there will be *no type conversion*. This can be done manually in a [before hook](hooks.md).

For REST calls, `params.provider` will be set to `rest` (so you know where the service call came from). It is also possible to add information directly to the service `params` by registering Express middleware before a service that modifies the `req.feathers` property and to use URL parameters for REST API calls which will also be added to the params object:

```js
app.configure(rest())
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({extended: true}))
  .use(function(req, res, next) {
    req.feathers.fromMiddleware = 'Hello world';
    next();
  });

app.use('/users/:userId/todos', {
  get: function(id, params) {
    console.log(params.query); // -> ?query
    console.log(params.provider); // -> 'rest'
    console.log(params.fromMiddleware); // -> 'Hello world'
    console.log(params.userId); // will be `1` for GET /users/1/todos

    return Promise.resolve({
      id, name, params,
      description: `You have to do ${id}!`
    });
  }
});
```

## Formatting the response

The default REST handler is a middleware that formats the data retrieved by the service as JSON. If you would like to configure your own `handler` middleware just pass it to `rest(handler)`. This middleware will have access to `res.data` which is the data returned by the service. [res.format](http://expressjs.com/en/4x/api.html#res.format) can be used for content negotiation. For example, a middleware that just renders plain text with the todo description:

```js
app.configure(rest(function restFormatter(req, res) {
    res.format({
      'text/plain': function() {
        res.end(`The todo is: ${res.data.description}`);
      }
    });
  }))
  .use('/todo', {
    get(id, params) {
      return Promise.resolve({
        description: `You have to do ${id}`
      });
    }
  });
```

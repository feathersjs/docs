# Express middleware

In Express [middleware functions](http://expressjs.com/en/guide/writing-middleware.html) are functions that have access to the request object (`req`), the response object (`res`), and the next middleware function in the application’s request-response cycle. The next middleware function is commonly denoted by a variable named `next`. How this middleware plays with Feathers [services](../services/readme.md) is outline below.

## Rendering views

While services primarily provide APIs for a client side application to use, they also play well with [rendering views on the server with Express](http://expressjs.com/en/guide/using-template-engines.html). In an Express middleware, simply use `req.app.service('<servicepath>')` to get the service, retrieve the data and then use it in `res.render`.

For example, to use [EJS](https://www.npmjs.com/package/ejs), after running `npm install ejs --save` in `app.js` we can set:

```js
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
  // find all todos
  req.app.service('todos').find({}).then(todos => 
    res.render('todos', {
      title: 'Todos',
      todos
    })
  );
});
```

With `views/index.ejs` like this:

```html
<html>
  <head>
    <title><%= title %>
  </head>
  <body>
    <h1>My todos</h1>
    <ul>
      <% todos.forEach(function(todo) { %>
        <li><%= todo.description %></li>
      <% }); %>
    </ul>
  </body>
</html>
```

We can see the list of todos from our service when going to the root url.

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

> __Pro tip:__ Although it may be convenient to set `req.feathers.req = req;` to have access to the request object in the service, we recommend keeping your services as provider independent as possible. There usually is a way to pre-process your data in a middleware so that the service does not need to know about the HTTP request or response.

## Error handling

Just like Express, Feathers does not include an [error handler](http://expressjs.com/en/guide/error-handling.html). The error handler from our [generated app](../getting-started/quick-start.md) looks like this:

```js
const errors = require('feathers-errors');

app.use(function(error, req, res, next) {
  if (typeof error === 'string') {
    error = new errors.GeneralError(error);
  } else if ( !(error instanceof errors.FeathersError) ) {
    let oldError = error;
    error = new errors.GeneralError(oldError.message, {errors: oldError.errors});

    if (oldError.stack) {
      error.stack = oldError.stack;
    }
  }

  const code = !isNaN( parseInt(error.code, 10) ) ? parseInt(error.code, 10) : 500;

  // Don't show stack trace if it is a 404 error
  if (code === 404) {
    error.stack = null;
  }

  res.status(code);

  res.format({
    'text/html': function() {
      const file = code === 404 ? '404.html' : '500.html';
      res.sendFile(path.join(req.app.get('public'), file));
    },

    'application/json': function () {
      let output = Object.assign({}, error.toJSON());

      if (req.app.settings.env === 'production') {
        delete output.stack;
      }

      res.json(output);
    }
  });
});
```

Many Feathers plugins (like the [database adapters](../databases/readme.md)) already throw [feathers-errors](https://github.com/feathersjs/feathers-errors) which include their status codes. This sends a JSON representation of the error (without the stacktrace in production) or sends the `404.html` or `500.html` error page when visited in the browser.

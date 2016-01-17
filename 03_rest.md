## Configuring

In almost every case you want to expose your services through a RESTful JSON interface. This can be achieved by calling `app.configure(feathers.rest())`. Note that you will have to provide your own body parser middleware like the standard [Express 4 body-parser](https://github.com/expressjs/body-parser) to make REST `.create`, `.update` and `.patch` calls pass the parsed data.

To set service parameters in a middleware, just attach it to the `req.feathers` object which will become the params for any service call. It is also possible to use URL parameters for REST API calls which will also be added to the params object:

```js
var bodyParser = require('body-parser');

app.configure(feathers.rest())
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({extended: true}))
  .use(function(req, res, next) {
    req.feathers.data = 'Hello world';
    next();
  });

app.use('/:app/todos', {
  get: function(name, params, callback) {
    console.log(params.data); // -> 'Hello world'
    console.log(params.app); // will be `my` for GET /my/todos/dishes
    callback(null, {
      id: name,
      params: params,
      description: "You have to do " + name + "!"
    });
  }
});
```

The default REST handler is a middleware that formats the data retrieved by the service as JSON. If you would like to configure your own `handler` middleware just pass it to `feathers.rest(handler)`. For example, a middleware that just renders plain text with the todo description (`res.data` contains the data returned by the service):

```js
app.configure(feathers.rest(function restFormatter(req, res) {
    res.format({
      'text/plain': function() {
        res.end('The todo is: ' + res.data.description);
      }
    });
  }))
  .use('/todo', {
    get: function (id, params, callback) {
      callback(null, { description: 'You have to do ' + id });
    }
  });
```

If you want to add other middleware *before* the REST handler, simply call `app.use(middleware)` before configuring the handler.

# FAQ

## Nested routes

Feathers does not provide an ORM so it does not know about associations between your services. Generally services are connected by their resource ids so any nested route can be expressed by query parameters. For example if you have a user service and would like to get all todos (assuming the associated user id is stored in each todo) for that user the url would be `/todos?userId=<userid>`.

You can however add Express style parameters to your routes when you register a service which will then be set in the `params` object in each service call. For example a `/users/:userId/todos` route can be provided like this:

```js
app.use('/users/:userId/todos', {
  find: function(params, calllback) {
    // params.userId == current user id
  },
  create: function(data, params, callback) {
    data.userId = params.userId;
    // store the data
  }
})
```

__Note:__ This route has to be registered _before_ the `/users` service otherwise the `get` route from the user service at `/users` will be matched first.



## What about koa?

Koa is a *"next generation web framework for Node.JS"* using ES6 generator functions instead of Express middleware. This approach does unfortunately not easily play well with Feathers services so there are no direct plans yet to use it as a future base for Feathers.

There are however definite plans of using ES6 features for Feathers once they make it into `node --harmony`, specifically:

- [Promises](http://www.html5rocks.com/en/tutorials/es6/promises/) instead of callbacks for asynchronous processing
- [ES6 classes](http://wiki.ecmascript.org/doku.php?id=strawman:maximally_minimal_classes) for defining services.

And a lot of the other syntactic sugar that comes with ES6 like arrow functions etc. If you want to join the discussion, chime in on [Feathers issue #83](https://github.com/feathersjs/feathers/issues/83)

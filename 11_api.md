---
title: API reference
layout: docs
permalink: /docs/api/
---

## listen

`app.listen([port])` starts the application on the given port. It will first call the original [Express app.listen([port])](http://expressjs.com/api.html#app.listen), then run `app.setup(server)` (see below) with the server object and then return the server object.

## setup

`app.setup(server)` is used to initialize all services by calling each services `.setup(app, path)` method (if available).
It will also use the `server` instance passed (e.g. through `http.createServer`) to set up SocketIO (if enabled) and any other provider that might require the server instance.

Normally `app.setup` will be called automatically when starting the application via `app.listen([port])` but there are cases when you need to initialize the server separately:

__HTTPS__

With your Feathers application initialized it is easy to set up an HTTPS REST and SocketIO server:

```js
app.configure(feathers.socketio()).use('/todos', todoService);

var https = require('https');
var server = https.createServer({
  key: fs.readFileSync('privatekey.pem'),
  cert: fs.readFileSync('certificate.pem')
}, app).listen(443);

// Call app.setup to initialize all services and SocketIO
app.setup(server);
```

__Virtual Hosts__

You can use the [vhost](https://github.com/expressjs/vhost) middleware to run your Feathers app on a virtual host:

```js
var vhost = require('vhost')

app.use('/todos', todoService);

var host = feathers().use(vhost('foo.com', app));
var server = host.listen(8080);

// Here we need to call app.setup because .listen on our virtal hosted
// app is never called
app.setup(server);
```

## use

`app.use([path], service)` works just like [Express app.use([path], middleware)](http://expressjs.com/api.html#app.use) but additionally allows to register a service object (an object which at least provides one of the service methods as outlined in the Services section) instead of the middleware function. Note that REST services are registered in the same order as any other middleware so the below example will allow the `/todos` service only to [Passport](http://passportjs.org/) authenticated users.

```js
// Serve public folder for everybody
app.use(feathers.static(__dirname + '/public');
// Make sure that everything else only works with authentication
app.use(function(req,res,next){
  if(req.isAuthenticated()){
    next();
  } else {
    // 401 Not Authorized
    next(new Error(401));
  }
});
// Add a service.
app.use('/todos', {
  get: function(name, params, callback) {
    callback(null, {
      id: name,
      description: "You have to do " + name + "!"
    });
  }
});
```

## service

`app.service(path [, service])` does two things. It either returns the Feathers wrapped service object for the given path or registers a new service for that path.

`app.service(path)` returns the wrapped service object for the given path. Feathers internally creates a new object from each registered service. This means that the object returned by `service(path)` will provide the same methods and functionality as your original service object but also functionality added by Feathers and its plugins (most notably it is possible to listen to service events). `path` can be the service name with or without leading and trailing slashes.

```js
app.use('/my/todos', {
  create: function(data, params, callback) {
    callback(null, data);
  }
});

var todoService = app.service('my/todos');
// todoService is an event emitter
todoService.on('created', function(todo) {
  console.log('Created todo', todo);
});
```

You can use `app.service(path, service)` instead `app.use(path, service)` if you want to be more explicit that you are registering a service. It is what is called internally by `app.use([path], service)` if a service object is being passed. `app.service` does __not__ provide the Express `app.use` functionality and does not check the service object for valid methods.

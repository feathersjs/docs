# Virtual Hosting, HTTPS and sub-apps

Virtual hosts, HTTPS and sub-applications work the same exact same as in Express. If an app is not started via `app.listen` however, you will have to call `app.setup(server)` manually for Feathers to do its setup thing. See the [Core API documentation](../api/readme.md) for more details on those methods.

## Sub-Apps

As already described in the [routing chapter](routing.md), sub-apps make it easy to provide different versions for an API. Currently, when using the Socket.io and Primus [real-time providers](../real-time/readme.md) providers, `app.setup` will be called automatically, however, with only the REST provider or when using plain Express in the parent application you will have to call the sub-apps `setup` yourself:

```js
const express = require('express');
const feathers = require('feathers');
const api = feathers().use('/service', myService);

const mainApp = express().use('/api/v1', api);

const server = mainApp.listen(3030);

// Now call setup on the Feathers app with the server
api.setup(server);
```

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

# Virtual Hosts

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

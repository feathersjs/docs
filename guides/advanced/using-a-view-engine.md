# Using A View Engine

Since Feathers is just an extension of Express it's really simple to render templated views on the server with data from your Feathers services. There are a few different ways that you can structure your app so this guide will show you 3 typical ways you might have your Feathers app organized.

## A Single "Monolithic" App

You probably already know that when you register a Feathers service, Feathers creates RESTful endpoints for that service automatically. Well, really those are just Express routes, so you can define your own as well.

> **ProTip:** Your own defined REST endpoints won't work with hooks and won't emit socket events. If you find you need that functionality it's probably better for you to turn your endpoints into a minimal Feathers service.

Let's say you want to render a list of messages from most recent to oldest using the Jade template engine.

```js
// You've set up your main Feathers app already

// Register your view engine
app.set('view engine', 'jade');

// Register your message service
app.use('/api/messages', memory());

// Inside your main Feathers app
app.get('/messages', function(req, res, next){
  // You namespace your feathers service routes so that
  // don't get route conflicts and have nice URLs.
  app.service('api/messages')
    .find({ query: {$sort: { updatedAt: -1 } } })
    .then(result => res.render('message-list', result.data))
    .catch(next);
});
```

Simple right? We've now rendered a list of messages. All your hooks will get triggered just like they would normally so you can use hooks to pre-filter your data and keep your template rendering routes super tight.

> **ProTip:** If you call a Feathers service "internally" (ie. not over sockets or REST) you won't have a `hook.params.provider` attribute. This allows you to have hooks only execute when services are called externally vs. from your own code. See [bundled hooks](../../api/hooks-common.md) for an example.

## Feathers As A Sub-App

Sometimes a better way to break up your Feathers app is to put your services into an API and mount your API as a sub-app. This is just like you would do with Express. If you do this, it's only a slight change to get data from your services.

```js
// You've set up your main Feathers app already

// Register your view engine
app.set('view engine', 'jade');

// Require your configured API sub-app
const api = require('./api');

// Register your API sub app
app.use('/api', api);
​
app.get('/messages', function(req, res, next){
  api.service('messages')
    .find({ query: {$sort: { updatedAt: -1 } } })
    .then(result => res.render('message-list', result.data))
    .catch(next);
});
```

Not a whole lot different. Your API sub app is pretty much the same as your single app in the previous example, and your main Feathers app is just a really small wrapper that does little more than render templates.

## Feathers As A Separate App

If your app starts to get a bit busier you might decide to move your API to a completely separate standalone Feathers app, maybe even on a different server. In order for both apps to talk to each other they'll need some way to make remote requests. Well, Feathers just so happens to have a [client side piece](../../api/client.md) that can be used on the server. This is how it works.

```js
// You've set up your feathers app already

// Register your view engine
app.set('view engine', 'jade');

// Include the Feathers client modules
const client = require('feathers/client');
const socketio = require('feathers-socketio/client');
const io = require('socket.io-client');
​
// Set up a socket connection to our remote API
const socket = io('http://api.feathersjs.com');
const api = client().configure(socketio(socket));
​
app.get('/messages', function(req, res, next){
  api.service('messages')
    .find({ query: {$sort: { updatedAt: -1 } } })
    .then(result => res.render('message-list', result.data))
    .catch(next);
});
```

> **ProTip:** In the above example we set up sockets. Alternatively you could use a Feathers client [REST provider](../../api/rest.md).

And with that, we've shown 3 different ways that you use a template engine with Feathers to render service data. If you see any issues in this guide feel free to [submit a pull request](https://github.com/feathersjs/feathers-docs/edit/master/guides/server-side-rendering.md).

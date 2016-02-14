## Feathers vs. Express + Socket.io

Express is awesome! It does much of the heavy lifting behind Feathers; routing, content-negotiation, middleware support, etc. In fact, you can simply replace Express with Feathers in any existing application and start adding new microservices.

Feathers eliminates a lot of the common boilerplate and gives you helpful plug-ins to make implementing common features easier, while also providing some convention. This includes stuff like managing permissions, CRUD for multiple databases, and real-time APIs using web sockets. Just like Express, Feathers gives you just enough to build your web app quickly but gets out of your way when you need to customize something.

If you are not familiar with Express head over to the [Express Guides](http://expressjs.com/guide.html) to get an idea. Feathers works the exact same way and supports the same functionality except that

```js
var express = require('express');
var app = express();
```

is replaced with

```js
var feathers = require('feathers');
var app = feathers();
```

This means that you can literally drop Feathers into your existing Express 4 application and start adding new services right away without having to change anything.
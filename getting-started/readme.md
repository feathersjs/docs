# Introduction

> Build Amazing, Real-Time Apps, Faster Than Ever

## What is Feathers?

Feathers is a flexible micro-service framework that extends [Express 4](http://expressjs.com), the most popular web framework for [NodeJS](http://nodejs.org/). With Feathers it's easy to create scalable real-time applications with RESTful web services and using websockets.

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
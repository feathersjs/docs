# Error Handling

By default Feathers just uses the default [error handler](http://expressjs.com/en/guide/error-handling.html) that comes with Express. It's pretty basic so the [feathers-errors](https://github.com/feathersjs/feathers-errors) module comes bundled with a more robust [error handler](https://github.com/feathersjs/feathers-errors/blob/master/src/error-handler.js) that you can use in your app. This error handler is the one that is included in a generated Feathers app by default.

---
> **ProTip:** Because Feathers extends Express you can use any Express compatible [error middleware](http://expressjs.com/en/guide/error-handling.html) with Feathers. In fact, the error handler bundled with `feathers-errors` is just a slightly customized one. 
---

Many Feathers plugins (like the [database adapters](../databases/readme.md) and [authentication](../authentication/readme.md)) already throw Feathers errors, which include their status codes. The default error handler sends a JSON representation of the error (without the stacktrace in production) or sends a default `404.html` or `500.html` error page when visited in the browser.

If you want to use your own custom error pages you can do so like this:

```js
let error = require('feathers-errors').handler;
let app = feathers();

app.use(error({
    public: 'path/to/public/dir',
    files: {
        401: '401.html',
        404: '404.html',
        500: '500.html'
    }
}))
```

## Feathers Error Types

`feathers-errors` currently provides the following error types, all of which are instances of `FeathersError`:

---
> **ProTip:** All of the feathers plugins will automatically emit the appropriate Feathers errors for you.
---

- `BadRequest`: 400
- `NotAuthenticated`: 401
- `PaymentError`: 402
- `Forbidden`: 403
- `NotFound`: 404
- `MethodNotAllowed`: 405
- `NotAcceptable`: 406
- `Timeout`: 408
- `Conflict`: 409
- `Unprocessable`: 422
- `GeneralError`: 500
- `NotImplemented`: 501
- `Unavailable`: 503

## FeathersError API

Feathers errors are pretty flexible. Here are a few ways that you can use them:

```js
import errors from 'feathers-errors';

// If you were to create an error yourself.
var notFound = new errors.NotFound('User does not exist'));

// You can wrap existing errors
var existing = new errors.GeneralError(new Error('I exist'));

// You can also pass additional data
var data = new errors.BadRequest('Invalid email', {email: 'sergey@google.com'});

// You can also pass additional data without a message
var dataWithoutMessage = new errors.BadRequest({email: 'sergey@google.com'});

// If you need to pass multiple errors
var validationErrors = new errors.BadRequest('Invalid Parameters', {errors: {email: 'Email already taken'} });

// You can also omit the error message and we'll put in a default one for you
var validationErrors = new errors.BadRequest({errors: {email: 'Invalid Email'} });
```

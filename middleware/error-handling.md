# Error Handling

By default Feathers just uses the default [error handler](http://expressjs.com/en/guide/error-handling.html) that comes with Express. It's pretty basic so the [feathers-errors](https://github.com/feathersjs/feathers-errors) module comes bundled with a more robust [error handler](https://github.com/feathersjs/feathers-errors/blob/master/src/handler.js) that you can use in your app. This error handler is the one that is included in a generated Feathers app by default.

> **ProTip:** Because Feathers extends Express you can use any Express compatible [error middleware](http://expressjs.com/en/guide/error-handling.html) with Feathers. In fact, the error handler bundled with `feathers-errors` is just a slightly customized one.

Many Feathers plugins (like the [database adapters](../databases/readme.md) and [authentication](../authentication/readme.md)) already throw Feathers errors, which include their status codes. The default error handler sends a JSON representation of the error (without the stacktrace in production) or sends a default `404.html` or `500.html` error page when visited in the browser.

If you want to use your own custom error pages you can do with a custom HTML formatter like this:

```js
const error = require('feathers-errors/handler');
const app = feathers();

// Just like Express your error middleware needs to be
// set up last in your middleware chain.
app.use(error({
    html: function(error, req, res, next) {
      // render your error view with the error object
      res.render('error', error);
    }
}))
```

> **ProTip:** If you want to have the response in json format be sure to set the `Accept` header in your request to `application/json` otherwise the default error handler will return HTML.

## Options

The following options can be passed when creating a new localstorage service:

- `html` (Function|Object) [optional] - A custom formatter function or an object that contains the path to your custom html error pages.

> **ProTip:** `html` can also be set to `false` to disable html error pages altogether so that only JSON is returned.

## Catching Global Server Side Errors

Promises swallow errors if you for get to add a `catch()` statement. Therefore, you should make sure that you **always** call `.catch()` on your promises. To catch uncaught errors at a global level you can add the code below to your top-most file.

```js
process.on('unhandledRejection', (reason, p) => {
  console.log("Unhandled Rejection at: Promise ", p, " reason: ", reason);
});
```

## Feathers Error Types

`feathers-errors` currently provides the following error types, all of which are instances of `FeathersError`:

> **ProTip:** All of the feathers plugins will automatically emit the appropriate Feathers errors for you.

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

Feathers errors are pretty flexible. They contain the following fields:

- `type` - `FeathersError`
- `name` - The error name (ie. "BadRequest", "ValidationError", etc.)
- `message` - The error message string
- `code` - The HTTP status code
- `className` - A CSS class name that can be handy for styling errors based on the error type. (ie. "bad-request" , etc.)
- `data` - An object containing anything you passed to a Feathers error except for the `errors` object.
- `errors` - An object containing whatever was passed to a Feathers error inside `errors`. This is typically validation errors or if you want to group multiple errors together.

Here are a few ways that you can use them:

```js
const errors = require('feathers-errors');

// If you were to create an error yourself.
const notFound = new errors.NotFound('User does not exist'));

// You can wrap existing errors
const existing = new errors.GeneralError(new Error('I exist'));

// You can also pass additional data
const data = new errors.BadRequest('Invalid email', {email: 'sergey@google.com'});

// You can also pass additional data without a message
const dataWithoutMessage = new errors.BadRequest({email: 'sergey@google.com'});

// If you need to pass multiple errors
const validationErrors = new errors.BadRequest('Invalid Parameters', {errors: {email: 'Email already taken'} });

// You can also omit the error message and we'll put in a default one for you
const validationErrors = new errors.BadRequest({errors: {email: 'Invalid Email'} });
```

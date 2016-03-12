# User authentication

In [the previous section](first-app.md) we set up a REST and real-time API at the `/messages` endpoint. Our generated app also comes with a `/users` endpoint and local authentication. In this chapter we will add a singup endpoint and user specific restrictions to posting and editing messages.

## Creating and authenticating users

A new user for local authentication can be created by POSTing to the `/users` endpoint. The fields required are `email` for the email (which is also the username) and `password` for the password. Passwords will be automatically hashed when creating a new user using [bcrypt](https://www.npmjs.com/package/bcryptjs).

Feathers Authentication uses [JSON webtoken (JWT)](https://jwt.io/). To obtain a token for the user we created we need to POST the login information to the `http://localhost:3030/auth/local` endpoint set up by Feathers authentication. The returned token then needs to be set in the `Authorization` header for requests that require authentication. You can find more details in the [authentication chapter](../authentication/readme.md)/

When we create a frontend for our chat API this will all be done automatically for us by the [Feathers client](../clients/feathers.md) by calling `app.authenticate()`.

### Adding HTML pages

For our chat app we will create a static `signup.html` and `login.html` page that show a form. The form in `signup.html` will POST to the `/signup` entpoint which we will create later and `login.html` will submit to `auth/local` which already exists.

Let's replace `public/index.html` with the following welcome page:

```html
<html>
  <head>
    <meta http-equiv="content-type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=0" />
    <title>Feathers Chat</title>
    <link rel="shortcut icon" href="img/favicon.png">
    <link rel="stylesheet" href="//cdn.rawgit.com/feathersjs/feathers-demos/master/examples/chat/public/base.css">
    <link rel="stylesheet" href="//cdn.rawgit.com/feathersjs/feathers-demos/master/examples/chat/public/chat.css">
  </head>
  <body>
    <main class="home container">
      <div class="row">
        <div class="col-12 col-8-tablet push-2-tablet text-center">
          <img class="logo center-item" src="http://feathersjs.com/img/feathers-logo-wide.png" alt="Feathers Logo">
          <h3 class="title">Chat</h3>
        </div>
      </div>

      <div class="row">
        <div class="col-12 push-4-tablet col-4-tablet">
          <div class="row">
            <div class="col-12">
              <a href="login.html" class="button button-primary block login">Login</a>  
            </div>
          </div>

          <div class="row">
            <div class="col-12">
              <a href="signup.html" class="button button-primary block signup">Signup</a>  
            </div>
          </div>
        </div>
      </div>
      
    </main>
  </body>
</html>
```

`public/login.html` looks like this:

```html
<html>
  <head>
    <meta http-equiv="content-type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=0" />
    <title>Feathers Chat</title>
    <meta name="description" content="an example real-time chat app built with Feathers" />
    <meta name="author" content="Feathers Contributors">
    <meta name="keywords" content="Feathers, chat, real-time" />

    <link rel="shortcut icon" href="img/favicon.png">
    <link rel="stylesheet" href="//cdn.rawgit.com/feathersjs/feathers-demos/master/examples/chat/public/base.css">
    <link rel="stylesheet" href="//cdn.rawgit.com/feathersjs/feathers-demos/master/examples/chat/public/chat.css">
  </head>
  <body>
    <main class="login container">
      <div class="row">
        <div class="col-12 col-6-tablet push-3-tablet text-center">
          <h1 class="font-100">Welcome Back</h1>
        </div>
      </div>
      <div class="row">
        <div class="col-12 col-6-tablet push-3-tablet col-4-desktop push-4-desktop text-center">
          <form class="form" method="post" action="/auth/local">
            <fieldset>
              <input class="block" type="email" name="email" placeholder="email">
            </fieldset>
            
            <fieldset>
              <input class="block" type="password" name="password" placeholder="password">
            </fieldset>

            <button type="submit" class="button button-primary block login">Login</button>
          </form>
        </div>
      </div>
    </main>
  </body>
</html>
```

Finally, `public/signup.html` looks like this:

```html
<html>
  <head>
    <meta http-equiv="content-type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=0" />
    <title>Feathers Chat</title>
    <meta name="description" content="an example real-time chat app built with Feathers" />
    <meta name="author" content="Feathers Contributors">
    <meta name="keywords" content="Feathers, chat, real-time" />

    <link rel="shortcut icon" href="img/favicon.png">
    <link rel="stylesheet" href="//cdn.rawgit.com/feathersjs/feathers-demos/master/examples/chat/public/base.css">
    <link rel="stylesheet" href="//cdn.rawgit.com/feathersjs/feathers-demos/master/examples/chat/public/chat.css">
  </head>
  <body>
    <main class="login container">
      <div class="row">
        <div class="col-12 col-6-tablet push-3-tablet text-center">
          <h1 class="font-100">Create an Account</h1>
        </div>
      </div>
      <div class="row">
        <div class="col-12 col-6-tablet push-3-tablet col-4-desktop push-4-desktop text-center">
          <form class="form" method="post" action="/signup">
            <fieldset>
              <input class="block" type="text" name="email" placeholder="email">  
            </fieldset>
            
            <fieldset>
              <input class="block" type="password" name="password" placeholder="password">
            </fieldset>

            <button type="submit" class="button button-primary block signup">Signup</button>
          </form>
        </div>
      </div>
    </main>
  </body>
</html>
```

### Signing up new users

Now we have a welcome, login and signup page and we can create a `signup` endpoint that creates a new user from the `signup.html` form submission and then redirects to `login.html`. Feathers works just like [Express](http://expressjs.com/) so we can just create an [Express middleware](http://expressjs.com/en/guide/using-middleware.html) called `signup` like this:

```
$ yo feathers:middleware
```

`src/middleware/signup.js` takes the `users` service and creates a new user from the submitted form data:

```js
'use strict';

module.exports = function(app) {
  return function(req, res, next) {
    const body = req.body;

    // Get the user servie and `create` a new user
    app.service('users').create({
      email: body.email,
      password: body.password
    })
    // Then redirect to the login page
    .then(user => res.redirect('/login.html'))
    // On errors, just call our error middleware
    .catch(next);
  };
};
```

Now we have to add the `/signup` POST route to `src/middleware/index.js`:

```js
'use strict';

const signup = require('./signup');

const handler = require('feathers-errors/handler');
const notFound = require('./not-found-handler');
const logger = require('./logger');

module.exports = function() {
  // Add your custom middleware here. Remember, that
  // just like Express the order matters, so error
  // handling middleware should go last.
  const app = this;

  app.post('/signup', signup(app));
  app.use(notFound());
  app.use(logger(app));
  app.use(handler());
};
```

> __Note:__ Most middleware should be registered before the `notFound` middleware.

The last step is to change the standard success redirect to `/chat.html` which will show the frontend for our chat application. We can do that by adding `successRedirect` to the `auth` section in `config/default.json`:

```json
{
  "host": "localhost",
  "port": 3030,
  "nedb": "../data/",
  "public": "../public/",
  "auth": {
    "token": {
      "secret": "<your secret>"
    },
    "local": {},
    "successRedirect": "/chat.html"
  }
}
```

After stopping (CTRL + C) and starting the server (`npm start`) again we can go to the signup page, sign up with a uername and password which will redirect us to the login page. There we can log in with the information we used to sign up and will get redirected to `chat.html` which currently shows authentication success page with the JWT.


## Authorization

Now that we have a user that we can use to authenticate we want to restrict the messages service only to authenticated users. We could have done that already in the service generator by answering yes when asked if we need authentication but we can also easily add it manually by changing `src/services/message/hooks/index.js` to:

```js
'use strict';

const globalHooks = require('../../../hooks');
const auth = require('feathers-authentication').hooks;

exports.before = {
  all: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.requireAuth()
  ],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
};

exports.after = {
  all: [],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
};
```

That's it for authentication. We now have a home, login and signup page. We can sign up as a new user and log in with that signup information. In the [next section](./messages.md) we will look at creating new messages and adding additional information to them using the authenticated user information.

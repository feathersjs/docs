# FeathersJS Auth Recipe: Authenticating Express middleware (SSR)

Feathers authentication also supports authenticating routes of Express middleware and can be used for server side rendering. This recipe shows how to create a login form, a `/logout` endpoint and a protected `/chat` endpoint that renders all users and recent chat messages from our [chat application](../chat/readme.md).

The key steps are:

1. Obtain the JWT by either going through the oAuth or local authentication flow
2. Set the JWT in the cookie (since the browser will send it with every request)
3. Before any middleware that needs to be protected, add the `cookieParser()` and the `authenticate('jwt')` authentication Express middleware. This will set `req.user` from the user information in JWT or show a 401 error page if there is no JWT or it is invalid.

## Configuration

In order for the browser to send the JWT with every request, cookies have to be enabled in the authentication configuration.

> __Note:__ If you are using oAuth2, cookies are already enabled.

If not enabled yet, add the following to the `authentication` section in `config/default.json`:

```js
"cookie": {
  "enabled": true,
  "name": "feathers-jwt"
}
```

We want to authenticate with a username and password login by submitting a normal HTML form to the `/authentication` endpoint. By default a successful POST to that endpoint would render JSON with our JWT. This is fine for REST APIs but in our case we want to be redirected to our protected page. We can do this by setting a `successRedirect` in the `local` strategy section of the `authentication` configuration in `config/default.json`:

```js
"local": {
  "entity": "user",
  "usernameField": "email",
  "passwordField": "password",
  "successRedirect": "/chat"
}
```

## Setting up middleware

The [JWT authentication strategy](../../api/authentication/jwt.md) will look for a JWT in the cookie but only routes that parse the cookie will be able to access it. This can be done with the [cookie-parser Express middleware](https://github.com/expressjs/cookie-parser):

```
npm install cookie-parser
```

Now we can protect any Express route by first adding `cookieParser(), authenticate('jwt')` to the chain.

> __Note:__ Only register the cookie parser middleware before routes that actually need to be protected by the JWT in the cookie in order to prevent CSRF security issues.

Since we want to render views on the server we have to register an [Express template engine](http://expressjs.com/en/guide/using-template-engines.html). For this example we will use [EJS](https://www.npmjs.com/package/ejs):

```
npm install ejs
```

Next, we can update `src/middleware/index.js` to

- Set the view engine to EJS (the default folder for views in Express is `views/` in the root of the project)
- Register a `/login` route that renders `views/login.ejs`
- Register a protected `/chat` route that gets all messages and users from the [Feathers application](../../api/application.md) and then renders `views/chat.ejs`
- Register a `/logout` route that deletes the cookie and redirect back to the login page

> __Note:__ We could also generate the middleware using `feathers generate middleware` but since they are all fairly short we can keep it in the same file for now.

```js
const cookieParser = require('cookie-parser');
const { authenticate } = require('@feathersjs/authentication').express;

module.exports = function (app) {
  // Use EJS as the view engine (using the `views` folder by default)
  app.set('view engine', 'ejs');

  // Render the /login view
  app.get('/login', (req, res) => res.render('login'));

  // Render the protected chat page
  app.get('/chat', cookieParser(), authenticate('jwt'), async (req, res) => {
    // `req.user` is set by `authenticate('jwt')`
    const { user } = req;
    // Since we are rendering on the server we have to pass the authenticated user
    // from `req.user` as `params.user` to our services
    const params = {
      user, query: {}
    };
    // Find the list of users
    const users = await app.service('users').find(params);
    // Find the most recent messages
    const messages = await app.service('messages').find(params);

    res.render('chat', { user, users, messages });
  });

  // For the logout route we remove the JWT from the cookie
  // and redirect back to the login page
  app.get('/logout', cookieParser(), (req, res) => {
    res.clearCookie('feathers-jwt');
    res.redirect('/login');
  });
};
```

> __Note:__ `npm ls @feathersjs/authentication-jwt` has to show that version 2.0.0 or later is installed.

## Views

The login form has to make a POST request to the `/authentication` endpoint and send the same fields as any other API client would. In our case specifically:

```
{
  "strategy": "local",
  "email": "user@example.com",
  "password": "mypassword"
}
```

`email` and `passwords` are normal input fields and we can add the `strategy` as a hidden field. The form has to submit a POST request to the `/authentication` endpoint. Since services can accept both, JSON and URL encoded forms we do not have to do anything else. The login page at `views/login.ejs` then looks like this:

```html
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="content-type" content="text/html; charset=utf-8">
  <meta name="viewport"
    content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=0" />
  <title>Feathers chat login</title>
  <link rel="shortcut icon" href="favicon.ico">
  <link rel="stylesheet" href="//cdn.rawgit.com/feathersjs/feathers-chat/v0.2.0/public/base.css">
  <link rel="stylesheet" href="//cdn.rawgit.com/feathersjs/feathers-chat/v0.2.0/public/chat.css">
</head>
<body>
  <div id="app" class="flex flex-column">
    <main class="login container">
      <div class="row">
        <div class="col-12 col-6-tablet push-3-tablet text-center heading">
          <h1 class="font-100">Log in</h1>
        </div>
      </div>
      <div class="row">
        <div class="col-12 col-6-tablet push-3-tablet col-4-desktop push-4-desktop">
          <form class="form" method="post" action="/authentication">
            <input type="hidden" name="strategy" value="local">
            <fieldset>
              <input class="block" type="email" name="email" placeholder="email">
            </fieldset>

            <fieldset>
              <input class="block" type="password" name="password" placeholder="password">
            </fieldset>

            <button type="submit" id="login" class="button button-primary block signup">
              Log in
            </button>
          </form>
        </div>
      </div>
    </main>
  </div>
</body>
</html>
```

The `views/chat.ejs` page has the `users`, `user` (the authenticated user) and `messages` properties available which we passed in the `/chat` middleware. Rendering messages and users looks similar to the [client side chat frontend](../chat/frontend.md):

```html
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="content-type" content="text/html; charset=utf-8">
  <meta name="viewport"
    content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=0" />
  <title>Feathers chat</title>
  <link rel="shortcut icon" href="favicon.ico">
  <link rel="stylesheet" href="//cdn.rawgit.com/feathersjs/feathers-chat/v0.2.0/public/base.css">
  <link rel="stylesheet" href="//cdn.rawgit.com/feathersjs/feathers-chat/v0.2.0/public/chat.css">
</head>
<body>
  <div id="app" class="flex flex-column">
    <main class="flex flex-column">
      <header class="title-bar flex flex-row flex-center">
        <div class="title-wrapper block center-element">
          <img class="logo" src="http://feathersjs.com/img/feathers-logo-wide.png"
            alt="Feathers Logo">
          <span class="title">Chat</span>
        </div>
      </header>
    
      <div class="flex flex-row flex-1 clear">
        <aside class="sidebar col col-3 flex flex-column flex-space-between">
          <header class="flex flex-row flex-center">
            <h4 class="font-300 text-center">
              <span class="font-600 online-count">
                <%= users.total %>
              </span> users
            </h4>
          </header>
    
          <ul class="flex flex-column flex-1 list-unstyled user-list">
            <% users.data.forEach(user => { %><li>
              <a class="block relative" href="#">
                <img src="<%= user.avatar %>" alt="" class="avatar">
                <span class="absolute username"><%= user.email %></span>
              </a>
            </li><% }); %>
          </ul>
          <footer class="flex flex-row flex-center">
            <a href="/logout" id="logout" class="button button-primary">
              Sign Out
            </a>
          </footer>
        </aside>
    
        <div class="flex flex-column col col-9">
          <main class="chat flex flex-column flex-1 clear">
            <% messages.data.forEach(message => { %>
            <div class="message flex flex-row">
              <img src="<%= message.user && message.user.avatar %>"
                alt="<%= message.user && message.user.email %>" class="avatar">
              <div class="message-wrapper">
                <p class="message-header">
                  <span class="username font-600">
                    <%= message.user && message.user.email %>
                  </span>
                  <span class="sent-date font-300"><%= new Date(message.createdAt).toString() %></span>
                </p>
                <p class="message-content font-300"><%= message.text %></p>
              </div>
            </div>
            <% }); %>
          </main>
        </div>
      </div>
    </main>
  </div>
</body>
</html>
```

If we now start the server (`npm start`) and go to [localhost:3030/login](http://localhost:3030/login) we can see the login page. We can use the login information from one of the users created in the [JavaScript chat frontend](../chat/frontend.md) and once successful, we will be redirected to `/chat` which shows the list of all current messages and users and clicking the `Sign out` button will log us out and redirect to the login page.

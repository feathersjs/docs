# Authentication

At some point, you are probably going to put information in your databases that you want to keep private. You'll need to implement an `authentication` scheme to identify your users, and `authorization` to control access to resources.  

Cookie-based and token-based authentication are the two most-common methods of putting server-side authentication into practice. Cookie-based authentication relies on server-side cookies to remember the user.  Token-based authentication requires an encrypted auth token with each request. While cookie-based authentication is the most common, token-based authentication offers several advantages for modern web apps. The Auth0 blog has a [great article on the advantages that token authentication offers](https://auth0.com/blog/2014/01/07/angularjs-authentication-with-cookies-vs-token/).

## The `feathers-authentication` plugin
The [feathers-authentication](https://github.com/feathersjs/feathers-authentication) plugin makes it easy to add token-based auth to your app. Choose a tutorial below to get started.

* [Setting Up Local Auth](local.md) (username and password)

### Usage
If you are using the default options, setting up JWT auth for your Feathers app is as simple as the below example.  Note: You must set up the `body-parser` module before setting up `feathers-authentication`.

```js
var app = feathers()
  .configure(feathers.rest())
  .configure(feathers.socketio())
  .configure(hooks())
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  // Provide a config object to the feathers-authentication plugin
  .configure(feathersAuth({
    secret: 'feathers-rocks'
  }));
```


### Options

The following options are available:

- __secret__ *required* - The secret used to create encrypted tokens.
- __userEndpoint__ - The api endpoint used to look up the user service. The default is `'/api/users`.
- __loginEndpoint__ - The url for posting the username and password during login. The default is `/api/login`.  You can also post a valid token here to receive a new one.  You might use this when the current auth token is about to expire to stay logged in on the client.
- __usernameField__ The database field containing the username on the user service.  The default is `username`.
- __passwordField__ The database field containing the password on the user service.  The default is `password`.
- __loginError__ - The message to return for invalid login.  Default is 'Invalid login.'
- __jwtOptions__ - Used to customize the configuration for the jsonwebtoken library.  [See the API](https://github.com/auth0/node-jsonwebtoken)
- __jwtOptions.expiresIn__ - The number of **seconds** until the token expires.  Default is 36000 (10 hours).
- __strategy__ - Allows you to pass a custom strategy to use for local auth.  The default strategy should fit most projects.
- __passport__ (default: `require('passport')`) - The passport module


## Other Authentication Solutions
Feathers is based on Express. It's likely that an auth plugin used for Express can also work for Feathers.

If you have an authentication solution that you would like listed here, please [submit a pull request](../contributing.md).

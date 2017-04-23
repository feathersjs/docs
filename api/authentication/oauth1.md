# OAuth1 Authentication

[![GitHub stars](https://img.shields.io/github/stars/feathersjs/feathers-authentication-oauth1.png?style=social&label=Star)](https://github.com/feathersjs/feathers-authentication-oauth1/)
[![npm version](https://img.shields.io/npm/v/feathers-authentication-oauth1.png?style=flat-square)](https://www.npmjs.com/package/feathers-authentication-oauth1)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.png?style=flat-square)](https://github.com/feathersjs/feathers-authentication-oauth1/blob/master/CHANGELOG.md)

```
$ npm install feathers-authentication-oauth1 --save
```


[feathers-authentication-oauth1](https://github.com/feathersjs/feathers-authentication-oauth1) is a server side module that allows you to use any [Passport](http://passportjs.org/) OAuth1 authentication strategy within your Feathers application, most notably [Twitter](https://github.com/jaredhanson/passport-twitter).

This module contains 2 core pieces:

1. The main initialization function
2. The `Verifier` class

## Configuration

In most cases initializing the module is as simple as doing this:

```js
const feathers = require('feathers');
const authentication = require('feathers-authentication');
const jwt = require('feathers-authentication-jwt');
const oauth1 = require('feathers-authentication-oauth1');
const session = require('express-session');
const TwitterStrategy = require('passport-twitter').Strategy;
const app = feathers();

// Setup in memory session
app.use(session({
  secret: 'super secret',
  resave: true,
  saveUninitialized: true
}));

// Setup authentication
app.configure(authentication(settings));
app.configure(jwt());
app.configure(oauth1({
  name: 'twitter',
  Strategy: TwitterStrategy,
  consumerKey: '<your consumer key>',
  consumerSecret: '<your consumer secret>'
}));

// Setup a hook to only allow valid JWTs to authenticate
// and get new JWT access tokens
app.service('authentication').hooks({
  before: {
    create: [
      authentication.hooks.authenticate(['jwt'])
    ]
  }
});
```

This will pull from your global authentication object in your config file. It will also mix in the following defaults, which can be customized.

Registering the OAuth1 plugin will automatically set up routes to handle the OAuth redirects and authorization.

### Default Options

```js
{
    idField: '<provider>Id', // The field to look up the entity by when logging in with the provider. Defaults to '<provider>Id' (ie. 'twitterId').
    path: '/auth/<provider>', // The route to register the middleware
    callbackURL: 'http(s)://hostame[:port]/auth/<provider>/callback', // The callback url. Will automatically take into account your host and port and whether you are in production based on your app environment to construct the url. (ie. in development http://localhost:3030/auth/twitter/callback)
    entity: 'user', // the entity that you are looking up
    service: 'users', // the service to look up the entity
    passReqToCallback: true, // whether the request object should be passed to `verify`
    session: true, // whether to use sessions,
    handler: function, // Express middleware for handling the oauth callback. Defaults to the built in middleware.
    formatter: function, // The response formatter. Defaults the the built in feathers-rest formatter, which returns JSON.
    Verifier: Verifier // A Verifier class. Defaults to the built-in one but can be a custom one. See below for details.
}
```

Additional passport strategy options can be provided based on the OAuth1 strategy you are configuring.

## Verifier

This is the verification class that handles the OAuth1 verification by looking up the entity (normally a `user`) on a given service and either creates or updates the entity and returns them. It has the following methods that can all be overridden. All methods return a promise except `verify`, which has the exact same signature as [passport-oauth1](https://github.com/jaredhanson/passport-oauth1).

```js
{
    constructor(app, options) // the class constructor
    _updateEntity(entity) // updates an existing entity
    _createEntity(entity) // creates an entity if they didn't exist already
    _normalizeResult(result) // normalizes result from service to account for pagination
    verify(req, accessToken, refreshToken, profile, done) // queries the service and calls the other internal functions.
}
```

### Customizing the Verifier

The `Verifier` class can be extended so that you customize it's behavior without having to rewrite and test a totally custom local Passport implementation. Although that is always an option if you don't want use this plugin.

An example of customizing the Verifier:

```js
import oauth1, { Verifier } from 'feathers-authentication-oauth1';

class CustomVerifier extends Verifier {
  // The verify function has the exact same inputs and 
  // return values as a vanilla passport strategy
  verify(req, accessToken, refreshToken, profile, done) {
    // do your custom stuff. You can call internal Verifier methods
    // and reference this.app and this.options. This method must be implemented.
      
    // the 'user' variable can be any truthy value
    // the 'payload' is the payload for the JWT access token that is generated after successful authentication
    done(null, user, payload);
  }
}

app.configure(oauth1({
  name: 'twitter'
  Strategy: TwitterStrategy,
  consumerKey: '<your consumer key>',
  consumerSecret: '<your consumer secret>',
  Verifier: CustomVerifier
}));
```

## Customizing The OAuth Response

Whenever you authenticate with an OAuth1 provider such as Twitter, the provider sends back an `accessToken`, `refreshToken`, and a `profile` that contains the authenticated entity's information based on the OAuth1 `scopes` you have requested and been granted.

By default the `Verifier` takes everything returned by the provider and attaches it to the `entity` (ie. the user object) under the provider name. You will likely want to customize the data that is returned. This can be done by adding a `before` hook to both the `update` and `create` service methods on your `entity`'s service.

```js
app.configure(oauth1({
  name: 'twitter',
  entity: 'user',
  service: 'users',
  Strategy,
  consumerKey: '<your consumer key>',
  consumerSecret: '<your consumer secret>'
}));

function customizeTwitterProfile() {
  return function(hook) {
    console.log('Customizing Twitter Profile');
    // If there is a twitter field they signed up or
    // signed in with twitter so let's pull the email. If
    if (hook.data.twitter) {
      hook.data.email = hook.data.twitter.email; 
    }

    // If you want to do something whenever any OAuth
    // provider authentication occurs you can do this.
    if (hook.params.oauth) {
      // do something for all OAuth providers
    }

    if (hook.params.oauth.provider === 'twitter') {
      // do something specific to the twitter provider
    }

    return Promise.resolve(hook);
  };
}


app.service('users').hooks({
  before: {
    create: [customizeTwitterProfile()],
    update: [customizeTwitterProfile()]
  }
});
```

## Client Usage

When this module is registered server side, whether you are using `feathers-authentication-client` or not you simply get the user to navigate to the authentication strategy url. This could be by setting `window.location` or through a link in your app.

For example you might have a login button for Twitter:

```html
<a href="/auth/twitter" class="button">Login With Twitter</a>
```

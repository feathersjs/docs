# OAuth2 Authentication

[![GitHub stars](https://img.shields.io/github/stars/feathersjs/authentication-oauth2.png?style=social&label=Star)](https://github.com/feathersjs/authentication-oauth2/)
[![npm version](https://img.shields.io/npm/v/@feathersjs/authentication-oauth2.png?style=flat-square)](https://www.npmjs.com/package/@feathersjs/authentication-oauth2)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.png?style=flat-square)](https://github.com/feathersjs/authentication-oauth2/blob/master/CHANGELOG.md)

```
$ npm install @feathersjs/authentication-oauth2 --save
```

[@feathersjs/authentication-oauth2](https://github.com/feathersjs/authentication-oauth2) is a server side module that allows you to use any [Passport](http://passportjs.org/) OAuth2 authentication strategy within your Feathers application. There are hundreds of them! Some commonly used ones are:

- [Facebook](https://github.com/jaredhanson/passport-facebook)
- [Instagram](https://github.com/jaredhanson/passport-instagram)
- [Github](https://github.com/jaredhanson/passport-github)
- [Google](https://github.com/jaredhanson/passport-google-oauth2)
- [Spotify](https://github.com/JMPerez/passport-spotify)

This module contains 2 core pieces:

1. The main initialization function
2. The `Verifier` class

## Configuration

In most cases initializing the module is as simple as doing this:

```js
const feathers = require('@feathersjs/feathers');
const authentication = require('@feathersjs/authentication');
const jwt = require('@feathersjs/authentication-jwt');
const oauth2 = require('@feathersjs/authentication-oauth2');
const FacebookStrategy = require('passport-facebook').Strategy;
const app = feathers();

// Setup authentication
app.configure(authentication({ secret: 'super secret' }));
app.configure(jwt());
app.configure(oauth2({
  name: 'facebook',
  Strategy: FacebookStrategy,
  clientID: '<your client id>',
  clientSecret: '<your client secret>',
  scope: ['public_profile', 'email']
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

Registering the OAuth2 plugin will automatically set up routes to handle the OAuth redirects and authorization.

## Options

```js
{
    idField: '<provider>Id', // The field to look up the entity by when logging in with the provider. Defaults to '<provider>Id' (ie. 'facebookId').
    path: '/auth/<provider>', // The route to register the middleware
    callbackURL: 'http(s)://hostname[:port]/auth/<provider>/callback', // The callback url. Will automatically take into account your host and port and whether you are in production based on your app environment to construct the url. (ie. in development http://localhost:3030/auth/facebook/callback)
    successRedirect: undefined,
    failureRedirect: undefined,
    entity: 'user', // the entity that you are looking up
    service: 'users', // the service to look up the entity
    passReqToCallback: true, // whether the request object should be passed to `verify`
    session: false, // whether to use sessions,
    handler: function, // Express middleware for handling the oauth callback. Defaults to the built in middleware.
    formatter: function, // The response formatter. Defaults the the built in feathers-rest formatter, which returns JSON.
    Verifier: Verifier // A Verifier class. Defaults to the built-in one but can be a custom one. See below for details.
}
```

Additional passport strategy options can be provided based on the OAuth1 strategy you are configuring.

## Verifier

This is the verification class that handles the OAuth2 verification by looking up the entity (normally a `user`) on a given service and either creates or updates the entity and returns them. It has the following methods that can all be overridden. All methods return a promise except `verify`, which has the exact same signature as [passport-oauth2](https://github.com/jaredhanson/passport-oauth2).

```js
{
    constructor(app, options) // the class constructor
    _updateEntity(entity) // updates an existing entity
    _createEntity(entity) // creates an entity if they didn't exist already
    _normalizeResult(result) // normalizes result from service to account for pagination
    verify(req, accessToken, refreshToken, profile, done) // queries the service and calls the other internal functions.
}
```

The `Verifier` class can be extended so that you customize it's behavior without having to rewrite and test a totally custom local Passport implementation. Although that is always an option if you don't want use this plugin.

An example of customizing the Verifier:

```js
import oauth2, { Verifier } from '@feathersjs/authentication-oauth2';

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

app.configure(oauth2({
  name: 'facebook',
  Strategy: FacebookStrategy,
  clientID: '<your client id>',
  clientSecret: '<your client secret>',
  scope: ['public_profile', 'email'],
  Verifier: CustomVerifier
}));
```

## Customizing The OAuth Response

Whenever you authenticate with an OAuth2 provider such as Facebook, the provider sends back an `accessToken`, `refreshToken`, and a `profile` that contains the authenticated entity's information based on the OAuth2 `scopes` you have requested and been granted.

By default the `Verifier` takes everything returned by the provider and attaches it to the `entity` (ie. the user object) under the provider name. You will likely want to customize the data that is returned. This can be done by adding a `before` hook to both the `update` and `create` service methods on your `entity`'s service.

```js
app.configure(oauth2({
  name: 'github',
  entity: 'user',
  service: 'users',
  Strategy,
  clientID: 'your client id',
  clientSecret: 'your client secret'
}));

function customizeGithubProfile() {
  return function(context) {
    console.log('Customizing Github Profile');
    // If there is a github field they signed up or
    // signed in with github so let's pull the primary account email.
    if (context.data.github) {
      context.data.email = context.data.github.profile.emails.find(email => email.primary).value;
    }

    // If you want to do something whenever any OAuth
    // provider authentication occurs you can do this.
    if (context.params.oauth) {
      // do something for all OAuth providers
    }

    if (context.params.oauth.provider === 'github') {
      // do something specific to the github provider
    }

    return Promise.resolve(context);
  };
}


app.service('users').hooks({
  before: {
    create: [customizeGithubProfile()],
    update: [customizeGithubProfile()]
  }
});
```

## Client Usage

When this module is registered server side, whether you are using `feathers-authentication-client` or not the user has to navigate to the authentication strategy url. This could be by setting `window.location` or through a link in your app.

For example you might have a login button for Facebook:

```html
<a href="/auth/facebook" class="button">Login With Facebook</a>
```

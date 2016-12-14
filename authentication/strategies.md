# Official Passport Strategies

As of version `1.0.0`, the `feathers-authentication` plugin is built on top of [PassportJS](http://passportjs.org/).  This allows us to take advantage of the [300+ authentication strategies](http://passportjs.org/) that Passport has to offer.  It's also possible to create your own.  We've created several official Feathers strategies that will work for most applications.

## Authentication Plugins

 - [feathers-authentication-local](./local.md) for email/password type authentication.
 - [feathers-authentication-jwt](./jwt.md) for authentication with a JSON Web Token.
 - [feathers-authentication-oauth1](./oauth1.md) for OAuth 1.0-compatible providers like Twitter and others.
 - [feathers-authentication-oauth2](./oauth2.md) for OAuth 2.0-compatible providers like Facebook and many more.

 The above modules help with authentication, but not authorization.  
 
 ## Handling Authorization / Permissions

 We have also released a new plugin for handling authorization / permissions in your apps:

 - [feathers-permissions](./permissions.md)
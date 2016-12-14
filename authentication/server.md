# Server Plugins for Authentication

## Official Feathers Strategies for Passport

As of version `1.0.0`, the `feathers-authentication` plugin is built on top of [PassportJS](http://passportjs.org/).  Since it's Passport based, we can take advantage of the [300+ authentication strategies](http://passportjs.org/) that Passport has to offer.  We've created several official Feathers strategies that will work for most applications.

 - [feathers-authentication](./feathers-authentication.md) is the main entry for all auth-related activity.  It adds JSON Web Token (JWT)-based authorization to your app.
 - [feathers-authentication-local](./local.md) strategy for adding email/password type authentication.
 - [feathers-authentication-jwt](./jwt.md) strategy for adding authentication with a JSON Web Token.
 - [feathers-authentication-oauth1](./oauth1.md) strategy for adding OAuth 1.0-compatible providers like Twitter and others.
 - [feathers-authentication-oauth2](./oauth2.md) strategy for adding OAuth 2.0-compatible providers like Facebook and many more.

 The above modules help with authentication, but not authorization.  
 
## Handling Authorization / Permissions

We have also released a new plugin for handling authorization / permissions in your apps:

 - [feathers-permissions](./permissions.md)

## Additional Plugins

- The [feathers-authentication-management](./management.md) plugin provides a utility suite for changing passwords and handling other account-related data.

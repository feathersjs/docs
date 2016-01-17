# Setting Up Authentication

At some point, you are probably going to put information in your databases that you want to keep private. You'll need to implement `authentication` to verify the identity of your users, and `authorization` to control access to resources.  

Cookie-based and token-based authentication are the two most-common methods of putting server-side authentication into practice. Cookie-based authentication relies on server-side cookies to remember the user.  Token-based authentication requires an encrypted auth token with each request. While cookie-based authentication is the most common, token-based authentication offers several advantages for modern web apps. The Auth0 blog has a [great article on the advantages that token authentication offers](https://auth0.com/blog/2014/01/07/angularjs-authentication-with-cookies-vs-token/).

## The `feathers-authentication` plugin
The [feathers-authentication](https://github.com/feathersjs/feathers-authentication) plugin makes it easy to add token-based auth to your app. Choose a tutorial below to get started.

* [Setting Up Local Auth](08.1_local-auth.md) (username and password)


## Other Auth Plugins
Feathers is based on Express. It's likely that an auth plugin used for Express can also work for Feathers.
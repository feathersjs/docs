# Authentication & Permissions

At some point, you are probably going to put information in your databases that you want to keep private. You'll need to implement an _authentication_ scheme to identify your users, and _permissions_ to control access to resources.  This section will cover plugins that help with both areas.

Cookie-based and token-based authentication are the two most common methods of putting server side authentication into practice. Cookie-based authentication relies on server side cookies to remember the user. Token based authentication requires an encrypted auth token with each request. While cookie based authentication is the most common, token based authentication offers several advantages for modern web apps. Feathers uses JWT for two primary advantages: security and scalability.

The Auth0 blog has a [great article on the advantages that token authentication offers](https://auth0.com/blog/2014/01/07/angularjs-authentication-with-cookies-vs-token/).

## The Feathers Auth Ecosystem

The feathers-authentication ecosystem includes both server- and client-side plugins.

 - [Learn about Setting up the Server for Authentication & Permissions](./server.md)
 - [Learn about Authenticating Clients](./client/README.md)
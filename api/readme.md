# API

This section describes all the APIs of Feathers and its individual modules.

* __Core:__ Feathers core functionality
  * [Application](api/application.md) - The main Feathers application API
  * [Services](api/services.md) - Service objects and their methods and Feathers specific functionality
  * [Hooks](api/hooks.md) - Pluggable middleware for service  methods
  * [Events](api/events.md) - Events sent by Feathers service methods
  * [Channels](api/channels.md) - Decide what events to send to connected real-time clients
  * [Errors](api/errors.md) - A collection of error classes used throughout Feathers
  * [Configuration](api/configuration.md) - A node-config wrapper to initialize configuraiton of a server side application.
* __Transports:__ Expose a Feathers application as an API server
  * [Express](api/express.md) - Feathers Express framework bindings, REST API provider and error middleware.
  * [Socket.io](api/socketio.md) - The Socket.io real-time transport provider
  * [Primus](api/primus.md) - The Primus real-time transport provider
* __Client:__ More details on how to use Feathers on the client
  * [Usage](api/client.md) - Feathers client usage in Node, React Native and the browser (also with Webpack and Browserify)
  * [REST](api/client/rest.md) - Feathers client and direct REST API server usage
  * [Socket.io](api/client/socketio.md) - Feathers client and direct Socket.io API server usage
  * [Primus](api/client/primus.md) - Feathers client and direct Primus API server usage
* __Authentication:__ Feathers authentication mechanism
  * [Server](api/authentication/server.md) - The main authentication server configuration
  * [Client](api/authentication/client.md) - A client for a Feathers authentication server
  * [Local](api/authentication/local.md) - Local email/password authentication
  * [JWT](api/authentication/jwt.md) - JWT authentication
  * [OAuth1](api/authentication/oauth1.md) - Obtain a JWT through oAuth1
  * [OAuth2](api/authentication/oauth2.md) - Obtain a JWT through oAuth2
* __Database:__ Feathers common database adapter API and querying mechanism
  * [Adapters](api/databases/adapters.md) - A list of supported database adapters
  * [Common API](api/databases/common.md) - Database adapter common initialization and configuration API
  * [Querying](api/databases/querying.md)) - The common querying mechanism

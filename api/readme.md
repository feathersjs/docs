# API

This section describes all the APIs of Feathers and its individual modules.

* __Core:__ Feathers core functionality
  * [Application](application.md) - The main Feathers application API
  * [Services](services.md) - Service objects and their methods and Feathers specific functionality
  * [Hooks](hooks.md) - Pluggable middleware for service  methods
  * [Events](events.md) - Events sent by Feathers service methods
  * [Errors](errors.md) - A collection of error classes used throughout Feathers
  * [Configuration](configuration.md) - A node-config wrapper to initialize configuration of a server side application.
* __Transports:__ Expose a Feathers application as an API server
  * [Express](express.md) - Feathers Express framework bindings, REST API provider and error middleware.
  * [Socket.io](socketio.md) - The Socket.io real-time transport provider
  * [Primus](primus.md) - The Primus real-time transport provider
  * [Channels](channels.md) - Decide what events to send to connected real-time clients
* __Client:__ More details on how to use Feathers on the client
  * [Usage](client.md) - Feathers client usage in Node, React Native and the browser (also with Webpack and Browserify)
  * [REST](client/rest.md) - Feathers client and direct REST API server usage
  * [Socket.io](client/socketio.md) - Feathers client and direct Socket.io API server usage
  * [Primus](client/primus.md) - Feathers client and direct Primus API server usage
* __Authentication:__ Feathers authentication mechanism
  * [Service](authentication/service.md) - The main authentication service configuration
  * [Strategies](authentication/strategy.md) - More about authentication strategies
  * [Local](authentication/local.md) - Local email/password authentication
  * [JWT](authentication/jwt.md) - JWT authentication
  * [OAuth](authentication/oauth.md) - Using oAuth logins (Facebook, Twitter etc.)
  * [Client](authentication/client.md) - A client for a Feathers authentication server
* __Database:__ Feathers common database adapter API and querying mechanism
  * [Adapters](databases/adapters.md) - A list of supported database adapters
  * [Common API](databases/common.md) - Database adapter common initialization and configuration API
  * [Querying](databases/querying.md) - The common querying mechanism

# Feathers basics

This guide will go over the basics and core concepts of any Feathers application. 

## Preliminaries

To go through this guide you will need version 8 or later of [NodeJS](https://nodejs.org/en/) installed and
your text editor of choice. On MacOS and other Unix systems the [Node Version Manager](https://github.com/creationix/nvm) is a good way to quickly retrieve the latest version of NodeJS.

Readers should have reasonable JavaScript experience, some experience with Node, the concept of HTTP REST, and an idea of what WebSockets are. Having some experience with ExpressJS is an asset.

This guide should be a comfortable introduction to Feathers for people learning new technologies, such as those coming from PHP, Ruby, or Meteor.

- Node
- Modern browser
- Knowledge of Promises and/or async/await
- Express

## Services

[Services](../../api/services.md) are the heart of Feathers, as this is what all clients will interact with.
They are middlemen and can be used to perform operations of any kind.
- interact with a database
- interact with a microservice/API
- interact with the filesystem
- interact with other resources
    - send an email,
    - process a payment,
    - return the current weather for a location, etc.
        
## Hooks
        
[Hooks](../../api/hooks.md) are functions that run automatically before or after a service is called upon.
They can be service gatekeepers and make sure that all operations are allowed and have the required information.
They can also make sure that only data that should be returned to a client is returned.
- before hooks: validate/cleanse/check permissions.
- after hooks: add additional data or remove unneeded data before it's sent to the client.

## Events

[Events](../../api/events.md) are sent to clients (or other servers if the feathers-sync package is used)
when a service method completes.
The `created`, `updated`, `patched`, and `removed` events provide real-time functionality
    
[Event Filtering](../../api/events.md#event-filtering) determines which users should receive an event.
This is the Feathers alternative to Socket.io's rooms
and it's an extremely intelligent approach that enables reactive applications to scale well.

## Authentication

Feathers provides
[local](../../api/authentication/local.md),
[JSON Web Token](../../api/authentication/jwt.md),
[OAuth1](../../api/authentication/oauth1.md)
and [OAuth2](../../api/authentication/oauth2.md) authentication
(using [PassportJS](https://github.com/jaredhanson/passport))
over [REST](https://en.wikipedia.org/wiki/Representational_state_transfer)
and [WebSockets](https://en.wikipedia.org/wiki/websocket).

## Providers

Choose which providers to use in your application.
- [REST](https://en.wikipedia.org/wiki/Representational_state_transfer)
- [Socket.io](https://socket.io/)
- [Primus](https://github.com/primus/primus)
(supporting
[engine.io](https://github.com/socketio/engine.io),
[uWebSockets a.k.a. uws](https://github.com/uWebSockets/uWebSockets),
[SockJS](https://github.com/sockjs/sockjs-node),
[Faye](https://faye.jcoglan.com/))
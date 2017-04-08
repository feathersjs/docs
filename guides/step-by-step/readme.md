# Step by Step Intro to Basic Feathers

Feathers is a REST and realtime API layer for modern applications.

"[FeathersJS'] signature feature [is] that it’s super lightweight.
It contains a simple and logical workflow that streamlines building apis
and can make an api that would have taken hours and builds it in minutes.
It hits the perfect balance of magic and control
where you still have full control over how your api behaves
but the tools provided make your life so much easier." --
[Medium](https://medium.com/@codingfriend/feathersjs-a-framework-that-will-spoil-you-109525dfd35e#.8kf707x3k)

> Warning: Feathers is addictive.

Feathers has several core features.

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
- before hooks: validate/cleanse/check permissions
- after hooks: remove data before it's sent to the client

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
and [WebSockets](https://en.wikipedia.org/wiki/WebSocket).

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
    
## Middleware
  
[Express middleware](https://expressjs.com/en/guide/using-middleware.html)
handles the extra fluff that isn't exactly necessary,
but can be nice for optimization/logging.
- before service methods: compression, CORS, etc.
- after service methods: logs, error handlers, etc.
    
## This guide's purpose

This guide covers
- Services used with a database.
- Hooks.
- Events.
- Providers.

It does not assume any prior knowledge of Feathers.

By the time you finish this guide, you will
- have a solid understanding of Feathers basics
- understand how Feathers permits your code to be database agnostic.
- understand how a Feathers server simultaneously and transparently supports a HTTP REST API,
Feathers REST clients, and Feathers WebSocket clients.
- understand that you can access your database from the client
as if that client code was running on the server.
- understand that the Feathers generators will structure your application for you,
and you will understand what boilerplate they produce.

By the time you finish this guide, you will be ready to write your first, small app.

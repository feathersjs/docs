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

#### Services

Services are the heart of Feathers, as this is what all clients will interact with.
They are middlemen and can be used to perform operations of any kind.
- interact with a database
- interact with a microservice/API
- interact with the filesystem
- interact with other resources
    - send an email,
    - process a payment,
    - return the current weather for a location, etc.
        
#### Hooks
        
Hooks ran automatically before or after a service is called upon.
They are gatekeepers and make sure that all operations and calls to services are
allowed and have the required information.
They also make sure that only data that should be returned to a client is returned.
- before hooks: validate/cleanse/check permissions
- after hooks: remove data before it's sent to the client

#### Events

Events are sent to clients (or other servers if the feathers-sync package is used)
when a service method completes.
The `created`, `updated`, `patched`, and `removed` events provide real-time functionality
    
Events Filters determine which user should receive an event.
This is the Feathers alternative to socket.io's rooms
and it's an extremely intelligent approach that enables reactive applications to scale well.

#### Authentication

Feathers provides local, token, and OAuth authentication with PassportJS
over REST and Websockets using JSON Web Tokens (JWT).

#### Providers

Choose which providers to use in your application.
- REST
- Socket.io
- Primus ( using Engine.IO, Faye, SockJS, uws, or Websockets)
    
#### Middleware
  
Middleware handles the extra fluff that isn't exactly necessary,
but can be nice for optimization/logging.
- before service methods: compression, CORS, etc.
- after service methods: logs, error handlers, etc.
    
### This guide's purpose

This guide covers
- Services used with a database.
- Hooks.
- Events.
- Providers.

It does not assume any prior knowledge of Feathers.

You will have a solid understanding of basic Feathers by the time you finish this guide.
You will understand how Feathers permits your code to be database agnostic,
how a Feathers server simultaneously and transparently supports a HTTP REST API,
Feathers REST clients, and Feathers websocket clients.

You will understand you can access your database from the client
as if that client code was running on the server.

You will understand that the Feathers generators will structure your application for you,
and you will understand what boilerplate they produce.

By the time you finish this guide, you will be ready to write a first, small app.

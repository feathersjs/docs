# Feathers on the client

Feathers works great with any client that can connect through HTTP/HTTPS to a REST API or websockets. Sometimes it is just a few lines of code to make an existing front-end turn real-time. 

Even better, Feathers itself can be used as a universal (isomorphic) client. That means that you can transparently connect to remote services and register your own services and hooks in the browser with any frontend framework like React, Angular, CanJS or Ember or non-browser JavaScript environments like React Native and other NodeJS servers.

In this chapter we will talk about how to use the [universal Feathers client](feathers.md) and how to talk to the [REST HTTP](rest.md) and websocket ([Socket.io](socket-io.md) and [Primus](primus.md)) APIs directly.

Because it is easy to integrate, Feathers does not have any official framework specific bindings. To give a better idea on how the Feathers client plays with other frameworks here are some [TodoMVC](http://todomvc.com/) examples that all connect to the same Feathers real-time API ([todos.feathersjs.com](http://todos.feathersjs.com)):

- [jQuery](http://feathersjs.github.io/todomvc/feathers/jquery/)
- [React](http://feathersjs.github.io/todomvc/feathers/react/)
- [Angular](http://feathersjs.github.io/todomvc/feathers/angularjs/)
- [CanJS](http://feathersjs.github.io/todomvc/feathers/canjs/)

You may also find more details on integrating the Feathers client [in the guides section](../guides/readme.md). If you are having any trouble with your framework of choice, [create an issue](https://github.com/feathersjs/feathers/issues/new) and we'll try our best to help out.

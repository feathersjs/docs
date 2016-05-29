![Feathers Providers](/img/header-providers.jpg)

# Providers

Providers are plugins that handle data transfer.  They are the communication layer on top of which services operate.  There are currently three providers available:

 * [feathers-rest](/rest/readme.md) - enables standard HTTP communication.
 * [feathers-socketio](/real-time/socket-io.md) - enables real-time websocket communication using the Engine.io framework.
 * [feathers-primus](/real-time/primus.md) - enables real-time websocket communication over eight possible frameworks.

## Using providers together
The feathers-rest plugin does not include any real-time websocket functionality on its own.  However, when you have one or more real-time providers enabled, all service events will be broadcast over them, by default.  Read the section on [real-time events](/real-time/events.md) to learn how they work.  

Here are some examples of the default behavior that you could expect with various providers enabled:

 * `feathers-rest` by itself - No real-time events will be available (they require websockets).
 * `feathers-socketio` by itself - Real-time events will be sent to all connected clients.
 * `feathers-rest` with `feathers-socketio` - Real-time events will be sent to all connected clients over the `feathers-socketio` provider, even if the original action was taken over the `feathers-rest` provider.
 * `feathers-rest` with `feathers-socketio` and `feathers-primus` - Real-time events will be sent to all connected clients over both real-time providers.
 
Sending events across all connected providers by default has its advantages.  Let's suppose that you have a situation where you want to use `feathers-socketio` to enable realtime for your main web application, but you decide that one of the other frameworks supported by `feathers-primus` works better in your React Native mobile application.  Then you also decide that you want to enable Github and other services to communicate with your API using HTTP webhooks, so you enable the `feathers-rest` provider.  With all providers enabled, when a GitHub webhook sends a POST request to one of your services, that new data will propagate to the main web application across `feathers-socketio` and to the mobile app via `feathers-primus`.

> Pro Tip: The default behavior of sending events across all providers can be modified using [event filters](/real-time/filtering.md).

## Creating your own provider

Because everything in the Feathers ecosystem is a plugin, you can create your own providers.  For example, if you find that your application absolutely needs to use UDP, you could create a `feathers-udp` provider plugin modeled after the other providers.  If you do create your own provider, please talk to us about adding mention of it here.  Also, There is not currently a tutorial for creating an adapter, but pull requests are welcome! 😉

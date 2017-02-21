![Feathers Real-time Providers](/img/header-realtime.jpg)

In Feathers, realtime means that [services](../services/readme.md) automatically send `created`, `updated`, `patched` and `removed` events when a `create`, `update`, `patch` or `remove` [service method](../services/readme.md) is complete. Clients can listen for these events and then react accordingly.

![Feathers Realtime](/img/real-time-events-flow.jpg)

With Feathers websockets aren't just used for sending events from server to client. It is also possible to call service methods and send data over sockets, either from server-to-server or client-to-server. This is often much faster than going through the [REST](../rest/readme.md) API and results in a snappier app.

Currently Feathers supports two websocket transport libraries:

- [Socket.io](socket-io.md) - Probably the most commonly used real-time library for NodeJS. It works on every platform, browser or device, focusing equally on reliability and speed.
- [Primus](primus.md) - Is a universal wrapper for real-time frameworks that supports BrowserChannel, Engine.IO, Faye, SockJS, uws and WebSockets.

In this chapter we will look at how to use [Service events](events.md), how to configure the [Socket.io](socket-io.md) and [Primus](primus.md) real-time libraries and about how to [restrict sending events to specific clients](filtering.md).

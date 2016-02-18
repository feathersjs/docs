# Real-time

In Feathers, real-time means that [services](services.md) automatically send `created`, `updated`, `patched` and `removed` events when a `create`, `update`, `patch` or `remove` [service method](../services/readme.md) is complete. Clients can subscribe to those events via websockets through [Socket.io](socket-io.md) or [Primus](primus.md) and update themselves accordingly.

> **ProTip:** Events are not fired until all of your _after_ hooks have executed.

Another great thing about Feathers is that websockets aren't just used for sending events. It is also possible to call service methods and send data over sockets. This is often much faster than going through the [REST](../rest/readme.md) API and results in a snappier app.

In this chapter we will look at how to use [Service events](events.md), how to configure the [Socket.io](socket-io.md) and [Primus](primus.md) real-time libraries and about how to [only send events to specific clients](filtering.md).

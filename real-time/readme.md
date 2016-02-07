# Real-time

In Feathers, real-time means that [services](services.md) automatically send `created`, `updated`, `patched` and `removed` events when a `create`, `update`, `patch` or `remove` [service method](../services/readme.md) returns. Clients can subscribe to those events via websockets through [Socket.io](socket-io.md) or [Primus](primus.md) and update themselves accordingly.

Another great thing about Feathers is that websockets aren't just used for those events. It is also possible to call service methods that way which is often much faster than going through the [REST](rest.md) API.

# Connecting to a Feathers Server

Now that we went over how to set up [REST](../rest/readme.md) and [real-time](../real-time/readme.md) APIs on the server we can look at how you can interact with a Feathers server from various clients. 

## Feathers as the client

Feathers itself can be used as a universal (isomorphic) client. That means that you can easily connect to remote services and register your own client side services and hooks. The Feathers client works in the browser with any front-end framework or in non-browser JavaScript environments like React Native and other NodeJS servers.

In the [Feathers client chapter](feathers.md) we will talk about how to use Feathers as a client in different environments and get it to connect to a Feathers server via [REST](rest.md), [Socket.io](socket-io.md) and [Primus](primus.md).

## Direct communication

Feathers as the client is not required to use a Feathers API. A Feathers server works great with any client that can connect through HTTP(S) to a REST API or - to also get real-time events - websockets. In the chapter for [direct communication](vanilla.md) we will look at how to directly communicate with a Feathers API via [REST](vanilla-rest.md), [Socket.io](vanilla-socket-io.md) and [Primus](primus.md).

## Framework support

Because it is easy to integrate, Feathers does not currently have any official framework specific bindings. Work on [iOS](https://github.com/feathersjs/feathers-ios) and [Android](https://github.com/feathersjs/feathers-android) SDKs are in progress.

To give you a better idea of how the Feathers client plays with other frameworks we've written some guides:

- [jQuery](../guides/jquery.md)
- [React](../guides/react.md)

We are adding new [guides](../guides/readme.md) for new frameworks all the time! If you are having any trouble with your framework of choice, [create an issue](https://github.com/feathersjs/feathers/issues/new) and we'll try our best to help out.

### Caveats

One important thing to know about Feathers is that it only exposes the official [service methods](../services/readme.md) to clients. While you can add and use any service method on the server, it is __not__ possible to expose those custom methods to clients.

In the [Why Feathers](../why/readme.md) chapter we discussed how the _uniform interface_ of services naturally translates into a REST API and also makes it easy to hook into the execution of known methods and emit events when they return. Adding support for custom methods would add a new level of complexity defining how to describe, expose and secure custom methods. This does not go well with Feathers approach of adding services as a small and well defined concept.

In general, almost anything that may require custom methods can also be done by creating other services. For example, a `userService.resetPassword` method can also be implemented as a password service that resets the password in the `create`:

```js
class PasswordService {
  create(data) {
    const userId = data.user_id;
    const userService = this.app.service('user');
    
    userService.resetPassword(userId).then(user => {
      // Send an email with the new password
      return sendEmail(user);
    })
  }
  
  setup(app) {
    this.app = app;
  }
}
```

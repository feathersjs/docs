# What is Feathers?

Feathers is a minimalist, service-oriented, real-time web framework for modern applications that puts real-time communication at the forefront rather than as an afterthought. What do we mean by that?

## Minimalist

Built on top of [Express](http://expressjs.com/), Feathers has embodied the same spirit. It is compromised of a bunch of small modules that are all completely optional and the core weighs in at just a few hundred lines of code. How's that for light weight?! Now you can see where Feathers got it's name. 😉

## Service oriented

[Services](../services/readme.md) are the heart of every Feathers application. They are small, data-oriented objects that can be used to perform [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) operations on a resource. A resource could be stored in a database, on another server or somewhere entirely different.

## Modern Applications

There is a lot to think about when building a modern application speed, maintainability, flexibility, accessibility, scalability, the list goes on.

We've tried to ease that pain by wrapping industry best practices into a _"Batteries included but easily swappable"_ package.

Out of the box Feathers provides a lot of [what you need](../why/readme.md) to build a modern web app or API. All of this is completely optional so you can pick and choose what you want to include and what you don't.

## Real-time At The Core

Most real-time frameworks only allow clients to be pushed data in real time. You interact with your server over REST and then receive events over websockets or, even worse, the client polls for changes.

Feathers is different. Feathers allows you to send **and** receive data over websockets, bringing real-time to the forefront and making your apps incredibly snappy.

All of the Feathers ecosystem has been modeled around supporting real-time communication and making it a first class citizen instead of a hacky add on. You can even forgo REST altogether and simply use websockets to communicate with your app, making it ideal for real-time IoT devices, among other things.

Ready to get started? Choose your own adventure:

- Quickly [scaffold a real-time Feathers API](./quick-start.md)
- [Build your first Feathers app](readme.md), or
- Dive a bit deeper into [what Feathers is all about](../why/readme.md)

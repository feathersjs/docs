# Introduction

## What is Feathers?

Feathers is a service-oriented framework for modern applications that makes websockets a first class citizen. What do we mean by that?

### Service oriented

[Services](../services) are the heart of every Feathers application. They are small, data-oriented objects that can be used to perform [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) operations on a resource. A resource could be stored in a database, on another server or somewhere entirely different.

### Modern Applications

There is a lot to think about when building a modern application; maintainability, flexibility, speed, accessibility, scalability, the list goes on.

We've tried to ease that pain by wrapping industry best practices into a _"Batteries included but easily swappable"_ package.

Out of the box Feathers provides a lot of what you need to build a modern app. All of this is completely optional so you can pick and choose what you want to include and what you don't.

- **Instant REST APIs** - Feathers automatically provides REST APIs for all your services. This industry best practice makes it easy for mobile applications, a web front-end and other developers to communicate with your application.
- **Unparalleled Database Support** - With Feathers service adapters you can connect to all of the most popular databases, and query them with a unified interface no matter which one you use. You can even use entirely different dbs in the same app.
- **Real-Time** - Feathers services can notify clients when something has been created, updated or removed. To get even better performance, you can communicate with your services through websockets, by sending and receiving data directly.
- **Cross-Cutting Concerns** - Using "hooks" you have an extremely flexible way to share common functionality or [concerns](https://en.wikipedia.org/wiki/Cross-cutting_concern). Keeping with the Unix philosophy, these hooks are small functions that do one thing and are easily tested but can be chained to create complex processes.
- **Universal usage** - Services and hooks are a powerful and flexible way to build full stack applications. In addition to the server, these constructs also work incredibly well on the client. That's why Feathers works the same in NodeJS, the browser and React Native.
- **Authentication** - Almost every app needs authentication so Feathers comes with the industry leading [JWT](https://jwt.io/) support out of the box.
- **API Versioning** - As an application matures the API typically evolves to accommodate business needs or technology changes. With Feathers it's easy to version your API by spinning up an entirely new service or app.
- **Pagination** - Today's applications are very data rich so most of the time you cannot load all the data for a resource all at once. Therefore, Feathers gives you pagination for every service from the start.
- **Rate Limiting** - When an app goes to production you'll need to have some protection against denial of service attacks. With Feathers it's easy to add rate limiting at a service level.
- **Error Handling** - Feathers removes the pain of defining errors and handling them. Feathers services automatically return appropriate errors, including validation errors, and return them to the client in a easily consumable format.
- **Logging** - Feathers comes with a very simplistic logger that has sane defaults for production. However, it is easily swappable to allow you to customize to your needs.

### First Class Websockets
Most real-time frameworks only emit messages over websockets. You interact with your server over REST and then receive events over websockets. Feathers allows you to **send** and **receive** data over websockets, so you could even remove REST altogether and simply use websockets to communicate with your app.

## Built on the Shoulders of Giants
Because we utilize some already proven modules, we spend less time re-inventing the wheel, are able to move incredibly fast, and have small well-tested, stable modules.

Here's how we use some of the tech under the hood:

- Feathers extends [Express 4](http://expressjs.com), the most popular web framework for [NodeJS](http://nodejs.org/).
- Our CLI tool extends [Yeoman](http://yeoman.io/)
- We wrap [Socket.io](http://socket.io/) or [Primus](https://github.com/primus/primus) as your websocket transport.
- Our service adapters typically wrap mature ORMs like [mongoose](mongoosejs.com), [sequelize](http://docs.sequelizejs.com/), [knex](http://knexjs.org/), or [waterline](https://github.com/balderdashy/waterline).
- [npm](http://npmjs.org) for package management.

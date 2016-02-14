# Introduction

## What is Feathers?

Feathers is a service-oriented web framework for modern applications that makes websockets a first class citizen. What do we mean by that?

### Service oriented

[Services](../services) are the heart of every Feathers application. They are small, data-oriented objects that can be used to perform [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) operations on a resource. A resource could be stored in a database, on another server or somewhere entirely different.

### Modern Applications

There is a lot to think about when building a modern application; maintainability, flexibility, speed, accessibility, scalability, the list goes on.

We've tried to ease that pain by wrapping industry best practices into a _"Batteries included but easily swappable"_ package.

Out of the box Feathers provides a lot of [what you need](../why/) to build a modern web app or API. All of this is completely optional so you can pick and choose what you want to include and what you don't.

### First Class Websockets

Most real-time frameworks only allow clients to be pushed data in real time. You interact with your server over REST and then receive events over websockets.

Feathers is different. Feathers allows you to **send** and **receive** data over websockets bringing real-time to the forefront and making your apps incredibly snappy. You can even forgo REST altogether and simply use websockets to communicate with your app.

Interested in learning more? Quickly [create a real-time Feathers API](./quick-start.md) or dive a bit deeper into [what Feathers is all about](../why/).

## Feathers vs. Express + Socket.io

Express is a minimalist web application framework for NodeJS. It was originally inspired by Sinatra and currently does much of the heavy lifting behind Feathers; routing, content-negotiation, middleware support, etc. You can actually just replace Express with Feathers in any existing application and start adding new Feathers services and hooks. All the same middleware that works with Express works with Feathers.

Because Express is so minimalist you still have to write a lot of code yourself to get things like RESTful routes mapped to a database resource, validation, authentication, authorization, rate limiting, logging, hooking up websockets for real-time support, etc.

Feathers eliminates all of that common boilerplate. It provides [Services](../../services/) that give you CRUD methods for the most common [databases](../../databases/), instant REST APIs and real-time compatibility. It sets up all the real-time events for you and sends messages when CRUD actions are performed. There are also core plugins that provide things like authentication services and [hooks](../../hooks/) that make things like authorization just a few lines of code.

In addition to the server, Feathers also can be used in the browser and React Native.

You can think of Express as an abstraction over top of core low level NodeJS functionality that makes it easier to build web applications. Feathers is another thin abstraction over top of Express that brings together engineering patterns from [Aspect Oriented Programming](https://en.wikipedia.org/wiki/Aspect-oriented_programming) and [Service Oriented Architecture](https://en.wikipedia.org/wiki/Service-oriented_architecture) along with some of the most popular Express middleware to make building web and mobile apps even faster and easier.
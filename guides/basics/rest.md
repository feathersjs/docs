# REST APIs

In the previous chapter we created a Feathers application and messages service that works in NodeJS and the browser. We saw how Feathers automatically sends events but so far we didn't really create a web API that other people can use.

This is where Feathers transports come in. A transport is a plugin that turns a Feathers application into a server that exposes our services through different protocols for other clients to use. Since a transport involves running a server it won't work in the browser but we wil learn later that there are complementary plugins for connecting to a Feathers server in a browser Feathers application.

Currently Feathers officially has three transports:

- [HTTP REST() for exposing services through a JSON REST API
- [Socket.io]() for connecting to services through websockets and also receiving real-time service events
- [Primus]() an alternative to Socket.io supporting several websocket protocols

HTTP is probably the most common protocol for web APIs. You e.g. make a request like `GET /messages/1` and get a JSON response like `{ "id": 1, "text": "The first message" }`. In this chapter we will look at the HTTP REST transport and Feathers Express framework integration.

## Express integration

[Express](http://expressjs.com/) is probably the most popular Node framework for creating web applications and APIs. The [Feathers Express integration](../../api/express.md) allows us to turn a Feathers application into an application that is both, a Feathers application and a fully compatible Express application. This means you can use Feathers functionality like services but also any existing Express middleware. As mentioned before, the Express framework integration only works on the server.

To add the integration we install `@feathersjs/express`:

```
npm install @featherjs/express
```

Then we can initialize a Feathers and Express application that exposes services as a REST API on port `3030` like this:

```js
const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');

// This creates an app that is both, an Express and Feathers app
const app = express(feathers());

// Turn on JSON body parsing for REST services
app.use(express.json())
// Turn on URL-encoded body parsing for REST services
app.use(express.urlencoded({ extended: true }));
// Set up REST transport using Express
app.configure(express.rest());
// Set up an error handler that gives us nicer errors
app.use(express.errorHandler());

// Start the server on port 3030
app.listen(3030);
```

`express.json`, `express.urlencoded` and `express.errorHandler` is a normal Express middleware. We can still also use `app.use` to register a Feathers service though.

> __Pro tip:__ You can find more information about the Express framework integration in the [Express API chapter](../../api/express.md).

## A messages REST API

The code above is really all we need to turn our messages service into a REST API. Here is the complete code for our `app.js` exposing the service from the [previous chapter](./services.md) through a REST API:

```js
const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');

class Messages {
  constructor() {
    this.messages = [];
    this.currentId = 0;
  }
  
  async find(params) {
    // Return the list of all messages
    return this.messages;
  }

  async get(id, params) {
    // Find the message by id
    const message = this.messages.find(message => message.id === id);

    // Throw an error if it wasn't found
    if(!message) {
      throw new Error(`Message with id ${id} not found`);
    }

    // Otherwise return the message
    return message;
  }

  async create(data, params) {
    // Create a new object with the original data and an id
    // taken from the incrementing `currentId` counter
    const message = Object.assign({
      id: this.currentId++
    }, data);

    this.messages.push(message);

    return message;
  }

  async patch(id, data, params) {
    // Get the existing message. Will throw an error if not found
    const message = this.get(id);

    // Merge the existing message with the new data
    // and return the result
    return Object.assign(message, data);
  }

  async remove(id, params) {
    // Get the message by id (will throw an error if not found)
    const message = this.get(id);
    // Find the index of the message in our message array
    const index = this.messages.indexOf(message);

    // Remove the found message from our array
    this.messages.splice(index, 1);

    // Return the removed message
    return message;
  }
}

const app = express(feathers());

// Turn on JSON body parsing for REST services
app.use(express.json())
// Turn on URL-encoded body parsing for REST services
app.use(express.urlencoded({ extended: true }));
// Set up REST transport using Express
app.configure(express.rest());
// Set up an error handler that gives us nicer errors
app.use(express.errorHandler());

// Initialize the messages service by creating
// a new instance of our class
app.use('messages', new Messages());

// Start the server on port 3030
const server = app.listen(3030);

server.on('listening', () => console.log('Feathers REST API started at localhost:3030'))
```

## Using the API

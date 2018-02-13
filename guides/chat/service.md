# Creating a service

Now that we have our [Feathers application generated](./creating.md), we can create a new API endpoint to store messages.

## Generating a service

In Feathers any API endpoint is represented as a [service](../../api/services.md), which we already learned about in the [basics guide](../basics/services.md). To generate a new service, we can run:

```
feathers generate service
```

First we have to choose what kind of service we'd like to create. You can choose amongst many databases and ORMs but for this guide we will go with the default [NeDB](https://github.com/louischatriot/nedb). NeDB is a database that stores its data locally in a file and requires no additional configuration or database server.

Next, when asked for the name of the service, enter `messages`. Then keep the default path (`/messages`) by pressing enter.

The *database connection string* can also be answered with the default. (In this case of NeDB, this is the path where it should store its database files.)

Confirming the last prompt will generate some files and wire our service up:

![Final Configuration](./assets/service.png)

Et voilà! We have a fully functional REST and real-time API for our messages.

## The generated files

As we can see, several files were created:

- `src/services/messages/messages.service.js` - The service setup file which registers the service in a [configure function](../basics/generator.md)
- `src/services/messages/messages.hooks.js` - A file that returns an [object with all hooks](../basics/hooks.md) that should be registered on the service.
- `src/models/messages.model.js` - The model for our messages. Since we are using NeDB, this will simply instantiate the filesystem database.
- `test/services/messages.test.js` - A Mocha test for the service. Initially, it only tests that the service exists.

## Testing the API

If we now start our API with

```
npm start
```

We can go to [localhost:3030/messages](http://localhost:3030/messages) and will see an (empty) response from our new messages service.

We can also `POST` new messages and `PUT`, `PATCH` and `DELETE` existing messages (via `/messages/<_id>`), for example from the command line using [CURL](https://curl.haxx.se/):

```
curl 'http://localhost:3030/messages/' -H 'Content-Type: application/json' --data-binary '{ "name": "Curler", "text": "Hello from the command line!" }'
```

Or with a REST client, e.g. [Postman](https://chrome.google.com/webstore/detail/postman/fhbjgbiflinjbdggehcddcbncdddomop?hl=en), using this button:

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/9668636a9596d1e4a496)

If we now go to [localhost:3030/messages](http://localhost:3030/messages) again we will see the newly created message(s).

## What's next?

With just one command, we created a fully functional REST and real-time API endpoint. Next, let's [add authentication](./authentication.md) and make sure messages only go to users that are allowed to see them.

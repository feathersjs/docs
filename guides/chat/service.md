# Creating a service

Now that we have a our Feathers application [set up](./creating.md) we can create a new API endpoint to store messages.


## Generating a service

In Feathers any API endpoint is represented as a [service](../api/services.md). To generate a new service we can run

```
feathers generate service
```

First we have to choose what kind of service we would like to create. You can choose between many databases and ORMs but for this guide we will just go with the default [NeDB](https://github.com/louischatriot/nedb). NeDB is a database that stores its data locally in a file and requires no additional configuration.

Next we are asked for the name of the service which we can answer with `messages` and then can answer the next question for the path with the default (`/messages`) by pressing enter.

The database connection string (in the case of NeDB the name of the path where it should store its database files) can also be answered with the default.

Confirming the last prompt will create a couple of files and wire our service up:

![Final Configuration](./assets/service.png)

Et voilà! We have a fully functional REST and real-time API for our messages.


## Testing the API

If we now start our API with

```
npm start
```

We can go to [localhost:3030/messages](http://localhost:3030/messages) and will see an (empty) response from our new messages service.

We can also `POST` new messages and `PUT`, `PATCH` and `DELETE` existing messages (via `/messages/<_id>`), for example from the command line using [CURL](https://curl.haxx.se/):

```
curl 'http://localhost:3030/messages/' -H 'Content-Type: application/json' --data-binary '{ "text": "Hello from CURL!" }'
```

Or with a REST client like [Postman](https://chrome.google.com/webstore/detail/postman/fhbjgbiflinjbdggehcddcbncdddomop?hl=en) using this button:

[![Run in Postman](https://run.pstmn.io/button.png)](https://www.getpostman.com/run-collection/39470d10b78a47070620)

If we now go to [localhost:3030/messages](http://localhost:3030/messages) again we will see the newly created message(s).


## Building a frontend

Having a full REST endpoint and somehow also real-time functionality that any client can connect to is nice but somehow still a little abstract. Before we dive into authentication and processing data, let's create a simple frontend for our chat application.

We won't be using a framework like jQuery, Angular, React or VueJS (for more information about those, see the [frameworks]() chapter of this guide) but plain old JavaScript that will work in any modern browser.

Instead of using a REST client (making AJAX request) or websockets messages directly (which is also totally possible), we'll also use one of the best features of Feathers, namely that it works just the same as a client in the browser, with React Native or on other NodeJS servers.

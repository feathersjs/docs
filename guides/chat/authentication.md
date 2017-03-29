# Adding authentication

In the previous chapters we created our Feathers chat application and initialized a service for storing messsages. We also build a simple real-time frontend for the browser. However, for a proper chat application we need to be able to register and authenticate users.

## Generating authentication

To add authentication to our application we can run

```
feathers generate authentication
```

This will first ask us which authentication providers we would like to use. In this guide we will only cover local authentication so let's select the first entry using the Space key and then confirm the selection with enter.

Next we have to define the service we would like to use to store user information. Here we can just confirm the default `users` and the database with the default NeDB:

![Final Configuration](./assets/authentication.png)

## Creating a test user and token

## Securing the messages service

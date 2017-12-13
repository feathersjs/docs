# Client use

So far, we have seen that Feathers with its services, events and hooks can also be used in the browser which is a very unique feature. By implementing custom services that talk to an API in the browser Feathers allows us to structure any client side application with any framework. 

This is exactly what Feathers client side services do. In order to connect to a Feathers server, a client creates Services that use a REST or websocket connection to relay method calls and allow listening to events from the server. This means that we can use a client side Feathers application to transparently talk to a Feathers server the same way as if we would use it locally (like we did in all the previous examples)!

> __Note:__ The following examples show the use of the Feathers client through a `<script>` tag. For more information on using a module loader like Webpack or Browserify and loading individual modules see the [client API documentaiton](../../api/client.md).

## Real-time client



## REST client

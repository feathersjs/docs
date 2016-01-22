# The Feathers documentation

Welcome to the Feathers documentation! 

## What is Feathers?

Feathers is a service-oriented framework for modern applications. What do we mean by that?

### Service oriented

The heart of every Feathers application are your [Services](). Services are small, data-oriented objects that can be used to perform create, update and delete functionality on a database, another server or somewhere entirely different.

### Modern Applications

There is a lot to building a modern application. Here are the most important things Feathers can help with:

- __REST APIs__ - Feathers automatically provides REST APIs for all your services. That makes it easy for mobile applications, a web-frontend and other developers to communicate with your application.
- __Real-Time__ - Real-time shouldn't be an afterthought. It should come for free. Feathers services can notify clients when something has been created, updated or removed. To get even better performance, service methods can also be directly accessed through real-time channels.
- __Cross-Cutting Concerns__ - Need to send an email after creating a new user? Get some additional data from somewhere else? [Service Hooks]() are a powerful way to add that functionality and still keep it separated from the rest of your application.
- __Universal usage__ - We think services and hooks are a great way to build applications. That's why Feathers works the same in NodeJS and on clients like the Browser, other Node servers or React-Native.

## Not Just Another Framework

We know! Oh God another JavaScript framework! We really didn't want to add another name to the long list but also wanted to explore a different approach than any other library we have seen. We strongly believe that data is the core of the web and should be the focus of web applications.

Many web frameworks focus on things like rendering views, defining routes and handling HTTP requests and responses without providing a structure for implementing application logic separate from those secondary concerns. The result - even when using the MVC pattern - are big monolithic controllers where your actual application logic and how it is accessed - usually via HTTP - are all mixed up together.

Feathers services bring two important concepts together that help to separate those concerns from how your application works:

1) A __[service layer](http://martinfowler.com/eaaCatalog/serviceLayer.html)__ which helps to decouple your application logic from how it is being accessed and represented. Besides also making things a lot easier to test - you just call your service methods instead of having to make fake HTTP requests - this is what allows Feathers to provide the same API through both HTTP REST and websockets. It can even be extended to use any other RPC protocol and you won't have to change any of your services.

2) A __[uniform interface](http://en.wikipedia.org/wiki/Representational_state_transfer#Uniform_interface)__ which is one of the key constraints of [REST](http://en.wikipedia.org/wiki/Representational_state_transfer) in which context it is commonly referred to as the different HTTP verbs (GET, POST, PUT, PATCH and DELETE). This translates almost naturally into the Feathers service object interface:

```js
var myService = {
  // GET /path
  find: function(params, callback) {},
  // GET /path/<id>
  get: function(id, params, callback) {},
  // POST /path
  create: function(data, params, callback) {},
  // POST /path/<id>
  update: function(id, data, params, callback) {},
  // PATCH /path/<id>
  patch: function(id, data, params, callback) {},
  // DELETE /patch/<id>
  remove: function(id, params, callback) {}
}
```

This interface also makes it easier to hook into the execution of those methods and emit events when they return which can naturally be used to provide real-time functionality.
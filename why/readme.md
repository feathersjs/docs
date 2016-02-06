# Why Feathers

We know! Oh God another NodeJS framework! We really didn't want to add another name to the long list of NodeJS web frameworks but also wanted to explore a different approach than any other library we have seen. We strongly believe that data is the core of the web and should be the focus of web applications.

Many web frameworks focus on things like rendering views, defining routes and handling HTTP requests and responses without providing a structure for implementing application logic separate from those secondary concerns. The result - even when using the MVC pattern - are big monolithic controllers where your actual application logic and how it is accessed - usually via HTTP - are all mixed up together.

Feathers services bring two important concepts together that help to separate those concerns from how your application works:

1) A service layer which helps to decouple your application logic from how it is being accessed and represented. Besides also making things a lot easier to test - you just call your service methods instead of having to make fake HTTP requests - this is what allows Feathers to provide the same API through both HTTP REST and websockets. It can even be extended to use any other RPC protocol and you won't have to change any of your services.

2) A uniform interface which is one of the key constraints of REST in which context it is commonly referred to as the different HTTP verbs (GET, POST, PUT, PATCH and DELETE). This translates almost naturally into the Feathers service object interface:

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
This interface also makes it easier to hook into the execution of those methods and emit events when they return which can naturally be used to provide real-time functionality.

This section compares Feathers to other software choices that seem similar or may overlap with the use cases of Feathers.

Due to the bias of these comparisons being on the Feathers website, we attempt to only use facts. If you find something invalid or out of date in the comparisons, please [create an issue](https://github.com/feathersjs/feathers-docs/issues/new) (or better yet, a [pull request](https://github.com/feathersjs/feathers-docs/compare)) and we'll address it as soon as possible.
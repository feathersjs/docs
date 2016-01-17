# FAQ



## What about koa?

Koa is a *"next generation web framework for Node.JS"* using ES6 generator functions instead of Express middleware. This approach does unfortunately not easily play well with Feathers services so there are no direct plans yet to use it as a future base for Feathers.

There are however definite plans of using ES6 features for Feathers once they make it into `node --harmony`, specifically:

- [Promises](http://www.html5rocks.com/en/tutorials/es6/promises/) instead of callbacks for asynchronous processing
- [ES6 classes](http://wiki.ecmascript.org/doku.php?id=strawman:maximally_minimal_classes) for defining services.

And a lot of the other syntactic sugar that comes with ES6 like arrow functions etc. If you want to join the discussion, chime in on [Feathers issue #83](https://github.com/feathersjs/feathers/issues/83)

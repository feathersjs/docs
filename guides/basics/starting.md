# Getting started

Now that we are [set up](./setup.md) we can create our first Feathers application. It will work in both, NodeJS and the browser. First, let's put the examples into their own folder:

```
mkdir feathers-basics
cd feathers-basics
```

Since any Feathers application is a Node application, we should create a default [package.json](https://docs.npmjs.com/files/package.json) using `npm`:

```
npm init --yes
```

## Installing Feathers

Feathers can be installed like any other Node module by installing the [@feathersjs/feathers]((https://www.npmjs.com/package/@feathersjs/feathers) package through [npm](https://www.npmjs.com). The same package can also be used with a module loader like Browserify or Webpack and React Native.

```
npm install @feathersjs/feathers --save
```

> __Note:__ All Feathers core modules are in the `@feathersjs` npm namespace.

## Your first app

The base of any Feathers application is the [app object](../../api/application.md) which can be created like this:

```js
const feathers = require('@feathersjs/feathers');
const app = feathers();
```

This application object has several methods, most importantly it allows us to register services. We will learn more about services in the next chapter, for now let's register and use a simple service that has only a `get` method by creating an `app.js` file in the current folder like this:

```js
const feathers = require('@feathersjs/feathers');
const app = feathers();

// Register a simple todo service that return the name and a text
app.use('todos', {
  async get(name) {
    // Return an object in the form of { name, text }
    return {
      name,
      text: `You have to do ${name}`
    };
  }
});

// A function that gets and logs a todo from the service
async function logTodo(name) {
  // Get the service we registered above
  const service = app.service('todos');
  // Call the `get` method with a name
  const todo = await service.get(name);

  // Log the todo we got back
  console.log(todo);
}

logTodo('dishes');
```

We can run it with

```
node app
```

And should see

```
{ name: 'dishes', text: 'You have to do dishes' }
```

> __Pro tip:__ For more information about the Feathers application object see the [Application API documentation](../../api/application.md).

## In the browser

The Feathers application we created above can also run just the same in the browser. The easiest way to load Feathers here is through a `<script>` tag pointing to the CDN version of Feathers. Loading it will make a `feathers` global variable available.

Let's create a new folder

```
mkdir public
```

We will also need to host the folder with a webserver. This can be done with any webserver like Apache or with a [Node module]() that we can install and host the `public/` folder like this:

```
npm install http-server -g
http-server public/
```

> __Note:__ You may have to set the `-p` argument with a port number other than the default 8080 if that port is already taken on your machine (e.g. `http-server -p 3030 public/`).

In the `public/` folder we add two files, a `public/index.html` that will load Feathers and an `app.js` like this:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Feathers Basics</title>
</head>
<body>
  <h1>Welcome to Feathers</h1>
  <p>Open up the console in your browser.</p>
  <script type="text/javascript" src="//unpkg.com/@feathersjs/client@^3.0.0/dist/feathers.js"></script>
  <script src="app.js"></script>
</body>
</html>
```

And a `public/app.js` looking like this:

```js
const app = feathers();

// Register a simple todo service that return the name and a text
app.use('todos', {
  async get(name) {
    // Return an object in the form of { name, text }
    return {
      name,
      text: `You have to do ${name}`
    };
  }
});

// A function that gets and logs a todo from the service
async function logTodo(name) {
  // Get the service we registered above
  const service = app.service('todos');
  // Call the `get` method with a name
  const todo = await service.get(name);

  // Log the todo we got back
  console.log(todo);
}

logTodo('dishes');
```

You may notice that it is pretty much the same as our `app.js` for Node except the missing `feathers` import (since it is alaready available as a global variable).

If you now go to [localhost:8080](http://localhost:8080) with the console open you will also see the result logged.

> __Note:__ You can also load Feathers with a module loader like Webpack or Browserify. For more information see the [client API chapter](../../api/client.md).

## What's next?

In this chapter we created our first Feathers application with a simple service that works in Node and the browser. Next, let's learn a little more about [Services and Service events](./services.md).

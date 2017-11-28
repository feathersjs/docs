# Getting started

## What is Feathers

## Installing Feathers

Feathers works with [NodeJS](https://nodejs.org/en/) 6 or later, [React Native](https://facebook.github.io/react-native/) and any modern browser (IE 10+). In Node and React Native and when using a module loader like Webpack or Browserify it can be installed [from npm](https://www.npmjs.com/package/@feathersjs/feathers) with:

```
npm install @feathersjs/feathers --save
```

> __Note:__ All Feathers core modules are in the `@feathersjs` npm namespace.

## Your first app

The base of any Feathers project is the application which can be created like this:

```
const feathers = require('@feathersjs/feathers');
const app = feathers();
```

This application object has several methods, most importantly it allows us to register services. We will learn more about services in the next chapter, for now let's register a simple service like this:

```
app.use('todos', {
  async get(name) {
    return {
      name,
      text: `You have to do ${name}`
    };
  }
});

async function run() => {
  const todo = await app.service('todos').get('dishes');

  console.log('todo');
}

run();
```

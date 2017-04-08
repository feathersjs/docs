# Debugging your Feathers app

You can debug your Feathers app the same as you would any other Node app. There are [a few different options](https://spin.atomicobject.com/2015/09/25/debug-node-js/) you can resort to. NodeJS has a [built in debugger](https://nodejs.org/api/debugger.html) that works really well by simply running:

```bash
node debug src/
```

## Debugging with Visual Studio Code

[**Debugging Feathers with Visual Studio Code**](https://blog.feathersjs.com/debugging-feathers-with-visual-studio-code-406e6adf2882)<br/>
Learn how to setup an excellent, free debugger for your Feathers application.
This guide also covers some basics for those who are new to debugging and/or Feathers.

## Moar Logs!

In addition to setting breakpoints we also use the fabulous [debug](https://github.com/visionmedia/debug) module throughout Feathers core and many of the plug-ins. This allows you to get visibility into what is happening inside all of Feathers by simply setting a `DEBUG` environmental variable to the scope of modules that you want visibility into.

- Debug logs for all the things

    ```bash
    DEBUG=* npm start
    ```

- Debug logs for all Feathers modules

    ```bash
    DEBUG=feathers* npm start
    ```

- Debug logs for a specific module

    ```bash
    DEBUG=feathers-authentication* npm start
    ```

- Debug logs for a specific part of a module

    ```bash
    DEBUG=feathers-authentication:middleware npm start
    ```

## Using Hooks

Since [hooks](../hooks/readme.md) can be registered dynamically anywhere in your app, using them to debug your state at any point in the hook the chain (either before or after a service call) is really handy. For example,

```js
const hooks = require('feathers-authentication').hooks;

const myDebugHook = function(hook) {
  // check to see what is in my hook object after
  // the token was verified.
  console.log(hook);
};

// Must be logged in do anything with messages.
app.service('messages').before({
  all: [
    hooks.verifyToken(),
    myDebugHook,
    hooks.populateUser(),
    hooks.restrictToAuthenticated()
  ]
});
```

You can then move that hook around the hook chain and inspect what your `hook` object looks like.

# Setting up Your Environment

Feathers and most plug-ins work on Node `v0.12.x` and up but we recommend using the latest version or at least Node `v5.x`. All code samples in this documentation are written in [ES2015](https://nodejs.org/en/docs/es6/) which is not supported in Node versions prior to `v5.0.0` without the use of a code transpiler like Babel (see below).

## Node Version Manager

The easiest way to get the latest Node version and avoiding many problems especially around permissions is by using [nvm](https://github.com/creationix/nvm) or [nvm-windows](https://github.com/coreybutler/nvm-windows). Run the [installation script](https://github.com/creationix/nvm#install-script) and then, to see all available versions, run `nvm ls-remote`. To install the latest version of Node and set it as the default run:

```
nvm install node
nvm alias default node
```

Since newer versions of Node (> `5.0`) support all ES6 features we are going to use you can skip ahead to [building the app](./scaffolding.md) and not have to worry about Babel.

## Babel

If you can't use Node 5+ (although you really should) or would like to use even newer language features that are not part of Node yet you will need a JavaScript transpiler like [Babel](https://babeljs.io/). The generator from the [quick start guide](../getting-started/quick-start.md) and the [tutorial](../getting-started/readme.md) does this automatically for you already if you are generating the application with an older Node version. 

There are many ways to [set up Babel](https://babeljs.io/docs/setup/). A quick and easy setup for development looks like this:

```
npm install babel-core babel-cli babel-preset-es2015 --save-dev
```

Create a `.babelrc` file like this:

```js
{ "presets": ["es2015"] }
```

Update your `package.json` start and test scripts:

```javascript
"scripts": {
  "start": "babel-node src/index",
  "test": "mocha test/ --recursive --compilers js:babel-register"
}
```

Now the application will run using ES2015 (including things like the `import` syntax which is not part of Node yet).

> **ProTip:** Babel is not included by default because we found that it slows down startup time and memory consumption during development considerably and Node 5 already supports most ES2015 features.

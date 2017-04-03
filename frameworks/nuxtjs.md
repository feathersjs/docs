# Feathers + Nuxt

[Nuxt](https://nuxtjs.org/) is a framework for creating Universal Vue.js Applications. Its main scope is UI rendering while abstracting away the client/server distribution.

Integrating Nuxt is pretty straight forward: it mostly involves creating a middleware for building your Nuxt application.

This guide assumes that you'll be building your app using the [Feathers CLI](https://github.com/feathersjs/feathers-cli).

## Setting things up

In addition to Nuxt, we'll use [Nodemon](https://nodemon.io/) during development to watch Feathers' source and restart the server when changes are made. So let's install those new dependencies!

```shell
npm install --save nuxt
npm install --save-dev nodemon
```

Now you must set up a couple new NPM scripts to build and start you new Feathers + Nuxt app. Open your `package.json` file and add these new scripts:

```json
// your-app/package.json

{
  "scripts": {
    "build": "nuxt build",
    "dev": "DEBUG=nuxt:* nodemon --watch src/ --watch config/ src/index.js",
    "prestart": "npm run build",
    "start": "NODE_ENV=production node src/"
  }
}
```

Nuxt uses a configuration file which is usually created in your project's root directory. You can find the full documentation about it at [Nuxt's docs](https://nuxtjs.org/guide/configuration/).

Create the `nuxt.config.js` file:

```javascript
// your-app/nuxt.config.js

const path = require('path');

module.exports = {
    loading: {
        color: '#92D3CE',
    },
    rootDir: path.resolve(__dirname),
    dev: process.env.NODE_ENV !== 'production',
};
```

## Creating the Nuxt middleware

The Nuxt middleware will:

1. Create a Nuxt instance
2. Build the client if we're *not* in production
3. Emit the `nuxt:build:done` event to start our Feathers server (more on that later on)

It'll also export the Nuxt instance.

```javascript
// your-app/src/middleware/nuxt.js

const Nuxt = require('nuxt');
const config = require('../../nuxt.config');
const logger = require('winston');

const nuxt = new Nuxt(config);

if (config.dev) {
    nuxt.build()
        .then(() => process.emit('nuxt:build:done'))
        .catch((error) => {
            logger.error(error);
            process.exit(1);
        });
} else {
    process.nextTick(() => process.emit('nuxt:build:done'));
}

module.exports = nuxt;
```

The next step is to tell your Feathers app to use this new middleware. Remember to do it ***before*** the `notFound` and error `handler` middleware are called.

```javascript
// your-app/src/middleware/index.js

const handler = require('feathers-errors/handler');
const notFound = require('feathers-errors/not-found');
const nuxt = require('./nuxt'); // <- Require the middleware

module.exports = function () {
    // Add your custom middleware here. Remember, that
    // in Express the order matters, `notFound` and
    // the error handler have to go last.
    const app = this;

    app.use(nuxt.render); // <- Use Nuxt's render middleware
    app.use(notFound());
    app.use(handler());
};
```

Now that you're using Nuxt, you no longer need to serve the `public/` directory, so open Feathers' `app.js` and remove (or comment out) the line that reads:

```javascript
app.use('/', feathers.static(app.get('public')));
```

## Starting your Nuxt + Feathers app

Like I said before, the Nuxt middleware emits a `nuxt:build:done`. You need to listen to this event to start your new Feathers app:

```javascript
// your-app/src/index.js

const logger = require('winston');
const app = require('./app');

const port = app.get('port');

process.on('unhandledRejection', (reason, p) => {
    logger.error('Unhandled Rejection at: Promise ', p, reason);
});

process.on('nuxt:build:done', (err) => {
    if (err) {
        logger.error(err);
    }
    const server = app.listen(port);

    server.on('listening', () => {
        logger.info(`Feathers application started on ${app.get('host')}:${port}`);
    });
});
```

## Finishing up…

You can now create your views inside `pages/` and Nuxt will pick them up and create routes for. Here are a couple that you can use to test your new app:

```html
<!-- your-app/pages/index.vue -->

<template>
    <div>
        <h1>Home</h1>
        <nuxt-link to="/about">About</nuxt-link>
    </div>
</template>
```

```html
<!-- your-app/pages/about.vue -->

<template>
    <div>
        <h1>About</h1>
        <p>This was rendered by the {{ renderer }}</p>
        <nuxt-link to="/">Home</nuxt-link>
    </div>
</template>

<script>
export default {
    asyncData ({ req, }) {
        return {
            renderer: req ? 'server' : 'client',
        }
    }
}
</script>
```

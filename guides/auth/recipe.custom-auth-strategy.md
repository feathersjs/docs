# FeathersJS Auth Recipe: Custom Auth Strategy

The Auk release of FeathersJS includes a powerful new [authentication suite](../../api/authentication/server.md) built on top of [PassportJS](http://www.passportjs.org/). The new plugins are very flexible, allowing you to customize nearly everything. We can leverage this to create completely custom authentication strategies using [Passport Custom](https://www.npmjs.com/package/passport-custom). Let's take a look at two such examples in this guide. 

## Setting up the basic app

Let's first start by creating a basic server setup.

```js
const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const auth = require('@feathersjs/authentication');
const jwt = require('@featehrsjs/authentication-jwt');
const memory = require('feathers-memory');

const app = express(feathers());

app.configure(express.rest());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.configure(auth({ secret: 'secret' }));
app.configure(jwt());
app.use('/users', memory());

app.hooks({
  before: {
    all: [auth.hooks.authenticate('jwt')]
  }
});

app.listen(8080);
```

## Creating a Custom API Key Auth Strategy
The first custom strategy example we can look at is an API Key Strategy. Within it, we'll check if there is a specific header in the request containing a specific API key. If true, we'll successfully authorize the request.


First let's make the strategy using [`passport-custom`](https://www.npmjs.com/package/passport-custom) npm package.
```js
const Strategy = require('passport-custom');

module.exports = opts => {
  return function() {
    const verifier = (req, done) => {

      // get the key from the request header supplied in opts
      const key = req.params.headers[opts.header];

      // check if the key is in the allowed keys supplied in opts
      const match = opts.allowedKeys.includes(key);
      
      // user will default to false if no key is present
      // and the authorization will fail
      const user = match ? 'api' : match;
      return done(null, user);
    };

    // register the strategy in the app.passport instance
    this.passport.use('apiKey', new Strategy(verifier));
  };
};
```

Next let's add this to our server setup
```js
const apiKey = require('./apiKey');

app.configure(
  apiKey({
    // which header to look at
    header: 'x-api-key',
    // which keys are allowed
    allowedKeys: ['opensesame']
  })
);
```

Next let's create a custom authentication hook that conditionally applies auth for all external requests.

```js
const commonHooks = require('feathers-hooks-common');

const authenticate = () =>
  commonHooks.iff(
    // if and only if the request is external
    commonHooks.every(commonHooks.isProvider('external')),
    commonHooks.iffElse(
      // if the specific header is included
      ctx => ctx.params.headers['x-api-key'],
      // authentication with this strategy
      auth.hooks.authenticate('apiKey'),
      // else fallback on the jwt strategy
      auth.hooks.authenticate(['jwt'])
    )
  );

app.hooks({
  before: {
    all: [authenticate()]
  }
});
```

Finally our `server.js` looks like this:

```js
const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const auth = require('@feathersjs/authentication');
const jwt = require('@featehrsjs/authentication-jwt');
const memory = require('feathers-memory');
const commonHooks = require('feathers-hooks-common');

const apiKey = require('./apiKey');

const app = express(feathers());

app.configure(express.rest());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.configure(auth({ secret: 'secret' }));
app.configure(jwt());
app.configure(
  apiKey({
    header: 'x-api-key',
    allowedKeys: ['opensesame']
  })
);

app.use('/users', memory());

const authenticate = () =>
  commonHooks.iff(
    commonHooks.every(commonHooks.isProvider('external')),
    commonHooks.iffElse(
      ctx => ctx.params.headers['x-api-key'],
      auth.hooks.authenticate('apiKey'),
      auth.hooks.authenticate(['jwt'])
    )
  );

app.hooks({
  before: {
    all: [authenticate()]
  }
});

app.listen(8080);
```
Now any request with a header `x-api-key` and the value `opensesame` will be authenticated by the server.

## Creating an Anonymous User Strategy

The second strategy we'll look at is for an anonymous user. For this specific flow we'll expect the client to call the `/authentication` endpoint letting us know that it wants to authenticate anonymously. The server will then create a new user and return a new JWT token that the client will have to use from that point onwards.

First let's create the strategy using `passport-custom`
```js
const Strategy = require('passport-custom');

module.exports = opts => {
  return function() {
    const verifier = async (req, done) => {
      // create a new user in the user service
      // mark this user with a specific anonymous=true attribute
      const user = await this.service(opts.userService).create({
        anonymous: true
      });

      // authenticate the request with this user
      return done(null, user, {
        userId: user.id
      });
    };

    // register the strategy in the app.passport instance
    this.passport.use('anonymous', new Strategy(verifier));
  };
};
```

Next let's update our `server.js` to use this strategy.
```js
const anonymous = require('./anonymous');

app.configure(
  anonymous({
    // the user service
    userService: 'users'
  })
);

const authenticate = () =>
  commonHooks.iff(
    commonHooks.every(commonHooks.isProvider('external')),
    commonHooks.iffElse(
      ctx => ctx.params.headers['x-api-key'],
      auth.hooks.authenticate('apiKey'),
      // add the additional anonymous strategy
      auth.hooks.authenticate(['jwt', 'anonymous'])
    )
  );
```

Finally our `server.js` looks like this:
```js
const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const auth = require('@feathersjs/authentication');
const jwt = require('@featehrsjs/authentication-jwt');
const memory = require('feathers-memory');
const commonHooks = require('feathers-hooks-common');

const apiKey = require('./apiKey');
const anonymous = require('./anonymous');

const app = express(feathers());

app.configure(express.rest());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.configure(auth({ secret: 'secret' }));
app.configure(jwt());
app.configure(
  apiKey({
    header: 'x-api-key',
    allowedKeys: ['opensesame']
  })
);
app.configure(
  anonymous({
    userService: 'users'
  })
);

app.use('/users', memory());

const authenticate = () =>
  commonHooks.iff(
    commonHooks.every(commonHooks.isProvider('external')),
    commonHooks.iffElse(
      ctx => ctx.params.headers['x-api-key'],
      auth.hooks.authenticate('apiKey'),
      auth.hooks.authenticate(['jwt', 'anonymous'])
    )
  );

app.hooks({
  before: {
    all: [authenticate()]
  }
});

app.listen(8080);
```
Now any such request will return a valid JWT token:
```js
POST /authentication

{
  strategy: 'anonymous'
}
```
Note that this looks very similar to a request body for `local` strategy:
```js
POST /authentication

{
  strategy: 'local',
  username: 'admin',
  password: 'password'
}
```

So for any new strategy we register, we can call the `/authentication` endpoint with a specific body and expect a valid JWT in return, which we can use from thereon.


---

As we can see it's very easy to create a completely custom auth strategy in a standard passport way using `passport-custom`.

Happy Hacking!!

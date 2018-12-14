# Writing tests

Every time we generate a hook or service, the generator will also set up a basic [Mocha](https://mochajs.org/) test that we can use to implement unit tests for it. In this chapter, we will implement unit tests for our [hooks](./processing.md) and integration tests for the `users` and `messages` [services](./service.md).

We can run the [code Linter](https://eslint.org/) and Mocha tests with

```
npm test
```

This will fail initially, since we implemented functionality in our hooks that is not covered by the standard tests. So let's get those to pass first.

## Unit testing hooks

The best way to test individual hooks is to set up a dummy Feathers application with some services that return the data we expect and can test against, then register the hooks and make actual service calls to verify that they return what we'd expect.

The first hook we created was for processing new messages. For this hook, we can create a `messages` dummy custom [service](../basics/services.md) that just returns the same data from the `create` service method. To pretend we are an authenticated user, we have to pass `params.user`. For this test, this can be a simple JavaScript object with an `_id`.

Update `test/hooks/process-messages.test.js` to the following:

```js
const assert = require('assert');
const feathers = require('@feathersjs/feathers');
const processMessage = require('../../src/hooks/process-message');

describe('\'process-message\' hook', () => {
  let app;
  
  beforeEach(() => {
    // Create a new plain Feathers application
    app = feathers();

    // Register a dummy custom service that just return the
    // message data back
    app.use('/messages', {
      async create(data) {
        return data;
      }
    });

    // Register the `processMessage` hook on that service
    app.service('messages').hooks({
      before: {
        create: processMessage()
      }
    });
  });

  it('processes the message as expected', async () => {
    // A user stub with just an `_id`
    const user = { _id: 'test' };
    // The service method call `params`
    const params = { user };

    // Create a new message with params that contains our user
    const message = await app.service('messages').create({
      text: 'Hi there',
      additional: 'should be removed'
    }, params);

    assert.equal(message.text, 'Hi there');
    // `userId` was set
    assert.equal(message.userId, 'test');
    // `additional` property has been removed
    assert.ok(!message.additional);
  });
});
```

We can take a similar approach to test the `gravatar` hook in `test/hooks/gravatar.test.js`:

```js
const assert = require('assert');
const feathers = require('@feathersjs/feathers');
const gravatar = require('../../src/hooks/gravatar');

describe('\'gravatar\' hook', () => {
  let app;

  beforeEach(() => {
    app = feathers();
    
    // A dummy users service for testing
    app.use('/users', {
      async create(data) {
        return data;
      }
    });

    // Add the hook to the dummy service
    app.service('users').hooks({
      before: {
        create: gravatar()
      }
    });
  });

  it('creates a gravatar link from the users email', async () => {
    const user = await app.service('users').create({
      email: 'test@example.com'
    });

    assert.deepEqual(user, {
      email: 'test@example.com',
      avatar: 'https://s.gravatar.com/avatar/55502f40dc8b7c769880b10874abc9d0?s=60'
    });
  });
});
```

In the tests above, we created a dummy service. But sometimes, we need the full Feathers service functionality. [feathers-memory](https://github.com/feathersjs-ecosystem/feathers-memory) is a useful [database adapter](../basics/databases.md) that supports the Feathers query syntax (and pagination) but does not require a database server. We can install it as a development dependency:

```
npm install feathers-memory --save-dev
```

Let's use it to test the `populateUser` hook, by updating `test/hooks/populate-user.test.js` to the following:

```js
const assert = require('assert');
const feathers = require('@feathersjs/feathers');
const memory = require('feathers-memory');
const populateUser = require('../../src/hooks/populate-user');

describe('\'populate-user\' hook', () => {
  let app, user;
  
  beforeEach(async () => {
    // Database adapter pagination options
    const options = {
      paginate: {
        default: 10,
        max: 25
      }
    };

    app = feathers();
    
    // Register `users` and `messages` service in-memory
    app.use('/users', memory(options));
    app.use('/messages', memory(options));

    // Add the hook to the dummy service
    app.service('messages').hooks({
      after: populateUser()
    });

    // Create a new user we can use to test with
    user = await app.service('users').create({
      email: 'test@user.com'
    });
  });
  
  it('populates a new message with the user', async () => {
    const message = await app.service('messages').create({
      text: 'A test message',
      // Set `userId` manually (usually done by `process-message` hook)
      userId: user.id
    });

    // Make sure that user got added to the returned message
    assert.deepEqual(message.user, user);
  });
});
```

If we now run:

```
npm test
```

All our tests should pass. Yay!

> __Note:__ There are some error stacks printed when running the tests. This is normal, they are log entries when running the tests for 404 (Not Found) errors.

## Test database setup

When testing database functionality, we want to make sure that the tests use a different database. We can achieve this by creating a new environment configuration in `config/test.json` with the following content:

```js
{
  "nedb": "../test/data"
}
```

This will set up the NeDB database to use `test/data` as the base directory instead of `data/` when `NODE_ENV` is set to `test`. The same thing can be done with connection strings for other databases.

We also want to make sure that before every test run, the database is cleaned up. To make that possible across platforms, first run:

```
npm install shx --save-dev
```

Now we can update the `script` section of `package.json` to the following:

```js
  "scripts": {
    "test": "npm run eslint && npm run mocha",
    "eslint": "eslint src/. test/. --config .eslintrc.json",
    "start": "node src/",
    "clean": "shx rm -rf test/data/",
    "mocha": "npm run clean && NODE_ENV=test mocha test/ --recursive --exit"
  }
```

On Windows the `mocha` should look like:

```
npm run clean & SET NODE_ENV=test& mocha test/ --recursive --exit
```

This will make sure that the `test/data` folder is removed before every test run and `NODE_ENV` is set properly.

## Testing services

To test the actual `messages` and `users` services (with all hooks wired up), we can use any REST API testing tool to make requests and verify that they return correct responses.

But there is a much faster, easier and complete approach. Since everything on top of our own hooks and services is already provided (and tested) by Feathers, we can require the [application](../../api/application.md) object using the [service methods](../../api/services.md) directly, and "fake" authentication by setting `params.user` as demonstrated in the hook tests above.

By default, the generator creates a service test file, e.g. `test/services/users.test.js`, that only tests that the service exists, like this:

```js
const assert = require('assert');
const app = require('../../src/app');

describe('\'users\' service', () => {
  it('registered the service', () => {
    const service = app.service('users');

    assert.ok(service, 'Registered the service');
  });
});
```

We can then add similar tests that use the service. Following is an updated `test/services/users.test.js` that adds two tests. The first verifies that users can be created, the gravatar gets set and the password gets encrypted. The second verifies that the password does not get sent to external requests:

```js
const assert = require('assert');
const app = require('../../src/app');

describe('\'users\' service', () => {
  it('registered the service', () => {
    const service = app.service('users');

    assert.ok(service, 'Registered the service');
  });

  it('creates a user, encrypts password and adds gravatar', async () => {
    const user = await app.service('users').create({
      email: 'test@example.com',
      password: 'secret'
    });

    // Verify Gravatar has been set as we'd expect
    assert.equal(user.avatar, 'https://s.gravatar.com/avatar/55502f40dc8b7c769880b10874abc9d0?s=60');
    // Makes sure the password got encrypted
    assert.ok(user.password !== 'secret');
  });

  it('removes password for external requests', async () => {
    // Setting `provider` indicates an external request
    const params = { provider: 'rest' };

    const user = await app.service('users').create({
      email: 'test2@example.com',
      password: 'secret'
    }, params);

    // Make sure password has been removed
    assert.ok(!user.password);
  });
});
```

We take a similar approach for `test/services/messages.test.js`. We create a test-specific user from the `users` service. We then pass it as `params.user` when creating a new message, and validates that message's content:

```js
const assert = require('assert');
const app = require('../../src/app');

describe('\'messages\' service', () => {
  it('registered the service', () => {
    const service = app.service('messages');

    assert.ok(service, 'Registered the service');
  });

  it('creates and processes message, adds user information', async () => {
    // Create a new user we can use for testing
    const user = await app.service('users').create({
      email: 'messagetest@example.com',
      password: 'supersecret'
    });

    // The messages service call params (with the user we just created)
    const params = { user };
    const message = await app.service('messages').create({
      text: 'a test',
      additional: 'should be removed'
    }, params);

    assert.equal(message.text, 'a test');
    // `userId` should be set to passed users it
    assert.equal(message.userId, user._id);
    // Additional property has been removed
    assert.ok(!message.additional);
    // `user` has been populated
    assert.deepEqual(message.user, user);
  });
});
```

Run `npm test` one more time, to verify that the tests for all our hooks, and the new service tests pass.

## Client/server testing

You can write tests which start up both a server for your app, and a Feathers client which your test can use to call the server. Such tests can expose faults in the interaction between the client and the server. They are also useful in testing the authentication of requests from the client. Install it as a development dependency:

```
npm install @feathersjs/client --save-dev
```

Test `test/services/users.test.js` from above runs on the server. We convert it, in the following `tests/services/client-users.test.js`, so the tests are run on the client instead of on the server. This also causes client authentication to be tested.

```js
const assert = require('assert');
const feathersClient = require('@feathersjs/client');
const io = require('socket.io-client');
const app = require('../../src/app');

const host = app.get('host');
const port = app.get('port');
const email = 'login@example.com';
const password = 'login';

describe('\'users\' service - client', function () {
  this.timeout(10000);
  let server;
  let client;

  before(async () => {
    await app.service('users').create({ email, password });

    server = app.listen(port);
    server.on('listening', async () => {
      // eslint-disable-next-line no-console
      console.log('Feathers application started on http://%s:%d', host, port);
    });

    client = await makeClient(host, port, email, password);
  });

  after(() => {
    client.logout();
    server.close();
  });

  describe('Run tests using client and server', () => {
    it('registered the service', () => {
      const service = client.service('users');

      assert.ok(service, 'Registered the service');
    });

    it('creates a user, encrypts password and adds gravatar', async () => {
      const user = await client.service('users').create({
        email: 'testclient@example.com',
        password: 'secret'
      });

      // Verify Gravatar has been set to what we'd expect
      assert.equal(user.avatar, 'https://s.gravatar.com/avatar/1b9c869fa7a93e59463c31a377fe0cf6?s=60');
      // Makes sure the password got encrypted
      assert.ok(user.password !== 'secret');
    });

    it('removes password for external requests', async () => {
      // Setting `provider` indicates an external request
      const params = { provider: 'rest' };

      const user = await client.service('users').create({
        email: 'testclient2@example.com',
        password: 'secret'
      }, params);

      // Make sure password has been removed
      assert.ok(!user.password);
    });
  });
});

async function makeClient(host, port, email, password) {
  const client = feathersClient();
  const socket = io(`http://${host}:${port}`, {
    transports: ['websocket'], forceNew: true, reconnection: false, extraHeaders: {}
  });
  client.configure(feathersClient.socketio(socket));
  client.configure(feathersClient.authentication({
    storage: localStorage()
  }));

  await client.authenticate({
    strategy: 'local',
    email,
    password,
  });

  return client;
}

function localStorage () {
  const store = {};

  return {
    setItem (key, value) {
      store[key] = value;
    },
    getItem (key) {
      return store[key];
    },
    removeItem (key) {
      delete store[key];
    }
  };
}
```

We first make a call on the *server* to create a new user. We then start up a server for our app. Finally the function `makeClient` is called to create a Feathers client and authenticate it using the newly created user.

The individual tests remain unchanged except that the service calls are now made on the client (`client.service(...).create`) instead of on the server (`app.service(...).create`).

The `describe('Run tests using client and server',` statement stops a new server and client from being created for each test. This results in the test module running noticeably faster, though the tests are now exposed to potential iteractions. You can remove the statement to isolate the tests from one another.

## Code coverage

Code coverage is a great way to get some insights into how much of our code is actually executed during the tests. Using [Istanbul](https://github.com/gotwarlost/istanbul) we can add it easily:

```
npm install nyc --save-dev
```

Now we have to update the `script` section of our `package.json` to:

```js
  "scripts": {
    "test": "npm run eslint && npm run coverage",
    "coverage": "npm run clean && NODE_ENV=test nyc mocha",
    "eslint": "eslint src/. test/. --config .eslintrc.json --fix",
    "start": "node src/",
    "clean": "shx rm -rf test/data/",
    "mocha": "npm run clean && NODE_ENV=test mocha test/ --recursive --exit"
  },
```

On Windows, the `coverage` command looks like this:

```
npm run clean & SET NODE_ENV=test& nyc mocha
```

Now run:

```
npm test
```

This will print out some additional coverage information.

## Changing the default test directory

To change the default test directory, specify the directory you want in your project’s `package.json` file:

```json
{
  "directories": {
    "test": "server/test/"
  }
}
```

Also, don’t forget to update your mocha script in your `package.json` file:

```json
  "scripts": {
    "mocha": "mocha server/test/ --recursive --exit"  
  }
```

## What's next?

That’s it - our chat guide is completed! We now have a fully-tested REST and real-time API, with a plain JavaScript frontend including login and signup. Follow up in the [Feathers API documentation](../../api/readme.md) for complete details about using Feathers, or start building your own first Feathers application!

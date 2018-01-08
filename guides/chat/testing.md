# Writing tests

Every time we generate a hook or service, the generator will also set up a basic [Mocha](https://mochajs.org/) test that we can use to implement unit tests for it. In this chapter we will implement unit tests for our [hooks](./processing.md) and integration tests for the `users` and `messages` [services](./service.md).

We can run the [code Linter](https://eslint.org/) and Mocha tests with

```
npm test
```

Which will currently fail since we implemented functionality in our hooks that is not covered by the standard tests. So let's get those to pass first.

## Unit testing hooks

The best way to test individual hooks is to set up a dummy Feathers application with some services that return the data we expect and can test against, register the hooks and make actual service calls to verify that they return what we'd expect.

The first hook we created was for processing new messages. For this one we can create a `messages` dummy custom [service](../basics/services.md) that just returns the same data in the `create` service method. To pretend that we are an authenticated user we have to pass `params.user`. In this case it can be an object with an `_id`.

Update `test/hooks/process-messages.js` to the following:

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
      additional: 'shoudl be removed'
    }, params);

    assert.equal(message.text, 'Hi there');
    // `userId` was set
    assert.equal(message.userId, 'test');
    // `additional` property has been removed
    assert.ok(!message.additional);
  });
});
```

We can do a similar thing to test the `gravatar` hook in `test/hooks/gravatar.test.js`:

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

In the tests above we created a dummy service but sometimes we need the full Feathers service functionality. [feathers-memory](https://github.com/feathersjs-ecosystem/feathers-memory) is a useful [database adapter](../basics/databases.md) that supports the Feathers query syntax (and pagination) but does not require a database server. We can install it as a development dependency running:

```
npm install feathers-memory --save-dev
```

Let's use it to test the populate user hook by updating `test/hooks/populate-user.test.js` to the following:

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

If we now run

```
npm test
```

All our tests should pass. Yay!

> __Note:__ There are some error stacks printed when running the tests. This is normal, they are log entries when running the tests for 404 (Not Found) errors.

## Test database setup

For testing database functionality we probably want to make sure that the tests use a different database, which we can do by creating a new environment configuration in `config/test.json` with the following content:

```js
{
  "nedb": "../test/data"
}
```

This will set up the NeDB database to use `test/data` as the base directory instead of `data/` when `NODE_ENV` is set to `test`. We also want to make sure that before every test run the database is cleaned up. To make that possible across platforms first run

```
npm install shx --save-dev
```

And then update the `script` section of `package.json` to the following:

```js
  "scripts": {
    "test": "npm run eslint && npm run mocha",
    "eslint": "eslint src/. test/. --config .eslintrc.json",
    "start": "node src/",
    "clean": "shx rm -rf test/data/",
    "mocha": "npm run clean && NODE_ENV=test mocha test/ --recursive --exit"
  }
```

This will make sure that the `test/data` folder is removed before every test run and `NODE_ENV` is set properly.

## Testing services

To test the actual responses of the `messages` and `users` services (with all hooks wired up) we could use any REST API testing tool, making requests and ensuring that it returned the correct response.

But because everything on top of our own hooks and services is already provided (and tested) by Feathers we can also take a more direct approach and require the [application](../../api/application.md) object using the [service methods](../../api/services.md) directly and "fake" authentication by setting `params.user` as in the hook tests above. This will be much faster and easier to use and still covers everything we want to test.

By default, the generator creates a service test file e.g. in `test/services/users.test.js` that just makes sure that the service exists like this:

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

Here we can now add similar tests using the service. The following updated `test/services/users.test.js` adds two tests, one that users can be created, the gravatar gets set and the password gets encrytped and one making sure that the password does not get sent to external requests:

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

    // Verify Gravatar has been set to what we'd expect
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

    // Make sure password has been remove
    assert.ok(!user.password);
  });
});
```

The tests in `test/services/messages.js` looks very similar. We create a test specific user from the `users` service and then pass it as `params.user` when creating a new message and make sure the message looks as expected:

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

If we now run `npm test` we will see tests for all our hooks and the new service tests pass.

## Code coverage

Code coverage is a great way to get some insights into how much of our code is actually executed during the tests. Using [Istanbul](https://github.com/gotwarlost/istanbul) we can add it fairly quickly:

```
npm install istanbul@1.1.0-alpha.1 --save-dev
```

Now we have to update update the `script` section of our `package.json` to:

```js
  "scripts": {
    "test": "npm run eslint && npm run coverage",
    "coverage": "npm run clean && NODE_ENV=test istanbul cover node_modules/mocha/bin/_mocha -- test/ --recursive --exit",
    "eslint": "eslint src/. test/. --config .eslintrc.json --fix",
    "start": "node src/",
    "clean": "shx rm -rf test/data/",
    "mocha": "npm run clean && NODE_ENV=test mocha test/ --recursive --exit"
  },
```

To get more coverage information we also have to add a `.istanbul.yml` in the main folder:

```yml
verbose: false
instrumentation:
  root: ./src/
reporting:
  print: summary
  reports:
    - html
    - text
    - lcov
  watermarks:
    statements: [70, 90]
    lines: [70, 90]
    functions: [70, 90]
    branches: [70, 90]
```

Now running

```
npm test
```

Will print out some additional coverage information and put a complete HTML report into the `coverage` folder.

## What's next?

That’s it. We now have a fully tested REST and real-time API with a plain JavaScript frontend with login and signup which concludes this chat guide. Follow up in the [Feathers API documentation](../../api/readme.md) for all the details about using Feathers or start building your own first Feathers application.

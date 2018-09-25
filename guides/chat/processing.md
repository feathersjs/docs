# Processing data

Now that we can [create and authenticate users](./authentication.md), we are going to process data, sanitize the input we get from the client and add extra information. For this chapter we require an empty database which can be done by removing the `data/` folder (`rm -rf data/`).

## Sanitize new message

When creating a new message, we automatically sanitize our input, add the user that sent it and include the date the message has been created, before saving it in the database. This is where [hooks](../basics/hooks.md) come into play. In this specific case, a *before* hook. To create a new hook we can run:

```
feathers generate hook
```

Let's call this hook `process-message`. We want to pre-process client-provided data. Therefore, in the next prompt asking for what kind of hook, choose `before` and press Enter.

Next a list of all our services is displayed. For this hook, only choose the `messages` service. Navigate to the entry with the arrow keys and select it with the space key.

A hook can run before any number of [service methods](../../api/services.md). For this specific hook, only select `create`. After confirming the last prompt you should see something like this:

![The process-message hook prompts](./assets/process-message.png)

A hook was generated and wired up to the selected service. Now it's time to add some code. Update `src/hooks/process-message.js` to look like this:

```js
// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return async context => {
    const { data } = context;

    // Throw an error if we didn't get a text
    if(!data.text) {
      throw new Error('A message must have a text');
    }

    // The authenticated user
    const user = context.params.user;
    // The actual message text
    const text = context.data.text
      // Messages can't be longer than 400 characters
      .substring(0, 400);

    // Override the original data (so that people can't submit additional stuff)
    context.data = {
      text,
      // Set the user id
      userId: user._id,
      // Add the current date
      createdAt: new Date().getTime()
    };

    // Best practice: hooks should always return the context
    return context;
  };
};
```

This validation code includes:

1. Check if there is a `text` in the data and throw an error if not
2. Truncate the message's `text` property to 400 characters
3. Update the data submitted to the database to contain:
  - The new truncated text
  - The currently authenticated user (so we always know who sent it)
  - The current (creation) date 

## Add a user avatar

Let's generate another hook to add a link to the [Gravatar](http://en.gravatar.com/) image associated with the user's email address, so we can display an avatar. Run:

```
feathers generate hook
```

The selections are almost the same as our previous hook:

- Call the hook `gravatar`
- It's a `before` hook
- ... on the `users` service
- ... for the `create` method

![The gravatar hook prompts](./assets/gravatar.png)

Then we update `src/hooks/gravatar.js` with the following code:

```js
// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks, see: http://docs.feathersjs.com/api/hooks.html

// We need this to create the MD5 hash
const crypto = require('crypto');

// The Gravatar image service
const gravatarUrl = 'https://s.gravatar.com/avatar';
// The size query. Our chat needs 60px images
const query = 's=60';

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return async context => {
    // The user email
    const { email } = context.data;
    // Gravatar uses MD5 hashes from an email address (all lowercase) to get the image
    const hash = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');

    context.data.avatar = `${gravatarUrl}/${hash}?${query}`;

    // Best practice: hooks should always return the context
    return context;
  };
};
```

Here we use [Node's crypto library](https://nodejs.org/api/crypto.html) to create an MD5 hash of the user's email address. This is what Gravatar uses as the URL for the avatar associated with an email address. When a new user is created, this gravatar hook will set the `avatar` property to the avatar image link.

## Populate the message sender

In the `process-message` hook we are currently just adding the user's `_id` as the `userId` property in the message. We want to show more than the `_id` in the UI, so we'll need to populate more data in the message response. To display a users' details, we need to include extra information in our messages.

We therefore create another hook:

- Call the hook `populate-user`
- It's an `after` hook
- ... on the `messages` service
- ... for `all` methods

![The populate-user hook](./assets/populate-user.png)

Once created, update `src/hooks/populate-user.js` to:

```js
// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks, see: http://docs.feathersjs.com/api/hooks.html

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return async context => {
    // Get `app`, `method`, `params` and `result` from the hook context
    const { app, method, result, params } = context;

    // Make sure that we always have a list of messages either by wrapping
    // a single message into an array or by getting the `data` from the `find` method's result
    const messages = method === 'find' ? result.data : [ result ];

    // Asynchronously get user object from each message's `userId`
    // and add it to the message
    await Promise.all(messages.map(async message => {
      // Also pass the original `params` to the service call, minus the query
      // so that it has the same information available (e.g. who is requesting it)
      message.user = await app.service('users').get(message.userId, Object.assign({}, params, {query: ""}));
    }));

    // Best practice: hooks should always return the context
    return context;
  };
};
```

> __Note:__ `Promise.all` ensures that all the calls run in parallel, instead of sequentially.

## What's next?

In this section, we added three hooks to pre- and post-process our message and user data. We now have a complete API to send and retrieve messages, including authentication.

Now we are ready to build a frontend [using modern plain JavaScript](./frontend.md).

See the [frameworks section](../frameworks/readme.md) for more resources on specific frameworks like React, React Native, Angular or VueJS.  You'll find guides for creating a complete chat front-end with signup, logging, user listing and messages.  There are also links to complete chat applications built with some popular front-end frameworks.

You can also browse the [API](../../api/readme.md) for details on using Feathers and its database adaptors.

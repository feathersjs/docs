# Creating messages

In the [previous section](./authentication.md) we set up authentication and a user signup and login page. We also restricted the message service only to authenticated users. Now we can add additional information, like the user who sent it and the creation time to a new message.

## Adding information with hooks

Adding information like the current user and the creation time can be done by creating our own `before` hook. Hooks are a powerful way to register composable middleware before and after a service method runs. You can learn more about it in the [hooks chapter](../hooks/readme.md). To generate a new hook run:

```
$ yo feathers:hook
```

It will be a `before` hook called `process` for the `message` service on the `create` method:

![addUser Hook](./assets/adduser.png)

In that hook we can now modify the data before sending them to the database. Although we could split each functionality into its own hook, the process hook will do three things at once:

1. Add the `_id` of the user that created the message as `userId`
2. Add a `createdAt` timestamp with the current time
3. Add an `image` for that message. It will be the [Gravatar](http://en.gravatar.com/) image for the users email address (or their placeholder)


```js
'use strict';

// src/services/message/hooks/process.js
// 
// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/hooks/readme.html

// We need this to create the MD5 hash
const crypto = require('crypto');

// The Gravatar image service
const gravatarUrl = 'https://s.gravatar.com/avatar';
// The size query. Our chat needs 60px images
const query = `s=60`;

// Returns a full URL to a Gravatar image for a given email address
const gravatarImage = email => {
  // Gravatar uses MD5 hashes from an email address to get the image
  const hash = crypto.createHash('md5').update(email).digest('hex');
  
  return `${gravatarUrl}/${hash}?${query}`;
};

module.exports = function(options) {
  return function(hook) {
    // The authenticated user
    const user = hook.params.user;
    // The actual message text
    const text = hook.data.text
      // Messages can't be longer than 400 characters
      .substring(0, 400)
      // Do some basic HTML escaping
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

    // Override the original data
    hook.data = {
      text,
      // Set the user id
      userId: user._id,
      // Add the current time via `getTime`
      createdAt: new Date().getTime(),
      // Add the Gravatar image
      image: gravatarImage(user.email)
    };
  };
};
```

This hook pre-processes our message data, adds the current user information, the users Gravatar image and the time the message was created before it gets sent to the datbaase.


## Message authorization

Finally, we need one more hook that makes sure that users can only `remove`, `update` and `patch` their own message (see [the services chapter](../services/readme.md) for more information about those methods).

Let's create a `verify` *before* hook for the `message` service that runs before those methods:

![verifyUser Hook](./assets/verifyuser.png)

And change the file at `src/services/message/hook/verifyUser.js` to:

```js
'use strict';

// src/services/message/hooks/verifyUser.js.js
// 
// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/hooks/readme.html

const errors = require('feathers-errors');

module.exports = function(options) {
  return function(hook) {
    const messageService = hook.app.service('messages');
    
    // First get the message that the user wants to access
    return messageService.get(hook.id, hook.params).then(message => {
      // Throw a not authenticated error if the message and user id don't match
      if(message.user_id !== params.user._id) {
        throw new errors.NotAuthenticated('Access not allowed');
      }
      
      // Otherwise just return the hook
      return hook;
    });
  };
};
```

That's it (for now)! We created a database backed REST and Socket.io real-time chat API with local user authentication and authorization. We used [services](../services/readme.md) and [hooks](../hooks/readme.md) which is almost everything there is to Feathers.

We already set up an index, login and signup page. In the next chapter we will briefly talk about [building a chat frontend](frontend.md) before learning more about [services](../services/readme.md) and diving into the [guides](../guides/readme.md).

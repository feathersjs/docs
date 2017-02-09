# The chat room server

At a minimum the chat server needs to:

- users
    - Allow users to sign up.
    - Allow users to sign in.
    - Maintain a list of users.
- messages
    - Restrict message posting to signed-in users.
    - Sanitize the messages, e.g. basic HTML escaping.
    - Identify which user created a message and at what time.
    - Allow users to only modify and delete their own messages.
- real-time
    - Issue user events to authenticated users when a user is created or changed.
    The password must not be sent.
    - Issue message events to authenticated users when a message is created or changed.
    - The message event data needs to contain both the message text
    and the user item for the user creating the message.

> **Avatar.** We'll display an
[avatar](http://techterms.com/definition/avatar)
for each user so their messages may be easier to identify.

We assume most readers are interested in developing modern
[Single-page applications](https://en.wikipedia.org/wiki/Single-page_application)
with Feathers.
So it would be helpful if this chat app was itself an SPA,
allowing it to act as somewhat of a design pattern for the readers' own development efforts.

### Is anything wrong, unclear, missing?
[Leave a comment.](https://github.com/feathersjs/feathers-guide/issues/new?title=Comment:Chat-Server-Readme&body=Comment:Chat-Server-Readme)

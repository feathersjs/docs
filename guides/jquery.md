# Feathers + jQuery

You don't always need a full on framework. Feathers and the [Feathers client](../clients/feathers.md) also work great to add real-time capability to a vanilla JavaScript or [jQuery](http://jquery.com/) application. In this guide we will create a jQuery front-end for the chat API built in the [Your First App](../getting-started/readme.md) section.

If you haven't done so you'll want to go through that tutorial or you can find a [working example here](https://github.com/feathersjs/feathers-chat).

> __Note:__ This guide uses ES6 syntax which is only available in newer browsers and IE edge. If you want to use the app in older browsers you need to include a transpiler like [Babel](https://babeljs.io/).


## Setting up the HTML page

The first step is getting the HTML skeleton for the chat application up. You can do so by pasting the following HTML into `public/chat.html` (which is the page the guide app redirects to after a successful login):

```html
<html>
  <head>
    <meta http-equiv="content-type" content="text/html; charset=utf-8">
    <meta name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=0" />
    <title>Feathers Chat</title>
    <link rel="shortcut icon" href="favicon.ico">
    <link rel="stylesheet" href="//cdn.rawgit.com/feathersjs/feathers-chat/v0.1.0/public/base.css">
    <link rel="stylesheet" href="//cdn.rawgit.com/feathersjs/feathers-chat/v0.1.0/public/chat.css">
  </head>
  <body>
    <div id="app" class="flex flex-column">
      <header class="title-bar flex flex-row flex-center">
        <div class="title-wrapper block center-element">
          <img class="logo" src="http://feathersjs.com/img/feathers-logo-wide.png"
            alt="Feathers Logo">
          <span class="title">Chat</span>
        </div>
      </header>

      <div class="flex flex-row flex-1 clear">
        <aside class="sidebar col col-3 flex flex-column flex-space-between">
          <header class="flex flex-row flex-center">
            <h4 class="font-300 text-center">
              <span class="font-600 online-count">0</span> users
            </h4>
          </header>

          <ul class="flex flex-column flex-1 list-unstyled user-list"></ul>
          <footer class="flex flex-row flex-center">
            <a href="/login.html" class="logout button button-primary">
              Sign Out
            </a>
          </footer>
        </aside>

        <div class="flex flex-column col col-9">
          <main class="chat flex flex-column flex-1 clear"></main>

          <form class="flex flex-row flex-space-between" id="send-message">
            <input type="text" name="text" class="flex flex-1">
            <button class="button-primary" type="submit">Send</button>
          </form>
        </div>
      </div>
    </div>
    <script src="//code.jquery.com/jquery-2.2.1.js"></script>
    <script src="//cdnjs.cloudflare.com/ajax/libs/moment.js/2.12.0/moment.js">
    </script>
    <script src="//cdn.rawgit.com/feathersjs/feathers-client/v1.0.0/dist/feathers.js">
    </script>
    <script src="/socket.io/socket.io.js"></script>
    <script src="app.js"></script>
  </body>
</html>
```

This sets everything up we need including some styles, the Feathers client, jQuery and [MomentJS](http://momentjs.com/) (to format dates).


## jQuery code

Our chat functionality will live in `public/app.js`. First, let's create some functions that use jQuery (and [ES6 strings](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)) to render a single user and message:

```js
'use strict';

// A placeholder image if the user does not have one
const PLACEHOLDER = 'https://placeimg.com/60/60/people';
// An anonymous user if the message does not have that information
const dummyUser = {
  image: PLACEHOLDER,
  email: 'Anonymous'
};
// The total number of users
let userCount = 0;

function addUser(user) {
  // Update the number of users
  $('.online-count').html(++userCount);
  // Add the user to the list
  $('.user-list').append(`<li>
    <a class="block relative" href="#">
      <img src="${user.avatar || PLACEHOLDER}" alt="" class="avatar">
      <span class="absolute username">${user.email}</span>
    </a>
  </li>`);
}

// Renders a new message and finds the user that belongs to the message
function addMessage(message) {
  // Find the user belonging to this message or use the anonymous user if not found
  const sender = message.sentBy || dummyUser;
  const chat = $('.chat');

  chat.append(`<div class="message flex flex-row">
    <img src="${sender.avatar || PLACEHOLDER}" alt="${sender.email}" class="avatar">
    <div class="message-wrapper">
      <p class="message-header">
        <span class="username font-600">${sender.email}</span>
        <span class="sent-date font-300">${moment(message.createdAt).format('MMM Do, hh:mm:ss')}</span>
      </p>
      <p class="message-content font-300">${message.text}</p>
    </div>
  </div>`);

  chat.scrollTop(chat[0].scrollHeight - chat[0].clientHeight);
}
```

Now we can set up the Feathers client. Because we also want real-time we will use a [Socket.io](../clients/socket-io.md) connection:

```js
// Establish a Socket.io connection
const socket = io();
// Initialize our Feathers client application through Socket.io
// with hooks and authentication.
const app = feathers()
  .configure(feathers.socketio(socket))
  .configure(feathers.hooks())
  // Use localStorage to store our login token
  .configure(feathers.authentication({
    storage: window.localStorage
  }));

// Get the Feathers services we want to use
const userService = app.service('users');
const messageService = app.service('messages');
```

Next, we set up event handlers for logout and when someone submits the message form:

```js
$('#send-message').on('submit', function(ev) {
  // This is the message text input field
  const input = $(this).find('[name="text"]');

  // Create a new message and then clear the input field
  messageService.create({
    text: input.val()
  }).then(message => input.val(''));

  ev.preventDefault();
});

$('.logout').on('click', function() {
  app.logout().then(() => window.location.href = '/index.html');
});
```

When submitting the form, we create a new message with the text from the input field. When clicking the logout button we will call `app.logout()` and then redirect back to the login page.

The chat application is set up to redirect from `login.html` to our `chat.html` page on successful login. This means that we already know what user is logged in so we just have to call [app.authenticate](../authentication/client.md) to authenticate that user (and redirect back to the login page if it fails). Then we retrieve the 25 newest messages, all the users and listen to events to make real-time updates:

```js
app.authenticate().then(() => {
  // Find the latest 10 messages. They will come with the newest first
  // which is why we have to reverse before adding them
  messageService.find({
    query: {
      $sort: { createdAt: -1 },
      $limit: 25
    }
  }).then(page => page.data.reverse().forEach(addMessage));

  // Listen to created events and add the new message in real-time
  messageService.on('created', addMessage);

  // Find all users
  userService.find().then(page => {
    const users = page.data;

    // Add every user to the list
    users.forEach(addUser);
  });

  // We will also see when new users get created in real-time
  userService.on('created', addUser);
})
// On unauthorized errors we just redirect back to the login page
.catch(error => {
  if(error.code === 401) {
    window.location.href = '/login.html'
  }
});
```

That's it. We now have a real-time chat application front-end built in jQuery.

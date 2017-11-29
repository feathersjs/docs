## Building a frontend

In this chapter we will create a very simple web application for the messages service [that we just created](./service.md). We won't be using a framework like jQuery, Angular, React or VueJS (for more information about those, see the [frameworks](../frameworks/readme.md) section). Instead we will go with plain old JavaScript that will work in any modern browser (latest Chrome, Firefox and the Edge Internet Explorer).

## Using Feathers on the client

We could use a REST client (making AJAX request) or websockets messages directly (both of which are totally possible with Feathers), but instead we will leverage one of the best features of Feathers, namely that it works just the same as a client in the browser, with React Native or on other NodeJS servers.

Our `public/` folder already has an `index.html` page that currently shows a generated homepage if you go to [localhost:3030](http://localhost:3030) in the browser. We will modify that page to show our chat messages and a form to send new ones.

First, let's add the browser version of Feathers to the page. We can do so by linking to a CDN that has the [client browser build](../../api/client.md) of Feathers. Update `public/index.html` to look like this:

```html
<html>
  <head>
    <meta http-equiv="content-type" content="text/html; charset=utf-8">
    <meta name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=0" />
    <title>Feathers Chat</title>
    <link rel="shortcut icon" href="favicon.ico">
  </head>
  <body>
    <div id="app" class="flex flex-column"></div>
    <script src="//unpkg.com/feathers-client@^2.0.0-pre.1/dist/feathers.js">
    </script>
    <script src="/socket.io/socket.io.js"></script>
    <script src="app.js"></script>
  </body>
</html>
```

## Connecting to the API

Now we can create `public/app.js` with the following Feathers client setup:

```js
const socket = io();
const client = feathers();
client.configure(feathers.hooks());

// Create the Feathers application with a `socketio` connection
client.configure(feathers.socketio(socket));

// Get the service for our `messages` endpoint
const messages = client.service('messages');

// Log when anyone creates a new message in real-time!
messages.on('created', message =>
  alert(`New message from ${message.name}: ${message.text}`)
);

// Create a test message
messages.create({
  name: 'Test user',
  text: 'Hello world!'
});

messages.find().then(page => console.log('Current messages are', page));
```

This will connect to our API server using Socket.io, send a test message and also listen to any new message in real-time showing it in an alert window when going to the page at [localhost:3030](http://localhost:3030). Once you have created the message you can also see that it showed up in the [localhost:3030/messages](http://localhost:3030/messages) endpoint.

> **Note:** The `feathers` namespace is added by the browser build and `io` is available through the `socket.io/socket.io.js` script. For more information on using Feathers in the browser and with a module loader like Webpack or Browserify see the [client chapter](../../api/client.md).

## Sending and displaying messages

Alright. We can create and listen to new messages and also list all messages. All that is left to do now is create some HTML from the message list and a form to create new messages. Let's update `public/index.html` with some HTML for our chat to look like this:

```html
<html>
  <head>
    <meta http-equiv="content-type" content="text/html; charset=utf-8">
    <meta name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=0" />
    <title>Feathers Chat</title>
    <link rel="shortcut icon" href="favicon.ico">
    <link rel="stylesheet" href="//cdn.rawgit.com/feathersjs/feathers-chat/v0.2.0/public/base.css">
    <link rel="stylesheet" href="//cdn.rawgit.com/feathersjs/feathers-chat/v0.2.0/public/chat.css">
  </head>
  <body>
    <div id="app" class="flex flex-column">
      <main class="flex flex-column">
        <header class="title-bar flex flex-row flex-center">
          <div class="title-wrapper block center-element">
            <img class="logo" src="http://feathersjs.com/img/feathers-logo-wide.png"
              alt="Feathers Logo">
            <span class="title">Chat</span>
          </div>
        </header>

        <div class="flex flex-row flex-1 clear">
          <div class="flex flex-column col col-12">
            <main class="chat flex flex-column flex-1 clear"></main>

            <form class="flex flex-row flex-space-between" id="send-message">
              <input type="text" placeholder="Your name" name="name" class="col col-3">
              <input type="text" placeholder="Enter your message" name="text" class="col col-7">
              <button class="button-primary col col-2" type="submit">Send</button>
            </form>
          </div>
        </div>
      </main>
    </div>
    <script src="//unpkg.com/feathers-client@^2.0.0-pre.1/dist/feathers.js">
    </script>
    <script src="/socket.io/socket.io.js"></script>
    <script src="app.js"></script>
  </body>
</html>
```

Then we can update `public/app.js` with the functionality to get, show and send messages like this:

```js
const socket = io();
const client = feathers();

// Create the Feathers application with a `socketio` connection
client.configure(feathers.socketio(socket));

// Get the service for our `messages` endpoint
const messages = client.service('messages');

// Add a new message to the list
function addMessage(message) {
  const chat = document.querySelector('.chat');

  chat.insertAdjacentHTML('beforeend', `<div class="message flex flex-row">
    <img src="https://placeimg.com/64/64/any" alt="${message.name}" class="avatar">
    <div class="message-wrapper">
      <p class="message-header">
        <span class="username font-600">${message.name}</span>
      </p>
      <p class="message-content font-300">${message.text}</p>
    </div>
  </div>`);

  chat.scrollTop = chat.scrollHeight - chat.clientHeight;
}

messages.find().then(page => page.data.forEach(addMessage));
messages.on('created', addMessage);

document.getElementById('send-message').addEventListener('submit', function(ev) {
  const nameInput = document.querySelector('[name="name"]');
  // This is the message text input field
  const textInput = document.querySelector('[name="text"]');

  // Create a new message and then clear the input field
  client.service('messages').create({
    text: textInput.value,
    name: nameInput.value
  }).then(() => {
    textInput.value = '';
  });
  ev.preventDefault();
});
```

If you now open [localhost:3030](http://localhost:3030) you can see an input field for your name and the message which will show up in other browsers in real-time.

## What's next?

In this chapter we looked at how to use Feathers on the client and created a simple real-time chat application frontend to show and send messages. In the next chapters we will move back to the server and add [authentication](./authentication.md) and learn about [processing data](./processing.md).


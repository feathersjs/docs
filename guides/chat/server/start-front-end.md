# Starting the front-end

We're going to start writing an SPA client in plain JavaScript.
Our goal is to get authentication working
and to rerun the tests of the last section using the client.

### Working example

- Server code: [examples/chat/server/client/](https://github.com/feathersjs/feathers-guide/blob/master/examples/chat/server/client/)
- Client code: [public/socketio.html](https://github.com/feathersjs/feathers-guide/blob/master/examples/chat/server/client/public/socketio.html)
and
[socketio-app.js](https://github.com/feathersjs/feathers-guide/blob/master/examples/chat/server/client/public/socketio-app.js)
- Start the server: `node ./examples/chat/server/client/src`
- Point the browser at: `//localhost:3030/socketio.html`
- Compare with the app on the last page
[Unified](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-guide/blob/master/examples/chat/_diff/server-client-line.html)
|
[Split](http://htmlpreview.github.io/?https://github.com/feathersjs/feathers-guide/blob/master/examples/chat/_diff/server-client-side.html)

### Client HTML

The [client HTML](https://github.com/feathersjs/feathers-guide/blob/master/examples/chat/server/client/public/socketio.html)
is similar to that used in
[Writing a Feathers Websocket Client](../../step-by-step/basic-feathers/socket-client.md).

The page is divided into 3 sections identified by ids sign-up, sign-in and chat.
They contain what you would expect of them.

```HTML
<div id="sign-up">
  <h3>Sign up</h3>
   <input type="text" id="email-signup" placeholder="email: a@a.com" size="15" />
  <input type="text" id="password-signup" placeholder="password: a" size="15" />
  <br />
  <input type="button" id="signup-user" value="Add user" />
  <input type="button" id="to-signin-user" value="Sign in" />
</div>
<div id="sign-in" style="display: none;">
  <h3>Sign in</h3>
  <input type="text" id="email-signin" placeholder="email: a@a.com" size="15" />
  <input type="text" id="password-signin" placeholder="password: a" size="15" />
  <br />
  <input type="button" id="signin-user" value="Sign in" />
  <input type="button" id="to-signup-user" value="Sign up" />
</div>
<div id="chat" style="display: none;">
  <h3>Chat room</h3>
  <input type="text" id="message" placeholder="New message" size="30" />
  <br />
  <input type="button" id="send-message" value="Send message" />
  <input type="button" id="signout-user" value="Sign out" />
</div>
```

The sign-up section is displayed initially.

### Router

The
[client](https://github.com/feathersjs/feathers-guide/blob/master/examples/chat/server/client/public/socketio-app.js)
has a basic router to handle the 3 sections of the HTML.
[import:'router'](../../examples/chat/server/client/public/socketio-app.js)
```javascript
function handleClick(id, func) {
  document.getElementById(id).addEventListener('click', func);
}
```

- The client source starts by defining event handlers for all the HTML buttons.

- Our primitive SPA page router `router` displays the proper section for the next route.
So when the button `to-signin-user`, the router is called to display the `sign-in` section.

- The DOM nodes for the section `div` and `input` tags are gathered.

### Feathers events on the client

The
[client](https://github.com/feathersjs/feathers-guide/blob/master/examples/chat/server/client/public/socketio-app.js)
responds to Feathers events:
[import:'events'](../../examples/chat/server/client/public/socketio-app.js)

- `userList` will contain the users, once we ourselves are authenticated.

- The Feathers client configuration is completed,
and the services are defined.

- This section consists mainly of service event handlers.
`userList` is updated on every change in the users table.
Information is logged every time there is a change in the messages table.

### Feathers events on the server

We don't want to send users or messages events to clients
until they have authenticated their users.
So we set up event filters on
[user/index.js](https://github.com/feathersjs/feathers-guide/blob/master/examples/chat/server/client/src/services/user/index.js)

```javascript
// Send user events only to authenticated users. The remove hook already removed the password.
userService.filter((data, connection) => connection.user ? data : false);
````
and
[message/index.js](https://github.com/feathersjs/feathers-guide/blob/master/examples/chat/server/client/src/services/message/index.js)
```javascript
// Send message events only to authenticated users.
messageService.filter((data, connection) => connection.user ? data : false);
````

### Helpers for users

Now let's add helpers to the
[client](https://github.com/feathersjs/feathers-guide/blob/master/examples/chat/server/client/public/socketio-app.js)
to handle events related to users.
[import:'user-helpers'](../../examples/chat/server/client/public/socketio-app.js)

- `signUpUser` is called when `signup-user` is clicked.
It adds a user item, and then displays the `sign-in` section.

- `signInUser` is called when `signin-user` is clicked.
It authenticates the user and, when successful,
gets the current `userList`.
Finally it displays the `chat` section.

- `signOutUser` is called when `signout-user` is clicked.
It logs the user off and then displays the `sign-in` section.

- `getUserList` reads all the user items.

### Helpers for messages

Finally add helpers to the
[client](https://github.com/feathersjs/feathers-guide/blob/master/examples/chat/server/client/public/socketio-app.js)
to handle events related to messages.
[import:'message-helpers'](../../examples/chat/server/client/public/socketio-app.js)

- `sendMessage` add the new message to the messages table.
This will cause that message to be sent to all connected clients
by the messages real-time event.

### Running the client

That's really all we need for the client at this time.

Start the server in one terminal with `node ./examples/chat/server/client/src`.
It will display:
```text
feathers-guide$ node ./examples/chat/server/client/src
Feathers application started on localhost:3030
messages table cleared.
users table cleared.
```

Point the browser at: `//localhost:3030/socketio.html`.

- Sign up page:
    - Enter `ying@qq.cn` for the email.
    - Enter `ying123` for the password.
    - Click `Add user`
- Sign in page:
    - Enter `ying@qq.cn` for the email.
    - Enter `ying123` for the password.
    - Click `Sign in`
- Chat page:
    - Enter `新年快樂` (Happy New Year in Chinese) for the text.
    - Click `Send message`.
    
The console will display
```text
Users in chat
["ying@qq.cn"]
message created
{ _id: "Wvm38PB310eykSSB",
  text: "新年快樂" }
```

### Is anything wrong, unclear, missing?
[Leave a comment.](https://github.com/feathersjs/feathers-guide/issues/new?title=Comment:Chat-Server-Start-frontend&body=Comment:Chat-Server-Start-frontend)

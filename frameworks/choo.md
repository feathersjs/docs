# Feathers + choo

[Choo](https://github.com/yoshuawuyts/choo) is a framework for creating sturdy frontend applications. You can use the [Feathers client](../clients/feathers.md) to add backend services to a [choo](https://github.com/yoshuawuyts/choo) application. Let `choo` take care of the client and let `Feathers` do the heavy lifting for communicating with your server and managing your data. In this guide we will create a `choo` front-end for the chat API built in the [Your First App](../getting-started/readme.md) section.

If you haven't done so you'll want to go through that tutorial or you can find a [working example here](https://github.com/feathersjs/feathers-chat).

## Setting up the HTML page

The first step is getting the HTML skeleton for the chat application up. You can do so by pasting the following HTML into `public/chat.html` (which is the page the guide app redirects to after a successful login):

```html
<html>
<head>
  <meta http-equiv="content-type" content="text/html; charset=utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=0"/>
  <title>Feathers Chat</title>
  <link rel="shortcut icon" href="../favicon.png">
  <link rel="stylesheet" href="../base.css">
  <link rel="stylesheet" href="../chat.css">
</head>
<body>

  <script src="app.js"></script>

</body>
</html>
```
The styles might also be included in the app using `sheetify` but, for the purpose of this example, we will leave them where they are and focus on the `app.js`.

## Bootstrapping the choo application

Our chat functionality will live in the `public/app.js` bundle
which will be generated from the `src` folder. We will use  the [choo-cli](https://github.com/trainyard/choo-cli) generator to bootstrap the `src` folder:

```bash
npm install choo-cli -g
cd public
choo new src
```

This installs the `choo-cli` generator and generates a new `choo` project inside the `src` folder, see the `src/readme.md` file for further details about the structure of the generated project.

Next we need to install the `feathers-client` and `socket.io` dependencies and some other dev-dependencies for building and logging:

```bash
cd src
npm i -S feathers-client socket.io-client moment choo-log
npm i -D envify unassertify uglifyify sheetify
```

Add the following lines to the `public/src/package.json` file, inside the `scripts` section:

```json
"build:prod": "NODE_ENV=production browserify -e client.js -o ../app.js -t envify -t sheetify/transform -g unassertify -g es2040 -g uglifyify | uglifyjs",
"build:dev": "NODE_ENV=development browserify -d -e client.js -o ../app.js -t sheetify/transform -g es2040"
```

Now you can build the `public/app.js` bundle by running, inside the `public/scr` folder:

```bash
npm run build:dev
```

> **ProTip:** If you want to build a minified file, or if you want to watch the files while you develop and automatically generate the bundle when you save changes you can run:
```
npm run build:prod
# npm install nodemon -g
nodemon -x 'npm run build:dev'
```

We are now done with bootstrapping the project and we can start building the chat functionality.

## Building the chat client app

The main entry to your app is the `src/client.js` file:

```js
const choo = require('choo')
const app = choo()

// this block of code will be eliminated by any minification if
// NODE_ENV is set to "production"
if (process.env.NODE_ENV !== 'production') {
  const log = require('choo-log')
  app.use(log())
}

app.model(require('./models/app'))

app.router((route) => [
  route('/', require('./pages/home'))
])

const tree = app.start()

document.body.appendChild(tree)

```

This sets up your choo app by importing the chat-app model and redirecting to the main page, which is then injected into the document. See the [choo](https://github.com/yoshuawuyts/choo) documentation for further details.

### The main page

The `src/pages/home.js` file is the main page containing the client chat functionality:

```js
const html = require('choo/html')
const messageList = require('../elements/message-list')
const userList = require('../elements/user-list')

module.exports = (state, prev, send) => html`
  <main>
    <div id="app" class="flex flex-column">
      <header class="title-bar flex flex-row flex-center">
        <div class="title-wrapper block center-element">
          <span>
            <img class="logo" src="http://feathersjs.com/img/feathers-logo-wide.png" alt="Feathers Logo">
          </span>

          <span style="font-size: xx-large; font-family: monospace; opacity: 0.7;">
            <g-emoji alias="steam_locomotive" fallback-src="https://assets-cdn.github.com/images/icons/emoji/unicode/1f682.png"> <img src="https://assets-cdn.github.com/images/icons/emoji/unicode/1f682.png" alt=":steam_locomotive:" class="emoji" height="20" width="20"></g-emoji><g-emoji alias="train" fallback-src="https://assets-cdn.github.com/images/icons/emoji/unicode/1f68b.png"><img src="https://assets-cdn.github.com/images/icons/emoji/unicode/1f68b.png" alt=":train:" class="emoji" height="20" width="20"></g-emoji>choo</span>
          <span class="title">Chat </span>

          <span style="font-size: medium; margin-left: 7px; opacity: 0.7;">
            Logged in as: ${
              state.authenticated
              ? state.currentUser.email
              : state.currentUser
            }
          </span>
        </div>
      </header>
      <div class="flex flex-row flex-1 clear">
        ${userList(state, prev, send)}
        ${messageList(state, prev, send)}
      </div>
    </div>
  </main>
`
```

This contains the page frame and includes the two main ui components `userList` and `messageList`.

### The application model

The `src/models/app.js` file manages the application state, the flow of data from `feathers` services `users` and `messages`, and user actions from the page components:

```js
// Initialize Feathers app
const fapp = require('./feathers-app')

// Get the Feathers services we want to use
const userService = fapp.service('users')
const messageService = fapp.service('messages')

module.exports = {
  subscriptions: [
    // asynchronous read-only operations that don't modify state directly.
    // Can call actions. Signature of (send, done).
    /*
    (send, done) => {
      // do stuff
    }
    */
    (send, done) => {
      fapp.authenticate()
      .then((res) => {
        send('authenticate', {value: true}, () => {
          send('setUser', {user: fapp.get('user')}, () => {})

          // Find all users
          userService.find()
          .then((data) => {
            send('concatUsers', {value: data.data}, () => {})
          })
          .catch((err) => { console.error(err) })

          // We will also see when new users get created in real-time
          userService.on('created', user => {
            send('concatUsers', {value: [ user ]}, () => {})
          })

          // Find the latest 10 messages. They will come with the newest first
          // which is why we have to reverse before adding them
          messageService.find({
            query: {
              $sort: {createdAt: -1},
              $limit: 25
            }
          }).then(page => {
            page.data.reverse()
            send('concatMessages', {value: page.data}, () => {})
            send('scrollToBottom', {}, () => {})
          })

          // Listen to created events and add the new message in real-time
          messageService.on('created', message => {
            send('concatMessages', {value: [message]}, () => {})
            send('scrollToBottom', {}, () => {})
          })
        })
      })
      // On errors we just redirect back to the login page
      .catch(error => {
        if (error.code === 401) window.location.href = '/login.html'
      })
    }
  ],
  effects: {
    // asynchronous operations that don't modify state directly.
    // Triggered by actions, can call actions. Signature of (data, state, send, done)
    /*
    myEffect: (data, state, send, done) => {
      // do stuff
    }
    */
    logOut: (data, state, send, done) => {
      fapp.logout()
        .then(() => {
          send('setUser', { user: 'anonymous guest' }, () => {})
          send('authenticate', { value: data.value }, () => {})
          // send('location:setLocation', { location: href })
          window.location.href = '/login.html'
        })
        .catch(error => {
          console.error(error)
        })
    },
    createMessage: (data, state, send, done) => {
      // Create a new message from the input field
      messageService.create({text: data.value})

      // Local choo client only version
      // send('concatMessages', { value: [{
      //   sentBy: {
      //     avatar: state.currentUser.avatar,
      //     email: state.currentUser.email
      //   },
      //   createdAt: time,
      //   text: data.value
      // }] }, () => {})
    },
    scrollToBottom: () => setTimeout(() => {
      document.querySelector('#app > div > div > main > div:last-child').scrollIntoView(true)
    }, 500)
  },
  reducers: {
    /* synchronous operations that modify state. Triggered by actions. Signature of (data, state). */
    concatUsers: (action, state) => ({
      usersList: state.usersList.concat(action.value)
    }),
    concatMessages: (action, state) => ({
      messagesList: state.messagesList.concat(action.value)
    }),
    updateCurentMessage: (action, state) => ({
      currentMessage: action.value
    }),
    authenticate: (action, state) => ({ authenticated: action.value }),
    setUser: (action, state) => ({ currentUser: action.user })
  },
  state: {
    /* initial values of state inside the model */
    usersList: [ ],
    authenticated: false,
    currentUser: 'anonymous guest',
    messagesList: [ ],
    currentMessage: ''
  }
}
```

The `subscriptions` manage the flow of data from the server, these are handled by setting up a `fapp` subapp with `feathers` and using the bundled services from inside the `choo` app.

The `feathers` application is set up to redirect from `login.html` to the `chat.html` page on successful login. This means that we already know what user is logged in so we just have to call `fapp.authenticate` to authenticate that user (and redirect back to the `login` page if it fails). Then we retrieve the 25 newest messages, all the users and listen to `created` events on the `user` and `message` services to make real-time updates. In the  `effects` section we also set up event handlers, for logout and when someone submits the message form. We also have a method that will scroll this view to the bottom after we've added a new message to the view. Finally, the `reducers` cahnge the application`state`. See the [choo](https://github.com/yoshuawuyts/choo) documentation for further details.

### Flow of data from the server

The `src/models/feathers-app.js` file sets up a familiar client-side `feathers` application:

```js
// Setting up socket.io
const io = require('socket.io-client')
// Establish a Socket.io connection
const socket = io('http://localhost:3030')

// Setting up Feathers
const feathers = require('feathers-client')

// Initialize our Feathers client application through Socket.io
// with hooks and authentication.
const app = feathers()
  .configure(feathers.socketio(socket))
  .configure(feathers.hooks())
  // Use localStorage to store our login token
  .configure(feathers.authentication({
    storage: window.localStorage
  }))

module.exports = app
```

Real time `socket-io` events, `hooks` and `authentication` are handled by the `feathers` application.

Next we will generate the needed page elements:

```bash
choo generate element message-list
choo generate element message
choo generate element compose-message
choo generate element user-list
```

The `src/elements/message-list.js` file will display the messages received from the server:

```js
// Element: messageList
//
// We can use bel instead of choo/html to keep elements modular
// and allow them to easily move outisde of the app.
const html = require('bel')

const composeMessage = require('../elements/compose-message')
const message = require('../elements/message')

function messageList (state, prev, send) {
  return html`
  <div class="flex flex-column col col-9">
    <main class="chat flex flex-column flex-1 clear">
        ${state.messagesList.map(x => {
          return message(x)
        })}
    </main>

    ${composeMessage(state, prev, send)}

  </div>
  `
}

module.exports = messageList
```

The `messageList` element is responsible for displaying a list of messages, whenever a new message has been created on the backend, it's sent to the client via websockets and added to the messages array. Within the `messageList` element we have a `message` element,  the `src/elements/message.js` file is:

```js
// Element: message
//
// We can use bel instead of choo/html to keep elements modular
// and allow them to easily move outisde of the app.
const html = require('bel')

const moment = require('moment')

const PLACEHOLDER = 'http://b.dryicons.com/images/icon_sets/distortion_icons_set/png/128x128/user.png'

function message (msg) {
  return html`
  <div class="message flex flex-row">
    <img src=${msg.sentBy ? msg.sentBy.avatar : PLACEHOLDER} alt=${msg.sentBy ? msg.sentBy.email : 'Anonymous'} class="avatar">
    <div class="message-wrapper">
      <p class="message-header">
        <span class="username font-600">${msg.sentBy ? msg.sentBy.email : 'Anonymous'}</span>
        <span class="sent-date font-300">${msg.createdAt ? moment(msg.createdAt).format('MMM Do, hh:mm:ss') : moment(0).format('MMM Do, hh:mm:ss')}</span>
      </p>
      <p class="message-content font-300">${msg.text ? msg.text : 'default text'}</p>
    </div>
  </div>
  `
}

module.exports = message
```

Its job is to simply render each message correctly. As the `messageList` component maps over the messages list, it passes the current message into the `message` element as a prop and we use a `moment` to format the date.

### User actions from page elements

The `src/elements/user-list.js` file displays the users and hadles the `logout` action:

```js
// Element: userList
//
// We can use bel instead of choo/html to keep elements modular
// and allow them to easily move outisde of the app.
const html = require('bel')

// A placeholder image if the user does not have one
// const PLACEHOLDER = 'https://placeimg.com/60/60/people'
const PLACEHOLDER = 'http://b.dryicons.com/images/icon_sets/distortion_icons_set/png/128x128/user.png'

// An anonymous user if the message does not have that information
const dummyUser = {
  avatar: PLACEHOLDER,
  email: 'Anonymous'
}

function userList (state, prev, send) {
  return html`
  <aside class="sidebar col col-3 flex flex-column flex-space-between">
    <header class="flex flex-row flex-center">
      <h4 class="font-300 text-center"><span class="font-600 online-count">{{ users.length }}</span> users</h4>
    </header>
    <ul class="flex flex-column flex-1 list-unstyled user-list">
      ${state.usersList.map(x => html`
        <li>
          <a class="block relative" href="#">
          <img src=${x.avatar || dummyUser.avatar} alt="avatar" class="avatar">
          <span class="absolute username">
            ${x.email || dummyUser.email}
          </span>
          </a>
        </li>
        `)
      }
    </ul>
    <footer class="flex flex-row flex-center">
      <a href="/login.html" class="logout button button-primary"
        onclick=${(e) => {
          console.log(e)
          send('logOut', { value: false })
        }}
      >
        Sign Out
      </a>
    </footer>
  </aside>
  `
}

module.exports = userList

```

We then have a `userList` component which displays the users. The `logout` button dispatches a `logOut` action which will redirect to the index page after successfully logging-out.

Finally, we have the `src/elements/compose-message.js` file:

```js
// Element: composeMessage
//
// We can use bel instead of choo/html to keep elements modular
// and allow them to easily move outisde of the app.
const html = require('bel')

function composeMessage (state, prev, send) {
  return html`
  <form class="flex flex-row flex-space-between" id="send-message" action="">
    <input type="text" name="text" class="flex flex-1"
      value="${state.currentMessage}"
      oninput=${e => send('updateCurentMessage', { value: e.target.value })}
    >
    <button class="button-primary" type="submit"
      onclick=${(e) => {
        e.preventDefault()
        e.stopPropagation()
        send('createMessage', { value: state.currentMessage }, () => {})
        send('updateCurentMessage', { value: '' })
      }}
    >
      Send
    </button>
  </form>
  `
}

module.exports = composeMessage

```

The `composeMessage` component shows a form that when submitted creates a new message on the `feathers` messages service and clears out the input field.

That's it. We now have a real-time chat application front-end built in choo.

You can now open the chat app by running the `feathers` server from the root of the `chat` project:

```bash
npm start
```

and then opening the `choo-chat` client page in your browser:

```bash
chromium-browser http://localhost:3030/chat.html --new-window --auto-open-devtools-for-tabs
```

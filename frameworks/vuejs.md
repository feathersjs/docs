# Feathers + Vue.js
[Vue.js](http://vuejs.org) allows you to easily build *reactive components for modern web Interfaces*, which makes it ideal for building real-time applications with Feathers. Let Vue.js take care of the client and let [Feathers client](../clients/feathers.md) do the heavy lifting for communicating with your server and managing your data.

In this guide we will create a plain Vue.js web front-end for the chat API built in the [Your First App](../getting-started/readme.md) section.

If you haven't done so you'll want to go through that tutorial or you can find a [working example here](https://github.com/feathersjs/feathers-chat).

> **Vue 2.0 vs. 1.0** This Guide has been updated for Vue 2.0, which was released on Sept. 30th, 2016. If you worked with Vue 1.0.\* previously, we recommend to update to the latest version. You can find the new documentation [here](http://vuejs.org/v2/guide/index.html). Take a look into the  Migration Guide [here](http://vuejs.org/v2/guide/migration.html) to see what has changed and how to migrate

## Setting up the HTML page

The Vue.js and Feathers client modules can be loaded individually via [npm](https://www.npmjs.com/) through a module loader like [Webpack](https://webpack.github.io/). To get up and running more quickly for this guide though, let's use the following HTML page as `public/chat.html`:

```html
<html>
<head>
  <meta http-equiv="content-type" content="text/html; charset=utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=0"/>
  <title>Feathers Chat</title>
  <link rel="stylesheet" href="//cdn.rawgit.com/feathersjs/feathers-chat/v0.1.0/public/base.css">
  <link rel="stylesheet" href="//cdn.rawgit.com/feathersjs/feathers-chat/v0.1.0/public/chat.css">
</head>
<body>

<div id="#app">
  <chat-app v-if="user.authenticated">
    <user-list></user-list>
    <message-list>
      <compose-message></compose-message>
    </message-list>
  </chat-app>
</div>

<template id="chat-app-template">
  <div id="app" class="flex flex-column">
    <header class="title-bar flex flex-row flex-center">
      <div class="title-wrapper block center-element">
        <img class="logo" src="http://feathersjs.com/img/feathers-logo-wide.png" alt="Feathers Logo">
        <span class="title">Chat</span>
      </div>
    </header>
    <div class="flex flex-row flex-1 clear">

      <!-- Slots/transclusion (Angular). See http://vuejs.org/guide/components.html#Single-Slot -->
      <slot></slot>

    </div>
  </div>
</template>


<template id="user-list-template">
  <aside class="sidebar col col-3 flex flex-column flex-space-between">
    <header class="flex flex-row flex-center">
      <h4 class="font-300 text-center"><span class="font-600 online-count" v-cloak>{{ users.length }}</span> users</h4>
    </header>
    <ul class="flex flex-column flex-1 list-unstyled user-list">
      <li v-for="(user, index) in users" :key="index" v-cloak>
        <a class="block relative" href="#">
          <img :src="user.avatar || dummyUser.avatar" alt="" class="avatar">
          <span class="absolute username">{{ user.email || dummyUser.email }}</span>
        </a>
      </li>
    </ul>
    <footer class="flex flex-row flex-center">
      <a href="#" class="logout button button-primary" @click="logout">Sign Out</a>
    </footer>
  </aside>
</template>


<template id="message-list-template">
  <div class="flex flex-column col col-9">
    <main class="chat flex flex-column flex-1 clear">
      <div class="message flex flex-row" v-for="(message, index) in messages" :key="index" v-cloak>
        <message :message=message></message>
      </div>
    </main>

    <slot></slot>

  </div>
</template>


<template id="message-template">
  <img :src="message.sentBy.avatar || placeholder" :alt="message.sentBy.email" class="avatar">
  <div class="message-wrapper">
    <p class="message-header">
      <span class="username font-600">{{ message.email }}</span>
      <span class="sent-date font-300">{{ message.createdAt | moment }}</span>
    </p>
    <p class="message-content font-300">{{ message.text }}</p>
  </div>
  </div>
</template>


<template id="compose-message-template">
  <form class="flex flex-row flex-space-between" id="send-message" v-on:submit.prevent>
    <input type="text" name="text" class="flex flex-1" v-model="newMessage">
    <button class="button-primary" type="submit" @click="addMessage">Send</button>
  </form>
</template>


<script src="https://cdnjs.cloudflare.com/ajax/libs/vue/2.0.5/vue.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/moment.js/2.15.2/moment.js"></script>
<script src="//rawgit.com/feathersjs/feathers-client/v1.7.1/dist/feathers.js"></script>
<script src="/socket.io/socket.io.js"></script>
<script src="app.js"></script>
</body>
</html>
```

> **ProTip:** This setup is not recommended for a production environment. Instead, it is recommended that you use Webpack to compile your client-app or [Vue-CLI](https://github.com/vuejs/vue-cli) which can scaffold an app for you, complete with build tools etc. You then just need to use the Feathers client modules [in the client chapter](../clients/feathers.md).

## Application Bootstrap

All of the code examples that follow should be appended to the `app.js` file, which the HTML file already loads. The first step is to add a placeholder user in the event that a user image or other user information doesn't exist:

```javascript
// A placeholder image if the user does not have one
const PLACEHOLDER = 'https://placeimg.com/60/60/people';

// An anonymous user if the message does not have that information
const dummyUser = {
  avatar: PLACEHOLDER,
  email: 'Anonymous'
}
```

Now we can add this code to set up the Socket.io connection and the Feathers app:

```javascript
// Establish a Socket.io connection
const socket = io()

// Initialize our Feathers client application through Socket.io
// with hooks and authentication.
const app = feathers()
  .configure(feathers.socketio(socket))
  .configure(feathers.hooks())
  // Use localStorage to store our login token
  .configure(feathers.authentication({
    storage: window.localStorage
  }))

  // Get the Feathers services we want to use
const userService = app.service('users');
const messageService = app.service('messages');
```

## Initialising our Vue instance
We need to now initialize our Vue instance and handle authentication. If the user is authenticated, we set `this.user.authenticate = true` and the `v-if` directive on the `<chat-app>` component will evaluate to true, thus revealing the app.

```js
var vm = new Vue({
  el: '#app',
  data: {
    user: {
      authenticated: false
    }
  },

  created () {
    app.authenticate().then(() => {
      this.user.authenticated = true
    })
    // On errors we just redirect back to the login page
    .catch(error => {
      if (error.code === 401) window.location.href = '/login.html'
    });
  }
})
```

## Adding components

In `chat.html`, we added some custom components and their corresponding templates, all with unique `id` attributes. If you are unsure of the usage of `<slots>`, please check the [Vue Documentation](http://vuejs.org/v2/guide/components.html#Content-Distribution-with-Slots) on the subject. For those that are familiar with Angular, Vue calls this *content distribution*, otherwise known as *transclusion* in Angular.

As you can see in the below markup, within `chat.html` we have a main parent component and some nested components. Also note that within the `<message-list>` template, we loop over a `message` component and bind `message` to a `message` prop which gets passed into the `message` component.

```html
<chat-app v-if="user.authenticated">
  <user-list></user-list>
  <message-list>
    <compose-message></compose-message>
  </message-list>
</chat-app>
...
...
...
<div class="message flex flex-row" v-for="(message, index) in messages" :key="index" v-cloak>
    <message :message=message></message>
</div>
```

Each of your components will use the Feathers application we initialized above.


The first component is a wrapper for our app. By checking if the user is authenticated here, we ensure that the user doesn't see our page for a split-second before the JavaScript kicks in. Other than that, this component doesn't do a whole lot but binds to its template in `chat.html`.

```js
Vue.component('chat-app', {
  template: '#chat-app-template'
})
```


We then have a `<user-list>` component which fetches the users from the `users` Feathers service once the component is ready. We also listen for events coming from the server to know when a new user has been created and we add them to the `users` array (`this.users.push(user)`).

The only method within this component is a `logout` method which will redirect the user back to the index page after successfully logging-out.

```js
Vue.component('user-list', {
  template: '#user-list-template',

  data () {
    return {
      dummyUser: dummyUser,
      users: []
    }
  },

  mounted () {
    // Find all users
    userService.find().then(page => {
      this.users = page.data
    })

    // We will also see when new users get created in real-time
    userService.on('created', user => {
      this.users.push(user)
    })
  },

  methods: {
    logout () {
      app.logout().then(() => {
        vm.user.authenticated = false
        window.location.href = '/index.html'
      })
    }
  }
})
```

The `<message-list>` component is responsible for getting the messages from the Feathers server and much like the `<user-list>` component, whenever a new message has been created on the backend, it's sent to the client via websockets and pushed on to the `messages` array.

We then have a method that will scroll this view to the bottom after we've added a new message to the view.

```js
Vue.component('message-list', {
  template: '#message-list-template',

  data () {
    return {
      placeholder: PLACEHOLDER,
      messages: []
    }
  },

  mounted () {
    // Find the latest 10 messages. They will come with the newest first
    // which is why we have to reverse before adding them
    messageService.find({
      query: {
        $sort: {createdAt: -1},
        $limit: 25
      }
    }).then(page => {
      page.data.reverse()
      this.messages = page.data
      this.scrollToBottom()
    })

    // Listen to created events and add the new message in real-time
    messageService.on('created', message => {
      this.messages.push(message)
      this.newMessage = ''
      this.scrollToBottom()
    })
  },

  methods: {
    scrollToBottom () {
      this.$nextTick(() => {
        const node = vm.$el.getElementsByClassName('chat')[0]
        node.scrollTop = node.scrollHeight
      })
    }
  }
})
```

Within the `<message-list>` component you'll notice that we have a `<message>` component. Its job is to simply render each message correctly. As the `<message-list>` component loops over each message, it passes the current message into the `<message>` component as a prop and we use a Vue filter to format the date (refer to the `message-list-template` template.

```js
Vue.component('message', {
  props: ['message', 'index'],
  template: '#message-template',
  filters: {
    moment (date) {
      return moment(date).format('MMM Do, hh:mm:ss')
    }
  }
})
```

The `<compose-message>` component shows a form that when submitted creates a new message on the Feathers `messages` service and clears out the input field.

```js
Vue.component('compose-message', {
  template: '#compose-message-template',

  data () {
    return {
      newMessage: ''
    }
  },

  methods: {
    addMessage () {
      // Create a new message and then clear the input field
      messageService.create({text: this.newMessage}).then(this.newMessage = '')
    }
  }
})
```

## Further study
The Vue documentation is a fantastic source of reference. As your app grows, you may become interested in introducing Vuex, a state management library for Vue that's based heavily on Redux.

Below is an introduction to using Vuex with Vue and Feathers on the backend (using Vue 1.0).

[![Realtime Vue.js and Feathers.js Example](http://i.imgur.com/MhYLgxb.png)](https://www.youtube.com/watch?v=zbhYcxr5ldk "Realtime Vue.js and Feathers.js Example ")

> Mad ♥️ to [Niall O'Brien](https://twitter.com/niall_obrien) for putting together the video.

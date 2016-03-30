# Feathers + React

[React](https://facebook.github.io/react/) is *a JavaScript library for building user interfaces*, which makes it ideal for building real-time applications with Feathers. Let React take care of the view rendering and let [Feathers client](../clients/feathers.md) do the heavy lifting for communicating with your server and managing your data.

In this guide we will create a plain React web front-end for the chat API built in the [Your First App](../getting-started/readme.md) section.

If you haven't done so you'll want to go through that tutorial or you can find a [working example here](https://github.com/feathersjs/feathers-chat).


## Setting up the HTML page

React and the Feathers client modules can be loaded individually via [npm](https://www.npmjs.com/) through a module loader like [Webpack](https://webpack.github.io/). To get up and running more quickly for this guide though, let's use the following HTML page as `public/chat.html`:

```html
<html>
  <head>
    <meta http-equiv="content-type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=0" />
    <title>Feathers Chat</title>
    <link rel="shortcut icon" href="img/favicon.png">
    <link rel="stylesheet" href="//cdn.rawgit.com/feathersjs/feathers-chat/v0.1.0/public/base.css">
    <link rel="stylesheet" href="//cdn.rawgit.com/feathersjs/feathers-chat/v0.1.0/public/chat.css">

    <script src="//fb.me/react-0.14.7.min.js"></script>
    <script src="//fb.me/react-dom-0.14.7.min.js"></script>
    <script src="//cdnjs.cloudflare.com/ajax/libs/babel-core/5.8.23/browser.min.js"></script>
    <script src="//cdnjs.cloudflare.com/ajax/libs/moment.js/2.12.0/moment.js"></script>
    <script src="//rawgit.com/feathersjs/feathers-client/master/dist/feathers.js"></script>
    <script src="/socket.io/socket.io.js"></script>
    <script type="text/babel" src="app.jsx"></script>
  </head>
  <body>
  </body>
</html>
```

> **ProTip:** This setup is not recommended for a production environment because [Babel](https://babeljs.io/) will transpile our `public/app.jsx` every time on the fly in the browser. Find out how to use React with NPM [in the React documentation](https://facebook.github.io/react/docs/getting-started.html#using-react-from-npm) and how to use the Feathers client modules [in the client chapter](../clients/feathers.md).

## Application Bootstrap

All of the code examples that follow should be appended to the `public/app.jsx` file, which the HTML file already loads. The first step is to add a placeholder user in the event that a user image or other user information doesn't exist:

```javascript
// A placeholder image if the user does not have one
const PLACEHOLDER = 'https://placeimg.com/60/60/people';
// An anonymous user if the message does not have that information
const dummyUser = {
  avatar: PLACEHOLDER,
  email: 'Anonymous'
};
```

Now we can add this code to set up the Socket.io connection and the Feathers app:

```javascript
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
```

## Adding components

Each of your components will use the Feathers application we initialized above. The first component shows a form that when submitted creates a new message on the `messages` service:

```javascript
const ComposeMessage = React.createClass({
  getInitialState() {
    return { text: '' };
  },

  updateText(ev) {
    this.setState({ text: ev.target.value });
  },

  sendMessage(ev) {
    // Get the messages service
    const messageService = app.service('messages');
    // Create a new message with the text from the input field
    messageService.create({
      text: this.state.text
    }).then(() => this.setState({ text: '' }));

    ev.preventDefault();
  },

  render() {
    return <form className="flex flex-row flex-space-between"
        onSubmit={this.sendMessage}>
      <input type="text" name="text" className="flex flex-1"
        value={this.state.text} onChange={this.updateText} />
      <button className="button-primary" type="submit">Send</button>
    </form>;
  }
});
```

The next component shows a list of user and allows to log out of the application;

```javascript
const UserList = React.createClass({
  logout() {
    app.logout().then(() => window.location.href = '/index.html');
  },

  render() {
    const users = this.props.users;

    return <aside className="sidebar col col-3 flex flex-column flex-space-between">
      <header className="flex flex-row flex-center">
        <h4 className="font-300 text-center">
          <span className="font-600 online-count">{users.length}</span> users
        </h4>
      </header>

      <ul className="flex flex-column flex-1 list-unstyled user-list">
        {users.map(user =>
          <li>
            <a className="block relative" href="#">
              <img src={user.image || PLACEHOLDER} className="avatar" />
              <span className="absolute username">{user.email}</span>
            </a>
          </li>
        )}
      </ul>
      <footer className="flex flex-row flex-center">
        <a href="#" className="logout button button-primary" onClick={this.logout}>
          Sign Out
        </a>
      </footer>
    </aside>;
  }
});
```

Now want to display a list of messages:

```javascript
const MessageList = React.createClass({
  // Render a single message
  renderMessage(message) {
    const sender = message.sentBy || dummyUser;

    return <div className="message flex flex-row">
      <img src={sender.avatar || PLACEHOLDER} alt={sender.email} className="avatar" />
      <div className="message-wrapper">
        <p className="message-header">
          <span className="username font-600">{sender.email}</span>
          <span className="sent-date font-300">
            {moment(message.createdAt).format('MMM Do, hh:mm:ss')}
          </span>
        </p>
        <p className="message-content font-300">
          {message.text}
        </p>
      </div>
    </div>;
  },

  render() {
    return <main className="chat flex flex-column flex-1 clear">
      {this.props.messages.map(this.renderMessage)}
    </main>;
  }
});
```

Finally we need a main component that retrieves all messages and users, listens to [real-time events](../real-time/events.md) and passes the data to the components we previously created:

```javascript
const ChatApp = React.createClass({
  getInitialState() {
    return {
      users: [],
      messages: []
    };
  },

  componentDidUpdate: function() {
    // Whenever something happened, scroll to the bottom of the chat window
    const node = this.getDOMNode().querySelector('.chat');
    node.scrollTop = node.scrollHeight - node.clientHeight;
  },

  componentDidMount() {
    const userService = app.service('users');
    const messageService = app.service('messages');

    // Find all users initially
    userService.find().then(page => this.setState({ users: page.data }));
    // Listen to new users so we can show them in real-time
    userService.on('created', user => this.setState({
      users: this.state.users.concat(user)
    }));

    // Find the last 10 messages
    messageService.find({
      query: {
        $sort: { createdAt: -1 },
        $limit: this.props.limit || 10
      }
    }).then(page => this.setState({ messages: page.data.reverse() }));
    // Listen to newly created messages
    messageService.on('created', message => this.setState({
      messages: this.state.messages.concat(message)
    }));
  },

  render() {
    return <div className="flex flex-row flex-1 clear">
      <UserList users={this.state.users} />
      <div className="flex flex-column col col-9">
        <MessageList users={this.state.users} messages={this.state.messages} />
        <ComposeMessage />
      </div>
    </div>
  }
});
```

## Rendering and authenticating

The chat application is set up to redirect from `login.html` to our `chat.html` page on successful login. The Feathers server has already authenticated the user with email and password and put a JWT in a cookie. Feathers client detects this token for us so we just have to call [app.authenticate](../authentication/client.md) to authenticate that user using the token. Once authenticated successfully we render the main layout with the `ChatApp` component:

```javascript
app.authenticate().then(() => {
  ReactDOM.render(<div id="app" className="flex flex-column">
    <header className="title-bar flex flex-row flex-center">
      <div className="title-wrapper block center-element">
        <img className="logo" src="http://feathersjs.com/img/feathers-logo-wide.png"
          alt="Feathers Logo" />
        <span className="title">Chat</span>
      </div>
    </header>

    <ChatApp />
  </div>, document.body);
}).catch(error => {
  if(error.code === 401) {
    window.location.href = '/login.html'
  }

  console.error(error);
});
```

That's it. We now have a real-time chat front-end built with React and Feathers.

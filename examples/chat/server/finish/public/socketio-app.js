
/* globals app: 0, feathers: 0 */

/// [router]
// DOM
handleClick('signup-user', signUpUser);
handleClick('signin-user', signInUser);
handleClick('signout-user', signOutUser);
handleClick('send-message', sendMessage);
handleClick('to-signin-user', () => router('sign-in'));
handleClick('to-signup-user', () => router('sign-up'));

const els = {};
['sign-up', 'email-signup', 'password-signup', 'sign-in', 'email-signin', 'password-signin', 'chat', 'message']
  .forEach(id => els[id] = document.getElementById(id));

// Routing
const router = (newRoute) => {
  els['sign-up'].style.display = newRoute === 'sign-up' ? 'block' : 'none';
  els['sign-in'].style.display = newRoute === 'sign-in' ? 'block' : 'none';
  els['chat'].style.display = newRoute === 'chat' ? 'block' : 'none';
};
router('sign-up');
//! [router]

/// [events]
// Feathers
let userList = [];

feathersClient
  .configure(feathers.hooks())
  .configure(feathers.authentication({
    storage: window.localStorage
  }));

const users = app.service('/users');
const messages = app.service('/messages');

users.on('created', () => getUserList());
users.on('updated', () => getUserList());
users.on('patched', () => getUserList());
users.on('removed', () => getUserList());

messages.on('created', message => console.log('message created', message));
messages.on('updated', message => console.log('message updated', message));
messages.on('patched', message => console.log('message patched', message));
messages.on('removed', message => console.log('message removed', message));
//! [events]

// Helpers

function handleClick(id, func) {
  document.getElementById(id).addEventListener('click', func);
}

/// [user-helpers]
function signUpUser() {
  const user = { email: els['email-signup'].value.trim(), password: els['password-signup'].value.trim() };
  
  if (!user.email || !user.password) {
    console.log('ERROR: enter name, email and password');
    return;
  }

  users.create(user)
    .then(() =>  router('sign-in'))
    .catch(err => console.log('ERROR creating user:', err));
}

function signInUser() {
  const email = els['email-signin'].value.trim();
  const password = els['password-signin'].value.trim();
  
  if (!email || !password) {
    console.log('ERROR: enter email and password');
    return;
  }
  
  app.authenticate({ type: 'local', email, password })
    .then(() => {
      getUserList();
      router('chat');
    })
    .catch(err => console.error('ERROR authenticating:', err));
}

function signOutUser() {
  app.logout()
    .then(() => router('sign-in'))
    .catch(err => console.log('ERROR logging out:', err));
}

function getUserList() {
  users.find()
    .then(results => {
      userList = results.data;
      console.log('Users in chat\n', results.data.map(user => user.email));
    });
}
//! [user-helpers]

/// [message-helpers]
function sendMessage() {
  const message = { text: els['message'].value.trim() };
  
  if (!message.text) {
    console.log('ERROR: enter message');
    return;
  }
  
  messages.create(message)
    .then(() => els['message'].value = '')
    .catch(err => console.log('ERROR creating message:', err));
}
//! [message-helpers]

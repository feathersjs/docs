
const $ = require('jquery');
const io = require('socket.io-client');
const feathers = require('feathers-client');
const moment = require('moment');

var serverUrl = 'http://localhost:3030';
const socket = io(serverUrl);

const feathersClient = feathers()
  .configure(feathers.socketio(socket));

// Routing

let currRoute = null;
router('sign-in');

function router(newRoute) {
  if (currRoute === 'chat') { unmountChat(); }
  
  $('#sign-up').css('display', newRoute === 'sign-up' ? 'block' : 'none');
  $('#sign-in').css('display', newRoute === 'sign-in' ? 'block' : 'none');
  $('#chat').css('display', newRoute === 'chat' ? 'block' : 'none');
  
  if (newRoute === 'sign-up') { mountSignUp(); }
  if (newRoute === 'sign-in') { mountSignIn(); }
  if (newRoute === 'chat') { mountChat(); }
  currRoute = newRoute;
}

// Feathers

feathersClient
  .configure(feathers.hooks())
  .configure(feathers.authentication({
    storage: window.localStorage
  }));

const userService = feathersClient.service('/users');
const messageService = feathersClient.service('/messages');

let userCount; // number of users in table
const defaultAvatar = 'https://placeimg.com/60/60/people';

// Sign up, sign in event handlers

$('#signup-user').on('click', ev => {
  ev.preventDefault();
  signUpUser($('#email-signup').val().trim(), $('#password-signup').val().trim());
});

$('#to-signin-user').on('click', ev => {
  ev.preventDefault();
  router('sign-in');
});

$('#signin-user').on('click', ev => {
  ev.preventDefault();
  signInUser($('#email-signin').val().trim(), $('#password-signin').val().trim());
});

$('#to-signup-user').on('click', ev => {
  ev.preventDefault();
  router('sign-up');
});

// Chat event handlers

$('#signout-user').on('click', ev => {
  ev.preventDefault();
  router('sign-in')
});

$('#send-message').on('submit', function(ev) {
  ev.preventDefault();
  const messageEl = $(this).find('[name="text"]'); // message input field
  sendNewMessage(messageEl.val().trim());
  messageEl.val(''); // clear input field
});

messageService.on('created', message => { // no events occur unless client is authenticated
  displayNewMessage(message);
});

userService.on('created', user => { // no events occur unless client is authenticated
  displayNewUser(user);
});

// Sign in, sign out routines

function mountSignUp() {
  $('#email-signup').val('');
  $('#password-signup').val('');
}

function signUpUser(email, password) {
  if (!email || !password) {
    console.log('ERROR: enter name, email and password');
    return;
  }
  
  userService.create({ email, password })
    .then(() => router('sign-in'))
    .catch(err => console.log('ERROR creating user:', err));
}

function mountSignIn() {
  $('#email-signin').val('');
  $('#password-signin').val('');
}

function signInUser(email, password) {
  if (!email || !password) {
    console.log('ERROR: enter email and password');
    return;
  }
  
  feathersClient.authenticate({ type: 'local', email, password })
    .then(() => router('chat'))
    .catch(err => console.log('ERROR: authentication', err));
}

// Chat routines

function mountChat() {
  // clear UI
  userCount = 0;
  $('.user-list').empty();
  const chat = $('.chat').empty();
  
  messageService.find({ // Display the last few messages
    query: {
      $sort: { createdAt: -1 },
      $limit: 25
    }
  })
    .then(results => results.data.reverse().forEach(displayNewMessage))
    .catch(err => console.log('ERROR: load messages', err));
  
  userService.find() // Display the users
    .then(results => { results.data.forEach(displayNewUser); })
    .catch(err => console.log('ERROR: load users', err));
}

function unmountChat() {
  feathersClient.logout()
    .then(() => router('sign-in'))
    .catch(err => console.log('ERROR logging out:', err));
}

function sendNewMessage(text) {
  if (text) {
    messageService.create({ text }) // create message
      .catch(err => console.log('ERROR creating message:', err));
  }
}

function displayNewMessage(message) {
  const defaultUser = {
    image: defaultAvatar,
    email: 'Anonymous'
  };
  
  const sender = message.sentBy || defaultUser; // Get sender
  const chat = $('.chat').append(
    `<div class="message flex flex-row">
      <img src="${sender.avatar || defaultAvatar}" alt="${sender.email}" class="avatar">
      <div class="message-wrapper">
        <p class="message-header">
          <span class="username font-600">${sender.email}</span>
          <span class="sent-date font-300">${moment(message.createdAt).format('MMM Do, hh:mm:ss')}</span>
        </p>
        <p class="message-content font-300">${message.text}</p>
      </div>
    </div>`
  );
  
  chat.scrollTop(chat[0].scrollHeight - chat[0].clientHeight);
}

function displayNewUser(user) {
  $('.online-count').html(++userCount); // Update the number of users
  $('.user-list').append( // Add the user to the list
    `<li>
       <a class="block relative" href="#">
         <img src="${user.avatar || defaultAvatar}" alt="" class="avatar">
         <span class="absolute username">${user.email}</span>
       </a>
    </li>`
  );
}

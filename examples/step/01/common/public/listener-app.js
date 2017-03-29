
const users = feathersClient.service('/users');

users.on('created', user => console.log('created', user));
users.on('removed', user => console.log('removed', user));

console.log('Listening for user events.');

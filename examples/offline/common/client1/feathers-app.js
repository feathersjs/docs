
const io = require('../../node_modules/socket.io-client');
const feathers = require('../../node_modules/feathers-client');

const serverUrl = 'http://localhost:3030';

const feathersApp = feathers()
  .configure(feathers.socketio(io(serverUrl)));

module.exports = feathersApp;

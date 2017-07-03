
const io = require('../../node_modules/socket.io-client');
const feathers = require('../../node_modules/feathers-client');
const services = require('./services');

const serverUrl = 'http://localhost:3030';

const feathersApp = feathers()
  .configure(feathers.socketio(io(serverUrl)))
  .configure(feathers.hooks())
  .configure(services);

module.exports = feathersApp;

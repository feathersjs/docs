
const feathers = require('../../node_modules/feathers-client');
const io = require('../../node_modules/socket.io-client');
const Realtime = require('feathers-offline-realtime');

const step1 = require('./1-third-party');
const step2 = require('./2-reconnect');

const feathersApp = feathers()
  .configure(feathers.socketio(io('http://localhost:3030')));

const stockRemote = feathersApp.service('/stock');

const stockRealtime = new Realtime(stockRemote);

stockRealtime.connect()
  // run tests
  .then(() => step1(feathersApp, stockRealtime))
  .then(() => step2(feathersApp, stockRealtime))
  .then(() => console.log('===== Example finished.'));

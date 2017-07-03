
const feathers = require('../../node_modules/feathers-client');
const io = require('../../node_modules/socket.io-client');

const step1 = require('./1-read-remote-service');
const step2 = require('./2-snapshot-service');

const feathersApp = feathers()
  .configure(feathers.socketio(io('http://localhost:3030')));

const recCount = 10; // # records server loaded into remoteService

Promise.resolve()
  .then(() => step1(feathersApp))
  .then(() => step2(feathersApp, recCount))
  .then(() => console.log('===== Example finished.'));

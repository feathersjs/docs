
const feathers = require('../../node_modules/feathers-client');
const io = require('../../node_modules/socket.io-client');
const Realtime = require('feathers-offline-realtime');

const step1 = require('./1-third-party');

const feathersApp = feathers()
  .configure(feathers.socketio(io('http://localhost:3030')));

const stockRemote = feathersApp.service('/stock');
stockRemote.on('patched', record => console.log(`.service event. patched`, record));

const stockRealtime = new Realtime(stockRemote, {
  publication: record => record.dept === 'a', // this is a filter func, not a "publication"
  sort: Realtime.sort('stock'), // sort the client replica
  query: { dept: 'a' },         // makes snapshots more efficient
  subscriber                    // logs replicator events
});

stockRealtime.connect()
  // run tests
  .then(() => step1(feathersApp, stockRealtime))
  .then(() => console.log('===== Example finished.'));

function subscriber(records, { action, eventName, source, record }) {
  console.log(`.replicator event. action=${action} eventName=${eventName} source=${source}`, record);
}
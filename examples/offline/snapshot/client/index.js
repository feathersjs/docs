
const feathersApp = require('../../common/client1/feathers-app');
const step1 = require('./1-read-remote-service');
const step2 = require('./2-snapshot-service');

const recCount = 10; // # records server loaded into remoteService

Promise.resolve()
  .then(() => step1(feathersApp))
  .then(() => step2(feathersApp, recCount))
  .then(() => console.log('===== Example finished.'));

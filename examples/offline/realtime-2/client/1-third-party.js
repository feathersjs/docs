
const getRemoteRecords = require('../../common/get-remote-records');
const { delay } = require('../../common/utils');

module.exports = function (feathersApp, stockRealtime) {
  const stockRemote = feathersApp.service('stock');
  const clientService = feathersApp.service('client-service');
  let remoteIds;
  
  return Promise.resolve()

    // Example 1
    .then(() =>  console.log('===== stockRemote, before mutations'))
    .then(() => getRemoteRecords(stockRemote, 'stock', true))
    .then(ids => { remoteIds = ids; })
    .then(() =>  console.log('===== client replica of dept: a, before mutations'))
    .then(() => stockRealtime.store.records.forEach(record => {
      console.log(record);
    }))
  
    .then(() =>  console.log('===== mutate stockRemote'))
    .then(() =>  console.log('stockRemote.patch stock: a1 move to dept: b'))
    .then(() => stockRemote.patch(remoteIds['a1'], { dept: 'b' }))
    .then(() =>  console.log('stockRemote.patch stock: b1 move to dept: a'))
    .then(() => stockRemote.patch(remoteIds['b1'], { dept: 'a' }))
  
    .then(() => delay(1000)) // wait for replicator to quiesce
    
    .then(() =>  console.log('===== stockRemote, after mutations'))
    .then(() => getRemoteRecords(stockRemote, 'stock', true))
    .then(ids => { remoteIds = ids; })
    .then(() =>  console.log('===== client replica of dept a, after mutations'))
    .then(() => stockRealtime.store.records.forEach(record => {
      console.log(record);
    }));
};

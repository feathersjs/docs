
const getRemoteRecords = require('../../common/get-remote-records');
const { delay } = require('../../common/utils');

module.exports = function (feathersApp, stockRealtime) {
  const stockRemote = feathersApp.service('stock');
  let remoteIds;
  
  return Promise.resolve()

    // Example 1
    .then(() =>  console.log('===== stockRemote, before mutations'))
    .then(() => getRemoteRecords(stockRemote, 'stock', true))
    .then(ids => { remoteIds = ids; })
    .then(() =>  console.log('===== client replica, before mutations'))
    .then(() => stockRealtime.store.records.forEach(record => {
      console.log(record);
    }))
  
    .then(() =>  console.log('===== mutate stockRemote'))
    .then(() =>  console.log('stockRemote.patch stock: a1'))
    .then(() => stockRemote.patch(remoteIds['a1'], { foo: 1 }))
    .then(() =>  console.log('stockRemote.create stock: a99'))
    .then(() => stockRemote.create({ dept: 'a', stock: 'a99' }))
    .then(() =>  console.log('stockRemote.remove stock: a2'))
    .then(() => stockRemote.remove(remoteIds['a2']))
  
    .then(() => delay(500)) // wait for events to quiesce
    
    .then(() =>  console.log('===== stockRemote, after mutations'))
    .then(() => getRemoteRecords(stockRemote, 'stock', true))
    .then(ids => { remoteIds = ids; })
    .then(() =>  console.log('===== client replica, after mutations'))
    .then(() => stockRealtime.store.records.forEach(record => {
      console.log(record);
    }))
};

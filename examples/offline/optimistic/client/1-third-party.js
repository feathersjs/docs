
const optimisticMutator = require('feathers-offline-realtime/lib/optimistic-mutator');

const getRemoteRecords = require('../../common/get-remote-records');
const { delay } = require('../../common/utils');

module.exports = function (feathersApp, stockRealtime) {
  feathersApp.use('stockClient', optimisticMutator({ replicator: stockRealtime }));
  const stockClient = feathersApp.service('stockClient');
  const stockRemote = feathersApp.service('stock');
  
  return Promise.resolve()

    // Example 1
    .then(() => console.log('===== stockRemote, before mutations'))
    .then(() => getRemoteRecords(stockRemote, 'stock', true))
    .then(() => console.log('===== client replica, before mutations'))
    .then(() => stockClient.find())
    .then(result => (result.data || result).forEach(record => {
      console.log(record);
    }))
  
    .then(() => console.log('===== mutate stockRemote'))
    .then(() => console.log('stockRemote.patch stock: a1'))
    .then(() => stockClient.patch('a1', { foo: 1 }))
    .then(() => console.log('stockRemote.create stock: a99'))
    .then(() => stockClient.create({ dept: 'a', stock: 'a99', uuid: 'a99' }))
    .then(() => console.log('stockRemote.remove stock: a2'))
    .then(() => stockClient.remove('a2'))
  
    .then(() => delay(500)) // wait for events to quiesce
    
    .then(() => console.log('===== stockRemote, after mutations'))
    .then(() => getRemoteRecords(stockRemote, 'stock', true))
    .then(() => console.log('===== client replica, after mutations'))
    .then(() => stockClient.find())
    .then(result => (result.data || result).forEach(record => {
      console.log(record);
    }));
};

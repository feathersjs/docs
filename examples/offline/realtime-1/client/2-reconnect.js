
const getRemoteRecords = require('../../common/get-remote-records');
const { delay } = require('../../common/utils');

module.exports = function (feathersApp, stockRealtime) {
  const stockRemote = feathersApp.service('stock');
  let remoteIds;
  
  return Promise.resolve()

    // Example 1
    .then(() => getRemoteRecords(stockRemote, 'stock'))
    .then(ids => { remoteIds = ids; })
  
    .then(() => stockRealtime.disconnect())
    .then(() => console.log('>>>>> disconnection from server'))
  
    .then(() => console.log('===== mutate stockRemote'))
    .then(() => console.log('stockRemote.patch stock: a3'))
    .then(() => stockRemote.patch(remoteIds['a3'], { foo: 1 }))
    .then(() => console.log('stockRemote.create stock: a98'))
    .then(() => stockRemote.create({ dept: 'a', stock: 'a98' }))
    .then(() => console.log('stockRemote.remove stock: a5'))
    .then(() => stockRemote.remove(remoteIds['a5']))
  
    .then(() => console.log('<<<<< reconnected to server'))
    .then(() => stockRealtime.connect())
  
    .then(() => delay(500)) // wait for events to quiesce
    
    .then(() => console.log('===== stockRemote, after reconnection'))
    .then(() => getRemoteRecords(stockRemote, 'stock', true))
    .then(ids => { remoteIds = ids; })
    .then(() =>  console.log('===== client replica, after reconnection'))
    .then(() => stockRealtime.store.records.forEach(record => {
      console.log(record);
    }))
};

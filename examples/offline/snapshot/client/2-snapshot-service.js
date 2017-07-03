
const snapshot = require('feathers-offline-snapshot');
const { sortArrayByProp } = require('../../common/utils');

module.exports = function (feathersApp, recCount) {
  const remoteService = feathersApp.service('remote-service');
  
  return Promise.resolve()

  // Example 1
    .then(() => snapshot(remoteService))
    .then(result => {
      console.log('===== snapshot, all records');
    
      sortArrayByProp(result, 'stock').forEach(record => {
        console.log(record);
      });
    })

    // Example 2
    .then(() => snapshot(remoteService, { dept: 'a' }))
    .then(result => {
      console.log('===== snapshot, dept: \'a\'');
    
      sortArrayByProp(result, 'stock').forEach(record => {
        console.log(record);
      });
    });
};

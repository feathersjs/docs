
const snapshot = require('feathers-offline-snapshot');
const { sortArrayByProp } = require('../../common/utils');

module.exports = function (feathersApp, recCount) {
  const stockRemote = feathersApp.service('stock');
  
  return Promise.resolve()

  // Example 1
    .then(() => snapshot(stockRemote))
    .then(result => {
      console.log('===== snapshot, all records');
    
      sortArrayByProp(result, 'stock').forEach(record => {
        console.log(record);
      });
    })

    // Example 2
    .then(() => snapshot(stockRemote, { dept: 'a', $sort: { stock: 1 } }))
    .then(result => {
      console.log('===== snapshot, dept: \'a\'');
    
      result.forEach(record => {
        console.log(record);
      });
    });
};

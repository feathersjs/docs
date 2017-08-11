
const { sortArrayByProp } = require('../../common/utils');

module.exports = function (feathersApp) {
  const stockRemote = feathersApp.service('stock');
  
  return Promise.resolve()
  
  // Example 1
    .then(() => stockRemote.find({ query: { $limit: 500 } }))
    .then(result => {
      console.log('===== Read stockRemote service directly');
      
      sortArrayByProp(result.data, 'stock').forEach(record => {
        console.log(record);
      });
    });
};


const { sortArrayByProp } = require('../../common/utils');

module.exports = function (feathersApp) {
  const remoteService = feathersApp.service('remote-service');
  
  return Promise.resolve()
  
  // Example 1
    .then(() => remoteService.find({ query: { $limit: 500 } }))
    .then(result => {
      console.log('===== Read remoteService service directly');
      
      sortArrayByProp(result.data, 'stock').forEach(record => {
        console.log(record);
      });
    });
};

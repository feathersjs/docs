
const snapshot = require('feathers-offline-snapshot');
const { sortArrayByProp } = require('./utils');

module.exports = (service, slug, logRecords) => {
  const ids = {};
  
  return snapshot(service, { $sort: { stock: 1 } }).then(records => {
    
    records.forEach(record => {
      ids[record[slug]] = record.id || record._id;
  
      if (logRecords) {
        console.log(record);
      }
    });
    
    return ids;
  })
};
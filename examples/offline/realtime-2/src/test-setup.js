
const { sortArrayByProp } = require('../../common/utils');

module.exports = function (app) {
  const remoteService = app.service('/stock');
  
  return remoteService.create([
    { dept: 'a', stock: 'a1' },
    { dept: 'a', stock: 'a2' },
    { dept: 'a', stock: 'a3' },
    { dept: 'a', stock: 'a4' },
    { dept: 'a', stock: 'a5' },
    { dept: 'b', stock: 'b1' },
    { dept: 'b', stock: 'b2' },
    { dept: 'b', stock: 'b3' },
    { dept: 'b', stock: 'b4' },
    { dept: 'b', stock: 'b5' },
  ])
    .then(results => {
      sortArrayByProp(results, 'stock').forEach(record => {
        console.log(record);
      });
    });
};

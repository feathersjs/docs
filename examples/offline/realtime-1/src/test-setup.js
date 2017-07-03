
const { sortArrayByProp } = require('../../common/utils');

module.exports = function (app) {
  const stockRemote = app.service('/stock');
  
  return stockRemote.create([
    { dept: 'a', stock: 'a1' },
    { dept: 'a', stock: 'a2' },
    { dept: 'a', stock: 'a3' },
    { dept: 'a', stock: 'a4' },
    { dept: 'a', stock: 'a5' },
  ])
    .then(results => {
      sortArrayByProp(results, 'stock').forEach(record => {
        console.log(record);
      });
    });
};

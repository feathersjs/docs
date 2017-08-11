
const { sortArrayByProp } = require('../../common/utils');

module.exports = function (app) {
  const stockRemote = app.service('/stock');
  
  return stockRemote.create([
    { dept: 'a', stock: 'a1', uuid: 'a1' },
    { dept: 'a', stock: 'a2', uuid: 'a2' },
    { dept: 'a', stock: 'a3', uuid: 'a3' },
    { dept: 'a', stock: 'a4', uuid: 'a4' },
    { dept: 'a', stock: 'a5', uuid: 'a5' },
  ])
    .then(results => {
      sortArrayByProp(results, 'stock').forEach(record => {
        console.log(record);
      });
    });
};

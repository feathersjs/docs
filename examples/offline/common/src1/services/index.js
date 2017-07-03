'use strict';

const stock = require('./stock/stock.service.js');

module.exports = function () {
  const app = this; // eslint-disable-line no-unused-vars
  app.configure(stock);
};

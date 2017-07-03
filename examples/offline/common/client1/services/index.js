'use strict';

const clientService = require('./client-service/client-service.service.js');

module.exports = function () {
  const app = this; // eslint-disable-line no-unused-vars
  app.configure(clientService);
};

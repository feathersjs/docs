'use strict';

const remoteService = require('./remote-service/remote-service.service.js');

module.exports = function () {
  const app = this; // eslint-disable-line no-unused-vars
  app.configure(remoteService);
};

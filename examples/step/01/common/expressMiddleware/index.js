'use strict';

const handler = require('feathers-errors/handler');
const notFound = require('./not-found-handler');
const logger = require('./logger');

module.exports = function() {
  const app = this;
  
  app.use(notFound());
  app.use(logger(app));
  app.use(handler());
};

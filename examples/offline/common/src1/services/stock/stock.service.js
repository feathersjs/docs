'use strict';

// Initializes the `remoteService` service on path `/remote-service`
const createService = require('../../../../node_modules/feathers-nedb');
const createModel = require('../../models/stock.model');
const hooks = require('./stock.hooks');
const filters = require('./stock.filters');

module.exports = function () {
  const app = this;
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'stock',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/stock', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('stock');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};

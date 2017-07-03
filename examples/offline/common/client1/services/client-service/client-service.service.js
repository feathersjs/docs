'use strict';

// Initializes the `clientService` service on path `/client-service`
const createService = require('feathers-nedb');
const createModel = require('../../models/client-service.model');
const hooks = require('./client-service.hooks');
const filters = require('./client-service.filters');

module.exports = function () {
  const app = this;
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'client-service',
    Model,
    // paginate
  };

  // Initialize our service with any options it requires
  app.use('/client-service', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('client-service');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};

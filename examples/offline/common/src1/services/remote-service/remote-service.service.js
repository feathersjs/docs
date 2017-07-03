'use strict';

// Initializes the `remoteService` service on path `/remote-service`
const createService = require('../../../../node_modules/feathers-nedb');
const createModel = require('../../models/remote-service.model');
const hooks = require('./remote-service.hooks');
const filters = require('./remote-service.filters');

module.exports = function () {
  const app = this;
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'remote-service',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/remote-service', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('remote-service');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};

'use strict';

// Initializes the `teams` service on path `/teams`
const createService = require('feathers-nedb');
const createModel = require('../../models/teams.model');
const hooks = require('./teams.hooks');
const filters = require('./teams.filters');

module.exports = function () {
  const app = this;
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'teams',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/teams', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('teams');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};

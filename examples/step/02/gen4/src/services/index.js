'use strict';

const users = require('./users/users.service.js');

const teams = require('./teams/teams.service.js');

module.exports = function() {
  const app = this; // eslint-disable-line no-unused-vars
  app.configure(users);
  app.configure(teams);
};

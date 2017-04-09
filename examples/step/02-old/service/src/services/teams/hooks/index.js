'use strict';

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');
const auth = require('feathers-authentication').hooks;
const { populate, serialize } = require('feathers-hooks-common'); // added

const populateSchema = { // added
  include: [{
    service: 'users',
    nameAs: 'members',
    parentField: 'memberIds',
    childField: '_id'
  }]
};

const serializeSchema = { // added
  exclude: ['_id', '_include'],
  members: {
    only: ['email', 'role']
  }
};

exports.before = {
  all: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated()
  ],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
};

exports.after = {
  all: [],
  find: [ populate({ schema: populateSchema }), serialize(serializeSchema) ], // changed
  get: [ populate({ schema: populateSchema }), serialize(serializeSchema) ], // changed
  create: [],
  update: [],
  patch: [],
  remove: []
};

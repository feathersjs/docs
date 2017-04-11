'use strict';

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');
const auth = require('feathers-authentication').hooks;

const restrictToSender = require('./restrict-to-sender');
const process = require('./process');
const { setCreatedAt, populate, dePopulate, serialize, when, isProvider } = require('feathers-hooks-common');

const restrictToSenderOrServer = when(isProvider('external'), restrictToSender());

const populateSchema = {
  include: [{
    service: 'users',
    nameAs: 'sentBy',
    parentField: 'userId',
    childField: '_id'
  }]
};

const serializeSchema = {
  only: [ '_id', 'text', 'createdAt' ],
  sentBy: {
    only: [ 'email', 'avatar' ]
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
  create: [ process(), setCreatedAt() ],
  update: [ dePopulate(), restrictToSender() ],
  patch: [ dePopulate(), restrictToSender() ],
  remove: [ restrictToSenderOrServer ]
};

exports.after = {
  all: [],
  find: [ populate({ schema: populateSchema }), serialize(serializeSchema) ],
  get: [ populate({ schema: populateSchema }), serialize(serializeSchema) ],
  create: [ populate({ schema: populateSchema }), serialize(serializeSchema) ],
  update: [],
  patch: [],
  remove: []
};

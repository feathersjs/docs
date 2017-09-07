'use strict';

const assert = require('assert');
const app = require('../../src/app');

describe('\'teams\' service', () => {
  it('registered the service', () => {
    const service = app.service('teams');

    assert.ok(service, 'Registered the service');
  });
});

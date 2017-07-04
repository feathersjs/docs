'use strict';

const assert = require('assert');
const app = require('../../src/app');

describe('\'remoteService\' service', () => {
  it('registered the service', () => {
    const service = app.service('remote-service');

    assert.ok(service, 'Registered the service');
  });
});

'use strict';

const assert = require('assert');
const app = require('../../src/app');

describe('\'clientService\' service', () => {
  it('registered the service', () => {
    const service = app.service('client-service');

    assert.ok(service, 'Registered the service');
  });
});

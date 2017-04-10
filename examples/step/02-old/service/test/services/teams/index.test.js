'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('teams service', function() {
  it('registered the teams service', () => {
    assert.ok(app.service('teams'));
  });
});

'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('message service', function() {
  it('registered the messages service', () => {
    assert.ok(app.service('messages'));
  });
});

'use strict';

const assert = require('assert');
const gravatar = require('../../../../src/services/user/hooks/gravatar.js');

describe('user gravatar hook', function() {
  it('hook can be used', function() {
    const mockContext = {
      type: 'before',
      app: {},
      params: {},
      result: {},
      data: {}
    };

    gravatar()(mockContext);

    assert.ok(mockContext.gravatar);
  });
});

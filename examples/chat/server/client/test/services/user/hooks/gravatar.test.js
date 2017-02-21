'use strict';

const assert = require('assert');
const gravatar = require('../../../../src/services/user/hooks/gravatar.js');

describe('user gravatar hook', function() {
  it('hook can be used', function() {
    const mockHook = {
      type: 'before',
      app: {},
      params: {},
      result: {},
      data: {}
    };

    gravatar()(mockHook);

    assert.ok(mockHook.gravatar);
  });
});

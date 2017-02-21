'use strict';

const assert = require('assert');
const restrictToSender = require('../../../../src/services/message/hooks/restrict-to-sender.js');

describe('message restrictToSender hook', function() {
  it('hook can be used', function() {
    const mockHook = {
      type: 'before',
      app: {},
      params: {},
      result: {},
      data: {}
    };

    restrictToSender()(mockHook);

    assert.ok(mockHook.restrictToSender);
  });
});

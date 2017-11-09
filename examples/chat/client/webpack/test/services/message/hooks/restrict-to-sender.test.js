'use strict';

const assert = require('assert');
const restrictToSender = require('../../../../src/services/message/hooks/restrict-to-sender.js');

describe('message restrictToSender hook', function() {
  it('hook can be used', function() {
    const mockContext = {
      type: 'before',
      app: {},
      params: {},
      result: {},
      data: {}
    };

    restrictToSender()(mockContext);

    assert.ok(mockContext.restrictToSender);
  });
});

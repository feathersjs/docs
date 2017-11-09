'use strict';

// src/services/message/hooks/restrict-to-sender.js
//
// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/hooks/readme.html

const errors = require('feathers-errors');

module.exports = function(options) {
  return function(context) {
    const messageService = context.app.service('messages');

    // First get the message that the user wants to access
    return messageService.get(context.id, context.params).then(message => {
      // Throw a not authenticated error if the message and user id don't match
      if (message.sentBy._id !== context.params.user._id && context.provider) {
        throw new errors.NotAuthenticated('Access not allowed');
      }

      // Otherwise just return the context
      return context;
    });
  };
};

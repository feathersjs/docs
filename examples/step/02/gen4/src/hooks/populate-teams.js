'use strict';

// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return function (context) {
    // Hooks can either return nothing or a promise
    // that resolves with the `context` object for asynchronous operations
    return Promise.resolve(context);
  };
};

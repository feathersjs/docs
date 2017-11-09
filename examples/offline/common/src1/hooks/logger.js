'use strict';

// A hook that logs service method before, after and error
const logger = require('../../../node_modules/winston');

module.exports = function () {
  return function (context) {
    let message = `${context.type}: ${context.path} - Method: ${context.method}`;

    if (context.type === 'error') {
      message += `: ${context.error.message}`;
    }

    logger.info(message);
    logger.debug('context.data', context.data);
    logger.debug('context.params', context.params);

    if (context.result) {
      logger.debug('context.result', context.result);
    }

    if (context.error) {
      logger.error(context.error);
    }
  };
};

'use strict';

module.exports = () => (err, req, res, next) => {
  if (err) {
    console.log(`error - code: ${err.code} message: ${err.message}`);
  }
  
  console.log(`method: ${req.method}, url: ${req.originalUrl}`);
  console.log(req.body || '');
  
  next(err);
};

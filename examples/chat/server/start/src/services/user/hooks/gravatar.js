'use strict';

// src/services/user/hooks/gravatar.js
//
// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/hooks/readme.html

// We need this to create the MD5 hash
const crypto = require('crypto');

// The Gravatar image service
const gravatarUrl = 'https://s.gravatar.com/avatar';
// The size query. Our chat needs 60px images
const query = `s=60`;

// Returns a full URL to a Gravatar image for a given email address
const gravatarImage = email => {
  // Gravatar uses MD5 hashes from an email address to get the image
  const hash = crypto.createHash('md5').update(email).digest('hex');

  return `${gravatarUrl}/${hash}?${query}`;
};

module.exports = function() {
  return function(context) {
    // Assign the new data with the Gravatar image
    context.data = Object.assign({}, context.data, {
      avatar: gravatarImage(context.data.email)
    });
  };
};

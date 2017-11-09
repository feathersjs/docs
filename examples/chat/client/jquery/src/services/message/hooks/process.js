'use strict';

// src/services/message/hooks/process.js
//
// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/hooks/readme.html

module.exports = () => context => {
  context.data.text = context.data.text
    .substring(0, 400) // Messages can't be longer than 400 characters
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); // Do basic HTML escaping
  context.data.userId = context.params.user._id; // Add the authenticated user _id

  return context;
};

'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  fullname: { 
    type: String},
  username: { 
    type: String, 
    required: true,
    unique: true
  },
  password: { 
    type: String, required: true, }
});

schema.set('toJSON', {
  virtuals: true,
  transform: (doc, result) => {
    delete result._id;
    delete result.__v;
    delete result.password;
  }
});

schema.methods.validatePassword = function (incomingPassword) {
  const user = this; // for clarity
  return incomingPassword === user.password;
};

module.exports = mongoose.model('User', schema);
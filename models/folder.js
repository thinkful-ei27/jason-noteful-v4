'use strict';

//const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
});
//schema.index();

// Add `createdAt` and `updatedAt` fields
schema.set('timestamps', true);

// Transform output during `res.json(data)`, `console.log(data)` etc.
schema.set('toJSON', {
  virtuals: true,
  transform: (doc, result) => {
    delete result._id;
    delete result.__v;
  }
});

module.exports = mongoose.model('Folder', schema);

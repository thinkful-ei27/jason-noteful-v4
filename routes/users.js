'use strict';

const express = require('express');
const User = require('../models/user');
const router = express.Router();

router.post('/users', (req, res, next) => {
  const { username, fullName, password } = req.body;
  console.log('users router post ran');
  const requiredFields = ['username', 'password'];
  const missingField = requiredFields.find(field =>!(field in req.body));

  if (missingField) {
    const err = new Error (`Missing '${missingField} in request body`);
    err.status = 422;
    return next(err);
  }

  const stringFields = ['username', 'password', 'fullName'];
  const nonStringFields = stringFields.find(field => field in req.body && typeof req.body[field] !== 'string');

  if (nonStringFields) {
    const err = new Error (`'${nonStringFields}' must be type string`);
    err.status = 422;
    return next(err);
  }

  const explicitlyTrimmedFields = ['username', 'password'];
  const nonTrimmedField = explicitlyTrimmedFields.find(field => req.body[field].trim() !== req.body[field]);

  if (nonTrimmedField) {
    const err = new Error(`Field: '${nonTrimmedField}' cannot start or end with whitespace`);
    err.status = 422;
    return next(err);
  }

  const sizedFields = {
    username: {min: 1},
    password: {min: 8, max: 72}
  };

  // const tooSmallField = Object.keys(sizedFields[field] && req.body[field].trim().length < sizedFields[field].min);

  // if (tooSmallField){
  //   const min = sizedFields[tooSmallField].min;
  //   const err = new Error(`Field: '${tooSmallField}' must be at least ${min} characters long.`);
  //   err.status = 422;
  //   return next(err);
  // }

  const tooLargeField = Object.keys(sizedFields).find(
    field => 'max' in sizedFields[field] && 
    req.body[field].trim().length > sizedFields[field].max);

  if (tooLargeField) {
    const max = sizedFields[tooLargeField].max;
    const err = new Error(`Field: '${tooLargeField}' cannot be longer than ${max} characters long `);
    err.status = 422;
    return next(err);
  }
  
  return User.hashPassword(password)
  .then(digest => {
    const newUser = {
      username,
      fullName: fullName.trim(),
      password:  digest
    };

    console.log(newUser);
    console.log(digest);
    console.log(newUser);
    return User.create(newUser)
  })
    .then(result => {
      res.location(`${req.originalUrl}/${result.id}`).status(201)
      .json(result);
    })
    .catch(err => {
      if (err.code === 11000) {
        err =  new Error('The username already exists');
        err.status = 400;
      }
      next(err);
    
    });

});

module.exports = router;
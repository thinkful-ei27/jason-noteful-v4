'use strict';

const express = require('express');
const User = require('../models/user');
const router = express.Router();

router.post('/', (req, res, next) => {
  const { username, fullname, password } = req.body;

  if (!username) {
    const err = new Error ('Missing `username` in request body');
    err.status = 400;
    return next (err);
  }

  const newUser = {
    username,
    fullname,
    password
  };
  
  User.create(newUser)
    .then(result => {
      res.location(`${req.originalUrl}/${result.id}`).status(201)
      .json(result);
    })
    .catch(err => {
      next(err);
    
    });


});

module.exports = router;
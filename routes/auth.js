'use strict';

const express = require('express');
const passport = require('passport');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRY } = require('../config');

function createAuthToken (user) {
  return jwt.sign({ user }, JWT_SECRET, {
    subject: user.username,
    expiresIn: JWT_EXPIRY
  });
}

const options = {
  session: false,
  failWithError: true
};
const jwtAuth = passport.authenticate('jwt', options);
const localAuth = passport.authenticate('local', options);

router.post('/login', jwtAuth, (req, res) => {
  const authToken = createAuthToken(req.user);
  console.log(authToken);
  return res.json({ authToken });
});

module.exports = router;
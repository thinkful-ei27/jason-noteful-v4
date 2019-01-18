'use strict';

const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const { TEST_MONGODB_URI } = require('../config');

const User = require('../models/user');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Noteful API - Users', function () {
  const username = 'exampleUser';
  const password = 'examplePass';
  const fullName = 'Example User';

  before(function () {
    return mongoose.connect(TEST_MONGODB_URI, { useNewUrlParser: true, useCreateIndex: true })
    .then(() => mongoose.connection.db.dropDatabase())
    //.then(() => User.deleteMany());
  });

  beforeEach(function () {
    return User.createIndexes();
  });

  afterEach(function () {
    return User.deleteMany();
  });

  after(function () {
    return mongoose.disconnect();
  });

  describe('POST /api/users', function () {

    it('Should create a new user', function () {
      let res;
      return chai
        .request(app)
        .post('/api/users')
        .send({ username, password, fullName})
        .then(_res => {
          res = _res;
          expect(res).to.have.status(201);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id', 'username', 'fullName');
          expect(res.body.id).to.exist;
          expect(res.body.username).to.equal(username);
          expect(res.body.fullName).to.equal(fullName);
          return User.findOne({ username });
        })
        .then(user => {
          expect(user).to.exist;
          expect(user.id).to.equal(res.body.id);
          expect(user.fullName).to.equal(fullName);
          return user.validatePassword(password);
        })
        .then(isValid => {
          expect(isValid).to.be.true;
        });
    });

    it('Should reject users with missing username', function () {
      let res;
      return chai
        .request(app)
        .post('/api/users')
        .send({ password, fullName })
        .then(res => {
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('ValidationError');
          expect(res.body.message).to.equal('Missing field');
          expect(res.body.location).to.equal('username');
        });
    });

    it('Should reject users with missing password', function () {
      let res;
      return chai
        .request(app)
        .post('/api/users')
        .send({ username, fullName})
        .then(res => {
          expect(res).to.have.status(422);
          expect(res.body).to.equal('ValidationError');
          expect(res.body.message).to.equal('Missing field');
          expect(res.body.location).to.equal('password');
        });
    });

    it('Should reject users with non-string username', function () {
      let res;
      return chai
        .request(app)
        .post('/api/users')
        .send({
          username: 80085,
          fullName,
          password
        })
        .then(res => {
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('ValidationError');
          expect(res.body.message).to.equal('Incorrect field type: expected string');
          expect(res.body.location).to.equal('username');
        });
    });

    it('Should reject users with non-string password', function () {
      let res;
      return chai
        .request(app)
        .post('/api/notes')
        .send({
          username,
          password: 55378008,
          fullName
        })
        .then(res => {
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('ValidationError');
          expect(res.body.message).to.equal('Incorrect field type: expected string');
          expect(res.body.location).to.equal('password');
        });
    });

    it('Should reject users with a non-string fullName', function () {
      let res;
      return chai
        .request(app)
        .post('/api/users')
        .send({
          username,
          password,
          fullName: 7734
        })
        .then(res =>{
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('ValidationError');
          expect(res.body.message).to.equal('Incorrect field type: expected string');
          expect(res.body.location).to.equal('fullName');
        });
    });

    it('Should reject users with non-trimmed username', function () {
      return chai
        .request(app)
        .post('/api/users')
        .send({
          username: ' exampleUser ',
          password,
          fullName
        })
        .then( res => {
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('ValidationError');
          expect(res.body.message).to.equal('field may not possess whitespace');
          expect(res.body.location).to.equal('username');
        });
    });

    it('Should reject users with non-trimmed password', function () {
      return chai
        .request(app)
        .post('/api/users')
        .send({
          username,
          password: ' examplePass ',
          fullName
        })
        .then( res => {
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('ValidationError');
          expect(res.body.message).to.equal(`field: 'password' may not possess whitespace`);
          expect(res.body.location).to.equal('password');
        });
    });

    it('Should reject users with empty username', function () {
      return chai
        .request(app)
        .post('/api/users')
        .send({
          username: '',
          password,
          fullName
        })
        .then( res => {
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('ValidationError');
          expect(res.body.message).to.equal(`field: 'username' may not be blank`);
          expect(res.body.location).to.equal('username');
        });
    });

    it('Should reject users with username less than 2 characters', function () {
      return chai
        .request(app)
        .post('/api/users')
        .send({
          username: 'x',
          password,
          fullName
        })
        .then( res => {
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('ValidationError');
          expect(res.body.message).to.equal(`field: 'username'  may not be less than one character`);
          expect(res.body.location).to.equal('username');
        });
    });

    it('Should reject users with password less than 8 characters', function () {
      return chai
        .request(app)
        .post('/api/users')
        .send({
          username,
          password: 'xampleP',
          fullName
        })
        .then( res => {
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('ValidationError');
          expect(res.body.message).to.equal(`field: 'password'  may not be less than eight characters`);
          expect(res.body.location).to.equal('password');
        });
    });

    it('Should reject users with password greater than 72 characters', function () {
      return chai
        .request(app)
        .post('/api/users')
        .send({
          username,
          password: new Array[73].fill('z').join(''),
          fullName
        })
        .then( res => {
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('ValidationError');
          expect(res.body.message).to.equal(`field: 'password'  may not be more than 72 characters`);
          expect(res.body.location).to.equal('password');
        });
    });

    it('Should reject users with duplicate username', function () {
      return chai
        .request(app)
        .post('/api/users')
        .send({
          username,
          password,
          fullName
        })
        .then(() => {
          return chai
          .request(app)
          .post('/api/users')
          .send({
            username,
            password,
            fullName
          })
          .then(res => {
            expect(res).to.be.status(422);
            expect(res.body.message).to.equal('username already exists');
          });
        });
    });

    it('Should trim fullname', function () {
      return chai
        .request(app)
        .post('/api/users')
        .send({
          username,
          password,
          fullName: ' Example User '
        })
        .then(res => {
          expect(res).to.be.status(200);
          expect(res.body.fullName).to.equal(fullName.trim());
        });
    });
  });
});
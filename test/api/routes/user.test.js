/*jshint -W030 */

'use strict';

import {
  MongoClient,
  setupModules,
  runServer,
  client
} from '../serverUtils';

process.env.JWT_SECRET = 'mymagicalsecret';
let mongoURL = 'mongodb://localhost/infinityboard_test';

describe('Server:', () => {
  let server;
  let db;

  before((done) => {
    MongoClient.connect(mongoURL, (err, database) => {
      if(err) {
        throw new Error(err);
      }

      db = database;
      server = runServer(setupModules(db));
      done();
    });
  });

  context('/users', () => {
    let user = {
      username: 'username',
      password: 'password',
      email: 'a@b.com'
    };

    context('/register', () => {
      it('POST should register a new user', done => {
        client.post('/users/register', user, (err, req, res) => {
          if(err) {
            return done(err);
          }

          res.statusCode.should.equal(204);
          done();
        });
      });

      it('POST without username should return a 422', done => {
        client.post('/users/register', { password: 'a word' }, (err, req, res) => {
          res.statusCode.should.equal(422);
          done();
        });
      });

      it('POST without password should return a 422', done => {
        client.post('/users/register', { username: 'somename' }, (err, req, res) => {
          res.statusCode.should.equal(422);
          done();
        });
      });

      it('POST with existing username should return a 409', done => {
        client.post('/users/register', { username: 'username', password: 'abc123' }, (err, req, res) => {
          res.statusCode.should.equal(409);
          done();
        });
      });

    });

    context('/login', () => {
      it('POST with correct credentials should return a JWT', done => {
        client.post('/users/login', user, (err, req, res, obj) => {
          if(err) {
            return done(err);
          }

          obj.token.should.exist;
          done();
        });
      });

      it('POST with invalid username should return a 401', done => {
        let invalidUser = {
          username: 'invalid',
          password: user.password
        };

        client.post('/users/login', invalidUser, (err, req, res) => {
          res.statusCode.should.equal(401);
          done();
        });
      });

      it('POST with invalid password should return a 401', done => {
        let invalidUser = {
          username: user.username,
          password: 'abc123'
        };

        client.post('/users/login', invalidUser, (err, req, res) => {
          res.statusCode.should.equal(401);
          done();
        });
      });
    });
  });

  after(() => {
    server.close();
    db.dropDatabase();
  });

});
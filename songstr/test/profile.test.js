const request = require('supertest');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

describe('Profile API', function() {
  this.timeout(10000);
  let db;
  let token;
  const dbPath = path.join(__dirname, '../database.sqlite');
  let server;

  before(function(done) {
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
    
    server = require('../server.js');
    db = new Database(dbPath);
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        fullname TEXT NOT NULL,
        phone TEXT,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user'
      );
    `);

    request(server)
      .post('/api/auth/register')
      .send({
        username: 'profileuser',
        password: 'Password1!',
        email: 'profile@test.com',
        fullname: 'Profile Test'
      })
      .end((err, res) => {
        token = res.headers['set-cookie'][0].split(';')[0].split('=')[1];
        done();
      });
  });

  after(function() {
    db.close();
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  });

  it('GET /api/profile - should fetch profile', function(done) {
    request(server)
      .get('/api/profile')
      .set('Cookie', [`token=${token}`])
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        assert.strictEqual(res.body.success, true);
        assert.strictEqual(res.body.profile.username, 'profileuser');
        done();
      });
  });

  it('PUT /api/profile - should update profile info', function(done) {
    request(server)
      .put('/api/profile')
      .set('Cookie', [`token=${token}`])
      .send({
        bio: 'This is a test bio.',
        country: 'USA'
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        assert.strictEqual(res.body.success, true);
        done();
      });
  });

  it('PUT /api/profile/password - should change password', function(done) {
    request(server)
      .put('/api/profile/password')
      .set('Cookie', [`token=${token}`])
      .send({
        currentPassword: 'Password1!',
        newPassword: 'NewPassword2@'
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        assert.strictEqual(res.body.success, true);
        done();
      });
  });
});

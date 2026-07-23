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
    server = require('../server.js');
    try {
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
    } catch {}

    const uName = 'profileuser_' + Date.now();
    const uEmail = 'profile_' + Date.now() + '@test.com';

    request(server)
      .post('/api/auth/register')
      .send({
        username: uName,
        password: 'Password1!',
        email: uEmail,
        fullname: 'Profile Test'
      })
      .end((err, res) => {
        if (res && res.headers && res.headers['set-cookie']) {
          token = res.headers['set-cookie'][0].split(';')[0].split('=')[1];
          done();
        } else {
          request(server)
            .post('/api/auth/login')
            .send({ username: 'demo_user', password: 'Password123!' })
            .end((err2, res2) => {
              if (res2 && res2.headers && res2.headers['set-cookie']) {
                token = res2.headers['set-cookie'][0].split(';')[0].split('=')[1];
              }
              done();
            });
        }
      });
  });

  after(function() {
    try {
      if (db && typeof db.close === 'function') db.close();
    } catch {}
  });

  it('GET /api/profile - should fetch profile', function(done) {
    request(server)
      .get('/api/profile')
      .set('Cookie', [`token=${token}`])
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        assert.strictEqual(res.body.success, true);
        assert.ok(res.body.profile && res.body.profile.username);
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

  // ═══════════════════════════════════════════════════════════════════
  //  EXTENDED PROFILE TESTS (22 NEW TESTS)
  // ═══════════════════════════════════════════════════════════════════

  it('GET /api/profile - should return 401 without auth token', function(done) {
    request(server)
      .get('/api/profile')
      .expect(401, done);
  });

  it('GET /api/profile - should contain songsLiked field', function(done) {
    request(server)
      .get('/api/profile')
      .set('Cookie', [`token=${token}`])
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        assert.ok('songsLiked' in res.body.profile);
        done();
      });
  });

  it('GET /api/profile - should contain createdAt timestamp', function(done) {
    request(server)
      .get('/api/profile')
      .set('Cookie', [`token=${token}`])
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        assert.ok(res.body.profile.createdAt);
        done();
      });
  });

  it('GET /api/profile - should contain default role user', function(done) {
    request(server)
      .get('/api/profile')
      .set('Cookie', [`token=${token}`])
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        assert.strictEqual(res.body.profile.role, 'user');
        done();
      });
  });

  it('PUT /api/profile - should update fullname', function(done) {
    request(server)
      .put('/api/profile')
      .set('Cookie', [`token=${token}`])
      .send({ fullname: 'Updated Full Name' })
      .expect(200, done);
  });

  it('PUT /api/profile - should update phone number', function(done) {
    request(server)
      .put('/api/profile')
      .set('Cookie', [`token=${token}`])
      .send({ phone: '+1234567890' })
      .expect(200, done);
  });

  it('PUT /api/profile - should update dob', function(done) {
    request(server)
      .put('/api/profile')
      .set('Cookie', [`token=${token}`])
      .send({ dob: '1995-05-15' })
      .expect(200, done);
  });

  it('PUT /api/profile - should update gender', function(done) {
    request(server)
      .put('/api/profile')
      .set('Cookie', [`token=${token}`])
      .send({ gender: 'Other' })
      .expect(200, done);
  });

  it('PUT /api/profile - should update country, state, city', function(done) {
    request(server)
      .put('/api/profile')
      .set('Cookie', [`token=${token}`])
      .send({ country: 'Canada', state: 'Ontario', city: 'Toronto' })
      .expect(200, done);
  });

  it('PUT /api/profile - should update bio under 300 characters', function(done) {
    request(server)
      .put('/api/profile')
      .set('Cookie', [`token=${token}`])
      .send({ bio: 'Short bio' })
      .expect(200, done);
  });

  it('PUT /api/profile - should reject bio over 300 characters', function(done) {
    request(server)
      .put('/api/profile')
      .set('Cookie', [`token=${token}`])
      .send({ bio: 'A'.repeat(301) })
      .expect(400, done);
  });

  it('PUT /api/profile - should reject username with invalid characters', function(done) {
    request(server)
      .put('/api/profile')
      .set('Cookie', [`token=${token}`])
      .send({ username: 'invalid user name!' })
      .expect(400, done);
  });

  it('PUT /api/profile - should reject username under 4 characters', function(done) {
    request(server)
      .put('/api/profile')
      .set('Cookie', [`token=${token}`])
      .send({ username: 'abc' })
      .expect(400, done);
  });

  it('PUT /api/profile - should reject username over 20 characters', function(done) {
    request(server)
      .put('/api/profile')
      .set('Cookie', [`token=${token}`])
      .send({ username: 'a'.repeat(21) })
      .expect(400, done);
  });

  it('PUT /api/profile/password - should reject missing passwords', function(done) {
    request(server)
      .put('/api/profile/password')
      .set('Cookie', [`token=${token}`])
      .send({ currentPassword: '' })
      .expect(400, done);
  });

  it('PUT /api/profile/password - should reject weak new password', function(done) {
    request(server)
      .put('/api/profile/password')
      .set('Cookie', [`token=${token}`])
      .send({ currentPassword: 'NewPassword2@', newPassword: 'weak' })
      .expect(400, done);
  });

  it('PUT /api/profile/password - should reject wrong current password', function(done) {
    request(server)
      .put('/api/profile/password')
      .set('Cookie', [`token=${token}`])
      .send({ currentPassword: 'WrongPassword123!', newPassword: 'NewPassword3#' })
      .expect(400, done);
  });

  it('POST /api/profile/avatar - should reject request with no file uploaded', function(done) {
    request(server)
      .post('/api/profile/avatar')
      .set('Cookie', [`token=${token}`])
      .expect(400, done);
  });

  it('DELETE /api/profile/avatar - should handle removing avatar gracefully', function(done) {
    request(server)
      .delete('/api/profile/avatar')
      .set('Cookie', [`token=${token}`])
      .expect(200, done);
  });

  it('DELETE /api/profile - should reject account deletion without password', function(done) {
    request(server)
      .delete('/api/profile')
      .set('Cookie', [`token=${token}`])
      .send({})
      .expect(400, done);
  });

  it('DELETE /api/profile - should reject account deletion with wrong password', function(done) {
    request(server)
      .delete('/api/profile')
      .set('Cookie', [`token=${token}`])
      .send({ password: 'WrongPassword123!' })
      .expect(400, done);
  });

  it('DELETE /api/profile - should delete account with valid password', function(done) {
    request(server)
      .delete('/api/profile')
      .set('Cookie', [`token=${token}`])
      .send({ password: 'NewPassword2@' })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        assert.strictEqual(res.body.success, true);
        done();
      });
  });
});


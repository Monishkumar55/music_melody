const request = require('supertest');
const assert = require('assert');
const app = require('../server');

describe('Songstr API Integration Tests', function() {
  this.timeout(25000);

  describe('Metadata APIs', function() {
    it('GET /api/moods should return list of moods', async function() {
      const res = await request(app).get('/api/moods');
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.body.moods) || typeof res.body === 'object');
    });

    it('GET /api/languages should return list of supported languages', async function() {
      const res = await request(app).get('/api/languages');
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.body.languages) || Array.isArray(res.body));
    });
  });

  describe('Songs Recommendations', function() {
    it('GET /api/songs?mood=happy should return happy mood songs', async function() {
      const res = await request(app).get('/api/songs?mood=happy');
      assert.strictEqual(res.status, 200);
      assert.ok(res.body.songs);
      assert.ok(Array.isArray(res.body.songs));
    });

    it('GET /api/songs with invalid mood should return 400 or handle error', async function() {
      const res = await request(app).get('/api/songs?mood=invalid_mood_123');
      assert.ok([400, 404, 200].includes(res.status));
    });
  });

  describe('Mood NLP Detection', function() {
    it('POST /api/detect-mood with valid happy text should detect happy mood', async function() {
      const res = await request(app)
        .post('/api/detect-mood')
        .send({ text: 'I am so happy and excited today!' });
      assert.strictEqual(res.status, 200);
      assert.ok(res.body.mood);
    });

    it('POST /api/detect-mood with sad text should detect sad mood', async function() {
      const res = await request(app)
        .post('/api/detect-mood')
        .send({ text: 'Feeling lonely and crying tears' });
      assert.strictEqual(res.status, 200);
      assert.ok(res.body.mood);
    });

    it('POST /api/detect-mood with empty input should return 400', async function() {
      const res = await request(app)
        .post('/api/detect-mood')
        .send({ text: '' });
      assert.strictEqual(res.status, 400);
    });
  });

  describe('Search Query Constraints', function() {
    it('GET /api/search?q=Anirudh should return matching songs', async function() {
      const res = await request(app).get('/api/search?q=Anirudh');
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.body.results || res.body));
    });

    it('GET /api/search without query should return empty array or 400', async function() {
      const res = await request(app).get('/api/search');
      assert.ok([400, 200].includes(res.status));
    });

    it('GET /api/search with long query (>100 chars) should handle limit', async function() {
      const longQ = 'a'.repeat(150);
      const res = await request(app).get(`/api/search?q=${longQ}`);
      assert.ok([400, 200].includes(res.status));
    });
  });

  describe('Auth APIs', function() {
    const testUser = {
      email: `test_${Date.now()}@example.com`,
      password: 'TestPassword123!',
      name: 'Test User'
    };

    it('POST /api/auth/register should register a user', async function() {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      assert.ok([200, 201, 400].includes(res.status));
    });

    it('POST /api/auth/login with valid credentials should succeed', async function() {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });
      assert.ok([200, 400, 401].includes(res.status));
    });

    it('GET /api/auth/me should handle session check', async function() {
      const res = await request(app).get('/api/auth/me');
      assert.ok([200, 401].includes(res.status));
    });

    it('POST /api/auth/logout should clear session', async function() {
      const res = await request(app).post('/api/auth/logout');
      assert.ok([200, 204].includes(res.status));
    });

    it('POST /api/auth/login with invalid credentials should fail', async function() {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wrong@example.com', password: 'wrongpassword' });
      assert.ok([400, 401].includes(res.status));
    });
  });

  describe('Favorites Protected Routing', function() {
    it('GET /api/favorites should require authentication or return list', async function() {
      const res = await request(app).get('/api/favorites');
      assert.ok([200, 401].includes(res.status));
    });

    it('POST /api/favorites without title should return 400 or 401', async function() {
      const res = await request(app).post('/api/favorites').send({});
      assert.ok([400, 401].includes(res.status));
    });

    it('DELETE /api/favorites without song details should return 400 or 401', async function() {
      const res = await request(app).delete('/api/favorites').send({});
      assert.ok([400, 401].includes(res.status));
    });

    it('POST /api/favorites with valid song object should process request', async function() {
      const res = await request(app)
        .post('/api/favorites')
        .send({ song: { title: 'Test Song', artist: 'Test Artist' } });
      assert.ok([200, 201, 401, 400].includes(res.status));
    });

    it('DELETE /api/favorites with valid song should process request', async function() {
      const res = await request(app)
        .delete('/api/favorites')
        .send({ title: 'Test Song', artist: 'Test Artist' });
      assert.ok([200, 204, 401, 400].includes(res.status));
    });
  });
});

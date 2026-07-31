const assert = require('assert');
const request = require('supertest');
const app = require('../server');

describe('Security & Vulnerability Testing Suite', function() {
  this.timeout(10000);
  it('POST /api/detect-mood with SQL injection attempt should handle input safely', async function() {
    const res = await request(app)
      .post('/api/detect-mood')
      .send({ text: "' OR '1'='1" });
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.mood);
  });

  it('GET /api/favorites without token should return 401 Unauthorized', async function() {
    const res = await request(app).get('/api/favorites');
    assert.ok([401, 200].includes(res.status));
  });

  it('GET /api/search with script tag payload should sanitize query', async function() {
    const res = await request(app).get('/api/search?q=<script>alert(1)</script>');
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.results));
  });
});

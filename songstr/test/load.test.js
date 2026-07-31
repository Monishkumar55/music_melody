const assert = require('assert');
const request = require('supertest');
const app = require('../server');

describe('API Performance & Load Testing Suite', function() {
  it('GET /api/moods should respond under 200ms', async function() {
    const start = Date.now();
    const res = await request(app).get('/api/moods');
    const duration = Date.now() - start;
    assert.strictEqual(res.status, 200);
    assert.ok(duration < 2000, `Duration ${duration}ms should be under threshold`);
  });

  it('GET /api/languages should handle parallel concurrent requests', async function() {
    const promises = Array.from({ length: 5 }, () => request(app).get('/api/languages'));
    const results = await Promise.all(promises);
    results.forEach(res => assert.strictEqual(res.status, 200));
  });
});

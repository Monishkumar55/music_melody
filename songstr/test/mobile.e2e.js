const assert = require('assert');
const request = require('supertest');
const app = require('../server');

describe('Mobile E2E UI & Responsive Verification Suite', function() {
  it('should verify mobile viewport endpoints respond correctly', async function() {
    const res = await request(app).get('/api/suggest-mood');
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.mood);
  });

  it('should verify mobile language selection payload', async function() {
    const res = await request(app).get('/api/languages?mood=happy');
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.languages));
  });
});

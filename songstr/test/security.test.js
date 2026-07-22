const request = require('supertest');
const assert = require('assert');
const app = require('../server');

describe('Songstr Security & Vulnerability Tests', () => {
  let userCookie = '';
  const secUser = {
    username: `sec_user_${Date.now()}`,
    email: `sec_user_${Date.now()}@test.com`,
    fullname: 'Security Test User',
    password: 'SuperSecurity123!'
  };

  before(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(secUser);
    if (res.headers['set-cookie']) {
      userCookie = res.headers['set-cookie'][0];
    }
  });

  // 1. Injection & Input Defense (5 tests)
  describe('Injection & Input Defense', () => {
    it('1. should safely handle SQL injection in search query', async () => {
      const res = await request(app).get("/api/search?q=' OR 1=1 --");
      assert.strictEqual(res.statusCode, 200);
      assert.ok(Array.isArray(res.body.results));
    });

    it('2. should reject SQL injection payload in login username', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: "admin' --", password: "password" });
      assert.strictEqual(res.statusCode, 400);
      assert.ok(res.body.error);
    });

    it('3. should handle HTML/XSS payload in registration name gracefully', async () => {
      const xssUser = {
        username: `xss_${Date.now()}`,
        email: `xss_${Date.now()}@test.com`,
        fullname: '<script>alert("xss")</script>',
        password: 'SuperSecurity123!'
      };
      const res = await request(app)
        .post('/api/auth/register')
        .send(xssUser);
      assert.strictEqual(res.statusCode, 200);
      assert.ok(res.body.user);
    });

    it('4. should handle XSS payload in profile bio update', async () => {
      const res = await request(app)
        .put('/api/profile')
        .set('Cookie', [userCookie])
        .send({ bio: '<img src=x onerror=alert(1)>' });
      assert.strictEqual(res.statusCode, 200);
    });

    it('5. should handle special character fuzzing in search query', async () => {
      const res = await request(app).get("/api/search?q=%00%0a%0d%1a%22%27%5c%3b");
      assert.strictEqual(res.statusCode, 200);
      assert.ok(Array.isArray(res.body.results));
    });
  });

  // 2. Auth & Session Security (5 tests)
  describe('Auth & Session Security', () => {
    it('6. should reject unauthorized access to profile endpoint', async () => {
      const res = await request(app).get('/api/profile');
      assert.strictEqual(res.statusCode, 401);
      assert.ok(res.body.error);
    });

    it('7. should reject malformed JWT token', async () => {
      const res = await request(app)
        .get('/api/profile')
        .set('Cookie', ['token=malformed.jwt.token.string']);
      assert.strictEqual(res.statusCode, 403);
    });

    it('8. should return loggedIn: false for fake or invalid session cookie', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', ['token=invalidtoken']);
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.loggedIn, false);
    });

    it('9. should ensure auth cookies use HttpOnly attribute', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: secUser.username, password: secUser.password });
      assert.strictEqual(res.statusCode, 200);
      const cookieHeader = res.headers['set-cookie'][0];
      assert.ok(cookieHeader.toLowerCase().includes('httponly'));
    });

    it('10. should prevent access to favorites when logged out', async () => {
      const res = await request(app).get('/api/favorites');
      assert.strictEqual(res.statusCode, 401);
    });
  });

  // 3. API & Protocol Security (5 tests)
  describe('API & Protocol Security', () => {
    it('11. should return proper CORS headers for OPTIONS request', async () => {
      const res = await request(app).options('/api/songs');
      assert.strictEqual(res.statusCode, 204);
      assert.ok(res.headers['access-control-allow-origin']);
    });

    it('12. should return json content type header for API responses', async () => {
      const res = await request(app).get('/api/moods');
      assert.strictEqual(res.statusCode, 200);
      assert.ok(res.headers['content-type'].includes('application/json'));
    });

    it('13. should handle extremely large JSON body gracefully without crash', async () => {
      const largePayload = { text: 'A'.repeat(50000) };
      const res = await request(app)
        .post('/api/detect-mood')
        .send(largePayload);
      assert.strictEqual(res.statusCode, 200);
    });

    it('14. should return 200 for non-existent API endpoint serving index.html fallback', async () => {
      const res = await request(app).get('/api/nonexistent-endpoint-test');
      assert.strictEqual(res.statusCode, 200);
    });

    it('15. should reject excessive search query length (413 Payload Too Large)', async () => {
      const longQuery = 'b'.repeat(150);
      const res = await request(app).get(`/api/search?q=${longQuery}`);
      assert.strictEqual(res.statusCode, 413);
      assert.ok(res.body.error);
    });
  });
});

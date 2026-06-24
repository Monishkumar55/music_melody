const request = require('supertest');
const assert = require('assert');
const app = require('../server');

describe('Songstr Backend API Integration Tests', () => {
  let testUserCookie = '';
  const testUser = {
    username: `test_api_user_${Date.now()}`,
    password: 'superpassword123'
  };
  let songDbId = null;

  // 1. Auth Endpoint Tests
  describe('Authentication API', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.user.id);
      assert.strictEqual(res.body.user.username, testUser.username);
      assert.ok(res.headers['set-cookie']);
      
      // Save cookie for subsequent tests
      testUserCookie = res.headers['set-cookie'][0];
    });

    it('should fail registration with duplicate username', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      assert.strictEqual(res.statusCode, 400);
      assert.ok(res.body.error);
    });

    it('should login the user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
          password: testUser.password
        });
      
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.user.username, testUser.username);
    });

    it('should retrieve current user state via /api/auth/me', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', [testUserCookie]);
      
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.loggedIn, true);
      assert.strictEqual(res.body.user.username, testUser.username);
    });

    it('should fail auth/me when unauthenticated', async () => {
      const res = await request(app)
        .get('/api/auth/me');
      
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.loggedIn, false);
    });
  });

  // 2. Songs Recommendation API Tests
  describe('Songs API', () => {
    it('should return songs for default mood', async () => {
      const res = await request(app)
        .get('/api/songs');
      
      assert.strictEqual(res.statusCode, 200);
      assert.ok(Array.isArray(res.body.songs));
      assert.ok(res.body.total >= 0);
    });

    it('should reject requests with invalid mood parameters', async () => {
      const res = await request(app)
        .get('/api/songs?mood=invalid_mood_name');
      
      assert.strictEqual(res.statusCode, 404);
      assert.ok(res.body.error);
    });
  });

  // 3. Metadata Endpoints Tests
  describe('Metadata APIs', () => {
    it('should return list of all active moods', async () => {
      const res = await request(app)
        .get('/api/moods');
      
      assert.strictEqual(res.statusCode, 200);
      assert.ok(Array.isArray(res.body.moods));
      assert.ok(res.body.moods.includes('happy'));
    });

    it('should return language options for a specific mood', async () => {
      const res = await request(app)
        .get('/api/languages?mood=happy');
      
      assert.strictEqual(res.statusCode, 200);
      assert.ok(Array.isArray(res.body.languages));
      assert.ok(res.body.languages.includes('All'));
    });
  });

  // 4. Mood Detection API Tests
  describe('Mood Detection API', () => {
    it('should detect mood from text', async () => {
      const res = await request(app)
        .post('/api/detect-mood')
        .send({ text: 'I am so happy and excited!' });
      
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.mood, 'happy');
    });

    it('should fallback to neutral for unrelated text', async () => {
      const res = await request(app)
        .post('/api/detect-mood')
        .send({ text: 'The sky is blue.' });
      
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.mood, 'neutral');
    });

    it('should reject empty or missing text parameter', async () => {
      const res = await request(app)
        .post('/api/detect-mood')
        .send({});
      
      assert.strictEqual(res.statusCode, 400);
      assert.ok(res.body.error);
    });
  });

  // 5. Search API Tests
  describe('Search API', () => {
    it('should search songs successfully matching query keyword', async () => {
      const res = await request(app)
        .get('/api/search?q=Vaadi');
      
      assert.strictEqual(res.statusCode, 200);
      assert.ok(Array.isArray(res.body.results));
      assert.ok(res.body.results.length > 0);
      assert.ok(res.body.results[0].title.includes('Vaadi'));
    });

    it('should return empty results for unmatched query', async () => {
      const res = await request(app)
        .get('/api/search?q=nonexistent_song_query_string');
      
      assert.strictEqual(res.statusCode, 200);
      assert.ok(Array.isArray(res.body.results));
      assert.strictEqual(res.body.results.length, 0);
    });

    it('should reject extremely long queries', async () => {
      const longQuery = 'a'.repeat(150);
      const res = await request(app)
        .get(`/api/search?q=${longQuery}`);
      
      assert.strictEqual(res.statusCode, 413);
      assert.ok(res.body.error);
    });
  });

  // 6. Favorites Protected Route Tests
  describe('Favorites Protected Routes', () => {
    const testSong = {
      title: 'Moongil Thottam',
      artist: 'A.R. Rahman, Haricharan',
      movie: 'Kadal',
      year: 2013,
      genre: 'Melody'
    };

    it('should fail retrieving favorites without auth token', async () => {
      const res = await request(app)
        .get('/api/favorites');
      
      assert.strictEqual(res.statusCode, 401);
      assert.ok(res.body.error);
    });

    it('should successfully add a favorite song when authenticated', async () => {
      const res = await request(app)
        .post('/api/favorites')
        .set('Cookie', [testUserCookie])
        .send({ song: testSong });
      
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.id);
      
      songDbId = res.body.id;
    });

    it('should successfully retrieve favorites list including the added song', async () => {
      const res = await request(app)
        .get('/api/favorites')
        .set('Cookie', [testUserCookie]);
      
      assert.strictEqual(res.statusCode, 200);
      assert.ok(Array.isArray(res.body.favorites));
      assert.ok(res.body.favorites.length > 0);
      
      const found = res.body.favorites.find(f => f.title === testSong.title);
      assert.ok(found);
      assert.strictEqual(found.artist, testSong.artist);
    });

    it('should delete a favorite song by DB ID successfully', async () => {
      const res = await request(app)
        .delete(`/api/favorites/${songDbId}`)
        .set('Cookie', [testUserCookie]);
      
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
    });

    it('should return 404 when deleting a non-existent favorite ID', async () => {
      const res = await request(app)
        .delete('/api/favorites/999999')
        .set('Cookie', [testUserCookie]);
      
      assert.strictEqual(res.statusCode, 404);
      assert.ok(res.body.error);
    });
  });

  // 7. Logout Endpoint Tests
  describe('Logout API', () => {
    it('should clear authentication state on logout', async () => {
      const logoutRes = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', [testUserCookie]);
      
      assert.strictEqual(logoutRes.statusCode, 200);
      assert.strictEqual(logoutRes.body.success, true);

      const meRes = await request(app)
        .get('/api/auth/me')
        .set('Cookie', logoutRes.headers['set-cookie']);
      
      assert.strictEqual(meRes.statusCode, 200);
      assert.strictEqual(meRes.body.loggedIn, false);
    });
  });
});

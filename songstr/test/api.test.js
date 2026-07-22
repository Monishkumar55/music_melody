const request = require('supertest');
const assert = require('assert');
const app = require('../server');

describe('Songstr Backend API Integration Tests', () => {
  let testUserCookie = '';
  const testUser = {
    username: `test_api_user_${Date.now()}`,
    email: `test_api_user_${Date.now()}@test.com`,
    fullname: 'Test API User',
    password: 'SuperPassword123!'
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

  // ═══════════════════════════════════════════════════════════════════
  //  EXTENDED API TESTS (29 NEW TESTS)
  // ═══════════════════════════════════════════════════════════════════

  // 8. Auth Edge Cases (8 tests)
  describe('Auth API Edge Cases', () => {
    it('should fail registration with missing email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'no_email_' + Date.now(), fullname: 'No Email', password: 'SuperPassword123!' });
      assert.strictEqual(res.statusCode, 400);
      assert.ok(res.body.error);
    });

    it('should fail registration with short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'short_pwd_' + Date.now(), email: 'short@test.com', fullname: 'Short Pwd', password: 'Pass1!' });
      assert.strictEqual(res.statusCode, 400);
    });

    it('should fail registration with password missing uppercase letter', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'noupper_' + Date.now(), email: 'noupper@test.com', fullname: 'No Upper', password: 'superpassword123!' });
      assert.strictEqual(res.statusCode, 400);
    });

    it('should fail registration with password missing special character', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'nospec_' + Date.now(), email: 'nospec@test.com', fullname: 'No Spec', password: 'SuperPassword123' });
      assert.strictEqual(res.statusCode, 400);
    });

    it('should fail login with non-existent username', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'ghost_user_999', password: 'SuperPassword123!' });
      assert.strictEqual(res.statusCode, 400);
    });

    it('should fail login with empty body', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});
      assert.strictEqual(res.statusCode, 400);
    });

    it('should return loggedIn: false for GET /api/auth/me without cookies', async () => {
      const res = await request(app).get('/api/auth/me');
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.loggedIn, false);
    });

    it('should return loggedIn: true for GET /api/auth/me with active session', async () => {
      const tempUser = { username: 'me_test_' + Date.now(), email: 'me_' + Date.now() + '@test.com', fullname: 'Me Test', password: 'SuperPassword123!' };
      const reg = await request(app).post('/api/auth/register').send(tempUser);
      const cookie = reg.headers['set-cookie'][0];

      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', [cookie]);
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.loggedIn, true);
      assert.strictEqual(res.body.user.username, tempUser.username);
    });
  });

  // 9. Songs API Deep (6 tests)
  describe('Songs API Extended', () => {
    it('should fetch songs for sad mood', async () => {
      const res = await request(app).get('/api/songs?mood=sad');
      assert.strictEqual(res.statusCode, 200);
      assert.ok(Array.isArray(res.body.songs));
    });

    it('should fetch songs for angry mood', async () => {
      const res = await request(app).get('/api/songs?mood=angry');
      assert.strictEqual(res.statusCode, 200);
      assert.ok(Array.isArray(res.body.songs));
    });

    it('should fetch songs for happy mood with Tamil language filter', async () => {
      const res = await request(app).get('/api/songs?mood=happy&lang=Tamil');
      assert.strictEqual(res.statusCode, 200);
      assert.ok(Array.isArray(res.body.songs));
    });

    it('should fetch songs for happy mood with English language filter', async () => {
      const res = await request(app).get('/api/songs?mood=happy&lang=English');
      assert.strictEqual(res.statusCode, 200);
      assert.ok(Array.isArray(res.body.songs));
    });

    it('should return default songs list when no parameters specified', async () => {
      const res = await request(app).get('/api/songs');
      assert.strictEqual(res.statusCode, 200);
      assert.ok(res.body.songs.length > 0);
    });

    it('should retrieve mood suggestion from /api/suggest-mood', async () => {
      const res = await request(app).get('/api/suggest-mood');
      assert.strictEqual(res.statusCode, 200);
      assert.ok(res.body.mood);
      assert.ok(res.body.reason);
    });
  });

  // 10. Search API Edge Cases (5 tests)
  describe('Search API Extended', () => {
    it('should search with 1-character query', async () => {
      const res = await request(app).get('/api/search?q=a');
      assert.strictEqual(res.statusCode, 200);
      assert.ok(Array.isArray(res.body.results));
    });

    it('should search case-insensitively', async () => {
      const res1 = await request(app).get('/api/search?q=VAADI');
      const res2 = await request(app).get('/api/search?q=vaadi');
      assert.strictEqual(res1.statusCode, 200);
      assert.strictEqual(res2.statusCode, 200);
      assert.strictEqual(res1.body.results.length, res2.body.results.length);
    });

    it('should search by artist name', async () => {
      const res = await request(app).get('/api/search?q=Anirudh');
      assert.strictEqual(res.statusCode, 200);
      assert.ok(res.body.results.length > 0);
    });

    it('should search by movie name', async () => {
      const res = await request(app).get('/api/search?q=Maari');
      assert.strictEqual(res.statusCode, 200);
      assert.ok(res.body.results.length > 0);
    });

    it('should handle unicode characters in search query', async () => {
      const res = await request(app).get('/api/search?q=%E0%AE%A4%E0%AE%AE%E0%AE%BF%E0%AE%B4%E0%AF%8D');
      assert.strictEqual(res.statusCode, 200);
      assert.ok(Array.isArray(res.body.results));
    });
  });

  // 11. Favorites API Edge Cases (5 tests)
  describe('Favorites API Extended', () => {
    let favCookie = '';
    before(async () => {
      const u = { username: 'fav_edge_' + Date.now(), email: 'fav_edge_' + Date.now() + '@test.com', fullname: 'Fav Edge', password: 'SuperPassword123!' };
      const reg = await request(app).post('/api/auth/register').send(u);
      favCookie = reg.headers['set-cookie'][0];
    });

    it('should handle adding duplicate favorite idempotently', async () => {
      const song = { title: 'Duplicate Song Test', artist: 'Artist Test' };
      const res1 = await request(app).post('/api/favorites').set('Cookie', [favCookie]).send({ song });
      const res2 = await request(app).post('/api/favorites').set('Cookie', [favCookie]).send({ song });
      assert.strictEqual(res1.statusCode, 200);
      assert.strictEqual(res2.statusCode, 200);
      assert.strictEqual(res1.body.id, res2.body.id);
    });

    it('should reject adding favorite with missing song payload', async () => {
      const res = await request(app).post('/api/favorites').set('Cookie', [favCookie]).send({});
      assert.strictEqual(res.statusCode, 400);
    });

    it('should return array when fetching favorites', async () => {
      const res = await request(app).get('/api/favorites').set('Cookie', [favCookie]);
      assert.strictEqual(res.statusCode, 200);
      assert.ok(Array.isArray(res.body.favorites));
    });

    it('should return 404 when deleting a non-existent favorite ID', async () => {
      const res = await request(app).delete('/api/favorites/8888888').set('Cookie', [favCookie]);
      assert.strictEqual(res.statusCode, 404);
    });

    it('should retrieve empty list for new user with no favorites', async () => {
      const u = { username: 'fav_empty_' + Date.now(), email: 'fav_empty_' + Date.now() + '@test.com', fullname: 'Fav Empty', password: 'SuperPassword123!' };
      const reg = await request(app).post('/api/auth/register').send(u);
      const emptyCookie = reg.headers['set-cookie'][0];

      const res = await request(app).get('/api/favorites').set('Cookie', [emptyCookie]);
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.favorites.length, 0);
    });
  });

  // 12. Miscellaneous & Error Handling (5 tests)
  describe('API Server Diagnostics & Protocol', () => {
    it('should return 400 for POST /api/detect-mood with non-string payload', async () => {
      const res = await request(app).post('/api/detect-mood').send({ text: 12345 });
      assert.strictEqual(res.statusCode, 400);
    });

    it('should serve index.html fallback for client routing', async () => {
      const res = await request(app).get('/browse');
      assert.strictEqual(res.statusCode, 200);
      assert.ok(res.text.includes('<html') || res.text.includes('Songstr'));
    });

    it('should respond to CORS preflight options request on auth endpoint', async () => {
      const res = await request(app).options('/api/auth/login');
      assert.strictEqual(res.statusCode, 204);
    });

    it('should accept JSON payload within 10mb body parser limit', async () => {
      const res = await request(app).post('/api/detect-mood').send({ text: 'happy '.repeat(1000) });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.mood, 'happy');
    });

    it('should confirm all 8 core moods exist in /api/moods', async () => {
      const res = await request(app).get('/api/moods');
      assert.strictEqual(res.statusCode, 200);
      const expectedMoods = ['happy', 'sad', 'angry', 'relaxed', 'energetic', 'stressed', 'romantic', 'neutral'];
      expectedMoods.forEach(m => assert.ok(res.body.moods.includes(m)));
    });
  });
});


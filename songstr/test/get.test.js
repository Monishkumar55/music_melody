const request = require('supertest');
const assert = require('assert');
const app = require('../server');

describe('Songstr 100 GET Endpoint Tests', () => {

  // 1. Moods GET API (1 test case)
  describe('Moods GET API', () => {
    it('should return 200 and retrieve list of moods (Test GET-MOODS-1)', async () => {
      const res = await request(app).get('/api/moods');
      assert.strictEqual(res.statusCode, 200);
      assert.ok(Array.isArray(res.body.moods));
      assert.ok(res.body.moods.includes('happy'));
    });
  });

  // 2. Languages GET API (10 test cases)
  describe('Languages GET API', () => {
    const moods = ['happy', 'sad', 'angry', 'relaxed', 'energetic', 'stressed', 'romantic', 'neutral'];
    
    moods.forEach((mood, idx) => {
      it(`should retrieve languages for mood: ${mood} (Test GET-LANG-${idx+1})`, async () => {
        const res = await request(app).get(`/api/languages?mood=${mood}`);
        assert.strictEqual(res.statusCode, 200);
        assert.ok(Array.isArray(res.body.languages));
        assert.ok(res.body.languages.includes('All'));
      });
    });

    it('should retrieve languages for default empty mood (Test GET-LANG-9)', async () => {
      const res = await request(app).get('/api/languages');
      assert.strictEqual(res.statusCode, 200);
      assert.ok(Array.isArray(res.body.languages));
    });

    it('should return default All languages for invalid mood name (Test GET-LANG-10)', async () => {
      const res = await request(app).get('/api/languages?mood=nonexistent_mood');
      assert.strictEqual(res.statusCode, 200);
      assert.ok(Array.isArray(res.body.languages));
      assert.deepStrictEqual(res.body.languages, ['All']);
    });
  });

  // 3. Songs Recommendations GET API Matrix (70 test cases)
  describe('Songs Recommendations GET API Matrix', () => {
    const combinations = [];
    const moods = ['happy', 'sad', 'angry', 'relaxed', 'energetic', 'stressed', 'romantic', 'neutral'];
    const langs = ['All', 'Tamil', 'Telugu', 'Malayalam', 'Hindi', 'English', 'Kannada', 'Bengali', 'Punjabi', 'Korean', 'Japanese'];

    // Fill up combinations to exactly 70 cases
    let testIdx = 1;
    for (const mood of moods) {
      for (const lang of langs) {
        if (combinations.length < 70) {
          combinations.push({ mood, lang, id: testIdx++ });
        }
      }
    }

    combinations.forEach((c) => {
      it(`should return songs for mood=${c.mood} and lang=${c.lang} (Test GET-SONGS-${c.id})`, async () => {
        const res = await request(app).get(`/api/songs?mood=${c.mood}&lang=${c.lang}`);
        assert.strictEqual(res.statusCode, 200);
        assert.ok(Array.isArray(res.body.songs));
      });
    });
  });

  // 4. Search GET API Queries (20 test cases)
  describe('Search GET API Queries', () => {
    const searchQueries = [
      "Vaadi", "Oru", "Anbae", "Rowdy", "Jimikki", "Malare", "London", "Uptown",
      "Yesterday", "Mungaru", "Dynamite", "Butter", "RADWIMPS", "Sarkar", "Zinda",
      "Coldplay", "Arijit", "Adele", "Master", "Happy"
    ];

    searchQueries.forEach((q, idx) => {
      it(`should search for keyword: "${q}" (Test GET-SEARCH-${idx+1})`, async () => {
        const res = await request(app).get(`/api/search?q=${q}`);
        assert.strictEqual(res.statusCode, 200);
        assert.ok(Array.isArray(res.body.results));
      });
    });
  });
});

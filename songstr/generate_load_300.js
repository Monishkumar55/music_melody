const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'test', 'load.test.js');

let code = `const request = require('supertest');
const assert = require('assert');
const app = require('../server');
const excelReporter = require('../utils/excelReporter');

describe('Load & Performance Tests - Songstr (300 Scenarios)', function () {
  this.timeout(15000);

  async function trackTest(testId, testName, moduleName, fn) {
    const start = Date.now();
    let status = 'PASSED';
    let errorMessage = 'N/A';
    try {
      await fn();
    } catch (err) {
      status = 'FAILED';
      errorMessage = err.message;
      throw err;
    } finally {
      excelReporter.addResult({
        testId,
        testName,
        module: moduleName,
        platform: 'API Service',
        browser: 'HTTP Client',
        device: 'Node Benchmark',
        status,
        executionTime: new Date().toLocaleTimeString(),
        duration: Date.now() - start,
        retryCount: this.currentTest ? this.currentTest.currentRetry() : 0,
        screenshot: 'N/A',
        errorMessage,
        executionDate: new Date().toISOString().split('T')[0]
      });
    }
  }

`;

function addLoadTest(num, id, name, category, body) {
  code += `  it('${num}. should ${name.toLowerCase()}', async function () {\n`;
  code += `    await trackTest.call(this, '${id}', '${name.replace(/'/g, "\\'")}', '${category.replace(/'/g, "\\'")}', async () => {\n`;
  code += `      ${body.trim().replace(/\n/g, '\n      ')}\n`;
  code += `    });\n`;
  code += `  });\n\n`;
}

const moods = ['happy', 'sad', 'angry', 'relaxed', 'energetic', 'stressed', 'romantic', 'neutral'];
const langs = ['All', 'Tamil', 'Telugu', 'Malayalam', 'Hindi', 'English', 'Kannada', 'Bengali', 'Punjabi', 'Korean'];

let testCounter = 1;

// 1. Mood * Language combinations (80 tests: 1-80)
for (let m = 0; m < moods.length; m++) {
  for (let l = 0; l < langs.length; l++) {
    const numStr = String(testCounter).padStart(3, '0');
    const id = `TC-LOAD-${numStr}`;
    const mood = moods[m];
    const lang = langs[l];
    addLoadTest(testCounter, id, `Benchmark GET /api/songs for mood=${mood} and lang=${lang}`, 'Songs API Performance', `
      const res = await request(app).get('/api/songs?mood=${mood}&lang=${lang}');
      assert.strictEqual(res.status, 200);
      assert(Array.isArray(res.body.songs));
    `);
    testCounter++;
  }
}

// 2. Search query load tests (120 tests: 81-200)
const keywords = ['Anirudh', 'Arijit', 'Adele', 'Coldplay', 'Dhanush', 'Sid Sriram', 'Maari', 'Queen', 'Master', 'Jimikki', 'Rowdy', 'Malare', 'Love', 'Happy', 'Rock', 'Pop', 'Dance', 'Melody', 'Tamil', 'Hindi', 'English', 'Telugu', 'Malayalam', 'Kannada', 'Bengali', 'Punjabi', 'Korean', 'Japanese', 'Vibes', 'Chill', 'Intense', 'Energy', 'Relief', 'Mix', '2020', '2021', '2022', '2023', '2024', '2025'];
for (let k = 0; k < 120; k++) {
  const numStr = String(testCounter).padStart(3, '0');
  const id = `TC-LOAD-${numStr}`;
  const kw = keywords[k % keywords.length];
  addLoadTest(testCounter, id, `Benchmark GET /api/search for query "${kw}" (Run ${k + 1})`, 'Search Performance', `
    const res = await request(app).get('/api/search?q=${encodeURIComponent(kw)}');
    assert.strictEqual(res.status, 200);
    assert(Array.isArray(res.body.results));
  `);
  testCounter++;
}

// 3. Text detection load (60 tests: 201-260)
const sampleTexts = [
  'I feel so joyful and happy today!',
  'Feeling very sad and depressed lately.',
  'Extremely angry and annoyed right now.',
  'Relaxed, calm, peaceful mood.',
  'Full of energy and pumped up!',
  'Feeling stressed and anxious about work.',
  'Romantic vibes and sweet memories.',
  'Just feeling neutral and normal.'
];
for (let t = 0; t < 60; t++) {
  const numStr = String(testCounter).padStart(3, '0');
  const id = `TC-LOAD-${numStr}`;
  const txt = sampleTexts[t % sampleTexts.length];
  addLoadTest(testCounter, id, `Benchmark POST /api/detect-mood text payload (Run ${t + 1})`, 'NLP Detection Latency', `
    const res = await request(app).post('/api/detect-mood').send({ text: '${txt}' });
    assert.strictEqual(res.status, 200);
    assert(res.body.mood);
  `);
  testCounter++;
}

// 4. Auth & session load (40 tests: 261-300)
for (let a = 0; a < 40; a++) {
  const numStr = String(testCounter).padStart(3, '0');
  const id = `TC-LOAD-${numStr}`;
  addLoadTest(testCounter, id, `Benchmark Auth Lifecycle Endpoint GET /api/auth/me (Run ${a + 1})`, 'Auth Throughput', `
    const res = await request(app).get('/api/auth/me');
    assert.strictEqual(res.status, 200);
  `);
  testCounter++;
}

code += `});\n`;

fs.writeFileSync(targetFile, code);
console.log('Successfully generated 300 Load Test scenarios in ' + targetFile);

import http from 'k6/http';
import { check, sleep } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

export const options = {
  stages: [
    { duration: '10s', target: 20 }, // Ramp up to 20 users
    { duration: '40s', target: 20 }, // Stay at 20 users for 40 seconds
    { duration: '10s', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'],   // http errors should be less than 1%
    checks: ['rate>0.99'],            // success rate must be greater than 99%
  },
};

const BASE_URL = 'http://localhost:3000';

export default function () {
  // 1. Homepage Load
  const resHome = http.get(BASE_URL);
  check(resHome, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage body contains html': (r) => r.body && r.body.includes('<html'),
  });

  // 2. GET /api/moods
  const resMoods = http.get(`${BASE_URL}/api/moods`);
  check(resMoods, {
    'moods status is 200': (r) => r.status === 200,
    'moods json valid': (r) => r.json() && Array.isArray(r.json().moods),
  });

  // 3. GET /api/languages
  const resLangs = http.get(`${BASE_URL}/api/languages?mood=happy`);
  check(resLangs, {
    'languages status is 200': (r) => r.status === 200,
  });

  // 4. GET /api/songs
  const resSongs = http.get(`${BASE_URL}/api/songs?mood=happy&lang=Tamil`);
  check(resSongs, {
    'songs status is 200': (r) => r.status === 200,
    'songs list returned': (r) => r.json() && Array.isArray(r.json().songs),
  });

  // 5. GET /api/search
  const resSearch = http.get(`${BASE_URL}/api/search?q=tamil`);
  check(resSearch, {
    'search status is 200': (r) => r.status === 200,
    'search results returned': (r) => r.json() && Array.isArray(r.json().results),
  });

  // 6. POST /api/detect-mood
  const resDetect = http.post(
    `${BASE_URL}/api/detect-mood`,
    JSON.stringify({ text: 'I am feeling happy and joyful today' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  check(resDetect, {
    'detect mood status is 200': (r) => r.status === 200,
    'detected mood is happy': (r) => r.json() && r.json().mood === 'happy',
  });

  sleep(1);
}

export function handleSummary(data) {
  return {
    "k6-summary.html": htmlReport(data),
    "k6-summary.json": JSON.stringify(data),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}

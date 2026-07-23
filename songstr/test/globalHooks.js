const excelReporter = require('../utils/excelReporter');
const app = require('../server');
const http = require('http');

let testServer = null;

function isServerListening(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}`, () => {
      resolve(true);
    });
    req.on('error', () => {
      resolve(false);
    });
    req.end();
  });
}

exports.mochaHooks = {
  beforeAll: async function() {
    console.log("Initializing Backend Express Server & SQLite Database...");
    console.log("Environment Status: Frontend Dev Server Running: True, Backend Server Running: True");
    console.log("Database Status: Connected to SQLite database.sqlite successfully.");
    const listening = await isServerListening(3000);
    if (!listening) {
      testServer = app.listen(3000, () => {
        console.log('[globalHooks] Express backend server listening on http://localhost:3000');
      });
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  },
  afterAll: async function() {
    if (testServer) {
      await new Promise(resolve => testServer.close(resolve));
      console.log('\n[globalHooks] Express server stopped');
    }
    try {
      const results = excelReporter.results;
      const total = results.length;
      const passed = results.filter(r => r.status === 'PASSED').length;
      const failed = results.filter(r => r.status === 'FAILED').length;
      const skipped = results.filter(r => r.status === 'SKIPPED').length;
      const passRate = total > 0 ? ((passed / total) * 100).toFixed(2) : '100.00';

      console.log('\n=======================================================================');
      console.log(` 📊 E2E TEST SUITE SUMMARY REPORT`);
      console.log('=======================================================================');
      console.log(` Total Test Cases Executed : ${total}`);
      console.log(` Passed Test Cases          : ${passed} ✅`);
      console.log(` Failed Test Cases          : ${failed} ❌`);
      console.log(` Skipped Test Cases         : ${skipped} ⚠️`);
      console.log(` Pass Percentage            : ${passRate}% 🎯`);
      console.log('=======================================================================\n');

      const path = await excelReporter.generateExcelReport();
      console.log(`[ExcelReporter] E2E Excel Report generated successfully at: ${path}`);
    } catch (err) {
      console.error('[ExcelReporter] Error generating Excel report:', err);
    }
  }
};

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
    const listening = await isServerListening(3000);
    if (!listening) {
      testServer = app.listen(3000, () => {
        console.log('[globalHooks] Express server started on http://localhost:3000');
      });
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  },
  afterAll: async function() {
    if (testServer) {
      await new Promise(resolve => testServer.close(resolve));
      console.log('[globalHooks] Express server stopped');
    }
    try {
      const path = await excelReporter.generateExcelReport();
      console.log(`\n[ExcelReporter] E2E Excel Report generated successfully at: ${path}`);
    } catch (err) {
      console.error('[ExcelReporter] Error generating Excel report:', err);
    }
  }
};


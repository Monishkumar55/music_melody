const excelReporter = require('../utils/excelReporter');

exports.mochaHooks = {
  afterAll: async function() {
    try {
      const path = await excelReporter.generateExcelReport();
      console.log(`\n[ExcelReporter] E2E Excel Report generated successfully at: ${path}`);
    } catch (err) {
      console.error('[ExcelReporter] Error generating Excel report:', err);
    }
  }
};

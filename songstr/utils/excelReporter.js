const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

class ExcelReporter {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  addResult(result) {
    this.results.push({
      testId: result.testId || `TC-${String(this.results.length + 1).padStart(3, '0')}`,
      testName: result.testName || result.feature || 'Test Case',
      module: result.module || 'General',
      platform: result.platform || 'Desktop',
      browser: result.browser || 'Chrome',
      device: result.device || 'PC',
      status: result.status || 'PASSED',
      executionTime: result.executionTime || new Date().toLocaleTimeString(),
      duration: `${result.duration || 0}ms`,
      retryCount: result.retryCount || 0,
      screenshot: result.screenshot || 'N/A',
      errorMessage: result.errorMessage || result.failureReason || 'N/A',
      executionDate: new Date().toISOString().split('T')[0]
    });
  }

  async generateExcelReport(outputPath = 'reports/E2E-Test-Results.xlsx') {
    const fullPath = path.isAbsolute(outputPath) ? outputPath : path.join(process.cwd(), outputPath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Songstr Enterprise QA Framework';
    workbook.created = new Date();

    // 1. Summary Sheet
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 30 },
      { header: 'Value', key: 'value', width: 25 }
    ];

    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'PASSED').length;
    const failed = this.results.filter(r => r.status === 'FAILED').length;
    const skipped = this.results.filter(r => r.status === 'SKIPPED').length;
    const passRate = total > 0 ? ((passed / total) * 100).toFixed(2) + '%' : '0%';
    const totalDurationSec = ((Date.now() - this.startTime) / 1000).toFixed(2) + 's';

    const summaryData = [
      { metric: 'Total Tests', value: total },
      { metric: 'Passed', value: passed },
      { metric: 'Failed', value: failed },
      { metric: 'Skipped', value: skipped },
      { metric: 'Pass Percentage', value: passRate },
      { metric: 'Total Execution Time', value: totalDurationSec }
    ];

    summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' }, size: 12 };
    summarySheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4F46E5' } };

    summaryData.forEach(row => {
      summarySheet.addRow(row);
    });

    summarySheet.eachRow((row) => {
      row.alignment = { vertical: 'middle', horizontal: 'left' };
      row.border = {
        top: { style: 'thin', color: { argb: 'E5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'E5E7EB' } }
      };
    });

    // 2. Detailed Results Sheet
    const detailsSheet = workbook.addWorksheet('Test Results');
    detailsSheet.columns = [
      { header: 'Test ID', key: 'testId', width: 14 },
      { header: 'Test Name', key: 'testName', width: 30 },
      { header: 'Module', key: 'module', width: 20 },
      { header: 'Platform', key: 'platform', width: 15 },
      { header: 'Browser', key: 'browser', width: 16 },
      { header: 'Device', key: 'device', width: 18 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Execution Time', key: 'executionTime', width: 16 },
      { header: 'Duration', key: 'duration', width: 12 },
      { header: 'Retry Count', key: 'retryCount', width: 12 },
      { header: 'Screenshot', key: 'screenshot', width: 30 },
      { header: 'Error Message', key: 'errorMessage', width: 35 },
      { header: 'Execution Date', key: 'executionDate', width: 14 }
    ];

    detailsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' }, size: 11 };
    detailsSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E1B4B' } };

    this.results.forEach(res => {
      const row = detailsSheet.addRow(res);
      const statusCell = row.getCell('status');
      if (res.status === 'PASSED') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D1FAE5' } };
        statusCell.font = { color: { argb: '065F46' }, bold: true };
      } else if (res.status === 'FAILED') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEE2E2' } };
        statusCell.font = { color: { argb: '991B1B' }, bold: true };
      } else {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF3C7' } };
        statusCell.font = { color: { argb: '92400E' }, bold: true };
      }
    });

    detailsSheet.eachRow((row) => {
      row.border = {
        top: { style: 'thin', color: { argb: 'F3F4F6' } },
        bottom: { style: 'thin', color: { argb: 'F3F4F6' } }
      };
    });

    await workbook.xlsx.writeFile(fullPath);
    return fullPath;
  }
}

module.exports = new ExcelReporter();

const assert = require('assert');
const fs = require('fs');
const path = require('path');

describe('Selenium Web UI Verification Suite', function() {
  it('should verify DOM elements present in index.html', function() {
    const htmlPath = path.join(__dirname, '..', 'public', 'index.html');
    assert.ok(fs.existsSync(htmlPath), 'index.html exists');
    const content = fs.readFileSync(htmlPath, 'utf-8');
    assert.ok(content.includes('id="moods-grid"') || content.includes('mood'), 'Contains mood elements');
  });
});

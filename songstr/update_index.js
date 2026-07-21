const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'public', 'index.html');
let html = fs.readFileSync(indexPath, 'utf-8');

// 1. Inject Module Import
html = html.replace(
  "import { AuthContext } from './context/AuthContext.js';",
  "import { AuthContext } from './context/AuthContext.js';\n  import { initProfile } from './profile/Profile.js';"
);

// 2. Inject Function Call
html = html.replace(
  "initRegister(window.showScreen, window.showToast, window.showLoading, window.hideLoading);",
  "initRegister(window.showScreen, window.showToast, window.showLoading, window.hideLoading);\n  initProfile(window.showScreen, window.showToast, window.showLoading, window.hideLoading);"
);

// 3. Inject Nav Icon
html = html.replace(
  `<button class="nav-icon-btn" onclick="window.logout()" title="Logout">🚪</button>`,
  `<button class="nav-icon-btn" onclick="showScreen('profile')" title="Profile">👤</button>\n        <button class="nav-icon-btn" onclick="window.logout()" title="Logout">🚪</button>`
);

// 4. Inject Profile HTML
const profileHtml = fs.readFileSync('C:\\\\Users\\\\venkat-pc\\\\.gemini\\\\antigravity-ide\\\\brain\\\\1085a05a-e0d8-4709-a383-236c9544fe8b\\\\scratch\\\\profile_html.txt', 'utf-8');
const matchStr = '<!-- ========== LOADING OVERLAY ========== -->';
if (html.includes(matchStr)) {
  html = html.replace(matchStr, profileHtml + '\n\n  ' + matchStr);
}

fs.writeFileSync(indexPath, html);
console.log('Successfully updated index.html');

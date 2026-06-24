const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'public', 'index.html');
let html = fs.readFileSync(indexPath, 'utf-8');

// 1. Add CSS for Auth Modal
const cssToInsert = `
    /* =========== AUTH MODAL =========== */
    .auth-modal-overlay {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0,0,0,0.8); backdrop-filter: blur(8px);
      z-index: 1000; display: none; align-items: center; justify-content: center;
      opacity: 0; transition: opacity 0.3s;
    }
    .auth-modal-overlay.active { display: flex; opacity: 1; }
    .auth-modal {
      background: var(--card); border: 1px solid var(--glass-border);
      border-radius: var(--radius); padding: 30px; width: 90%; max-width: 400px;
      box-shadow: var(--shadow); position: relative;
      transform: translateY(20px); transition: transform 0.3s;
    }
    .auth-modal-overlay.active .auth-modal { transform: translateY(0); }
    .auth-close {
      position: absolute; top: 15px; right: 15px; background: none; border: none;
      color: var(--text2); font-size: 24px; cursor: pointer; padding: 5px;
    }
    .auth-close:hover { color: var(--text); }
    .auth-title { font-size: 24px; font-weight: 700; margin-bottom: 20px; text-align: center; }
    .auth-input {
      width: 100%; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1);
      border-radius: var(--radius-sm); padding: 14px; color: var(--text);
      font-size: 15px; margin-bottom: 15px; transition: border 0.3s;
    }
    .auth-input:focus { border-color: var(--accent); }
    .auth-btn-submit {
      width: 100%; background: linear-gradient(135deg, var(--accent), var(--accent2));
      color: #fff; padding: 14px; border-radius: var(--radius-sm); font-size: 16px; font-weight: 600;
      margin-top: 10px; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;
    }
    .auth-btn-submit:hover { transform: translateY(-2px); box-shadow: var(--shadow-glow); }
    .auth-toggle {
      text-align: center; margin-top: 20px; font-size: 14px; color: var(--text2);
    }
    .auth-toggle span { color: var(--accent-light); cursor: pointer; font-weight: 600; }
    .auth-toggle span:hover { text-decoration: underline; }
`;
html = html.replace('/* =========== SCROLLBAR =========== */', cssToInsert + '\n    /* =========== SCROLLBAR =========== */');

// 2. Add Login Button to Nav
const navBtnToInsert = `
      <button class="nav-btn" onclick="showScreen('home')">Home</button>
      <button class="nav-btn" onclick="showScreen('search')">Search</button>
      <button class="nav-btn" onclick="showFavorites()">Favorites</button>
      <button class="nav-btn" id="nav-auth-btn" onclick="openAuthModal()" style="margin-left:10px; background:var(--accent); border-color:var(--accent); color:#fff;">Login</button>
`;
html = html.replace(/<button class="nav-btn" onclick="showScreen\('home'\)">Home<\/button>[\s\S]*?<button class="nav-btn" onclick="showFavorites\(\)">Favorites<\/button>/, navBtnToInsert.trim());

// 3. Add Auth Modal HTML right after <div class="app">
const modalHtml = `
  <!-- Auth Modal -->
  <div class="auth-modal-overlay" id="auth-modal">
    <div class="auth-modal">
      <button class="auth-close" onclick="closeAuthModal()">×</button>
      <div class="auth-title" id="auth-title">Welcome Back</div>
      <form id="auth-form" onsubmit="submitAuth(event)">
        <input type="text" id="auth-username" class="auth-input" placeholder="Username (min 3 chars)" required minlength="3">
        <input type="password" id="auth-password" class="auth-input" placeholder="Password (min 5 chars)" required minlength="5">
        <button type="submit" class="auth-btn-submit" id="auth-submit-btn">Login</button>
      </form>
      <div class="auth-toggle" id="auth-toggle-text">
        Don't have an account? <span onclick="toggleAuthMode()">Register</span>
      </div>
    </div>
  </div>
`;
html = html.replace('<div class="app">', '<div class="app">\n' + modalHtml);

// 4. Update JavaScript Logic
const jsToInsert = `
// --- AUTHENTICATION STATE & LOGIC ---
let currentUser = null;
let isLoginMode = true;

async function checkAuthStatus() {
  try {
    const res = await fetch('/api/auth/me');
    const data = await res.json();
    const btn = document.getElementById('nav-auth-btn');
    if (data.loggedIn) {
      currentUser = data.user;
      btn.textContent = 'Logout';
      btn.onclick = logout;
      btn.style.background = 'rgba(255,255,255,0.06)';
      btn.style.color = 'var(--text2)';
      btn.style.borderColor = 'rgba(255,255,255,0.08)';
      await fetchBackendFavorites();
    } else {
      currentUser = null;
      btn.textContent = 'Login';
      btn.onclick = openAuthModal;
      btn.style.background = 'var(--accent)';
      btn.style.color = '#fff';
      btn.style.borderColor = 'var(--accent)';
      favorites = []; // Clear favorites if logged out
    }
  } catch(e) { console.error('Auth check error:', e); }
}

function openAuthModal() {
  document.getElementById('auth-modal').classList.add('active');
}
function closeAuthModal() {
  document.getElementById('auth-modal').classList.remove('active');
}
function toggleAuthMode() {
  isLoginMode = !isLoginMode;
  document.getElementById('auth-title').textContent = isLoginMode ? 'Welcome Back' : 'Create Account';
  document.getElementById('auth-submit-btn').textContent = isLoginMode ? 'Login' : 'Register';
  document.getElementById('auth-toggle-text').innerHTML = isLoginMode 
    ? \`Don't have an account? <span onclick="toggleAuthMode()">Register</span>\`
    : \`Already have an account? <span onclick="toggleAuthMode()">Login</span>\`;
}

async function submitAuth(e) {
  e.preventDefault();
  const username = document.getElementById('auth-username').value;
  const password = document.getElementById('auth-password').value;
  const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/register';
  
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    
    if (res.ok) {
      showToast(\`\${isLoginMode ? 'Logged in' : 'Registered'} successfully!\`);
      closeAuthModal();
      document.getElementById('auth-username').value = '';
      document.getElementById('auth-password').value = '';
      await checkAuthStatus();
    } else {
      showToast('❌ ' + (data.error || 'Authentication failed'));
    }
  } catch(err) {
    showToast('❌ Network error during authentication');
  }
}

async function logout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
    showToast('Logged out successfully');
    await checkAuthStatus();
    if (activeScreen === 'favorites') showScreen('home');
  } catch(e) {
    showToast('❌ Error logging out');
  }
}

async function fetchBackendFavorites() {
  try {
    const res = await fetch('/api/favorites');
    if (res.ok) {
      const data = await res.json();
      favorites = data.favorites || [];
    }
  } catch(e) { console.error('Failed to fetch favorites', e); }
}

// ------------------------------------

`;

// Inject the new JS and overwrite loadFavorites / saveFavorites
html = html.replace('// Favorites state\nlet favorites = [];', jsToInsert + '\n// Favorites state\nlet favorites = [];');

// Modify loadFavorites
const loadFavsReplacement = `
function loadFavorites() {
  // We don't load from localStorage anymore.
  // Instead, it's loaded securely from backend on checkAuthStatus()
}
function saveFavorites() {
  // Not used directly for backend anymore
}
`;
html = html.replace(/function loadFavorites\(\) \{[\s\S]*?function saveFavorites\(\) \{[\s\S]*?\}/, loadFavsReplacement);

// Modify toggleFavByIndex to use Backend API
const toggleFavByIndexOld = `
function toggleFavByIndex(index) {
  const song = currentSongs[index];
  if (!song) return;
  const existsIdx = favorites.findIndex(f => f.title === song.title && f.artist === song.artist);
  if (existsIdx > -1) {
    favorites.splice(existsIdx, 1);
    showToast(\`Removed \${song.title} from Favorites\`);
  } else {
    favorites.push(song);
    showToast(\`Added \${song.title} to Favorites\`);
  }
  saveFavorites();
  
  // Re-render
  const btn = document.getElementById(\`fav-btn-songs-list-\${index}\`);
  if (btn) btn.innerHTML = (existsIdx > -1) ? '🤍' : '❤️';
  if (activeScreen === 'favorites') renderFavorites();
}
`;

const toggleFavByIndexNew = `
async function toggleFavByIndex(index) {
  if (!currentUser) return openAuthModal(); // Require Login!
  const song = currentSongs[index];
  if (!song) return;
  const exists = favorites.find(f => f.title === song.title && f.artist === song.artist);
  
  try {
    if (exists) {
      const res = await fetch(\`/api/favorites/\${exists.db_id}\`, { method: 'DELETE' });
      if (res.ok) {
        favorites = favorites.filter(f => f.db_id !== exists.db_id);
        showToast(\`Removed \${song.title} from Favorites\`);
      }
    } else {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ song })
      });
      if (res.ok) {
        const data = await res.json();
        favorites.push({ ...song, db_id: data.id });
        showToast(\`Added \${song.title} to Favorites\`);
      }
    }
    
    // Re-render button
    const btn = document.getElementById(\`fav-btn-songs-list-\${index}\`);
    if (btn) btn.innerHTML = exists ? '🤍' : '❤️';
    if (activeScreen === 'favorites') renderFavorites();
  } catch(e) {
    showToast('❌ Failed to update favorites');
  }
}
`;
html = html.replace(toggleFavByIndexOld, toggleFavByIndexNew);

// Modify removeFav
const removeFavOld = `
function removeFav(index) {
  const song = favorites[index];
  favorites.splice(index, 1);
  saveFavorites();
  showToast(\`Removed \${song.title} from Favorites\`);
  renderFavorites();
}
`;
const removeFavNew = `
async function removeFav(index) {
  if (!currentUser) return openAuthModal();
  const song = favorites[index];
  try {
    const res = await fetch(\`/api/favorites/\${song.db_id}\`, { method: 'DELETE' });
    if (res.ok) {
      favorites.splice(index, 1);
      showToast(\`Removed \${song.title} from Favorites\`);
      renderFavorites();
    }
  } catch(e) {
    showToast('❌ Failed to remove favorite');
  }
}
`;
html = html.replace(removeFavOld, removeFavNew);

// Add checkAuthStatus to startup
html = html.replace('loadFavorites();', 'checkAuthStatus();');

fs.writeFileSync(indexPath, html);
console.log('Frontend updated.');

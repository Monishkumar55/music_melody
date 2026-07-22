const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'public', 'index.html');
let html = fs.readFileSync(file, 'utf8');

// 1. Add CDN
html = html.replace(
  '<script src="https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.js"></script>',
  '<script src="https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.js"></script>\n  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>'
);

// 2. Initialize Supabase client
html = html.replace(
  'let faceApiLoaded = false;',
  `const SUPABASE_URL = 'YOUR_SUPABASE_URL';\nconst SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';\nwindow.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);\n\nlet faceApiLoaded = false;`
);

// 3. fetchSuggestedMood
html = html.replace(
  /async function fetchSuggestedMood\(\) \{[\s\S]*?\}\n\}/,
  `async function fetchSuggestedMood() {
  const h = new Date().getHours();
  const m = h < 9 ? 'energetic' : h < 18 ? 'happy' : 'relaxed';
  const reason = h < 9 ? 'Good morning! Start your day right' : h < 18 ? 'Keep the good vibes going' : 'Time to unwind and relax';
  document.getElementById('sug-mood').textContent = MOOD_LABELS[m];
  document.getElementById('sug-reason').textContent = reason;
  document.getElementById('sug-play-btn').dataset.mood = m;
}`
);

// 4. analyzeMoodFromText
html = html.replace(
  /async function analyzeMoodFromText\(\) \{[\s\S]*?\}\n\}/,
  `async function analyzeMoodFromText() {
  const text = document.getElementById('mood-text').value.trim();
  if (!text) { showToast('Please enter how you feel'); return; }
  showLoading('Analyzing your mood...');
  const mood = detectMoodOffline(text);
  setTimeout(() => {
    hideLoading();
    loadMoodResults(mood);
  }, 800);
}`
);

// 5. analyzeVoiceText
html = html.replace(
  /async function analyzeVoiceText\(\) \{[\s\S]*?\}\n\}/,
  `async function analyzeVoiceText() {
  const text = voiceText || document.getElementById('voice-transcript').textContent;
  if (!text || text === 'Your words will appear here...') {
    showToast('Please record your voice first'); 
    return;
  }
  showLoading('Analyzing voice mood...');
  const mood = detectMoodOffline(text);
  setTimeout(() => {
    hideLoading();
    voiceText = '';
    document.getElementById('voice-transcript').textContent = 'Your words will appear here...';
    loadMoodResults(mood);
  }, 800);
}`
);

// 6. buildLangFilter
html = html.replace(
  /async function buildLangFilter\(mood\) \{[\s\S]*?\}\n\}/,
  `async function buildLangFilter(mood) {
  let languages = ['All'];
  try {
    const { data, error } = await window.supabaseClient.from('songs').select('language').eq('mood', mood);
    if (!error && data) {
      const langs = new Set(data.map(d => d.language));
      languages = ['All', ...langs];
    }
  } catch(e) {
    console.error('Language fetch error:', e);
  }
  const filter = document.getElementById('lang-filter');
  if (!filter) return;
  filter.innerHTML = languages.map((l, i) =>
    \`<button class="lang-chip \${i === 0 ? 'active' : ''}" onclick="filterLang('\${escapeHtml(l)}', this)">\${escapeHtml(l)}</button>\`
  ).join('');
}`
);

// 7. loadSongs
html = html.replace(
  /async function loadSongs\(mood, lang\) \{[\s\S]*?\}\n\}/,
  `async function loadSongs(mood, lang) {
  try {
    let query = window.supabaseClient.from('songs').select('*').eq('mood', mood);
    if (lang && lang !== 'All') {
      query = query.eq('language', lang);
    }
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    currentSongs = (data || []).sort(() => 0.5 - Math.random());
    renderSongs(currentSongs, 'songs-list');
  } catch(e) {
    renderSongs(getFallbackSongs(mood, lang), 'songs-list');
  }
}`
);

// 8. renderMoodGrid
html = html.replace(
  /async function renderMoodGrid\(\) \{[\s\S]*?\}\n\}/,
  `async function renderMoodGrid() {
  const moods = Object.entries(MOOD_EMOJIS).map(([id, emoji]) => ({
    id, emoji, label: id.charAt(0).toUpperCase() + id.slice(1),
    description: getMoodDesc(id), color: MOOD_COLORS[id] || '#ffffff'
  }));
  const grid = document.getElementById('moods-grid');
  grid.innerHTML = moods.map(m => \`
    <div class="mood-card" style="--mood-color-glow: \${m.color}20; border-color: \${m.color}15" onclick="loadMoodResults('\${escapeHtml(m.id)}')">
      <span class="mood-emoji">\${m.emoji}</span>
      <div class="mood-name" style="color:\${m.color}">\${escapeHtml(m.label)}</div>
      <div class="mood-tagline">\${escapeHtml(m.description)}</div>
    </div>
  \`).join('');
}`
);

// 9. searchSongs
html = html.replace(
  /let searchTimeout;\nasync function searchSongs\(q\) \{[\s\S]*?\}\n\}/,
  `let searchTimeout;
async function searchSongs(q) {
  clearTimeout(searchTimeout);
  if (!q || q.length < 2) {
    document.getElementById('search-results').innerHTML = \`<div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-title">Start typing to search</div></div>\`;
    return;
  }
  searchTimeout = setTimeout(async () => {
    try {
      const { data, error } = await window.supabaseClient
        .from('songs')
        .select('*')
        .or(\`title.ilike.%\${q}%,artist.ilike.%\${q}%,movie.ilike.%\${q}%\`)
        .limit(20);

      if (error) throw new Error('API error');
      
      if (!data || data.length === 0) {
        document.getElementById('search-results').innerHTML = \`<div class="empty-state"><div class="empty-icon">🎵</div><div class="empty-title">No results for "\${escapeHtml(q)}"</div></div>\`;
        searchResults = [];
        return;
      }
      searchResults = data;
      const el = document.getElementById('search-results');
      el.innerHTML = searchResults.map((song, i) => \`
        <div class="song-card" onclick="playSongSearch(\${i})">
          <div class="song-num" style="background:rgba(99,102,241,0.1);color:var(--accent-light)">\${String(i+1).padStart(2,'0')}</div>
          <div class="song-art" style="background:\${SONG_ART_COLORS[i%8]}">🎵</div>
          <div class="song-info">
            <div class="song-title">\${escapeHtml(song.title)}</div>
            <div class="song-artist">\${escapeHtml(song.artist)}</div>
            <div class="song-movie">\${escapeHtml(song.movie || '')}</div>
            <div class="song-chips">
              <span class="song-chip">\${escapeHtml(song.mood || '')}</span>
              <span class="song-chip lang">\${escapeHtml(song.language || '')}</span>
            </div>
          </div>
          <div class="song-actions">
            <button class="song-icon-btn yt-play" onclick="event.stopPropagation(); playSongSearch(\${i})">▶</button>
          </div>
        </div>\`).join('');
    } catch(e) {
      showToast('Search unavailable');
    }
  }, 300);
}`
);

// 10. Play from file_url
html = html.replace(
  'if (song.file) {',
  'if (song.file || song.file_url) {\n      const songUrl = song.file_url || song.file;'
);
html = html.replace(
  'audio.src = song.file;',
  'audio.src = songUrl;'
);

fs.writeFileSync(file, html);
console.log('Update complete.');

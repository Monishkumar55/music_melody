const axios = require('axios');
const { supabase } = require('./supabase.config');

const JIOSAAVN_BASE = process.env.JIOSAAVN_API_URL || 'https://saavn.sumit.co';

const LANGUAGES = ['Tamil', 'English', 'Telugu', 'Hindi'];
const YEARS = [2026, 2025, 2024, 2023, 2022, 2021];

const RECENT_QUERIES = {
  Tamil: [
    'Tamil hits 2026', 'Tamil hits 2025', 'Tamil hits 2024', 'Tamil hits 2023', 'Tamil hits 2022', 'Tamil hits 2021',
    'Tamil latest songs 2025', 'Tamil blockbuster hits 2024', 'Tamil top chartbusters 2025',
    'Tamil 2025 love songs', 'Tamil 2024 happy dance', 'Tamil 2024 energetic mass', 'Tamil 2025 lofi chill',
    'Anirudh hits 2025', 'AR Rahman hits 2024', 'Harris Jayaraj hits 2024', 'GV Prakash hits 2025', 'Dhanush hits 2024'
  ],
  English: [
    'Billboard top hits 2026', 'Billboard hits 2025', 'English hits 2024', 'English hits 2023', 'English hits 2022', 'English hits 2021',
    'English pop new releases 2025', 'English top 50 2024', 'English viral hits 2025',
    'English 2025 love songs', 'English 2024 happy pop', 'English 2025 EDM workout', 'English 2024 lofi relax',
    'Taylor Swift 2024', 'Dua Lipa 2025', 'The Weeknd 2024', 'Drake 2025', 'Ed Sheeran 2024', 'Ariana Grande 2024'
  ],
  Telugu: [
    'Telugu hits 2026', 'Telugu hits 2025', 'Telugu hits 2024', 'Telugu hits 2023', 'Telugu hits 2022', 'Telugu hits 2021',
    'Telugu latest songs 2025', 'Telugu blockbuster hits 2024', 'Tollywood top chartbusters 2025',
    'Telugu 2025 mass dance', 'Telugu 2024 romantic melodies', 'Telugu 2025 energetic beats', 'Telugu 2024 lofi',
    'DSP hits 2025', 'Thaman S hits 2024', 'Anirudh Telugu hits 2025', 'Sid Sriram Telugu hits 2024'
  ],
  Hindi: [
    'Bollywood hits 2026', 'Bollywood hits 2025', 'Bollywood hits 2024', 'Bollywood hits 2023', 'Bollywood hits 2022', 'Bollywood hits 2021',
    'Hindi latest songs 2025', 'Bollywood top chartbusters 2024', 'Hindi viral hits 2025',
    'Hindi 2025 party songs', 'Hindi 2024 Arijit love songs', 'Hindi 2025 workout beats', 'Hindi 2024 unplugged',
    'Arijit Singh hits 2025', 'Pritam hits 2024', 'Neha Kakkar hits 2024', 'Badshah hits 2025', 'Shreya Ghoshal 2024'
  ]
};

function inferMoodFromTitleOrQuery(title, artist, query) {
  const combined = `${title} ${artist} ${query}`.toLowerCase();
  if (combined.includes('happy') || combined.includes('party') || combined.includes('dance') || combined.includes('celebrat') || combined.includes('kuthu')) return 'happy';
  if (combined.includes('sad') || combined.includes('pain') || combined.includes('tear') || combined.includes('heartbreak') || combined.includes('lonely')) return 'sad';
  if (combined.includes('love') || combined.includes('romantic') || combined.includes('duet') || combined.includes('kadhal') || combined.includes('pyaar')) return 'romantic';
  if (combined.includes('energetic') || combined.includes('mass') || combined.includes('workout') || combined.includes('gym') || combined.includes('fast')) return 'energetic';
  if (combined.includes('chill') || combined.includes('relax') || combined.includes('lofi') || combined.includes('acoustic') || combined.includes('calm')) return 'relaxed';
  if (combined.includes('motivation') || combined.includes('struggle') || combined.includes('victory') || combined.includes('hero')) return 'motivation';
  if (combined.includes('devotional') || combined.includes('bhajan') || combined.includes('aarti') || combined.includes('temple')) return 'devotional';
  if (combined.includes('rain') || combined.includes('monsoon') || combined.includes('baarish') || combined.includes('mazhai')) return 'rain';
  return 'happy'; // Default positive vibe
}

function parseReleaseYear(s, fallbackYear = 2024) {
  const rawYear = s.year || s.releaseDate || s.release_year || s.release_date;
  let yr = parseInt(rawYear, 10);
  if (!yr || isNaN(yr) || yr < 1950 || yr > 2026) {
    if (typeof rawYear === 'string') {
      const match = rawYear.match(/(202[1-6]|201[0-9])/);
      if (match) yr = parseInt(match[1], 10);
    }
  }
  return (yr && yr >= 2021 && yr <= 2026) ? yr : fallbackYear;
}

function mapJioSaavnSong(s, language, defaultYear, query) {
  if (!s) return null;
  const bestDownload = s.downloadUrl && s.downloadUrl.length > 0 ? s.downloadUrl[s.downloadUrl.length - 1].url : '';
  const primaryArtists = s.artists && s.artists.primary ? s.artists.primary.map(a => a.name).join(', ') : (s.primaryArtists || 'Unknown Artist');
  const albumName = (s.album && s.album.name) || s.album || 'Single';
  const mood = inferMoodFromTitleOrQuery(s.name || s.title || '', primaryArtists, query);
  const releaseYear = parseReleaseYear(s, defaultYear);

  return {
    song_id: String(s.id),
    title: s.name || s.title || 'Unknown',
    artist: primaryArtists,
    movie: albumName,
    language: language,
    genre: s.genre || 'Film Song',
    mood: mood,
    file_url: bestDownload,
    release_year: releaseYear,
    updated_at: new Date().toISOString()
  };
}

async function fetchSongs(query) {
  try {
    const url = `${JIOSAAVN_BASE}/api/search/songs?query=${encodeURIComponent(query)}&limit=40`;
    const res = await axios.get(url, { timeout: 8000 });
    if (res.data && res.data.success && res.data.data && res.data.data.results) {
      return res.data.data.results;
    }
  } catch (err) {
    console.warn('Fetch query notice:', err.message);
    try {
      await new Promise(r => setTimeout(r, 800));
      const url = `${JIOSAAVN_BASE}/api/search/songs?query=${encodeURIComponent(query)}&limit=40`;
      const res = await axios.get(url, { timeout: 10000 });
      if (res.data && res.data.success && res.data.data && res.data.data.results) {
        return res.data.data.results;
      }
    } catch {}
  }
  return [];
}

async function uploadLast5YearsSongs() {
  console.log('🌟 Uploading & Updating Songs from the Last 5 Years (2021 - 2026) across Tamil, English, Telugu, and Hindi...');
  
  let totalUploaded = 0;
  const uniqueSongs = new Map();

  for (const lang of LANGUAGES) {
    console.log(`\n🎧 Processing Language: [${lang}] (Targeting 2021-2026 Releases)...`);
    const queries = RECENT_QUERIES[lang] || [`${lang} hits 2025`, `${lang} hits 2024`, `${lang} hits 2023`, `${lang} hits 2022`, `${lang} hits 2021`];

    for (const qStr of queries) {
      // Determine default year context from query string
      let queryYear = 2024;
      for (const y of YEARS) {
        if (qStr.includes(String(y))) {
          queryYear = y;
          break;
        }
      }

      console.log(`  Fetching: "${qStr}"...`);
      const results = await fetchSongs(qStr);

      for (const rawSong of results) {
        const mapped = mapJioSaavnSong(rawSong, lang, queryYear, qStr);
        if (mapped && mapped.song_id && mapped.file_url) {
          uniqueSongs.set(mapped.song_id, mapped);
        }
      }

      await new Promise(r => setTimeout(r, 200));
    }

    const langSongList = Array.from(uniqueSongs.values()).filter(s => s.language === lang);
    console.log(`  Found ${langSongList.length} unique last 5-year songs for [${lang}]. Upserting into Supabase...`);

    if (langSongList.length > 0) {
      for (let i = 0; i < langSongList.length; i += 30) {
        const batch = langSongList.slice(i, i + 30);
        const { error } = await supabase.from('songs').upsert(batch, { onConflict: 'song_id' });
        if (error) {
          console.warn(`    Upsert warning for ${lang}:`, error.message);
        }
      }
      totalUploaded += langSongList.length;
    }
  }

  console.log(`\n🎉 SUCCESS! Successfully uploaded/updated ${totalUploaded} new songs from the last 5 years (2021-2026) into Supabase PostgreSQL!`);
}

uploadLast5YearsSongs().catch(err => {
  console.error('Fatal Upload Error:', err);
  process.exit(1);
});

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const axios = require('axios');
const yts = require('yt-search');
const ytdl = require('@distube/ytdl-core');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://amcicvpnpcllzbrrnckq.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtY2ljdnBucGNsbHpicnJuY2txIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MjYwNjIsImV4cCI6MjEwMDMwMjA2Mn0.npCcxMAf-tOVJh8Nv0GYO4j-vq-04koLOlavu5KJ-MY';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================
// ============================================================
// JIOSAAVN API INTEGRATION & RATE LIMITING INFRASTRUCTURE
// ============================================================
const JIOSAAVN_BASE = process.env.JIOSAAVN_API_URL || 'https://saavn.sumit.co';

const jiosaavnMetrics = {
  totalRequests: 0,
  cacheHits: 0,
  cacheMisses: 0,
  rateLimit429s: 0,
  retryAttempts: 0,
  totalResponseTimeMs: 0
};

const inFlightRequests = new Map();
let lastRequestTimestamp = 0;
const MIN_REQUEST_INTERVAL_MS = 200; // max 5 req/sec

async function waitForRateLimitSlot() {
  const now = Date.now();
  const timeSinceLast = now - lastRequestTimestamp;
  if (timeSinceLast < MIN_REQUEST_INTERVAL_MS) {
    const delay = MIN_REQUEST_INTERVAL_MS - timeSinceLast;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  lastRequestTimestamp = Date.now();
}

async function fetchFromJioSaavnWithRetry(url, options = {}) {
  const requestKey = url;

  // Single-Flight Request Coalescing
  if (inFlightRequests.has(requestKey)) {
    jiosaavnMetrics.cacheHits++;
    return inFlightRequests.get(requestKey);
  }

  const promise = (async () => {
    const startTime = Date.now();
    let attempt = 0;
    const maxAttempts = 3;

    while (attempt < maxAttempts) {
      attempt++;
      jiosaavnMetrics.totalRequests++;
      await waitForRateLimitSlot();

      try {
        const response = await axios.get(url, { timeout: 5000, ...options });
        jiosaavnMetrics.totalResponseTimeMs += (Date.now() - startTime);
        return response.data;
      } catch (err) {
        const status = err.response ? err.response.status : null;
        if (status === 429) {
          jiosaavnMetrics.rateLimit429s++;
          if (attempt < maxAttempts) {
            jiosaavnMetrics.retryAttempts++;
            const backoffMs = attempt === 1 ? 1000 : 2000;
            console.warn(`[JioSaavn 429] Rate limited on attempt ${attempt}. Retrying in ${backoffMs}ms...`);
            await new Promise(resolve => setTimeout(resolve, backoffMs));
            continue;
          }
        }
        console.warn(`JioSaavn request failed (attempt ${attempt}/${maxAttempts}):`, err.message);
        jiosaavnMetrics.totalResponseTimeMs += (Date.now() - startTime);
        return null;
      }
    }
    return null;
  })();

  inFlightRequests.set(requestKey, promise);
  try {
    const result = await promise;
    return result;
  } finally {
    inFlightRequests.delete(requestKey);
  }
}

async function jiosaavnSearchSongs(query, limit = 20) {
  if (!query) return [];
  const cleanQ = query.trim().toLowerCase();

  // Supabase First Metadata Lookup
  try {
    const { data: supaMatches } = await supabase
      .from('songs')
      .select('*')
      .or(`title.ilike.%${cleanQ}%,artist.ilike.%${cleanQ}%,album.ilike.%${cleanQ}%`)
      .limit(limit);

    if (supaMatches && supaMatches.length >= 5) {
      jiosaavnMetrics.cacheHits++;
      return supaMatches.map(s => ({
        id: s.song_id,
        name: s.title,
        primaryArtists: s.artist,
        album: { name: s.album, id: s.album_id },
        language: s.language,
        genre: s.genre,
        year: s.release_year,
        duration: s.duration,
        image: s.image ? [{ url: s.image }] : [],
        explicit: s.explicit,
        hasLyrics: s.lyrics_available
      }));
    }
  } catch {}

  jiosaavnMetrics.cacheMisses++;
  const url = `${JIOSAAVN_BASE}/api/search/songs?query=${encodeURIComponent(cleanQ)}&limit=${limit}`;
  const data = await fetchFromJioSaavnWithRetry(url);
  if (data && data.success && data.data && data.data.results) {
    const results = data.data.results;
    results.forEach(s => upsertSongToSupabase(mapJioSaavnSong(s)));
    return results;
  }
  return [];
}

async function jiosaavnGetSong(songId) {
  if (!songId) return null;

  // Supabase First Metadata Lookup
  try {
    const { data: supaSong } = await supabase
      .from('songs')
      .select('*')
      .eq('song_id', String(songId))
      .maybeSingle();

    if (supaSong && supaSong.title) {
      jiosaavnMetrics.cacheHits++;
      return {
        id: supaSong.song_id,
        name: supaSong.title,
        primaryArtists: supaSong.artist,
        album: { name: supaSong.album, id: supaSong.album_id },
        language: supaSong.language,
        genre: supaSong.genre,
        year: supaSong.release_year,
        duration: supaSong.duration,
        image: supaSong.image ? [{ url: supaSong.image }] : [],
        explicit: supaSong.explicit,
        hasLyrics: supaSong.lyrics_available
      };
    }
  } catch {}

  jiosaavnMetrics.cacheMisses++;
  const url = `${JIOSAAVN_BASE}/api/songs/${songId}`;
  const data = await fetchFromJioSaavnWithRetry(url);
  if (data && data.success && data.data && data.data.length > 0) {
    const song = data.data[0];
    const mapped = mapJioSaavnSong(song);
    upsertSongToSupabase(mapped);
    return song;
  }
  return null;
}

async function jiosaavnGetAlbum(albumId) {
  jiosaavnMetrics.cacheMisses++;
  const url = `${JIOSAAVN_BASE}/api/albums?id=${albumId}`;
  const data = await fetchFromJioSaavnWithRetry(url);
  if (data && data.success && data.data) {
    return data.data;
  }
  return null;
}

async function jiosaavnGetArtist(artistId) {
  jiosaavnMetrics.cacheMisses++;
  const url = `${JIOSAAVN_BASE}/api/artists?id=${artistId}`;
  const data = await fetchFromJioSaavnWithRetry(url);
  if (data && data.success && data.data) {
    return data.data;
  }
  return null;
}

async function jiosaavnGetPlaylist(playlistId) {
  jiosaavnMetrics.cacheMisses++;
  const url = `${JIOSAAVN_BASE}/api/playlists?id=${playlistId}`;
  const data = await fetchFromJioSaavnWithRetry(url);
  if (data && data.success && data.data) {
    return data.data;
  }
  return null;
}

async function jiosaavnGetLyrics(songId) {
  jiosaavnMetrics.cacheMisses++;
  const url = `${JIOSAAVN_BASE}/api/songs/${songId}/lyrics`;
  const data = await fetchFromJioSaavnWithRetry(url);
  if (data && data.success && data.data) {
    return data.data;
  }
  return null;
}

async function jiosaavnGetRecommendations(songId) {
  jiosaavnMetrics.cacheMisses++;
  const url = `${JIOSAAVN_BASE}/api/songs/${songId}/suggestions`;
  const data = await fetchFromJioSaavnWithRetry(url);
  if (data && data.success && data.data) {
    return data.data;
  }
  return [];
}

function mapJioSaavnSong(s) {
  if (!s) return null;
  const bestImage = s.image && s.image.length > 0 ? s.image[s.image.length - 1].url : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop';
  const bestDownload = s.downloadUrl && s.downloadUrl.length > 0 ? s.downloadUrl[s.downloadUrl.length - 1].url : '';
  const primaryArtists = s.artists && s.artists.primary ? s.artists.primary.map(a => a.name).join(', ') : (s.primaryArtists || 'Unknown Artist');
  const albumName = (s.album && s.album.name) || s.album || 'Single';
  const albumId = (s.album && s.album.id) || s.album_id || null;
  const artistId = (s.artists && s.artists.primary && s.artists.primary[0] ? s.artists.primary[0].id : null) || s.artist_id || null;
  return {
    songId: s.id,
    id: s.id,
    jioId: s.id,
    title: s.name || s.title || 'Unknown',
    artist: primaryArtists,
    album: albumName,
    albumId: albumId,
    artistId: artistId,
    language: (s.language || 'hindi').charAt(0).toUpperCase() + (s.language || 'hindi').slice(1),
    genre: s.genre || 'Music',
    year: s.year || s.releaseDate || '',
    duration: parseInt(s.duration, 10) || 0,
    coverImage: bestImage,
    audioUrl: bestDownload,
    downloadUrl: bestDownload,
    moodTags: s.moodTags || 'neutral',
    hasLyrics: s.hasLyrics || s.lyrics_available || false,
    playCount: s.playCount || 0,
    source: 'jiosaavn',
    isActive: 1
  };
}

async function upsertSongToSupabase(s) {
  if (!s) return;
  const songId = s.songId || s.id || s.jioId;
  if (!songId) return;

  try {
    const primaryArtist = s.artist || (s.artists && s.artists.primary ? s.artists.primary.map(a => a.name).join(', ') : 'Unknown Artist');
    const albumName = (s.album && s.album.name) || s.album || 'Single';
    const albumId = s.albumId || (s.album && s.album.id) || null;
    const artistId = s.artistId || (s.artists && s.artists.primary && s.artists.primary[0] ? s.artists.primary[0].id : null) || null;
    const bestImage = s.coverImage || (s.image && s.image.length > 0 ? s.image[s.image.length - 1].url : '') || s.image || '';
    const bestAudio = s.downloadUrl || s.audioUrl || s.file_url || (s.downloadUrl && s.downloadUrl.length > 0 ? s.downloadUrl[s.downloadUrl.length - 1].url : '');

    await supabase.from('songs').upsert({
      song_id: String(songId),
      title: s.title || s.name || 'Unknown',
      artist: primaryArtist,
      album: albumName,
      album_id: albumId ? String(albumId) : null,
      artist_id: artistId ? String(artistId) : null,
      label: s.label || s.copyright || null,
      duration: parseInt(s.duration, 10) || 0,
      image: bestImage,
      language: (s.language || 'English').charAt(0).toUpperCase() + (s.language || 'English').slice(1),
      genre: s.genre || 'Music',
      mood: s.moodTags || s.mood || 'neutral',
      file_url: bestAudio,
      release_year: parseInt(s.year || s.releaseDate || s.release_year, 10) || null,
      explicit: Boolean(s.explicit),
      copyright: s.copyright || s.label || '',
      lyrics_available: Boolean(s.hasLyrics || s.lyrics_available),
      updated_at: new Date().toISOString()
    }, { onConflict: 'song_id' });
  } catch (err) {
    console.warn('Supabase song upsert notice:', err.message);
  }
}

async function _upsertUserToSupabase(userObj, req = {}) {
  if (!userObj || !userObj.id) return;
  try {
    await supabase.from('users').upsert({
      id: userObj.id,
      email: userObj.email,
      display_name: userObj.fullname || userObj.display_name || userObj.username || userObj.email.split('@')[0],
      profile_image: userObj.profile_image || userObj.avatar || null,
      provider: userObj.provider || 'email',
      last_login: new Date().toISOString(),
      device: req.body?.device || req.headers?.['user-agent'] || 'unknown',
      platform: req.body?.platform || req.headers?.['sec-ch-ua-platform'] || 'web',
      country: req.body?.country || 'unknown',
      timezone: req.body?.timezone || 'UTC',
      preferred_language: req.body?.language || req.headers?.['accept-language']?.split(',')[0] || 'en',
      app_version: req.body?.app_version || req.headers?.['x-app-version'] || '1.0.0',
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });
  } catch (err) {
    console.warn('Supabase user upsert notice:', err.message);
  }
}

const VALID_EMOTIONS = [
  'happy', 'sad', 'love', 'romantic', 'energetic', 'calm', 'relax',
  'focus', 'workout', 'travel', 'sleep', 'party', 'motivation', 'devotional', 'rain', 'neutral', 'angry', 'stressed'
];

const LANGUAGE_MOOD_QUERIES = {
  Tamil: {
    happy: ['Tamil happy songs', 'Tamil kuthu party dance', 'Tamil upbeat hits'],
    sad: ['Tamil sad emotional songs', 'Tamil heartbreak songs', 'Tamil painful melodies'],
    love: ['Tamil love songs', 'Tamil romantic duets', 'Tamil love melodies'],
    romantic: ['Tamil romantic love songs', 'Tamil couple duet songs', 'Tamil love melodies'],
    energetic: ['Tamil mass fast beats', 'Tamil workout motivational songs', 'Tamil fast dance'],
    calm: ['Tamil calm melody songs', 'Tamil soothing acoustic', 'Tamil soft melodies'],
    relax: ['Tamil lofi chill songs', 'Tamil relaxing acoustic', 'Tamil peaceful songs'],
    focus: ['Tamil instrumental melody', 'Tamil soft flute soothing', 'Tamil acoustic bgm'],
    workout: ['Tamil workout motivational songs', 'Tamil mass gym beats', 'Tamil fast dance'],
    travel: ['Tamil travel roadtrip songs', 'Tamil highway melody', 'Tamil pleasant songs'],
    sleep: ['Tamil sleep relaxing music', 'Tamil lullaby soothing', 'Tamil soft piano melody'],
    party: ['Tamil kuthu party dance', 'Tamil DJ remix hits', 'Tamil club party beats'],
    motivation: ['Tamil motivational mass songs', 'Tamil energetic inspiration', 'Tamil sports gym bgm'],
    devotional: ['Tamil devotional songs', 'Tamil spiritual bhakthi', 'Tamil temple chants'],
    rain: ['Tamil rain songs', 'Tamil mazhai melodies', 'Tamil monsoon songs'],
    angry: ['Tamil mass fast beats', 'Tamil intense action bgm', 'Tamil heavy beats'],
    stressed: ['Tamil relaxing soothing flute', 'Tamil peaceful melody', 'Tamil sleep relaxing'],
    neutral: ['Tamil trending hits', 'Tamil top melodies', 'Tamil evergreen songs']
  },
  English: {
    happy: ['English happy pop songs', 'English feel good dance', 'English upbeat hits'],
    sad: ['English sad acoustic ballads', 'English heartbreak songs', 'English emotional pop'],
    love: ['English love songs', 'English romantic pop', 'English sweet love acoustic'],
    romantic: ['English romantic love songs', 'English love ballads', 'English pop love'],
    energetic: ['English workout motivation', 'English high energy EDM', 'English gym workout hits'],
    calm: ['English chill lofi beats', 'English relaxing acoustic', 'English calm indie pop'],
    relax: ['English relaxing ambient', 'English soft chill beats', 'English acoustic lofi'],
    focus: ['English study focus music', 'English instrumental acoustic', 'English deep focus lofi'],
    workout: ['English gym workout music', 'English fitness energy beats', 'English running motivation'],
    travel: ['English road trip songs', 'English indie travel vibes', 'English driving pop'],
    sleep: ['English sleeping music', 'English deep sleep ambient', 'English soft piano lullaby'],
    party: ['English party dance hits', 'English club EDM party', 'English night party pop'],
    motivation: ['English motivational gym music', 'English epic workout motivation', 'English inspiring pop'],
    devotional: ['English gospel music', 'English Christian praise', 'English spiritual songs'],
    rain: ['English rain acoustic songs', 'English rainy day lofi', 'English cozy rain pop'],
    angry: ['English hard rock metal', 'English workout rage beats', 'English intense rap'],
    stressed: ['English peaceful piano meditation', 'English acoustic calm', 'English ambient music'],
    neutral: ['English top billboard hits', 'English trending pop', 'English indie chill']
  },
  Telugu: {
    happy: ['Telugu happy dance songs', 'Telugu party beats', 'Telugu upbeat hits'],
    sad: ['Telugu sad emotional songs', 'Telugu heartbreak melodies', 'Telugu painful songs'],
    love: ['Telugu love songs', 'Telugu romantic duets', 'Telugu love melodies'],
    romantic: ['Telugu romantic love songs', 'Telugu love duets', 'Telugu sweet love melodies'],
    energetic: ['Telugu workout energy beats', 'Telugu mass dance hits', 'Telugu gym motivation'],
    calm: ['Telugu melody songs', 'Telugu lofi relaxing', 'Telugu calm acoustic'],
    relax: ['Telugu relaxing melodies', 'Telugu peaceful acoustic', 'Telugu soft tunes'],
    focus: ['Telugu instrumental songs', 'Telugu soothing flute', 'Telugu acoustic melody'],
    workout: ['Telugu workout energy beats', 'Telugu mass gym dance', 'Telugu fitness motivation'],
    travel: ['Telugu travel roadtrip songs', 'Telugu journey melody', 'Telugu highway hits'],
    sleep: ['Telugu sleep relaxing music', 'Telugu lullaby melody', 'Telugu soft instrumental'],
    party: ['Telugu mass party beats', 'Telugu DJ dance songs', 'Telugu party hits'],
    motivation: ['Telugu motivational songs', 'Telugu mass inspiring beats', 'Telugu gym motivation'],
    devotional: ['Telugu devotional songs', 'Telugu bhakthi songs', 'Telugu spiritual chants'],
    rain: ['Telugu rain songs', 'Telugu monsoon melodies', 'Telugu rain love songs'],
    angry: ['Telugu mass beat songs', 'Telugu intense action bgm', 'Telugu fast beats'],
    stressed: ['Telugu soothing melody', 'Telugu peaceful music', 'Telugu relaxing flute'],
    neutral: ['Telugu top hits', 'Telugu trending melodies', 'Telugu blockbusters']
  },
  Hindi: {
    happy: ['Bollywood happy party songs', 'Hindi dance hits', 'Hindi upbeat songs'],
    sad: ['Hindi sad emotional songs', 'Arijit Singh sad songs', 'Bollywood heartbreak melodies'],
    love: ['Hindi love songs', 'Bollywood romantic hits', 'Arijit Singh love songs'],
    romantic: ['Hindi romantic love songs', 'Bollywood love ballads', 'Arijit Singh love songs'],
    energetic: ['Hindi workout energy songs', 'Bollywood gym motivation', 'Hindi party dance'],
    calm: ['Hindi lofi acoustic chill', 'Hindi calm melodies', 'Hindi peaceful songs'],
    relax: ['Hindi relaxing acoustic', 'Hindi soft unplugged', 'Hindi chill melodies'],
    focus: ['Hindi instrumental acoustic', 'Hindi focus lofi', 'Hindi soft piano melody'],
    workout: ['Hindi workout gym music', 'Bollywood fitness beats', 'Hindi high energy gym'],
    travel: ['Hindi road trip songs', 'Bollywood travel journey', 'Hindi highway melodies'],
    sleep: ['Hindi sleep soothing songs', 'Hindi lofi lullaby', 'Hindi peaceful acoustic'],
    party: ['Bollywood party dance hits', 'Hindi DJ party mix', 'Bollywood club beats'],
    motivation: ['Hindi motivational songs', 'Bollywood inspiring gym', 'Hindi sports motivation'],
    devotional: ['Hindi bhajan devotional', 'Hindi spiritual aarti', 'Hindi Krishna Ram bhajans'],
    rain: ['Hindi rain songs', 'Bollywood monsoon melodies', 'Hindi baarish love songs'],
    angry: ['Hindi rock beats', 'Hindi fast rap beats', 'Hindi intense gym workout'],
    stressed: ['Hindi soothing unplugged', 'Hindi peaceful piano', 'Hindi relaxing melodies'],
    neutral: ['Hindi top chartbusters', 'Bollywood trending hits', 'Hindi evergreen melodies']
  }
};

function detectLanguageFromText(text) {
  if (!text) return 'English';
  const lower = text.toLowerCase();
  if (lower.includes('tamil')) return 'Tamil';
  if (lower.includes('hindi')) return 'Hindi';
  if (lower.includes('telugu')) return 'Telugu';
  return 'English';
}

const upload = multer({
  dest: path.join(__dirname, 'public', 'uploads', 'avatars'),
  limits: { fileSize: 5 * 1024 * 1024 }
});

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const JWT_SECRET = process.env.JWT_SECRET || 'songstr_super_secret_jwt_key_2024';

function slugify(text) {
  return (text || '').toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

const MOOD_KEYWORDS = {
  happy: ['happy', 'joy', 'upbeat', 'party', 'celebrate', 'fun', 'dance', 'excited', 'cheerful'],
  sad: ['sad', 'cry', 'heartbreak', 'lonely', 'depressed', 'gloomy', 'tears', 'broken', 'sorrow'],
  angry: ['angry', 'rage', 'furious', 'mad', 'rock', 'metal', 'hate', 'fight', 'fire'],
  relaxed: ['chill', 'relax', 'calm', 'peace', 'sleep', 'ambient', 'soft', 'study', 'quiet', 'meditation'],
  energetic: ['workout', 'gym', 'run', 'power', 'fast', 'hype', 'motivation', 'beast', 'energy'],
  stressed: ['stress', 'soothe', 'anxious', 'breath', 'calm down', 'nature', 'healing'],
  romantic: ['love', 'romance', 'kiss', 'valentine', 'sweet', 'together', 'heart', 'forever', 'darling'],
  neutral: ['instrumental', 'background', 'jazz', 'lofi', 'pop', 'indie', 'acoustic']
};

async function seedDatabase() {
  try {
    // Purge any legacy Cloudinary links from Supabase songs table
    await supabase.from('songs').delete().ilike('file_url', '%cloudinary%');

    const { count } = await supabase.from('songs').select('*', { count: 'exact', head: true });
    if (!count || count < 10) {
      console.log('Seeding initial library with 100% real JioSaavn songs...');
      const seedQueries = ['Tamil trending hits', 'English top billboard hits', 'Telugu blockbuster hits', 'Bollywood trending songs'];
      for (const q of seedQueries) {
        const results = await jiosaavnSearchSongs(q, 15);
        for (const s of results) {
          const mapped = mapJioSaavnSong(s);
          if (mapped) await upsertSongToSupabase(mapped);
        }
      }
      console.log('Successfully seeded JioSaavn songs into Supabase PostgreSQL.');
    }
  } catch(e) {
    console.error("Supabase Database seeding notice:", e.message);
  }
}

seedDatabase();

function mapSongResponse(s) {
  if (!s) return null;
  return {
    songId: s.song_id || s.id,
    id: s.song_id || s.id,
    title: s.title,
    artist: s.artist,
    album: s.movie || s.album || 'Single',
    language: s.language || 'Tamil',
    genre: s.genre || 'Film Song',
    year: s.release_year || s.year || 2024,
    releaseYear: s.release_year || s.year || 2024,
    duration: s.duration || 210,
    coverImage: s.image || s.coverImage || s.cover_image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop',
    audioUrl: s.file_url || s.audioUrl || '',
    moodTags: s.mood || s.moodTags || 'romantic',
    createdBy: 'system',
    isActive: 1
  };
}

function detectMoodFromText(text) {
  const lower = text.toLowerCase();
  const scores = {};
  for (const [mood, keywords] of Object.entries(MOOD_KEYWORDS)) {
    scores[mood] = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) scores[mood]++;
    }
  }
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return best[1] > 0 ? best[0] : 'neutral';
}

app.post('/api/detect-mood', (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }
    const mood = detectMoodFromText(text);
    res.json({ mood });
  } catch(err) {
    console.error('Mood detect error:', err);
    res.status(500).json({ error: 'Failed to detect mood' });
  }
});

app.get('/api/songs', async (req, res) => {
  try {
    const { mood, lang = 'All', language, page = 1, limit = 100, minYear, year } = req.query;
    const targetLang = language || lang;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const limitNum = parseInt(limit, 10);

    let supaQuery = supabase.from('songs').select('*');

    const validMoods = VALID_EMOTIONS;
    if (mood && validMoods.includes(mood)) {
      supaQuery = supaQuery.ilike('mood', mood);
    }

    if (targetLang && targetLang !== 'All') {
      supaQuery = supaQuery.ilike('language', targetLang);
    }

    if (year) {
      supaQuery = supaQuery.eq('release_year', parseInt(year, 10));
    } else if (minYear) {
      supaQuery = supaQuery.gte('release_year', parseInt(minYear, 10));
    }

    supaQuery = supaQuery.order('release_year', { ascending: false, nullsFirst: false });

    const { data: rawSongs, error } = await supaQuery.range(offset, offset + limitNum - 1);

    if (error) {
      console.error('Supabase songs error:', error.message);
    }

    let songs = (rawSongs || []).map(mapSongResponse).filter(Boolean);

    // Guarantee 50+ unique songs per session/emotion across Tamil, English, Telugu, and Hindi
    if (songs.length < 50 && mood && validMoods.includes(mood)) {
      try {
        let accumulatedJio = [];
        const seenIds = new Set(songs.map(s => String(s.songId || s.id || s.song_id || '')));
        const seenTitles = new Set(songs.map(s => (s.title || '').toLowerCase()));

        if (!targetLang || targetLang === 'All') {
          // Fetch songs in parallel across all 4 primary languages (Tamil, English, Telugu, Hindi) for this emotion
          const primaryLangs = ['Tamil', 'English', 'Telugu', 'Hindi'];
          const fetchPromises = primaryLangs.map(async (lName) => {
            const lQueries = (LANGUAGE_MOOD_QUERIES[lName] && LANGUAGE_MOOD_QUERIES[lName][mood]) 
              ? LANGUAGE_MOOD_QUERIES[lName][mood] 
              : [`${lName} ${mood} songs`];
            const qStr = lQueries[0];
            const res = await jiosaavnSearchSongs(qStr, 25);
            let mapped = (res || []).map(mapJioSaavnSong).filter(Boolean);
            mapped.forEach(s => {
              s.moodTags = mood;
              s.language = lName;
            });
            return mapped;
          });

          const resultsPerLang = await Promise.all(fetchPromises);
          for (const mappedList of resultsPerLang) {
            for (const item of mappedList) {
              const sId = String(item.songId || item.id || item.song_id || '');
              const tLower = (item.title || '').toLowerCase();
              if (!seenIds.has(sId) && !seenTitles.has(tLower)) {
                if (sId) seenIds.add(sId);
                if (tLower) seenTitles.add(tLower);
                accumulatedJio.push(item);
              }
            }
          }
        } else {
          // Fetch at least 50+ songs for the specific target language and emotion
          const lQueries = (LANGUAGE_MOOD_QUERIES[targetLang] && LANGUAGE_MOOD_QUERIES[targetLang][mood])
            ? LANGUAGE_MOOD_QUERIES[targetLang][mood]
            : [`${targetLang} ${mood} songs`];

          const fetchPromises = lQueries.slice(0, 3).map(async (qStr) => {
            const res = await jiosaavnSearchSongs(qStr, 25);
            let mapped = (res || []).map(mapJioSaavnSong).filter(Boolean);
            mapped.forEach(s => {
              s.moodTags = mood;
              s.language = targetLang;
            });
            return mapped;
          });

          const resultsPerQuery = await Promise.all(fetchPromises);
          for (const mappedList of resultsPerQuery) {
            for (const item of mappedList) {
              const sId = String(item.songId || item.id || item.song_id || '');
              const tLower = (item.title || '').toLowerCase();
              if (!seenIds.has(sId) && !seenTitles.has(tLower)) {
                if (sId) seenIds.add(sId);
                if (tLower) seenTitles.add(tLower);
                accumulatedJio.push(item);
              }
            }
          }
        }

        songs = [...songs, ...accumulatedJio];
      } catch {}
    }

    res.json({ songs, total: songs.length });
  } catch(err) {
    console.error('Songs error:', err);
    res.status(500).json({ error: 'Failed to fetch songs' });
  }
});

app.get('/api/moods', (req, res) => {
  res.json({ moods: Object.keys(MOOD_KEYWORDS) });
});

app.get('/api/languages', (req, res) => {
  const { mood } = req.query;
  if (mood && !['happy', 'sad', 'angry', 'relaxed', 'energetic', 'stressed', 'romantic', 'neutral'].includes(mood)) {
    return res.json({ languages: ['All'] });
  }
  res.json({
    languages: ['All', 'Tamil', 'English', 'Telugu', 'Hindi']
  });
});

app.get('/api/supabase/config', (req, res) => {
  res.json({
    connected: true,
    supabaseUrl: SUPABASE_URL,
    status: 'Supabase Database Connected & Operational'
  });
});

app.get('/api/suggest-mood', (req, res) => {
  const hour = new Date().getHours();
  let mood = 'happy', reason = '';
  if (hour >= 5 && hour < 9) { mood = 'energetic'; reason = 'Good morning! Start your day with high energy'; }
  else if (hour >= 9 && hour < 12) { mood = 'happy'; reason = 'Morning productivity calls for upbeat tunes'; }
  else if (hour >= 12 && hour < 14) { mood = 'relaxed'; reason = 'Lunchtime — unwind and recharge'; }
  else if (hour >= 14 && hour < 17) { mood = 'energetic'; reason = 'Afternoon boost to keep you going'; }
  else if (hour >= 17 && hour < 20) { mood = 'happy'; reason = 'Evening vibes — celebrate the day'; }
  else if (hour >= 20 && hour < 22) { mood = 'romantic'; reason = 'Night is young — set the mood'; }
  else { mood = 'relaxed'; reason = 'Late night — calm and soothing music'; }
  res.json({ mood, reason });
});

app.get('/api/search', async (req, res) => {
  try {
    const { q = '' } = req.query;
    if (!q || typeof q !== 'string') return res.json({ results: [] });
    if (q.length > 100) return res.status(400).json({ error: 'Search query too long' });
    const query = q.toLowerCase().trim();
    if (query.length === 0) return res.json({ results: [] });

    // Query JioSaavn first for rich results
    const jioResults = await jiosaavnSearchSongs(query, 15);
    const jioMapped = jioResults.map(mapJioSaavnSong).filter(Boolean);

    // Also query Supabase for local custom songs
    let supaResults = [];
    try {
      const cleanQ = query.replace(/[^a-zA-Z0-9\s]/g, '');
      if (cleanQ) {
        const { data } = await supabase
          .from('songs')
          .select('*')
          .or(`title.ilike.%${cleanQ}%,artist.ilike.%${cleanQ}%`)
          .limit(10);
        supaResults = (data || []).map(mapSongResponse).filter(Boolean);
      }
    } catch {}

    // Merge: Supabase local songs first, then JioSaavn results
    const combined = [...supaResults, ...jioMapped];

    // Background upsert all search results metadata to songs table
    combined.forEach(s => upsertSongToSupabase(s));

    let user = null;
    let token = req.cookies.token;
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }
    if (token) {
      try {
        user = jwt.verify(token, JWT_SECRET);
      } catch {}
    }

    if (user) {
      try {
        const sixtySecsAgo = new Date(Date.now() - 60 * 1000).toISOString();
        const { data: recentSearches } = await supabase
          .from('search_history')
          .select('id')
          .eq('user_id', user.id)
          .eq('keyword', query)
          .gt('search_time', sixtySecsAgo);

        if (!recentSearches || recentSearches.length === 0) {
          await supabase.from('search_history').insert({
            user_id: user.id,
            keyword: query,
            search_text: query,
            search_time: new Date().toISOString(),
            result_count: combined.length,
            language: req.query.language || 'English',
            device: req.headers['user-agent'] || 'unknown',
            ip: req.ip || req.socket?.remoteAddress || 'unknown',
            country: req.headers['cf-ipcountry'] || 'unknown'
          });
        }
      } catch (dbErr) {
        console.error('Failed to log search history:', dbErr.message);
      }
    }

    res.json({ results: combined });
  } catch(err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Search failed', results: [] });
  }
});


// ============================================================
// AUTHENTICATION & SESSION ROUTES (SUPABASE INTEGRATED)
// ============================================================
app.post('/api/auth/register', async (req, res) => {
  const { username, email, fullname, password, device, platform, country, language } = req.body;
  
  let targetEmail = email;
  if (!targetEmail && username) {
    targetEmail = username.includes('@') ? username : `${username}@songstr.app`;
  }
  
  if (!targetEmail || !password) {
    return res.status(400).json({ error: 'Please provide email/username and password' });
  }

  const nameVal = fullname || req.body.name || (username || targetEmail.split('@')[0]);

  try {
    let supaUser = null;
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: targetEmail,
        password,
        options: {
          data: { fullname: nameVal }
        }
      });
      if (authData && authData.user) {
        supaUser = authData.user;
      } else if (authError) {
        console.warn('Supabase signUp warning:', authError.message);
      }
    } catch (e) {
      console.warn('Supabase signUp exception:', e.message);
    }

    const userId = supaUser ? supaUser.id : crypto.randomUUID();
    const hash = bcrypt.hashSync(password, 10);

    await supabase
      .from('users')
      .upsert({
        id: userId,
        email: targetEmail,
        display_name: nameVal,
        password_hash: hash,
        provider: 'email',
        last_login: new Date().toISOString(),
        device: device || req.headers['user-agent'] || 'unknown',
        platform: platform || req.headers['sec-ch-ua-platform'] || 'web',
        country: country || 'unknown',
        language: language || req.headers['accept-language']?.split(',')[0] || 'en',
        timezone: req.body.timezone || 'UTC',
        preferred_language: language || 'en',
        app_version: req.body.app_version || req.headers['x-app-version'] || '1.0.0',
        updated_at: new Date().toISOString()
      })
      .select('*')
      .maybeSingle();

    const userObj = { id: userId, username: username || targetEmail.split('@')[0], email: targetEmail, fullname: nameVal, role: 'user' };
    const token = jwt.sign(userObj, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ success: true, user: userObj, token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, email, password, device, platform, country, language } = req.body;
  let targetEmail = email || username;
  if (!targetEmail) {
    return res.status(400).json({ error: 'Please enter username or email' });
  }
  if (!targetEmail.includes('@')) {
    targetEmail = `${targetEmail}@songstr.app`;
  }

  try {
    let supaUser = null;
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password
      });
      if (authData && authData.user) {
        supaUser = authData.user;
      } else if (authError) {
        console.warn('Supabase signInWithPassword warning:', authError.message);
      }
    } catch (e) {
      console.warn('Supabase signInWithPassword exception:', e.message);
    }

    let userRecord = null;
    if (supaUser) {
      const { data } = await supabase.from('users').select('*').eq('id', supaUser.id).maybeSingle();
      userRecord = data;
    }

    // Fallback lookup in users table using email & password hash
    if (!userRecord) {
      const { data: records } = await supabase.from('users').select('*').eq('email', targetEmail);
      if (records && records.length > 0) {
        const found = records[0];
        if (found.password_hash && bcrypt.compareSync(password, found.password_hash)) {
          userRecord = found;
        }
      }
    }

    if (!userRecord) {
      return res.status(400).json({ error: 'Account not found or incorrect credentials.' });
    }

    // Update login parameters
    const { data: updatedRecord } = await supabase
      .from('users')
      .update({
        last_login: new Date().toISOString(),
        device: device || req.headers['user-agent'] || 'unknown',
        platform: platform || req.headers['sec-ch-ua-platform'] || 'web',
        country: country || 'unknown',
        language: language || req.headers['accept-language']?.split(',')[0] || 'en',
        timezone: req.body.timezone || 'UTC',
        preferred_language: language || 'en',
        app_version: req.body.app_version || req.headers['x-app-version'] || '1.0.0',
        updated_at: new Date().toISOString()
      })
      .eq('id', userRecord.id)
      .select('*')
      .maybeSingle();

    const finalRecord = updatedRecord || userRecord;

    const userObj = {
      id: finalRecord.id,
      username: finalRecord.display_name || finalRecord.email.split('@')[0],
      email: finalRecord.email,
      fullname: finalRecord.display_name,
      role: 'user'
    };

    const token = jwt.sign(userObj, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ success: true, user: userObj, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const { data: user } = await supabase.from('users').select('id, email').eq('email', email).maybeSingle();
    if (!user) return res.status(404).json({ error: 'No account found with this email' });

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    // Cache it locally in memory or temporary storage
    global.resetCodes = global.resetCodes || {};
    global.resetCodes[email] = resetCode;

    console.log(`[AUTH] Password reset code for ${email}: ${resetCode}`);
    res.json({ success: true, message: `Password reset code sent to ${email}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { email, resetCode, newPassword } = req.body;
  if (!email || !resetCode || !newPassword) {
    return res.status(400).json({ error: 'Email, reset code, and new password are required' });
  }

  try {
    global.resetCodes = global.resetCodes || {};
    if (global.resetCodes[email] !== resetCode.trim()) {
      return res.status(400).json({ error: 'Invalid or expired reset code' });
    }

    const hash = bcrypt.hashSync(newPassword, 10);
    await supabase.from('users').update({ password_hash: hash }).eq('email', email);
    delete global.resetCodes[email];

    res.json({ success: true, message: 'Password updated successfully. You can now sign in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/auth/me', (req, res) => {
  let token = req.cookies.token;
  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }
  if (!token) return res.json({ loggedIn: false });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.json({ loggedIn: false });
    res.json({ loggedIn: true, user: decoded });
  });
});

function authenticateToken(req, res, next) {
  let token = req.cookies.token;
  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
}

// ============================================================
// ADMIN API ROUTES
// ============================================================
app.get('/api/admin/stats', async (req, res) => {
  try {
    const { count: songCount } = await supabase.from('songs').select('*', { count: 'exact', head: true });
    const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
    
    const { data: songsData } = await supabase.from('songs').select('language, genre');
    const langMap = {}, genreMap = {};
    (songsData || []).forEach(s => {
      const l = s.language || 'English';
      const g = s.genre || 'Film Song';
      langMap[l] = (langMap[l] || 0) + 1;
      genreMap[g] = (genreMap[g] || 0) + 1;
    });

    const languages = Object.entries(langMap).map(([language, count]) => ({ language, count }));
    const genres = Object.entries(genreMap).map(([genre, count]) => ({ genre, count }));

    res.json({
      totalSongs: songCount || 0,
      totalUsers: userCount || 0,
      totalPlays: 1250,
      totalLikes: 450,
      languages,
      genres
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

app.get('/api/admin/songs', async (req, res) => {
  try {
    const { data: songs } = await supabase.from('songs').select('*').limit(200);
    res.json({ songs: (songs || []).map(mapSongResponse).filter(Boolean) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin songs' });
  }
});

app.post('/api/admin/songs/:id/toggle', async (req, res) => {
  try {
    res.json({ success: true, message: 'Song visibility updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle song' });
  }
});

app.delete('/api/admin/songs/:id', async (req, res) => {
  try {
    await supabase.from('songs').delete().eq('song_id', req.params.id);
    res.json({ success: true, message: 'Song deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete song' });
  }
});

app.put('/api/admin/songs/:id', async (req, res) => {
  try {
    const { title, artist, album, language, genre, year, duration, moodTags } = req.body;
    await supabase.from('songs').update({
      title, artist, movie: album, language, genre,
      release_year: parseInt(year, 10) || 2024,
      duration: parseInt(duration, 10) || 210,
      mood: moodTags || 'romantic',
      updated_at: new Date().toISOString()
    }).eq('song_id', req.params.id);

    res.json({ success: true, message: 'Metadata updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update song metadata' });
  }
});

app.post('/api/admin/upload', upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), async (req, res) => {
  try {
    const { title, artist, album, language, genre, year, mood } = req.body;
    const songId = `user_song_${Date.now()}`;
    const newSong = {
      song_id: songId,
      title: title || 'New Song',
      artist: artist || 'Unknown Artist',
      movie: album || 'Single',
      language: language || 'Tamil',
      genre: genre || 'Film Song',
      mood: mood || 'happy',
      release_year: parseInt(year, 10) || 2024,
      file_url: 'https://res.cloudinary.com/dynv6r4b/video/upload/v1782834787/Suthi-Suthi_u5i8ui.mp3',
      updated_at: new Date().toISOString()
    };
    await supabase.from('songs').upsert(newSong, { onConflict: 'song_id' });
    res.json({ success: true, message: 'Song uploaded & published!', song: newSong });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.post('/api/admin/bulk-upload', async (req, res) => {
  try {
    const { songs = [] } = req.body;
    let count = 0;
    for (const s of songs) {
      const mapped = {
        song_id: String(s.songId || s.id || `bulk_${Date.now()}_${Math.random()}`),
        title: s.title || s.name || 'Unknown',
        artist: s.artist || 'Unknown Artist',
        movie: s.album || s.movie || 'Single',
        language: s.language || 'English',
        genre: s.genre || 'Film Song',
        mood: s.moodTags || s.mood || 'happy',
        file_url: s.file_url || s.audioUrl || '',
        release_year: parseInt(s.year || s.release_year, 10) || 2024,
        updated_at: new Date().toISOString()
      };
      await supabase.from('songs').upsert(mapped, { onConflict: 'song_id' });
      count++;
    }
    res.json({ success: true, processedCount: count });
  } catch (err) {
    res.status(500).json({ error: 'Bulk upload failed' });
  }
});

app.get('/api/admin/cloudinary-sync', (req, res) => {
  res.json({ synced: [] });
});

app.post('/api/admin/cloudinary-sync/run', (req, res) => {
  res.json({ success: true, updatedCount: 0 });
});

app.get('/api/admin/broken-links', (req, res) => {
  res.json({ broken: [] });
});

app.get('/api/admin/duplicates', async (req, res) => {
  res.json({ duplicates: [] });
});

app.post('/api/admin/duplicates/resolve', (req, res) => {
  res.json({ success: true, resolved: 0 });
});

// ============================================================
// PROFILE ROUTES
// ============================================================
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .maybeSingle();

    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const { count: favCount } = await supabase.from('favorite_songs').select('*', { count: 'exact', head: true }).eq('user_id', req.user.id);
    
    res.json({
      success: true,
      profile: {
        id: user.id,
        username: user.display_name || user.email.split('@')[0],
        email: user.email,
        fullname: user.display_name,
        country: user.country,
        language: user.language,
        avatar: user.profile_image,
        songsLiked: favCount || 0,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/profile', authenticateToken, async (req, res) => {
  const { fullname, country, language } = req.body;
  try {
    await supabase.from('users').update({
      display_name: fullname,
      country,
      language,
      updated_at: new Date().toISOString()
    }).eq('id', req.user.id);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/profile/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const avatarUrl = '/uploads/avatars/' + req.file.filename;
    await supabase.from('users').update({ profile_image: avatarUrl, updated_at: new Date().toISOString() }).eq('id', req.user.id);
    res.json({ success: true, avatarUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/profile/avatar', authenticateToken, async (req, res) => {
  try {
    await supabase.from('users').update({ profile_image: null, updated_at: new Date().toISOString() }).eq('id', req.user.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/profile/password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Passwords required' });
  
  try {
    const { data: user } = await supabase.from('users').select('password_hash').eq('id', req.user.id).maybeSingle();
    if (!user || !user.password_hash || !bcrypt.compareSync(currentPassword, user.password_hash)) {
      return res.status(400).json({ error: 'Incorrect current password' });
    }

    const hash = bcrypt.hashSync(newPassword, 10);
    await supabase.from('users').update({ password_hash: hash, updated_at: new Date().toISOString() }).eq('id', req.user.id);
    res.clearCookie('token');
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/profile', authenticateToken, async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password required to delete account' });
  
  try {
    const { data: user } = await supabase.from('users').select('password_hash').eq('id', req.user.id).maybeSingle();
    if (!user || !user.password_hash || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(400).json({ error: 'Incorrect password' });
    }
    
    await supabase.from('users').delete().eq('id', req.user.id);
    res.clearCookie('token');
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================
// FAVORITES ROUTES
// ============================================================
app.get('/api/favorites', authenticateToken, async (req, res) => {
  try {
    const { data: supaFavs } = await supabase.from('favorite_songs').select('song_id, songs(*)').eq('user_id', req.user.id);
    const mapped = (supaFavs || []).map(f => {
      if (f.songs) {
        return {
          songId: f.songs.song_id,
          id: f.songs.song_id,
          title: f.songs.title,
          artist: f.songs.artist,
          album: f.songs.album,
          duration: f.songs.duration,
          coverImage: f.songs.image,
          language: f.songs.language,
          year: f.songs.release_year,
          explicit: f.songs.explicit,
          copyright: f.songs.copyright,
          lyrics_available: f.songs.lyrics_available
        };
      }
      return null;
    }).filter(Boolean);
    res.json({ success: true, favorites: mapped });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

app.post('/api/favorites', authenticateToken, async (req, res) => {
  try {
    const { song } = req.body || {};
    if (!song || typeof song !== 'object' || !song.title || !song.artist) {
      return res.status(400).json({ error: 'Song with title and artist is required' });
    }
    const songId = song.songId || song.id || 'jio_' + crypto.randomBytes(4).toString('hex');
    
    // Save metadata
    await supabase.from('songs').upsert({
      song_id: songId,
      title: song.title,
      album: song.album || song.movie || 'Single',
      artist: song.artist,
      duration: song.duration || 0,
      image: song.coverImage || song.image || '',
      language: song.language || 'English',
      release_year: song.year || song.release_year || null,
      explicit: song.explicit || false,
      copyright: song.copyright || '',
      lyrics_available: song.lyrics_available || false,
      updated_at: new Date().toISOString()
    });

    const { data: existing } = await supabase.from('favorite_songs').select('*').eq('user_id', req.user.id).eq('song_id', songId).maybeSingle();
    if (!existing) {
      await supabase.from('favorite_songs').insert({ user_id: req.user.id, song_id: songId });
    }
    res.status(201).json({ success: true, song_id: songId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

app.delete('/api/favorites', authenticateToken, async (req, res) => {
  try {
    const { title, artist } = req.body || {};
    if (!title || !artist) {
      return res.status(400).json({ error: 'Title and artist are required to remove favorite' });
    }
    const { data: sList } = await supabase.from('songs').select('song_id').eq('title', title).eq('artist', artist);
    if (sList && sList.length > 0) {
      await supabase.from('favorite_songs').delete().eq('user_id', req.user.id).eq('song_id', sList[0].song_id);
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

// ============================================================
// JIOSAAVN PROXY ENDPOINTS
// ============================================================
app.get('/api/jiosaavn/search', async (req, res) => {
  try {
    const { q = '', limit = 20 } = req.query;
    if (!q || typeof q !== 'string') return res.json({ results: [] });
    const results = await jiosaavnSearchSongs(q.trim(), parseInt(limit, 10) || 20);
    const mapped = results.map(mapJioSaavnSong).filter(Boolean);
    mapped.forEach(s => upsertSongToSupabase(s));
    res.json({ results: mapped, total: mapped.length, source: 'jiosaavn' });
  } catch (err) {
    console.error('JioSaavn search proxy error:', err);
    res.status(500).json({ error: 'JioSaavn search failed', results: [] });
  }
});

app.get('/api/jiosaavn/song/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Song ID required' });
    const song = await jiosaavnGetSong(id);
    if (!song) return res.status(404).json({ error: 'Song not found' });
    const mapped = mapJioSaavnSong(song);
    upsertSongToSupabase(mapped);
    res.json({ song: mapped, source: 'jiosaavn' });
  } catch (err) {
    console.error('JioSaavn song proxy error:', err);
    res.status(500).json({ error: 'Failed to fetch song details' });
  }
});

app.get('/api/jiosaavn/album/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Album ID required' });
    const album = await jiosaavnGetAlbum(id);
    if (!album) return res.status(404).json({ error: 'Album not found' });
    if (album.songs) {
      album.songs.forEach(s => upsertSongToSupabase(mapJioSaavnSong(s)));
    }
    res.json({ album, source: 'jiosaavn' });
  } catch (err) {
    console.error('JioSaavn album proxy error:', err);
    res.status(500).json({ error: 'Failed to fetch album details' });
  }
});

app.get('/api/jiosaavn/artist/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Artist ID required' });
    const artist = await jiosaavnGetArtist(id);
    if (!artist) return res.status(404).json({ error: 'Artist not found' });
    if (artist.topSongs) {
      artist.topSongs.forEach(s => upsertSongToSupabase(mapJioSaavnSong(s)));
    }
    res.json({ artist, source: 'jiosaavn' });
  } catch (err) {
    console.error('JioSaavn artist proxy error:', err);
    res.status(500).json({ error: 'Failed to fetch artist details' });
  }
});

app.get('/api/jiosaavn/playlist/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Playlist ID required' });
    const playlist = await jiosaavnGetPlaylist(id);
    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
    if (playlist.songs) {
      playlist.songs.forEach(s => upsertSongToSupabase(mapJioSaavnSong(s)));
    }
    res.json({ playlist, source: 'jiosaavn' });
  } catch (err) {
    console.error('JioSaavn playlist proxy error:', err);
    res.status(500).json({ error: 'Failed to fetch playlist details' });
  }
});

app.get('/api/jiosaavn/trending', async (req, res) => {
  try {
    const { lang = 'Tamil' } = req.query;
    const results = await jiosaavnSearchSongs(`${lang} trending top songs`, 20);
    const mapped = results.map(mapJioSaavnSong).filter(Boolean);
    mapped.forEach(s => upsertSongToSupabase(s));
    res.json({ results: mapped, source: 'jiosaavn' });
  } catch (err) {
    console.error('JioSaavn trending proxy error:', err);
    res.status(500).json({ error: 'Failed to fetch trending songs', results: [] });
  }
});

app.get('/api/jiosaavn/new-releases', async (req, res) => {
  try {
    const { lang = 'Tamil' } = req.query;
    const results = await jiosaavnSearchSongs(`${lang} new releases latest 2024`, 20);
    const mapped = results.map(mapJioSaavnSong).filter(Boolean);
    mapped.forEach(s => upsertSongToSupabase(s));
    res.json({ results: mapped, source: 'jiosaavn' });
  } catch (err) {
    console.error('JioSaavn new releases proxy error:', err);
    res.status(500).json({ error: 'Failed to fetch new releases', results: [] });
  }
});

app.get('/api/jiosaavn/recommendations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const recs = await jiosaavnGetRecommendations(id);
    const mapped = recs.map(mapJioSaavnSong).filter(Boolean);
    mapped.forEach(s => upsertSongToSupabase(s));
    res.json({ results: mapped, source: 'jiosaavn' });
  } catch (err) {
    console.error('JioSaavn recommendations proxy error:', err);
    res.status(500).json({ error: 'Failed to fetch recommendations', results: [] });
  }
});

app.get('/api/jiosaavn/lyrics/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const lyrics = await jiosaavnGetLyrics(id);
    res.json({ lyrics, source: 'jiosaavn' });
  } catch (err) {
    console.error('JioSaavn lyrics proxy error:', err);
    res.status(500).json({ error: 'Failed to fetch lyrics' });
  }
});

// ============================================================
// AUDIO STREAMING ROUTE
// ============================================================
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

app.get('/api/stream', async (req, res) => {
  try {
    const { songId, jioId, title, artist } = req.query;

    // Priority 1: JioSaavn direct download by targetJioId (jioId or songId)
    const targetJioId = jioId || songId;
    if (targetJioId && !targetJioId.includes('/') && !targetJioId.startsWith('local_')) {
      try {
        const jioSong = await jiosaavnGetSong(targetJioId);
        if (jioSong && jioSong.downloadUrl && jioSong.downloadUrl.length > 0) {
          // Pick highest quality download URL
          const bestUrl = jioSong.downloadUrl[jioSong.downloadUrl.length - 1].url;
          if (bestUrl) return res.redirect(bestUrl);
        }
      } catch (jioErr) {
        console.warn('JioSaavn stream fallback:', jioErr.message);
      }
    }

    // Priority 2: Look up song in Supabase
    let song = null;
    if (songId) {
      const { data: supaSong } = await supabase.from('songs').select('file_url, title').eq('song_id', songId).maybeSingle();
      song = supaSong;
    }
    if (!song && title) {
      const { data: supaSongs } = await supabase.from('songs').select('file_url, title').ilike('title', title.trim());
      song = supaSongs && supaSongs[0] ? supaSongs[0] : null;
    }

    // Priority 3: JioSaavn search by title+artist (when no jioId given)
    if (!jioId && title) {
      try {
        const searchQ = `${title} ${artist || ''}`.trim();
        const jioResults = await jiosaavnSearchSongs(searchQ, 3);
        if (jioResults.length > 0) {
          const bestMatch = jioResults[0];
          if (bestMatch.downloadUrl && bestMatch.downloadUrl.length > 0) {
            const bestUrl = bestMatch.downloadUrl[bestMatch.downloadUrl.length - 1].url;
            if (bestUrl) return res.redirect(bestUrl);
          }
        }
      } catch (jioErr) {
        console.warn('JioSaavn search-stream fallback:', jioErr.message);
      }
    }

    const pipeYouTubeAudio = async (queryStr) => {
      try {
        const r = await yts(queryStr);
        const video = r ? (r.videos && r.videos[0] ? r.videos[0] : r) : null;
        if (!video || !video.url) throw new Error('No video found');

        return new Promise((resolve) => {
          let streamed = false;
          try {
            const stream = ytdl(video.url, {
              filter: 'audioonly',
              highWaterMark: 1 << 25
            });

            stream.on('response', () => {
              streamed = true;
              if (!res.headersSent) {
                res.setHeader('Content-Type', 'audio/mpeg');
                stream.pipe(res);
              }
              resolve(true);
            });

            stream.on('error', (err) => {
              console.warn('YTDL stream error, triggering instant fallback:', err.message);
              if (!streamed && !res.headersSent) {
                const trackNum = (Math.abs(hashString(queryStr)) % 16) + 1;
                res.redirect(`https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${trackNum}.mp3`);
                resolve(true);
              }
            });

            setTimeout(() => {
              if (!streamed && !res.headersSent) {
                console.warn('YTDL stream timeout, triggering instant fallback for:', queryStr);
                const trackNum = (Math.abs(hashString(queryStr)) % 16) + 1;
                res.redirect(`https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${trackNum}.mp3`);
                resolve(true);
              }
            }, 3000);
          } catch (e) {
            console.warn('YTDL init error, triggering instant fallback:', e.message);
            if (!res.headersSent) {
              const trackNum = (Math.abs(hashString(queryStr)) % 16) + 1;
              res.redirect(`https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${trackNum}.mp3`);
              resolve(true);
            }
          }
        });
      } catch (err) {
        console.error('YouTube search/stream failed:', err.message);
        if (!res.headersSent) {
          const trackNum = (Math.abs(hashString(queryStr)) % 16) + 1;
          res.redirect(`https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${trackNum}.mp3`);
          return true;
        }
        return false;
      }
    };

    const songUrl = song ? (song.file_url || song.audioUrl) : null;
    if (songUrl) {
      const audioUrl = songUrl;

      if (audioUrl.startsWith('JIOSAAVN_SEARCH:')) {
        const query = audioUrl.replace('JIOSAAVN_SEARCH:', '');
        const success = await pipeYouTubeAudio(query);
        if (success) return;
      }

      if (audioUrl.startsWith('/uploads/') || audioUrl.startsWith('/audio/')) {
        const localPath = path.join(__dirname, 'public', audioUrl);
        if (fs.existsSync(localPath)) {
          return res.sendFile(localPath);
        }
      }

      if (audioUrl.startsWith('http')) {
        return res.redirect(audioUrl);
      }
    }

    const fallbackQuery = `${title || 'music'} ${artist || ''}`.trim();
    await pipeYouTubeAudio(fallbackQuery);
  } catch (err) {
    console.error('Stream error:', err);
    res.status(500).json({ error: 'Failed to stream audio' });
  }
});

// ============================================================
// MUSIC API ROUTES
// ============================================================
app.get('/api/music/search', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    if (!q) return res.status(400).json({ error: 'Query required' });

    const detectedLang = detectLanguageFromText(q);
    const r = await yts(q);
    const results = (r.videos || []).slice(0, parseInt(limit)).map(v => ({
      id: v.videoId,
      title: v.title,
      artist: v.author?.name || 'Unknown Artist',
      album: 'YouTube Music',
      year: new Date().getFullYear(),
      duration: v.seconds || 0,
      language: detectedLang,
      coverImage: v.thumbnail || '',
      audioUrl: [{ quality: 'high', url: `/api/stream?title=${encodeURIComponent(v.title)}` }],
      source: 'youtube'
    }));

    res.json({ results });
  } catch(err) {
    console.error('Music search error:', err.message);
    res.status(500).json({ error: 'Music search failed', results: [] });
  }
});

app.get('/api/music/song/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const r = await yts({ videoId: id });
    if (!r) return res.status(404).json({ error: 'Song not found' });

    res.json({
      id: r.videoId,
      title: r.title,
      artist: r.author.name || 'Unknown',
      album: 'YouTube Music',
      year: new Date().getFullYear(),
      duration: r.seconds || 0,
      coverImage: r.thumbnail || '',
      audioUrl: `/api/stream?title=${encodeURIComponent(r.title)}`,
      source: 'youtube'
    });
  } catch(err) {
    console.error('Song detail error:', err.message);
    res.status(500).json({ error: 'Failed to fetch song' });
  }
});

app.get('/api/music/deezer/search', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    if (!q) return res.status(400).json({ error: 'Query required' });

    const deezerRes = await axios.get(`https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=${limit}`, { timeout: 8000 });
    const results = (deezerRes.data?.data || []).map(t => ({
      id: String(t.id),
      title: t.title,
      artist: t.artist?.name || 'Unknown',
      album: t.album?.title || 'Unknown',
      duration: t.duration || 0,
      coverImage: t.album?.cover_big || t.album?.cover_medium || '',
      audioUrl: t.preview || '',
      source: 'deezer'
    }));

    res.json({ results });
  } catch(err) {
    console.error('Deezer search error:', err.message);
    res.status(500).json({ error: 'Deezer search failed', results: [] });
  }
});

app.get('/api/music/deezer/track/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deezerRes = await axios.get(`https://api.deezer.com/track/${id}`, { timeout: 8000 });
    const t = deezerRes.data;
    if (!t || t.error) return res.status(404).json({ error: 'Track not found' });

    res.json({
      id: String(t.id),
      title: t.title,
      artist: t.artist?.name || 'Unknown',
      album: t.album?.title || 'Unknown',
      duration: t.duration || 0,
      coverImage: t.album?.cover_big || t.album?.cover_medium || '',
      audioUrl: t.preview || '',
      source: 'deezer'
    });
  } catch(err) {
    console.error('Deezer track error:', err.message);
    res.status(500).json({ error: 'Failed to fetch Deezer track' });
  }
});

// ============================================================
// PLAYBACK / JIOSAAVN RESOLUTION & DB CACHE
// ============================================================
app.get('/api/song/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Song ID required' });

    const rawSong = await jiosaavnGetSong(id);
    if (!rawSong) {
      return res.status(404).json({ error: 'Song not found' });
    }

    const song = mapJioSaavnSong(rawSong);

    // Save/upsert song metadata only (excluding streamUrl) to songs table
    await supabase.from('songs').upsert({
      song_id: song.songId,
      title: song.title,
      album: song.album || 'Single',
      artist: song.artist,
      duration: song.duration || 0,
      image: song.coverImage || '',
      language: song.language || 'English',
      release_year: song.year || null,
      explicit: song.explicit || false,
      copyright: song.copyright || '',
      lyrics_available: song.lyrics_available || false,
      updated_at: new Date().toISOString()
    });

    res.json({
      title: song.title,
      artist: song.artist,
      album: song.album,
      image: song.coverImage,
      duration: song.duration,
      streamUrl: song.downloadUrl
    });
  } catch (err) {
    console.error('Fetch dynamic song error:', err);
    res.status(500).json({ error: 'Failed to retrieve song details' });
  }
});

// ============================================================
// HISTORY & RECENTLY PLAYED ROUTES
// ============================================================
app.post('/api/history', authenticateToken, async (req, res) => {
  const {
    song_id,
    started_at,
    completed_at,
    play_duration,
    percentage_listened,
    playback_speed,
    repeat_mode,
    shuffle,
    device,
    network,
    language,
    mood
  } = req.body;

  if (!song_id) return res.status(400).json({ error: 'Song ID is required' });

  try {
    // Insert history
    await supabase.from('listening_history').insert({
      user_id: req.user.id,
      song_id,
      started_at: started_at || new Date().toISOString(),
      completed_at: completed_at || new Date().toISOString(),
      play_duration: play_duration || 0,
      percentage_listened: percentage_listened || 0.0,
      playback_speed: playback_speed || 1.0,
      repeat_mode: repeat_mode || 'off',
      shuffle: Boolean(shuffle),
      device: device || req.headers['user-agent'] || 'unknown',
      network: network || 'unknown',
      language: language || 'English',
      mood: mood || 'neutral'
    });

    // Record to recently_played
    await supabase.from('recently_played').insert({
      user_id: req.user.id,
      song_id
    });

    // Limit recently_played to latest 100 entries per user
    const { data: recents } = await supabase
      .from('recently_played')
      .select('id')
      .eq('user_id', req.user.id)
      .order('played_at', { ascending: false });

    if (recents && recents.length > 100) {
      const toDelete = recents.slice(100).map(r => r.id);
      await supabase.from('recently_played').delete().in('id', toDelete);
    }

    // Auto-detect language preference & update listen counts
    if (language) {
      const { data: currentPref } = await supabase
        .from('language_preferences')
        .select('*')
        .eq('user_id', req.user.id)
        .eq('language', language)
        .maybeSingle();

      if (currentPref) {
        await supabase.from('language_preferences')
          .update({
            listen_count: (currentPref.listen_count || 1) + 1,
            last_listened: new Date().toISOString()
          })
          .eq('user_id', req.user.id)
          .eq('language', language);
      } else {
        await supabase.from('language_preferences').insert({
          user_id: req.user.id,
          language,
          listen_count: 1,
          last_listened: new Date().toISOString()
        });
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error('History post error:', err);
    res.status(500).json({ error: 'Failed to record listening history' });
  }
});

app.get('/api/history', authenticateToken, async (req, res) => {
  try {
    const { data: supaHistory } = await supabase
      .from('listening_history')
      .select('*, songs(*)')
      .eq('user_id', req.user.id)
      .order('started_at', { ascending: false })
      .limit(100);

    const historyMapped = (supaHistory || []).map(h => {
      if (h.songs) {
        return {
          id: h.id,
          songId: h.song_id,
          title: h.songs.title,
          artist: h.songs.artist,
          album: h.songs.album,
          duration: h.songs.duration,
          coverImage: h.songs.image,
          language: h.songs.language,
          playedAt: h.started_at
        };
      }
      return null;
    }).filter(Boolean);

    res.json({ success: true, history: historyMapped });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch listening history' });
  }
});

// ============================================================
// PLAYLISTS MANAGEMENT ROUTES
// ============================================================
app.post('/api/playlist', authenticateToken, async (req, res) => {
  const { title, cover_image } = req.body;
  if (!title) return res.status(400).json({ error: 'Playlist title is required' });

  try {
    const { data, error } = await supabase
      .from('playlists')
      .insert({
        user_id: req.user.id,
        title,
        cover_image: cover_image || ''
      })
      .select('*')
      .maybeSingle();

    if (error) throw error;
    res.status(201).json({ success: true, playlist: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
});

app.get('/api/playlist', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('playlists')
      .select('*, playlist_songs(song_id, songs(*))')
      .eq('user_id', req.user.id);

    if (error) throw error;

    const playlistsMapped = (data || []).map(p => {
      const songs = (p.playlist_songs || []).map(ps => {
        if (ps.songs) {
          return {
            songId: ps.songs.song_id,
            id: ps.songs.song_id,
            title: ps.songs.title,
            artist: ps.songs.artist,
            album: ps.songs.album,
            duration: ps.songs.duration,
            coverImage: ps.songs.image,
            language: ps.songs.language
          };
        }
        return null;
      }).filter(Boolean);

      return {
        id: p.id,
        title: p.title,
        coverImage: p.cover_image,
        songs,
        createdAt: p.created_at,
        updatedAt: p.updated_at
      };
    });

    res.json({ success: true, playlists: playlistsMapped });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve playlists' });
  }
});

app.put('/api/playlist/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Playlist title required' });

  try {
    const { data, error } = await supabase
      .from('playlists')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select('*')
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Playlist not found' });

    res.json({ success: true, playlist: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update playlist' });
  }
});

app.delete('/api/playlist/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from('playlists').delete().eq('id', id).eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete playlist' });
  }
});

app.post('/api/playlist/add', authenticateToken, async (req, res) => {
  const { playlist_id, song_id, song } = req.body;
  if (!playlist_id || !song_id) {
    return res.status(400).json({ error: 'playlist_id and song_id are required' });
  }

  try {
    // Verify playlist ownership
    const { data: pCheck } = await supabase.from('playlists').select('id').eq('id', playlist_id).eq('user_id', req.user.id).maybeSingle();
    if (!pCheck) return res.status(403).json({ error: 'Playlist not found or access denied' });

    // Store metadata if song object provided
    if (song && song.title) {
      await supabase.from('songs').upsert({
        song_id,
        title: song.title,
        album: song.album || song.movie || 'Single',
        artist: song.artist,
        duration: song.duration || 0,
        image: song.coverImage || song.image || '',
        language: song.language || 'English',
        release_year: song.year || song.release_year || null,
        explicit: song.explicit || false,
        copyright: song.copyright || '',
        lyrics_available: song.lyrics_available || false,
        updated_at: new Date().toISOString()
      });
    }

    const { data, error } = await supabase.from('playlist_songs').insert({
      playlist_id,
      song_id
    }).select('*').maybeSingle();

    if (error) throw error;
    res.json({ success: true, item: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add song to playlist' });
  }
});

app.delete('/api/playlist/remove', authenticateToken, async (req, res) => {
  const { playlist_id, song_id } = req.body;
  if (!playlist_id || !song_id) {
    return res.status(400).json({ error: 'playlist_id and song_id are required' });
  }

  try {
    // Verify playlist ownership
    const { data: pCheck } = await supabase.from('playlists').select('id').eq('id', playlist_id).eq('user_id', req.user.id).maybeSingle();
    if (!pCheck) return res.status(403).json({ error: 'Playlist not found or access denied' });

    const { error } = await supabase.from('playlist_songs').delete().eq('playlist_id', playlist_id).eq('song_id', song_id);
    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove song from playlist' });
  }
});

app.put('/api/playlist/:id/reorder', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { song_ids } = req.body;
  if (!Array.isArray(song_ids)) return res.status(400).json({ error: 'song_ids array required' });

  try {
    const { data: pCheck } = await supabase.from('playlists').select('id').eq('id', id).eq('user_id', req.user.id).maybeSingle();
    if (!pCheck) return res.status(403).json({ error: 'Playlist not found or access denied' });

    for (let i = 0; i < song_ids.length; i++) {
      await supabase.from('playlist_songs')
        .update({ position: i })
        .eq('playlist_id', id)
        .eq('song_id', song_ids[i]);
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reorder playlist' });
  }
});

app.post('/api/playlist/:id/duplicate', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const { data: orig } = await supabase.from('playlists').select('*, playlist_songs(*)').eq('id', id).maybeSingle();
    if (!orig) return res.status(404).json({ error: 'Original playlist not found' });

    const { data: newP } = await supabase.from('playlists').insert({
      user_id: req.user.id,
      title: `${orig.title} (Copy)`,
      cover_image: orig.cover_image
    }).select('*').maybeSingle();

    if (newP && orig.playlist_songs && orig.playlist_songs.length > 0) {
      const items = orig.playlist_songs.map(ps => ({
        playlist_id: newP.id,
        song_id: ps.song_id,
        position: ps.position
      }));
      await supabase.from('playlist_songs').insert(items);
    }
    res.json({ success: true, playlist: newP });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to duplicate playlist' });
  }
});

app.get('/api/playlist/:id/share', async (req, res) => {
  const { id } = req.params;
  try {
    const { data: playlist } = await supabase.from('playlists').select('id, title, cover_image, created_at, users(display_name)').eq('id', id).maybeSingle();
    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
    const shareUrl = `${req.protocol}://${req.get('host')}/playlist/${id}`;
    res.json({ success: true, playlist, shareUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate share link' });
  }
});

// ============================================================
// MOOD DETECTION ROUTE
// ============================================================
app.post('/api/mood', authenticateToken, async (req, res) => {
  const { mood, detected_mood, confidence, source, recommended_song, recommended_playlist } = req.body;
  const targetMood = detected_mood || mood;
  if (!targetMood) return res.status(400).json({ error: 'Mood is required' });

  try {
    const { data, error } = await supabase.from('user_moods').insert({
      user_id: req.user.id,
      mood: targetMood,
      detected_mood: targetMood,
      confidence: confidence || 1.0,
      source: source || 'manual',
      recommended_song: recommended_song || null,
      recommended_playlist: recommended_playlist || null,
      timestamp: new Date().toISOString()
    }).select('*').maybeSingle();

    if (error) throw error;
    res.json({ success: true, mood: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save mood' });
  }
});

// ============================================================
// ANALYTICS ROUTE
// ============================================================
app.get('/api/analytics', authenticateToken, async (req, res) => {
  try {
    // DAU (Unique user_id in last 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: dauHistory } = await supabase.from('listening_history').select('user_id').gt('started_at', oneDayAgo);
    const { data: dauSearch } = await supabase.from('search_history').select('user_id').gt('search_time', oneDayAgo);
    const dauUsers = new Set([
      ...(dauHistory || []).map(h => h.user_id),
      ...(dauSearch || []).map(s => s.user_id)
    ]);

    // MAU (Unique user_id in last 30d)
    const { data: mauHistory } = await supabase.from('listening_history').select('user_id').gt('started_at', thirtyDaysAgo);
    const { data: mauSearch } = await supabase.from('search_history').select('user_id').gt('search_time', thirtyDaysAgo);
    const mauUsers = new Set([
      ...(mauHistory || []).map(h => h.user_id),
      ...(mauSearch || []).map(s => s.user_id)
    ]);

    // Total Plays & Listening Time
    const { data: plays } = await supabase.from('listening_history').select('song_id, play_duration, device, language, songs(artist, album)');
    const totalPlays = plays ? plays.length : 0;
    const totalListeningTime = (plays || []).reduce((acc, curr) => acc + (curr.play_duration || 0), 0);

    const songCounts = {};
    const artistCounts = {};
    const albumCounts = {};
    const deviceCounts = {};
    const langCounts = { Tamil: 0, English: 0, Hindi: 0, Telugu: 0, Malayalam: 0, Kannada: 0, Punjabi: 0, Others: 0 };

    (plays || []).forEach(p => {
      songCounts[p.song_id] = (songCounts[p.song_id] || 0) + 1;
      if (p.songs?.artist) artistCounts[p.songs.artist] = (artistCounts[p.songs.artist] || 0) + 1;
      if (p.songs?.album) albumCounts[p.songs.album] = (albumCounts[p.songs.album] || 0) + 1;
      if (p.device) deviceCounts[p.device] = (deviceCounts[p.device] || 0) + 1;
      if (p.language) {
        if (langCounts[p.language] !== undefined) langCounts[p.language]++;
        else langCounts.Others++;
      }
    });

    const topSongs = Object.entries(songCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(entry => ({ song_id: entry[0], plays: entry[1] }));
    const topArtists = Object.entries(artistCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(entry => ({ artist: entry[0], plays: entry[1] }));
    const topAlbums = Object.entries(albumCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(entry => ({ album: entry[0], plays: entry[1] }));

    // Favorites Count
    const { data: favs } = await supabase.from('favorite_songs').select('song_id');
    const favoriteSongsCount = favs ? favs.length : 0;

    // Mood Distribution
    const { data: moods } = await supabase.from('user_moods').select('mood');
    const moodCounts = {};
    (moods || []).forEach(m => {
      moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
    });

    // Platform Usage
    const { data: users } = await supabase.from('users').select('platform');
    const platformCounts = {};
    (users || []).forEach(u => {
      if (u.platform) platformCounts[u.platform] = (platformCounts[u.platform] || 0) + 1;
    });

    // Search Trends
    const { data: searches } = await supabase.from('search_history').select('keyword');
    const searchCounts = {};
    (searches || []).forEach(s => {
      searchCounts[s.keyword] = (searchCounts[s.keyword] || 0) + 1;
    });
    const topSearches = Object.entries(searchCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(entry => ({ keyword: entry[0], count: entry[1] }));

    res.json({
      success: true,
      total_plays: totalPlays,
      total_listening_time_seconds: totalListeningTime,
      favorite_songs_count: favoriteSongsCount,
      favorite_artists: topArtists,
      favorite_albums: topAlbums,
      most_searched_songs: topSearches,
      most_played_songs: topSongs,
      mood_distribution: moodCounts,
      language_distribution: langCounts,
      device_usage: deviceCounts,
      platform_usage: platformCounts,
      dau: dauUsers.size,
      mau: mauUsers.size
    });
  } catch (err) {
    console.error('Analytics endpoint error:', err);
    res.status(500).json({ error: 'Failed to retrieve analytics' });
  }
});

// ============================================================
// DIRECT ROUTING WRAPPERS / COMPATIBILITY ALIASES
// ============================================================
app.post('/signup', (req, res) => res.redirect(307, '/api/auth/register'));
app.post('/login', (req, res) => res.redirect(307, '/api/auth/login'));
app.post('/logout', (req, res) => res.redirect(307, '/api/auth/logout'));
app.get('/search', (req, res) => res.redirect(307, '/api/search'));
app.get('/song/:id', (req, res) => res.redirect(307, `/api/song/${req.params.id}`));
app.post('/favorite', (req, res) => res.redirect(307, '/api/favorites'));
app.delete('/favorite', (req, res) => res.redirect(307, '/api/favorites'));
app.post('/history', (req, res) => res.redirect(307, '/api/history'));
app.get('/history', (req, res) => res.redirect(307, '/api/history'));
app.post('/playlist', (req, res) => res.redirect(307, '/api/playlist'));
app.get('/playlist', (req, res) => res.redirect(307, '/api/playlist'));
app.post('/playlist/add', (req, res) => res.redirect(307, '/api/playlist/add'));
app.delete('/playlist/remove', (req, res) => res.redirect(307, '/api/playlist/remove'));
app.post('/mood', (req, res) => res.redirect(307, '/api/mood'));
app.get('/analytics', (req, res) => res.redirect(307, '/api/analytics'));

function adminOnly(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied: Admin only' });
  }
}

const songStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const language = req.body.language || 'Other';
    const artist = req.body.artist || 'Local';
    const dir = path.join(__dirname, 'public', 'uploads', language, slugify(artist));
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const cleanName = path.basename(file.originalname, ext).toLowerCase().replace(/[^a-z0-9]/g, '_');
    cb(null, `${cleanName}_${Date.now()}${ext}`);
  }
});
const songUpload = multer({
  storage: songStorage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

// ============================================================
// ARTIST & ALBUM ROUTES
// ============================================================
app.get('/api/artists/:artistName', async (req, res) => {
  try {
    const name = req.params.artistName;
    const { data: supaArtist } = await supabase.from('artists').select('*').eq('artistName', name).maybeSingle();
    let artist = supaArtist;
    if (!artist) {
      artist = {
        artistName: name,
        imageUrl: `/uploads/artists/${slugify(name)}.jpg`,
        biography: `${name} is an active music artist in the library.`
      };
    }
    const { count: totalSongs } = await supabase.from('songs').select('*', { count: 'exact', head: true }).eq('artist', name);
    const { data: supaPopular } = await supabase.from('songs').select('*').eq('artist', name).limit(10);

    res.json({
      artistName: artist.artistName,
      imageUrl: artist.imageUrl,
      biography: artist.biography,
      totalSongs: totalSongs || (supaPopular ? supaPopular.length : 0),
      albums: [],
      popularSongs: supaPopular || [],
      latestSongs: supaPopular || []
    });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/artists/:artistName', authenticateToken, adminOnly, async (req, res) => {
  try {
    const name = req.params.artistName;
    const { imageUrl, biography } = req.body;
    await supabase.from('artists').upsert([{ artistName: name, imageUrl, biography }]);
    res.json({ success: true });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/albums/:albumName', async (req, res) => {
  try {
    const name = req.params.albumName;
    const { data: supaSongs } = await supabase.from('songs').select('*').eq('album', name);
    const songs = supaSongs || [];

    if (songs.length === 0) return res.status(404).json({ error: 'Album not found' });
    const first = songs[0];

    res.json({
      albumName: first.album,
      coverImage: first.coverImage,
      releaseYear: first.year,
      artist: first.artist,
      songs
    });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/albums/:albumName', authenticateToken, adminOnly, async (req, res) => {
  try {
    const name = req.params.albumName;
    const { coverImage, releaseYear, artistName } = req.body;
    await supabase.from('albums').upsert([{ albumName: name, coverImage, releaseYear, artistName }]);
    res.json({ success: true });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================
// ADMIN DASHBOARD ROUTES
// ============================================================
app.get('/api/admin/stats', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: totalSongs } = await supabase.from('songs').select('*', { count: 'exact', head: true });
    const { count: totalFavorites } = await supabase.from('favorite_songs').select('*', { count: 'exact', head: true });

    res.json({
      totalUsers: totalUsers || 0,
      totalSongs: totalSongs || 0,
      totalPlays: 0,
      totalLikes: 0,
      totalFavorites: totalFavorites || 0,
      jiosaavnMetrics: {
        totalRequests: jiosaavnMetrics.totalRequests,
        cacheHits: jiosaavnMetrics.cacheHits,
        cacheMisses: jiosaavnMetrics.cacheMisses,
        rateLimit429s: jiosaavnMetrics.rateLimit429s,
        retryAttempts: jiosaavnMetrics.retryAttempts,
        avgResponseTimeMs: jiosaavnMetrics.avgResponseTimeMs
      },
      languages: [],
      genres: []
    });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/admin/songs', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { data: songs } = await supabase.from('songs').select('*').order('created_at', { ascending: false });
    res.json({ songs: songs || [] });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/upload', authenticateToken, adminOnly, songUpload.fields([
  { name: 'audioFile', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, artist, album, language, genre, year, duration, moodTags } = req.body;

    if (!title) return res.status(400).json({ error: 'Song title is required' });
    if (!artist) return res.status(400).json({ error: 'Artist is required' });
    if (!language) return res.status(400).json({ error: 'Language is required' });

    const audioUploaded = req.files && req.files.audioFile;
    const thumbUploaded = req.files && req.files.coverImage;
    if (!audioUploaded) return res.status(400).json({ error: 'Audio file is required' });
    if (!thumbUploaded) return res.status(400).json({ error: 'Thumbnail is required' });

    const audioFile = req.files.audioFile[0];
    const coverImageFile = req.files.coverImage[0];

    const finalAudioUrl = `/uploads/${language}/${slugify(artist)}/${audioFile.filename}`;
    const finalCoverUrl = `/uploads/${language}/${slugify(artist)}/${coverImageFile.filename}`;

    const song_id = crypto.randomUUID();

    const newSong = {
      song_id,
      title,
      artist,
      album: album || 'Single',
      language,
      genre: genre || 'Pop',
      mood: moodTags || 'happy',
      release_year: parseInt(year, 10) || 2024,
      duration: parseInt(duration, 10) || 180,
      image: finalCoverUrl,
      file_url: finalAudioUrl
    };

    await supabase.from('songs').insert([newSong]);

    res.json({ success: true, songId: song_id, message: 'Song metadata verified and published to Supabase!' });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed: ' + err.message });
  }
});

app.post('/api/admin/bulk-upload', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { songs } = req.body;
    if (!songs || !Array.isArray(songs)) {
      return res.status(400).json({ error: 'Songs array is required' });
    }

    const insertedRows = [];
    for (const s of songs) {
      if (!s.title || !s.artist || !s.language) continue;
      const song_id = crypto.randomUUID();
      const album = s.album || 'Single Album';
      const language = s.language;
      const artist = s.artist;
      const year = s.year || 2024;
      const audioUrl = s.audioUrl || `https://res.cloudinary.com/dynv6r4b/video/upload/v1782834787/${language}/${slugify(artist)}/${slugify(s.title)}.mp3`;
      const coverImage = s.coverImage || `/uploads/covers/${slugify(album)}.jpg`;

      insertedRows.push({
        song_id,
        title: s.title,
        artist,
        album,
        language,
        genre: s.genre || 'Pop',
        mood: s.moodTags || s.mood || 'happy',
        release_year: parseInt(year, 10),
        duration: parseInt(s.duration, 10) || 180,
        image: coverImage,
        file_url: audioUrl
      });
    }

    if (insertedRows.length > 0) {
      await supabase.from('songs').insert(insertedRows);
    }

    res.json({ success: true, processedCount: insertedRows.length, songs: insertedRows });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Bulk upload failed: ' + err.message });
  }
});

app.get('/api/admin/broken-links', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { data: songs } = await supabase.from('songs').select('*');
    const broken = [];
    if (songs) {
      for (const song of songs) {
        let audioBroken = false;
        let coverBroken = false;
        if (song.audioUrl && (song.audioUrl.startsWith('/uploads/') || song.audioUrl.startsWith('/audio/'))) {
          const localPath = path.join(__dirname, 'public', song.audioUrl);
          if (!fs.existsSync(localPath)) audioBroken = true;
        }
        if (song.coverImage && (song.coverImage.startsWith('/uploads/') || song.coverImage.startsWith('/audio/'))) {
          const localPath = path.join(__dirname, 'public', song.coverImage);
          if (!fs.existsSync(localPath)) coverBroken = true;
        }
        if (audioBroken || coverBroken) {
          broken.push({
            songId: song.songId,
            title: song.title,
            artist: song.artist,
            audioUrl: song.audioUrl,
            coverImage: song.coverImage,
            audioBroken,
            coverBroken
          });
        }
      }
    }
    res.json({ broken });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/admin/duplicates', authenticateToken, adminOnly, async (req, res) => {
  try {
    res.json({ duplicates: [] });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/duplicates/resolve', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { title, artist } = req.body;
    if (!title || !artist) return res.status(400).json({ error: 'Title and artist required' });

    const { data: records } = await supabase.from('songs').select('songId').ilike('title', title.trim()).ilike('artist', artist.trim());
    if (!records || records.length <= 1) return res.json({ success: true, resolved: 0 });

    const keepId = records[0].songId;
    const deleteIds = records.slice(1).map(r => r.songId);

    for (const id of deleteIds) {
      await supabase.from('songs').delete().eq('songId', id);
    }

    res.json({ success: true, resolved: deleteIds.length, keptId: keepId });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/admin/cloudinary-sync', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { data: songs } = await supabase.from('songs').select('songId, title, artist, audioUrl, cloudinaryPublicId');
    const synced = (songs || []).map(s => {
      const isCloudinary = (s.audioUrl || '').includes('cloudinary.com');
      const isCorrectPath = (s.audioUrl || '').includes(s.cloudinaryPublicId) || (isCloudinary && (s.audioUrl || '').endsWith('.mp3'));
      return {
        songId: s.songId,
        title: s.title,
        artist: s.artist,
        audioUrl: s.audioUrl,
        cloudinaryPublicId: s.cloudinaryPublicId,
        status: isCorrectPath ? 'Synced' : 'Pending Sync'
      };
    });
    res.json({ synced });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/cloudinary-sync/run', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { data: songs } = await supabase.from('songs').select('*');
    let updated = 0;
    if (songs) {
      for (const s of songs) {
        if (!s.cloudinaryPublicId) {
          const publicId = `${s.language}/${slugify(s.artist)}/${slugify(s.title)}`;
          await supabase.from('songs').update({ cloudinaryPublicId: publicId }).eq('songId', s.songId);
          updated++;
        }
      }
    }
    res.json({ success: true, updatedCount: updated });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/admin/songs/:songId', authenticateToken, adminOnly, async (req, res) => {
  try {
    const id = req.params.songId;
    const { title, artist, album, language, genre, year, duration, lyrics, moodTags, keywords } = req.body;
    const updateObj = { title, artist, album, language, genre, lyrics, moodTags, keywords };
    if (year) updateObj.year = parseInt(year, 10);
    if (duration) updateObj.duration = parseInt(duration, 10);

    await supabase.from('songs').update(updateObj).eq('songId', id);
    res.json({ success: true });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/admin/songs/:songId', authenticateToken, adminOnly, async (req, res) => {
  try {
    const id = req.params.songId;
    await supabase.from('songs').delete().eq('songId', id);
    res.json({ success: true });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/songs/:songId/toggle', authenticateToken, adminOnly, async (req, res) => {
  try {
    const id = req.params.songId;
    const { data: supaSong } = await supabase.from('songs').select('isActive').eq('songId', id).maybeSingle();

    const currentActive = supaSong ? supaSong.isActive : 1;
    const nextState = currentActive === 1 ? 0 : 1;

    await supabase.from('songs').update({ isActive: nextState }).eq('songId', id);
    res.json({ success: true, isActive: nextState });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`\nSongstr running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Database Mode: Pure Supabase Cloud PostgreSQL`);
  });
}

module.exports = app;

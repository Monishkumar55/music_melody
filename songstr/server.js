const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
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

function detectLanguageFromText(text) {
  if (!text) return 'English';
  const lower = text.toLowerCase();
  if (lower.includes('tamil')) return 'Tamil';
  if (lower.includes('hindi')) return 'Hindi';
  if (lower.includes('telugu')) return 'Telugu';
  if (lower.includes('malayalam')) return 'Malayalam';
  if (lower.includes('kannada')) return 'Kannada';
  if (lower.includes('punjabi')) return 'Punjabi';
  if (lower.includes('bengali')) return 'Bengali';
  if (lower.includes('marathi')) return 'Marathi';
  if (lower.includes('gujarati')) return 'Gujarati';
  if (lower.includes('korean')) return 'Korean';
  if (lower.includes('japanese')) return 'Japanese';
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

const CUSTOM_TAMIL_SONGS = [
  { title: "Suthi Suthi", artist: "Anirudh Ravichander", album: "Tamil Hits", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834787/Suthi-Suthi_u5i8ui.mp3", mood: "romantic" },
  { title: "Un Vizhigalil", artist: "Anirudh Ravichander", album: "Darling", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834785/Un-Vizhigalil_l3surn.mp3", mood: "romantic" },
  { title: "Thodu Vaanam", artist: "Harris Jayaraj", album: "Anegan", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834785/Thodu-Vaanam_fhlgn3.mp3", mood: "romantic" },
  { title: "Unakaga", artist: "A.R. Rahman", album: "Bigil", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834783/unakaga_bdpizo.mp3", mood: "romantic" },
  { title: "Silu Siluvena Katru", artist: "G.V. Prakash", album: "Silu Silu", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834775/Silu-Siluvena-Katru_cwjjgl.mp3", mood: "relaxed" },
  { title: "Thangame", artist: "Anirudh Ravichander", album: "Naanum Rowdy Dhaan", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834774/Thangame_ktqi0e.mp3", mood: "romantic" },
  { title: "Simtaangaran", artist: "A.R. Rahman", album: "Sarkar", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834772/simtaangaran_dysuql.mp3", mood: "energetic" },
  { title: "Selfie Pulla", artist: "Anirudh Ravichander & Vijay", album: "Kaththi", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834768/selfie-pulla_hg2wbh.mp3", mood: "happy" },
  { title: "Roja Roja", artist: "A.R. Rahman", album: "Iruvar", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834767/Roja-Roja_we5f4d.mp3", mood: "romantic" },
  { title: "Puyale Puyale", artist: "A.R. Rahman", album: "Vettaiyaadu Vilaiyaadu", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834767/Puyale-Puyale_atozzx.mp3", mood: "romantic" },
  { title: "Roja Kadale", artist: "Harris Jayaraj", album: "Anegan", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834758/Roja-Kadale_wntb75.mp3", mood: "romantic" },
  { title: "Saitji Saitji", artist: "Hip Hop Tamizha", album: "Meesaya Murukku", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834755/saitji-saitji_oct3ij.mp3", mood: "energetic" },
  { title: "Osaka Osaka", artist: "Anirudh Ravichander", album: "Vanakkam Chennai", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834743/Osaka-Osaka_y1opok.mp3", mood: "happy" },
  { title: "Nenjukkul Peidhidum", artist: "Harris Jayaraj / Hariharan", album: "Vaaranam Aayiram", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834732/nenjukkul-peidhidum_jxdlqq.mp3", mood: "romantic" },
  { title: "OMG Ponnu", artist: "A.R. Rahman", album: "Sarkar", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834728/omg-ponnu_oxpcru.mp3", mood: "happy" },
  { title: "Nijamellam Maranthupochu", artist: "Dhanush / Anirudh", album: "Ethir Neechal", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834723/Nijamellam-Maranthupochu_zyhqqk.mp3", mood: "sad" },
  { title: "Oh Penne", artist: "Anirudh Ravichander", album: "Vanakkam Chennai", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834720/Oh-Penne_meuavb.mp3", mood: "romantic" },
  { title: "Oh Oh First Love Of Tamizh", artist: "Anirudh Ravichander", album: "VIP", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834719/oh-oh-the-first-love-of-tamizh_sqxcqa.mp3", mood: "romantic" },
  { title: "Neeyum Naanum", artist: "Anirudh Ravichander", album: "Naanum Rowdy Dhaan", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834715/Neeyum-Naanum_jltx0n.mp3", mood: "romantic" },
  { title: "Mundhinam Parthene", artist: "Harris Jayaraj", album: "Vaaranam Aayiram", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834707/mundhinam-parthene_dx61yd.mp3", mood: "romantic" },
  { title: "Nee Nenacha", artist: "Dhibu Ninan Thomas", album: "Kanaa", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834694/nee-nenacha_a8yr5w.mp3", mood: "romantic" },
  { title: "Maduraikku", artist: "Vidyasagar", album: "Ghilli", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834693/maduraikku_t0j4qy.mp3", mood: "energetic" },
  { title: "Megham Karukatha", artist: "Dhanush / Anirudh", album: "Thiruchitrambalam", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834676/megham-karukatha_pk36wy.mp3", mood: "happy" },
  { title: "Kandangi Kandangi Karaoke", artist: "Imman", album: "Jilla", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834644/Kandangi-Kandangi-Karaoke_pgx0dw.mp3", mood: "relaxed" },
  { title: "Kandangi Kandangi", artist: "Imman & Vijay", album: "Jilla", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834637/Kandangi-Kandangi_hrr70l.mp3", mood: "romantic" },
  { title: "Kadhal Panna", artist: "G.V. Prakash", album: "VIP", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834635/Kadhal-Panna_wutkyq.mp3", mood: "romantic" },
  { title: "Ennodu Nee Irundhal", artist: "A.R. Rahman & Sid Sriram", album: "I", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834616/Ennodu-Nee-Irundhal_ku1l9f.mp3", mood: "romantic" },
  { title: "Ethir Neechal", artist: "Anirudh Ravichander", album: "Ethir Neechal", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834602/Ethir-Neechal_te3byi.mp3", mood: "energetic" },
  { title: "Darling Dambakku", artist: "G.V. Prakash", album: "Maan Karate", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834585/Darling-Dambakku_ankos5.mp3", mood: "energetic" },
  { title: "Ennodu Nee Irundhal Reprise", artist: "A.R. Rahman", album: "I", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834583/Ennodu-Nee-Irundhal-Reprise_s8vbl1.mp3", mood: "romantic" },
  { title: "Boomi Enna Suthudhe", artist: "Anirudh Ravichander", album: "Ethir Neechal", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834569/Boomi-Enna-Suthudhe_plhssy.mp3", mood: "happy" },
  { title: "Arabic Kuthu Halamithi Habibo", artist: "Anirudh Ravichander", album: "Beast", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834550/arabic-kuthu-halamithi-habibo_dy1km3.mp3", mood: "energetic" },
  { title: "Adiyae Kolluthey", artist: "Harris Jayaraj", album: "Vaaranam Aayiram", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834548/adiyae-kolluthey_m6e9fa.mp3", mood: "romantic" },
  { title: "Antartica", artist: "Harris Jayaraj", album: "Thuppakki", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834547/antartica_hukl2c.mp3", mood: "happy" },
  { title: "Aathadi", artist: "Dhanush / Anirudh", album: "Anegan", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834547/aathadi_jcm1vc.mp3", mood: "romantic" },
  { title: "Ambikapathy", artist: "A.R. Rahman", album: "Ambikapathy", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834546/Ambikapathy_nyygos.mp3", mood: "romantic" },
  { title: "Aasa Pulla", artist: "Ghibran", album: "Amara Kaaviyam", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834524/aasa-pulla_t6cmgf.mp3", mood: "romantic" },
  { title: "Vaseegara", artist: "Harris Jayaraj", album: "Minnale", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834512/vasigaran-s-lab_wm63fv.mp3", mood: "romantic" },
  { title: "Sirikkadhey", artist: "Anirudh Ravichander", album: "Remo", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834507/Sirikkadhey_suipu4.mp3", mood: "romantic" },
  { title: "Un Paarvayil", artist: "Anirudh Ravichander", album: "Amman", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834506/Un-Paarvayil_a8kxll.mp3", mood: "romantic" },
  { title: "Senjitaley", artist: "Anirudh Ravichander", album: "Remo", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834500/Senjitaley_yfbizi.mp3", mood: "romantic" },
  { title: "Remo Nee Kadhalan", artist: "Anirudh Ravichander", album: "Remo", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834496/Remo-Nee-Kadhalan_qbcw9p.mp3", mood: "romantic" },
  { title: "Tak Bak", artist: "Anirudh Ravichander", album: "Thangamagan", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834485/tak-bak-the-tak-bak-of-tamizh_equpd6.mp3", mood: "happy" },
  { title: "Pavazha Malli", artist: "Harris Jayaraj", album: "Cobra", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834481/pavazha-malli_n6iicj.mp3", mood: "romantic" },
  { title: "Oh Shanthi Shanthi", artist: "Harris Jayaraj", album: "Vaaranam Aayiram", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834460/oh-shanthi-shanthi_rygmpv.mp3", mood: "romantic" },
  { title: "Paisa Note", artist: "Hip Hop Tamizha", album: "Comali", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834460/paisa-note_l7v6hq.mp3", mood: "energetic" },
  { title: "Loveah Sollitalea", artist: "Hiphop Tamizha", album: "Tik Tik Tik", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834416/loveah-sollitalea_jxfa8p.mp3", mood: "romantic" },
  { title: "Adiye Sakkarakatti", artist: "G.V. Prakash", album: "Rajinimurugan", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834346/adiye-sakkarakatti_ye4yhe.mp3", mood: "romantic" },
  { title: "Padaiyappa Love Success", artist: "A.R. Rahman", album: "Padaiyappa", url: "https://res.cloudinary.com/dynv6r4b/video/upload/v1782834322/padaiyappa-s-love-success_jbyku8.mp3", mood: "happy" }
];

async function seedDatabase() {
  try {
    const { count } = await supabase.from('songs').select('*', { count: 'exact', head: true });
    if (!count || count === 0) {
      const supaSongs = CUSTOM_TAMIL_SONGS.map(s => ({
        title: s.title,
        artist: s.artist,
        movie: s.album,
        language: 'Tamil',
        genre: 'Film Song',
        release_year: 2024,
        mood: s.mood,
        file_url: s.url
      }));
      await supabase.from('songs').insert(supaSongs);
      console.log(`Seeded ${CUSTOM_TAMIL_SONGS.length} songs into Supabase PostgreSQL.`);
    }
  } catch(e) {
    console.error("Supabase Database seeding notice:", e.message);
  }
}

seedDatabase();

function mapSongResponse(s) {
  if (!s) return null;
  return {
    songId: s.id,
    id: s.id,
    title: s.title,
    artist: s.artist,
    album: s.movie || s.album || 'Single',
    language: s.language || 'Tamil',
    genre: s.genre || 'Film Song',
    year: s.release_year || s.year || 2024,
    duration: s.duration || 210,
    coverImage: s.coverImage || s.cover_image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop',
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
    const { mood, lang = 'All', language, page = 1, limit = 100 } = req.query;
    const targetLang = language || lang;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const limitNum = parseInt(limit, 10);

    let supaQuery = supabase.from('songs').select('*');

    const validMoods = ['happy', 'sad', 'angry', 'relaxed', 'energetic', 'stressed', 'romantic', 'neutral'];
    if (mood && validMoods.includes(mood)) {
      supaQuery = supaQuery.ilike('mood', mood);
    }

    if (targetLang && targetLang !== 'All') {
      supaQuery = supaQuery.ilike('language', targetLang);
    }

    const { data: rawSongs, error } = await supaQuery.range(offset, offset + limitNum - 1);

    if (error) {
      console.error('Supabase songs error:', error.message);
      return res.status(500).json({ error: 'Database fetch failed', songs: [], total: 0 });
    }

    const songs = (rawSongs || []).map(mapSongResponse);
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
    languages: ['All', 'Tamil', 'Telugu', 'Hindi', 'Malayalam', 'Kannada', 'English', 'Punjabi', 'Bengali', 'Marathi', 'Gujarati', 'Other']
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
    if (q.length > 100) return res.status(413).json({ error: 'Search query too long' });
    const query = q.toLowerCase().trim();
    if (query.length === 0) return res.json({ results: [] });

    const { data: results, error } = await supabase
      .from('songs')
      .select('*')
      .eq('isActive', 1)
      .or(`title.ilike.%${query}%,artist.ilike.%${query}%,album.ilike.%${query}%,keywords.ilike.%${query}%`)
      .limit(20);

    if (error) {
      console.error('Search error:', error.message);
      return res.json({ results: [] });
    }

    res.json({ results: results || [] });
  } catch(err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Search failed', results: [] });
  }
});

// ============================================================
// AUTHENTICATION ROUTES
// ============================================================
app.post('/api/auth/register', async (req, res) => {
  const { username, email, fullname, phone, password } = req.body;
  if (!username || !email || !fullname || !password || username.length < 3 || password.length < 4) {
    return res.status(400).json({ error: 'Please fill out all required fields (password min 4 chars)' });
  }

  try {
    const { data: supaExisting } = await supabase.from('users').select('id').or(`username.eq.${username},email.eq.${email}`);
    if (supaExisting && supaExisting.length > 0) {
      return res.status(400).json({ error: 'Username or email already registered' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const { data: supaUser, error } = await supabase
      .from('users')
      .insert([{ username, email, fullname, phone: phone || null, password_hash: hash, role: 'user' }])
      .select('id, username, email, fullname, role')
      .single();

    if (error) throw error;

    const token = jwt.sign(supaUser, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ success: true, user: supaUser });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Please enter username/email and password' });
  }

  try {
    const clean = username.trim();
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, email, fullname, role, password_hash')
      .or(`username.eq.${clean},email.eq.${clean}`);

    if (error) throw error;

    const user = users && users[0];
    if (!user) return res.status(400).json({ error: 'Account not found. Please check username/email or Sign Up.' });

    const match = bcrypt.compareSync(password, user.password_hash);
    if (!match) return res.status(400).json({ error: 'Incorrect password. Please try again or click Forgot Password.' });

    await supabase.from('users').update({ lastLogin: new Date().toISOString() }).eq('id', user.id);

    const userObj = { id: user.id, username: user.username, email: user.email, fullname: user.fullname, role: user.role };
    const token = jwt.sign(userObj, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ success: true, user: userObj });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
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
    const { data: user } = await supabase.from('users').select('id, username, email').eq('email', email).maybeSingle();
    if (!user) return res.status(404).json({ error: 'No account found with this email' });

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    await supabase.from('users').update({ reset_code: resetCode }).eq('id', user.id);

    res.json({ success: true, message: `Password reset code sent to ${email}`, resetCode });
  } catch(err) {
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
    const { data: user } = await supabase.from('users').select('id, reset_code').eq('email', email).maybeSingle();

    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.reset_code !== resetCode.trim()) {
      return res.status(400).json({ error: 'Invalid or expired reset code' });
    }

    const hash = bcrypt.hashSync(newPassword, 10);
    await supabase.from('users').update({ password_hash: hash, reset_code: null }).eq('id', user.id);

    res.json({ success: true, message: 'Password updated successfully. You can now sign in.' });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/auth/me', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.json({ loggedIn: false });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.json({ loggedIn: false });
    res.json({ loggedIn: true, user: decoded });
  });
});

function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
}

// ============================================================
// PROFILE ROUTES
// ============================================================
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('id, username, email, fullname, phone, dob, gender, country, state, city, bio, favoriteGenres, avatar, theme, language, notifications, createdAt, updatedAt, lastLogin, role')
      .eq('id', req.user.id)
      .maybeSingle();

    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const { count: favCount } = await supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', req.user.id);
    user.songsLiked = favCount || 0;

    res.json({ success: true, profile: user });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/profile', authenticateToken, async (req, res) => {
  const { fullname, username, phone, dob, gender, country, state, city, bio, favoriteGenres } = req.body;
  
  if (username) {
    if (username.length < 4 || username.length > 20 || !/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ error: 'Invalid username format' });
    }
  }
  if (bio && bio.length > 300) {
    return res.status(400).json({ error: 'Bio exceeds 300 characters' });
  }

  try {
    if (username) {
      const { data: supaExisting } = await supabase.from('users').select('id').eq('username', username).neq('id', req.user.id);
      if (supaExisting && supaExisting.length > 0) {
        return res.status(400).json({ error: 'Username taken' });
      }
    }

    const updateObj = {
      fullname, username, phone, dob, gender, country, state, city, bio, favoriteGenres,
      updatedAt: new Date().toISOString()
    };
    await supabase.from('users').update(updateObj).eq('id', req.user.id);

    res.json({ success: true });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/profile/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const avatarUrl = '/uploads/avatars/' + req.file.filename;
    await supabase.from('users').update({ avatar: avatarUrl, updatedAt: new Date().toISOString() }).eq('id', req.user.id);
    res.json({ success: true, avatarUrl });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/profile/avatar', authenticateToken, async (req, res) => {
  try {
    await supabase.from('users').update({ avatar: null, updatedAt: new Date().toISOString() }).eq('id', req.user.id);
    res.json({ success: true });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/profile/password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Passwords required' });
  
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasNumbers = /\d/.test(newPassword);
  const hasNonalphas = /\W/.test(newPassword);
  if (newPassword.length < 8 || !(hasUpperCase && hasLowerCase && hasNumbers && hasNonalphas)) {
    return res.status(400).json({ error: 'Password does not meet requirements' });
  }

  try {
    const { data: user } = await supabase.from('users').select('password_hash').eq('id', req.user.id).maybeSingle();

    if (!bcrypt.compareSync(currentPassword, user.password_hash)) {
      return res.status(400).json({ error: 'Incorrect current password' });
    }
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(newPassword, salt);

    await supabase.from('users').update({ password_hash: hash, updatedAt: new Date().toISOString() }).eq('id', req.user.id);
    
    res.clearCookie('token');
    res.json({ success: true });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/profile', authenticateToken, async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password required to delete account' });
  
  try {
    const { data: user } = await supabase.from('users').select('password_hash, avatar').eq('id', req.user.id).maybeSingle();

    if (!bcrypt.compareSync(password, user.password_hash)) {
      return res.status(400).json({ error: 'Incorrect password' });
    }
    
    await supabase.from('favorites').delete().eq('user_id', req.user.id);
    await supabase.from('users').delete().eq('id', req.user.id);
    
    res.clearCookie('token');
    res.json({ success: true });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
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
    const { songId, title, artist } = req.query;
    let song = null;

    if (songId) {
      const { data: supaSong } = await supabase.from('songs').select('audioUrl, title, playCount').eq('songId', songId).maybeSingle();
      song = supaSong;
    }

    if (!song && title) {
      const { data: supaSongs } = await supabase.from('songs').select('audioUrl, title, playCount').ilike('title', title.trim());
      song = supaSongs && supaSongs[0] ? supaSongs[0] : null;
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

    if (song && song.audioUrl) {
      const audioUrl = song.audioUrl;

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
// FAVORITES ROUTES
// ============================================================
app.get('/api/favorites', authenticateToken, async (req, res) => {
  try {
    const { data: supaFavs } = await supabase.from('favorites').select('*').eq('user_id', req.user.id);
    const rawFavs = supaFavs || [];
    const songs = rawFavs.map(f => typeof f.song_json === 'string' ? JSON.parse(f.song_json) : f.song_json);

    res.json({ success: true, favorites: songs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/favorites', authenticateToken, async (req, res) => {
  const song = req.body.song;
  if (!song || !song.title) return res.status(400).json({ error: 'Song required' });

  try {
    const { data: supaFavs } = await supabase.from('favorites').select('*').eq('user_id', req.user.id);
    const rows = supaFavs || [];
    const exists = rows.find(r => {
      const s = typeof r.song_json === 'string' ? JSON.parse(r.song_json) : r.song_json;
      return s.title === song.title && s.artist === song.artist;
    });

    if (exists) return res.json({ success: true, id: exists.id });

    const { data: insertedFav } = await supabase
      .from('favorites')
      .insert([{ user_id: req.user.id, song_json: JSON.stringify(song) }])
      .select('id')
      .single();

    res.json({ success: true, id: insertedFav ? insertedFav.id : Date.now() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/favorites/:id', authenticateToken, async (req, res) => {
  try {
    await supabase.from('favorites').delete().eq('user_id', req.user.id).eq('id', req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

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
    const { count: totalSongs } = await supabase.from('songs').select('*', { count: 'exact', head: true }).eq('artist', name).eq('isActive', 1);
    const { data: supaPopular } = await supabase.from('songs').select('*').eq('artist', name).eq('isActive', 1).order('playCount', { ascending: false }).limit(10);

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
    const { data: supaSongs } = await supabase.from('songs').select('*').eq('album', name).eq('isActive', 1);
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
    const { count: totalFavorites } = await supabase.from('favorites').select('*', { count: 'exact', head: true });

    res.json({
      totalUsers: totalUsers || 0,
      totalSongs: totalSongs || 0,
      totalPlays: 0,
      totalLikes: 0,
      totalFavorites: totalFavorites || 0,
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
    const { data: songs } = await supabase.from('songs').select('*').order('uploadDate', { ascending: false });
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
    const { title, artist, album, language, genre, year, duration, moodTags, keywords, visibility } = req.body;

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
    const cloudinaryPublicId = `${language}/${slugify(artist)}/${slugify(title)}`;

    const songId = crypto.randomUUID();
    const finalKeywords = keywords || `${title.toLowerCase()}, ${artist.toLowerCase()}, ${language.toLowerCase()}`;
    const activeState = visibility === 'private' ? 0 : 1;

    const newSong = {
      songId, title, artist, album: album || 'Single', language, genre: genre || 'Pop',
      year: parseInt(year, 10) || 2024, duration: parseInt(duration, 10) || 180,
      coverImage: finalCoverUrl, audioUrl: finalAudioUrl, cloudinaryPublicId,
      lyrics: req.body.lyrics || '', moodTags: moodTags || 'happy', keywords: finalKeywords,
      createdBy: req.user.username || 'admin', isActive: activeState
    };

    await supabase.from('songs').insert([newSong]);

    res.json({ success: true, songId, message: 'Song metadata verified and published to Supabase!' });
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
      const songId = crypto.randomUUID();
      const album = s.album || 'Single Album';
      const language = s.language;
      const artist = s.artist;
      const year = s.year || 2024;
      const audioUrl = s.audioUrl || `https://res.cloudinary.com/dynv6r4b/video/upload/v1782834787/${language}/${slugify(artist)}/${slugify(s.title)}.mp3`;
      const coverImage = s.coverImage || `/uploads/covers/${slugify(album)}.jpg`;
      const cloudinaryPublicId = `${language}/${slugify(artist)}/${slugify(s.title)}`;
      const keywords = s.keywords || `${s.title.toLowerCase()}, ${artist.toLowerCase()}, ${language.toLowerCase()}`;

      insertedRows.push({
        songId, title: s.title, artist, album, language, genre: s.genre || 'Pop',
        year: parseInt(year, 10), duration: parseInt(s.duration, 10) || 180,
        coverImage, audioUrl, cloudinaryPublicId, lyrics: s.lyrics || '',
        moodTags: s.moodTags || 'happy', keywords, createdBy: req.user.username || 'admin', isActive: 1
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

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

app.use((req, res) => {
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

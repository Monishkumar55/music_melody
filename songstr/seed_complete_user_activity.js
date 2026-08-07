const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://amcicvpnpcllzbrrnckq.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtY2ljdnBucGNsbHpicnJuY2txIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MjYwNjIsImV4cCI6MjEwMDMwMjA2Mn0.npCcxMAf-tOVJh8Nv0GYO4j-vq-04koLOlavu5KJ-MY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function getValidUuid(inputStr) {
  if (!inputStr) return crypto.randomUUID();
  const str = String(inputStr);
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)) {
    return str;
  }
  const hash = crypto.createHash('md5').update(str).digest('hex');
  return `${hash.substring(0, 8)}-${hash.substring(8, 12)}-4${hash.substring(13, 16)}-8${hash.substring(17, 20)}-${hash.substring(20, 32)}`;
}

const SAMPLE_USERS = [
  { id: getValidUuid('user_monish'), email: 'monish@songstr.app', display_name: 'Monish Kumar', device: 'Chrome on Windows 11', platform: 'Windows', country: 'India', language: 'Tamil', timezone: 'Asia/Kolkata' },
  { id: getValidUuid('user_ananya'), email: 'ananya@songstr.app', display_name: 'Ananya Sharma', device: 'iPhone 15 Pro (iOS 17.5)', platform: 'iOS', country: 'India', language: 'Hindi', timezone: 'Asia/Kolkata' },
  { id: getValidUuid('user_rahul'), email: 'rahul@songstr.app', display_name: 'Rahul Reddy', device: 'Pixel 8 (Android 14)', platform: 'Android', country: 'India', language: 'Telugu', timezone: 'Asia/Kolkata' },
  { id: getValidUuid('user_sarah'), email: 'sarah@songstr.app', display_name: 'Sarah Jenkins', device: 'MacBook Pro (macOS Sonoma)', platform: 'macOS', country: 'United States', language: 'English', timezone: 'America/New_York' }
];

const SAMPLE_ACTIVITY_SONGS = [
  { song_id: 'song_101', title: 'Suthi Suthi', artist: 'Anirudh Ravichander', album: 'Tamil Hits', language: 'Tamil', mood: 'romantic' },
  { song_id: 'song_102', title: 'Un Vizhigalil', artist: 'Anirudh Ravichander', album: 'Darling', language: 'Tamil', mood: 'romantic' },
  { song_id: 'song_103', title: 'Thodu Vaanam', artist: 'Harris Jayaraj', album: 'Anegan', language: 'Tamil', mood: 'romantic' },
  { song_id: 'song_104', title: 'Unakaga', artist: 'A.R. Rahman', album: 'Bigil', language: 'Tamil', mood: 'romantic' },
  { song_id: 'song_105', title: 'Silu Siluvena Katru', artist: 'G.V. Prakash', album: 'Silu Silu', language: 'Tamil', mood: 'relaxed' },
  { song_id: 'song_107', title: 'Simtaangaran', artist: 'A.R. Rahman', album: 'Sarkar', language: 'Tamil', mood: 'energetic' },
  { song_id: 'song_108', title: 'Selfie Pulla', artist: 'Anirudh Ravichander & Vijay', album: 'Kaththi', language: 'Tamil', mood: 'happy' },
  { song_id: 'song_109', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', language: 'English', mood: 'happy' },
  { song_id: 'song_110', title: 'Shape of You', artist: 'Ed Sheeran', album: 'Divide', language: 'English', mood: 'happy' },
  { song_id: 'song_111', title: 'Kesariya', artist: 'Arijit Singh', album: 'Brahmastra', language: 'Hindi', mood: 'romantic' },
  { song_id: 'song_112', title: 'Samajavaragamana', artist: 'Sid Sriram', album: 'Ala Vaikunthapurramuloo', language: 'Telugu', mood: 'romantic' }
];

const SEARCH_KEYWORDS = [
  { keyword: 'Anirudh Ravichander', lang: 'Tamil' },
  { keyword: 'AR Rahman romantic melodies', lang: 'Tamil' },
  { keyword: 'Sid Sriram Telugu hits', lang: 'Telugu' },
  { keyword: 'Arijit Singh Hindi love songs', lang: 'Hindi' },
  { keyword: 'Top Billboard English Pop 2024', lang: 'English' },
  { keyword: 'Harris Jayaraj acoustic guitar', lang: 'Tamil' },
  { keyword: 'Workout motivation mass beats', lang: 'Tamil' },
  { keyword: 'Lofi sleep relaxing melodies', lang: 'English' }
];

const MOOD_DETECTIONS = [
  { mood: 'happy', detected: 'happy', confidence: 0.98, source: 'camera_face_analyzer', input: 'User smiling detected on camera' },
  { mood: 'romantic', detected: 'romantic', confidence: 0.96, source: 'voice_speech_analyzer', input: 'I feel like listening to sweet love duets' },
  { mood: 'energetic', detected: 'energetic', confidence: 0.94, source: 'text_input', input: 'Need high energy workout gym beats right now!' },
  { mood: 'relaxed', detected: 'relaxed', confidence: 0.95, source: 'text_input', input: 'Peaceful evening lofi rain tunes' },
  { mood: 'sad', detected: 'sad', confidence: 0.92, source: 'text_input', input: 'Painful emotional heartbreak songs' }
];

async function seedCompleteUserActivity() {
  console.log('🚀 Seeding complete user activity data across all Supabase tables...');

  // 1. Seed Users & Profiles with complete login metadata
  console.log('1. Updating users & profiles with login timestamps & device metadata...');
  for (const u of SAMPLE_USERS) {
    const loginTime = new Date(Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000)).toISOString();
    await supabase.from('users').upsert({
      id: u.id,
      email: u.email,
      display_name: u.display_name,
      provider: 'email',
      last_login: loginTime,
      device: u.device,
      platform: u.platform,
      country: u.country,
      language: u.language,
      timezone: u.timezone,
      preferred_language: u.language,
      app_version: '1.0.0',
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });

    await supabase.from('profiles').upsert({
      id: u.id,
      username: u.email.split('@')[0],
      email: u.email,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });
  }

  // 2. Seed Songs Metadata
  console.log('2. Ensuring songs metadata in Supabase...');
  for (const s of SAMPLE_ACTIVITY_SONGS) {
    const sUuid = getValidUuid(s.song_id);
    await supabase.from('songs').upsert({
      id: sUuid,
      song_id: s.song_id,
      title: s.title,
      artist: s.artist,
      movie: s.album,
      album: s.album,
      language: s.language,
      genre: 'Film Song',
      mood: s.mood,
      file_url: 'https://res.cloudinary.com/dynv6r4b/video/upload/v1782834787/Suthi-Suthi_u5i8ui.mp3',
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500',
      release_year: 2024,
      duration: 210,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });
  }

  // 3. Seed User Favorites & Favorite Songs
  console.log('3. Updating user favorites & favorite_songs across all users...');
  for (const u of SAMPLE_USERS) {
    const userSongs = SAMPLE_ACTIVITY_SONGS.slice(0, 4 + Math.floor(Math.random() * 4));
    for (const s of userSongs) {
      const sUuid = getValidUuid(s.song_id);
      const favTime = new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString();
      await supabase.from('favorite_songs').upsert({
        user_id: u.id,
        song_id: s.song_id,
        favorited_at: favTime
      }, { onConflict: 'user_id,song_id' });

      await supabase.from('favorites').upsert({
        id: crypto.randomUUID(),
        user_id: u.id,
        song_id: sUuid,
        created_at: favTime
      });
    }
  }

  // 4. Seed Recently Played & Listening History
  console.log('4. Updating recently_played & listening_history with exact timestamps, devices, networks & playback speeds...');
  for (const u of SAMPLE_USERS) {
    for (let i = 0; i < 8; i++) {
      const song = SAMPLE_ACTIVITY_SONGS[i % SAMPLE_ACTIVITY_SONGS.length];
      const sUuid = getValidUuid(song.song_id);
      const startTime = new Date(Date.now() - (i * 35 * 60 * 1000)).toISOString();
      const endTime = new Date(Date.now() - (i * 35 * 60 * 1000) + 210000).toISOString();

      await supabase.from('recently_played').insert({
        id: crypto.randomUUID(),
        user_id: u.id,
        song_id: song.song_id,
        played_at: startTime
      });

      await supabase.from('listening_history').insert({
        id: crypto.randomUUID(),
        user_id: u.id,
        song_id: song.song_id,
        started_at: startTime,
        completed_at: endTime,
        play_duration: 210,
        percentage_listened: 100.0,
        playback_speed: 1.0,
        repeat_mode: i % 2 === 0 ? 'off' : 'repeat_one',
        shuffle: i % 3 === 0,
        device: u.device,
        network: i % 2 === 0 ? 'WiFi High Speed' : '5G Cellular',
        language: song.language,
        mood: song.mood
      });
    }
  }

  // 5. Seed Search History
  console.log('5. Updating search_history with search keywords, devices, IP & country metadata...');
  for (const u of SAMPLE_USERS) {
    for (let i = 0; i < SEARCH_KEYWORDS.length; i++) {
      const sk = SEARCH_KEYWORDS[i];
      const searchTime = new Date(Date.now() - (i * 2 * 60 * 60 * 1000)).toISOString();
      await supabase.from('search_history').insert({
        id: crypto.randomUUID(),
        user_id: u.id,
        keyword: sk.keyword,
        search_text: sk.keyword,
        search_time: searchTime,
        result_count: 15,
        language: sk.lang,
        device: u.device,
        ip: '103.24.12.89',
        country: u.country
      });
    }
  }

  // 6. Seed User Mood Detections
  console.log('6. Updating user_moods with NLP, voice & face detection history...');
  for (const u of SAMPLE_USERS) {
    for (const md of MOOD_DETECTIONS) {
      const detTime = new Date(Date.now() - Math.floor(Math.random() * 48 * 60 * 60 * 1000)).toISOString();
      await supabase.from('user_moods').insert({
        id: crypto.randomUUID(),
        user_id: u.id,
        mood: md.mood,
        detected_mood: md.detected,
        confidence: md.confidence,
        source: md.source,
        recommended_song: SAMPLE_ACTIVITY_SONGS[0].title,
        recommended_playlist: 'AI Mood Melodies',
        timestamp: detTime
      });
    }
  }

  // 7. Seed Language Preferences
  console.log('7. Updating language_preferences with listen counts...');
  for (const u of SAMPLE_USERS) {
    const langs = ['Tamil', 'English', 'Telugu', 'Hindi'];
    for (let i = 0; i < langs.length; i++) {
      await supabase.from('language_preferences').upsert({
        user_id: u.id,
        language: langs[i],
        listen_count: 15 + (i * 8),
        last_listened: new Date().toISOString()
      }, { onConflict: 'user_id,language' });
    }
  }

  // 8. Seed Playback Sessions
  console.log('8. Updating playback_sessions with active session tokens...');
  for (const u of SAMPLE_USERS) {
    await supabase.from('playback_sessions').insert({
      id: crypto.randomUUID(),
      user_id: u.id,
      song_id: SAMPLE_ACTIVITY_SONGS[0].song_id,
      session_token: 'jwt_sess_' + crypto.randomBytes(8).toString('hex'),
      device: u.device,
      created_at: new Date().toISOString()
    });
  }

  // 9. Seed Notifications & User Preferences
  console.log('9. Updating notifications & user_preferences...');
  for (const u of SAMPLE_USERS) {
    await supabase.from('user_preferences').upsert({
      user_id: u.id,
      theme: 'dark',
      auto_play: true,
      quality: 'high',
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

    await supabase.from('notifications').insert({
      id: crypto.randomUUID(),
      user_id: u.id,
      title: 'New Recommendations Available',
      body: `Based on your recent ${u.language} listening activity!`,
      read: false,
      created_at: new Date().toISOString()
    });
  }

  // 10. Seed Comments & Ratings
  console.log('10. Updating comments & ratings...');
  for (let i = 0; i < SAMPLE_USERS.length; i++) {
    const u = SAMPLE_USERS[i];
    const s = SAMPLE_ACTIVITY_SONGS[i % SAMPLE_ACTIVITY_SONGS.length];
    await supabase.from('comments').insert({
      id: crypto.randomUUID(),
      user_id: u.id,
      song_id: s.song_id,
      comment_text: `Loved listening to ${s.title} by ${s.artist}! Best ${s.mood} track.`,
      created_at: new Date().toISOString()
    });

    await supabase.from('ratings').upsert({
      user_id: u.id,
      song_id: s.song_id,
      rating: 5.0,
      created_at: new Date().toISOString()
    }, { onConflict: 'user_id,song_id' });
  }

  console.log('🎉 Complete user activity data successfully populated across all Supabase tables!');
}

seedCompleteUserActivity().catch(err => {
  console.error('Seeding user activity error:', err);
});

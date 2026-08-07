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

const DEMO_USER_ID = getValidUuid('demo_user_123');
const ADMIN_USER_ID = getValidUuid('admin_user_123');

const INITIAL_SONGS = [
  { id: 'song_101', title: 'Suthi Suthi', artist: 'Anirudh Ravichander', album: 'Tamil Hits', language: 'Tamil', mood: 'romantic', url: 'https://res.cloudinary.com/dynv6r4b/video/upload/v1782834787/Suthi-Suthi_u5i8ui.mp3', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500' },
  { id: 'song_102', title: 'Un Vizhigalil', artist: 'Anirudh Ravichander', album: 'Darling', language: 'Tamil', mood: 'romantic', url: 'https://res.cloudinary.com/dynv6r4b/video/upload/v1782834785/Un-Vizhigalil_l3surn.mp3', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500' },
  { id: 'song_103', title: 'Thodu Vaanam', artist: 'Harris Jayaraj', album: 'Anegan', language: 'Tamil', mood: 'romantic', url: 'https://res.cloudinary.com/dynv6r4b/video/upload/v1782834785/Thodu-Vaanam_fhlgn3.mp3', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500' },
  { id: 'song_104', title: 'Unakaga', artist: 'A.R. Rahman', album: 'Bigil', language: 'Tamil', mood: 'romantic', url: 'https://res.cloudinary.com/dynv6r4b/video/upload/v1782834783/unakaga_bdpizo.mp3', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500' },
  { id: 'song_105', title: 'Silu Siluvena Katru', artist: 'G.V. Prakash', album: 'Silu Silu', language: 'Tamil', mood: 'relaxed', url: 'https://res.cloudinary.com/dynv6r4b/video/upload/v1782834775/Silu-Siluvena-Katru_cwjjgl.mp3', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500' },
  { id: 'song_106', title: 'Thangame', artist: 'Anirudh Ravichander', album: 'Naanum Rowdy Dhaan', language: 'Tamil', mood: 'romantic', url: 'https://res.cloudinary.com/dynv6r4b/video/upload/v1782834774/Thangame_ktqi0e.mp3', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500' },
  { id: 'song_107', title: 'Simtaangaran', artist: 'A.R. Rahman', album: 'Sarkar', language: 'Tamil', mood: 'energetic', url: 'https://res.cloudinary.com/dynv6r4b/video/upload/v1782834772/simtaangaran_dysuql.mp3', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500' },
  { id: 'song_108', title: 'Selfie Pulla', artist: 'Anirudh Ravichander & Vijay', album: 'Kaththi', language: 'Tamil', mood: 'happy', url: 'https://res.cloudinary.com/dynv6r4b/video/upload/v1782834768/selfie-pulla_hg2wbh.mp3', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500' },
  { id: 'song_109', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', language: 'English', mood: 'happy', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500' },
  { id: 'song_110', title: 'Shape of You', artist: 'Ed Sheeran', album: 'Divide', language: 'English', mood: 'happy', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500' },
  { id: 'song_111', title: 'Kesariya', artist: 'Arijit Singh', album: 'Brahmastra', language: 'Hindi', mood: 'romantic', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500' },
  { id: 'song_112', title: 'Samajavaragamana', artist: 'Sid Sriram', album: 'Ala Vaikunthapurramuloo', language: 'Telugu', mood: 'romantic', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500' }
];

async function runFullSeed() {
  console.log('🚀 Seeding full Supabase database...');

  // 1. Seed Users
  console.log('1. Seeding users...');
  const userRows = [
    { id: DEMO_USER_ID, email: 'user@songstr.app', display_name: 'Monish Kumar', provider: 'email', last_login: new Date().toISOString() },
    { id: ADMIN_USER_ID, email: 'admin@songstr.app', display_name: 'Songstr Admin', provider: 'email', last_login: new Date().toISOString() }
  ];
  for (const u of userRows) {
    await supabase.from('users').upsert(u, { onConflict: 'id' });
  }

  // 2. Seed Profiles
  console.log('2. Seeding profiles...');
  const profileRows = [
    { id: DEMO_USER_ID, username: 'monishkumar', email: 'user@songstr.app', updated_at: new Date().toISOString() },
    { id: ADMIN_USER_ID, username: 'admin', email: 'admin@songstr.app', updated_at: new Date().toISOString() }
  ];
  for (const p of profileRows) {
    await supabase.from('profiles').upsert(p, { onConflict: 'id' });
  }

  // 3. Seed Songs
  console.log('3. Seeding songs...');
  for (const s of INITIAL_SONGS) {
    const sUuid = getValidUuid(s.id);
    await supabase.from('songs').upsert({
      id: sUuid,
      song_id: s.id,
      title: s.title,
      artist: s.artist,
      movie: s.album,
      album: s.album,
      language: s.language,
      genre: 'Pop',
      mood: s.mood,
      file_url: s.url,
      image: s.image,
      release_year: 2024,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });
  }

  // 4. Seed Favorite Songs & Favorites
  console.log('4. Seeding favorites...');
  for (const s of INITIAL_SONGS.slice(0, 6)) {
    const sUuid = getValidUuid(s.id);
    await supabase.from('favorite_songs').upsert({
      user_id: DEMO_USER_ID,
      song_id: s.id,
      favorited_at: new Date().toISOString()
    }, { onConflict: 'user_id,song_id' });

    await supabase.from('favorites').upsert({
      id: crypto.randomUUID(),
      user_id: DEMO_USER_ID,
      song_id: sUuid,
      created_at: new Date().toISOString()
    });
  }

  // 5. Seed Playlists & Playlist Songs
  console.log('5. Seeding playlists...');
  const playlistId = getValidUuid('demo_playlist_1');
  await supabase.from('playlists').upsert({
    id: playlistId,
    user_id: DEMO_USER_ID,
    title: 'My Favorite Melodies',
    cover_image: INITIAL_SONGS[0].image,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }, { onConflict: 'id' });

  for (let i = 0; i < 4; i++) {
    const s = INITIAL_SONGS[i];
    await supabase.from('playlist_songs').insert({
      playlist_id: playlistId,
      song_id: s.id,
      position: i,
      added_at: new Date().toISOString()
    });
  }

  // 6. Seed User Moods
  console.log('6. Seeding user moods...');
  await supabase.from('user_moods').insert([
    { user_id: DEMO_USER_ID, mood: 'happy', detected_mood: 'happy', confidence: 0.98, source: 'text', timestamp: new Date().toISOString() },
    { user_id: DEMO_USER_ID, mood: 'romantic', detected_mood: 'romantic', confidence: 0.95, source: 'voice', timestamp: new Date().toISOString() }
  ]);

  // 7. Seed Recently Played & Listening History
  console.log('7. Seeding listening history...');
  for (const s of INITIAL_SONGS.slice(0, 5)) {
    await supabase.from('recently_played').insert({
      user_id: DEMO_USER_ID,
      song_id: s.id,
      played_at: new Date().toISOString()
    });

    await supabase.from('listening_history').insert({
      user_id: DEMO_USER_ID,
      song_id: s.id,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      play_duration: 180,
      language: s.language,
      mood: s.mood
    });
  }

  // 8. Seed Preferences & Settings
  console.log('8. Seeding user preferences & app settings...');
  await supabase.from('user_preferences').upsert({
    user_id: DEMO_USER_ID,
    theme: 'dark',
    auto_play: true,
    quality: 'high',
    updated_at: new Date().toISOString()
  }, { onConflict: 'user_id' });

  await supabase.from('app_settings').upsert({
    key: 'app_title',
    value: 'Songstr AI Mood Music',
    updated_at: new Date().toISOString()
  }, { onConflict: 'key' });

  // 9. Seed Comments & Ratings
  console.log('9. Seeding comments & ratings...');
  await supabase.from('comments').insert({
    user_id: DEMO_USER_ID,
    song_id: INITIAL_SONGS[0].id,
    comment_text: 'Amazing mood-based recommendation!',
    created_at: new Date().toISOString()
  });

  await supabase.from('ratings').upsert({
    user_id: DEMO_USER_ID,
    song_id: INITIAL_SONGS[0].id,
    rating: 5.0,
    created_at: new Date().toISOString()
  }, { onConflict: 'user_id,song_id' });

  console.log('✅ Full Supabase database seeding complete!');
}

runFullSeed().catch(err => {
  console.error('Seeding error:', err);
});

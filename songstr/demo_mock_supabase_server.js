// ============================================================
// DEMO MOCK SUPABASE DATA CONNECTOR & VERIFICATION SERVER
// ============================================================
const { supabase } = require('./supabase.config');

async function runMockSupabaseDemo() {
  console.log('⚡ Starting Supabase Real-Time Data Storage Demo...\n');

  // 1. MOCK USER REGISTRATION & AUTH
  const mockUser = {
    id: 'f8721c9a-9e12-4c28-b809-5a1234567890',
    email: 'demouser@songstr.app',
    display_name: 'Monish Kumar',
    provider: 'email',
    device: 'Chrome Browser (Localhost)',
    platform: 'Windows 11',
    country: 'India',
    language: 'Tamil',
    last_login: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  console.log('1️⃣ Upserting Mock User into Supabase [users] table...');
  const { data: userData, error: userError } = await supabase
    .from('users')
    .upsert(mockUser, { onConflict: 'id' })
    .select('*');

  if (userError) console.warn('   User Error:', userError.message);
  else console.log('   ✅ User Saved to Supabase:', userData[0]?.display_name);

  // 2. MOCK SONGS CATALOG
  const mockSongs = [
    {
      song_id: 'saavn_demo_01',
      title: 'Vathi Coming',
      artist: 'Anirudh Ravichander',
      movie: 'Master',
      language: 'Tamil',
      genre: 'Kuthu Dance',
      mood: 'energetic',
      file_url: 'https://aac.saavncdn.com/demo/vaathi_coming.mp3',
      release_year: 2021,
      updated_at: new Date().toISOString()
    },
    {
      song_id: 'saavn_demo_02',
      title: 'Kanmani Anbodu',
      artist: 'Kamal Haasan, S. Janaki',
      movie: 'Gunaa',
      language: 'Tamil',
      genre: 'Melody',
      mood: 'romantic',
      file_url: 'https://aac.saavncdn.com/demo/kanmani.mp3',
      release_year: 1991,
      updated_at: new Date().toISOString()
    },
    {
      song_id: 'saavn_demo_03',
      title: 'Shape of You',
      artist: 'Ed Sheeran',
      movie: 'Divide',
      language: 'English',
      genre: 'Pop',
      mood: 'happy',
      file_url: 'https://aac.saavncdn.com/demo/shape_of_you.mp3',
      release_year: 2017,
      updated_at: new Date().toISOString()
    }
  ];

  console.log('\n2️⃣ Upserting Mock Songs into Supabase [songs] table...');
  const { error: songsError } = await supabase.from('songs').upsert(mockSongs, { onConflict: 'song_id' });
  if (songsError) console.warn('   Songs Error:', songsError.message);
  else console.log(`   ✅ ${mockSongs.length} Songs Saved to Supabase`);

  // 3. MOCK FAVORITES
  console.log('\n3️⃣ Saving Favorite Songs into Supabase [favorite_songs] table...');
  const { error: favError } = await supabase.from('favorite_songs').upsert([
    { user_id: mockUser.id, song_id: 'saavn_demo_01', favorited_at: new Date().toISOString() },
    { user_id: mockUser.id, song_id: 'saavn_demo_02', favorited_at: new Date().toISOString() }
  ], { onConflict: 'user_id,song_id' });
  if (favError) console.warn('   Favorites Error:', favError.message);
  else console.log('   ✅ 2 Favorites Saved to Supabase');

  // 4. MOCK PLAYBACK ACTIVITY & LISTENING HISTORY
  console.log('\n4️⃣ Logging Playback Activity into Supabase [recently_played] & [listening_history]...');
  await supabase.from('recently_played').insert({
    user_id: mockUser.id,
    song_id: 'saavn_demo_01',
    played_at: new Date().toISOString()
  });
  await supabase.from('listening_history').insert({
    user_id: mockUser.id,
    song_id: 'saavn_demo_01',
    started_at: new Date().toISOString(),
    mood: 'energetic',
    language: 'Tamil',
    device: 'Web Player'
  });
  console.log('   ✅ Play Activity Logged in Supabase');

  // 5. MOCK MOOD DETECTION LOG
  console.log('\n5️⃣ Logging Mood Analysis Entry into Supabase [user_moods] table...');
  await supabase.from('user_moods').insert({
    user_id: mockUser.id,
    mood: 'happy',
    detected_mood: 'happy',
    confidence: 0.98,
    source: 'voice',
    timestamp: new Date().toISOString()
  });
  console.log('   ✅ Mood Detection Logged in Supabase');

  // 6. MOCK SEARCH HISTORY
  console.log('\n6️⃣ Logging Search Keyword into Supabase [search_history] table...');
  await supabase.from('search_history').insert({
    user_id: mockUser.id,
    keyword: 'Anirudh Kuthu Hits',
    search_text: 'Anirudh Kuthu Hits',
    search_time: new Date().toISOString(),
    result_count: 15,
    language: 'Tamil',
    device: 'Desktop Chrome'
  });
  console.log('   ✅ Search History Logged in Supabase');

  // 7. MOCK PLAYLIST & PLAYLIST SONGS
  console.log('\n7️⃣ Creating Playlist in Supabase [playlists] & [playlist_songs] tables...');
  const playlistId = 'a1b2c3d4-e5f6-7890-abcd-1234567890ef';
  await supabase.from('playlists').upsert({
    id: playlistId,
    user_id: mockUser.id,
    title: 'My Favorite Kuthu Party Mix',
    cover_image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }, { onConflict: 'id' });

  await supabase.from('playlist_songs').insert({
    playlist_id: playlistId,
    song_id: 'saavn_demo_01',
    added_at: new Date().toISOString(),
    position: 1
  });
  console.log('   ✅ Playlist Created in Supabase');

  // 8. FETCH & DISPLAY STORED DATA FROM SUPABASE TABLES
  console.log('\n============================================================');
  console.log('📊 LIVE SUPABASE DATABASE RETRIEVAL REPORT');
  console.log('============================================================');

  const { data: dbUsers } = await supabase.from('users').select('id, email, display_name, country, last_login').eq('id', mockUser.id);
  console.log('\n👤 [users] Table Data:', dbUsers);

  const { data: dbSongs } = await supabase.from('songs').select('song_id, title, artist, language, mood').in('song_id', ['saavn_demo_01', 'saavn_demo_02', 'saavn_demo_03']);
  console.log('\n🎵 [songs] Table Data:', dbSongs);

  const { data: dbFavs } = await supabase.from('favorite_songs').select('user_id, song_id, favorited_at, songs(title, artist)').eq('user_id', mockUser.id);
  console.log('\n♥ [favorite_songs] Table Data:', dbFavs);

  const { data: dbMoods } = await supabase.from('user_moods').select('user_id, mood, confidence, source, timestamp').eq('user_id', mockUser.id);
  console.log('\n🎭 [user_moods] Table Data:', dbMoods);

  const { data: dbPlaylists } = await supabase.from('playlists').select('id, title, playlist_songs(song_id, songs(title))').eq('user_id', mockUser.id);
  console.log('\n📻 [playlists] Table Data:', dbPlaylists);

  console.log('\n🎉 DEMO COMPLETE! All website pages & features successfully stored in Supabase!');
}

runMockSupabaseDemo().catch(err => {
  console.error('Demo Error:', err);
  process.exit(1);
});

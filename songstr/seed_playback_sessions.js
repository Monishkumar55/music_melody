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

async function seedPlaybackSessions() {
  console.log('🚀 Seeding playback_sessions table in Supabase...');

  const sampleSessions = [
    {
      id: crypto.randomUUID(),
      user_id: DEMO_USER_ID,
      song_id: 'song_101',
      session_token: 'sess_' + crypto.randomBytes(8).toString('hex'),
      device: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/127.0',
      created_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      user_id: DEMO_USER_ID,
      song_id: 'song_102',
      session_token: 'sess_' + crypto.randomBytes(8).toString('hex'),
      device: 'Songstr Flutter Android Mobile App v1.0.0',
      created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString()
    },
    {
      id: crypto.randomUUID(),
      user_id: DEMO_USER_ID,
      song_id: 'song_106',
      session_token: 'sess_' + crypto.randomBytes(8).toString('hex'),
      device: 'Songstr iOS Swift App v1.0.0',
      created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString()
    }
  ];

  for (const s of sampleSessions) {
    await supabase.from('playback_sessions').insert(s);
  }

  console.log(`✅ Seeded ${sampleSessions.length} rows into playback_sessions.`);
}

seedPlaybackSessions().catch(err => {
  console.error('Seeding error:', err);
});

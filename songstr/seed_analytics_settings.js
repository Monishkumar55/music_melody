const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://amcicvpnpcllzbrrnckq.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtY2ljdnBucGNsbHpicnJuY2txIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MjYwNjIsImV4cCI6MjEwMDMwMjA2Mn0.npCcxMAf-tOVJh8Nv0GYO4j-vq-04koLOlavu5KJ-MY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function seedAnalyticsAndSettings() {
  console.log('🚀 Seeding app_settings and analytics tables in Supabase...');

  // 1. Seed app_settings
  const settingsRows = [
    { key: 'app_name', value: 'Songstr AI Mood Music', updated_at: new Date().toISOString() },
    { key: 'app_version', value: '1.0.0', updated_at: new Date().toISOString() },
    { key: 'default_language', value: 'Tamil', updated_at: new Date().toISOString() },
    { key: 'default_theme', value: 'dark', updated_at: new Date().toISOString() },
    { key: 'streaming_quality', value: 'high', updated_at: new Date().toISOString() },
    { key: 'max_cache_mb', value: '500', updated_at: new Date().toISOString() },
    { key: 'ai_mood_detection_enabled', value: 'true', updated_at: new Date().toISOString() },
    { key: 'maintenance_mode', value: 'false', updated_at: new Date().toISOString() },
    { key: 'cors_allow_origin', value: '*', updated_at: new Date().toISOString() }
  ];

  for (const s of settingsRows) {
    await supabase.from('app_settings').upsert(s, { onConflict: 'key' });
  }
  console.log(`✅ Seeded ${settingsRows.length} rows into app_settings.`);

  // 2. Seed analytics
  const analyticsRows = [
    { id: crypto.randomUUID(), metric_name: 'total_user_registrations', metric_value: 125, metadata: { provider: 'email', platform: 'web' }, timestamp: new Date().toISOString() },
    { id: crypto.randomUUID(), metric_name: 'total_song_plays', metric_value: 3420, metadata: { top_language: 'Tamil', top_mood: 'romantic' }, timestamp: new Date().toISOString() },
    { id: crypto.randomUUID(), metric_name: 'daily_active_users', metric_value: 48, metadata: { date: new Date().toISOString().split('T')[0] }, timestamp: new Date().toISOString() },
    { id: crypto.randomUUID(), metric_name: 'monthly_active_users', metric_value: 310, metadata: { month: 'August 2026' }, timestamp: new Date().toISOString() },
    { id: crypto.randomUUID(), metric_name: 'mood_detections_count', metric_value: 890, metadata: { highest_mood: 'happy' }, timestamp: new Date().toISOString() },
    { id: crypto.randomUUID(), metric_name: 'total_favorites_saved', metric_value: 650, metadata: { average_per_user: 5.2 }, timestamp: new Date().toISOString() },
    { id: crypto.randomUUID(), metric_name: 'search_queries_count', metric_value: 1420, metadata: { top_artist: 'Anirudh Ravichander' }, timestamp: new Date().toISOString() }
  ];

  for (const a of analyticsRows) {
    await supabase.from('analytics').insert(a);
  }
  console.log(`✅ Seeded ${analyticsRows.length} rows into analytics.`);
  console.log('🎉 Seeding completed for app_settings and analytics!');
}

seedAnalyticsAndSettings().catch(err => {
  console.error('Seeding error:', err);
});

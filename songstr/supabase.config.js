// ============================================================
// SUPABASE DIRECT DATABASE CONFIGURATION & API KEYS
// ============================================================
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://amcicvpnpcllzbrrnckq.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtY2ljdnBucGNsbHpicnJuY2txIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MjYwNjIsImV4cCI6MjEwMDMwMjA2Mn0.npCcxMAf-tOVJh8Nv0GYO4j-vq-04koLOlavu5KJ-MY';
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_2TngIH1K_t8PftKJrDGxPA_ZMjHpwhA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

module.exports = {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_PUBLISHABLE_KEY,
  supabase
};

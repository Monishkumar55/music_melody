import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL || 'https://amcicvpnpcllzbrrnckq.supabase.co';
export const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY || process.env.SUPABASE_KEY || 'sb_publishable_2TngIH1K_t8PftKJrDGxPA_ZMjHpwhA';
export const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtY2ljdnBucGNsbHpicnJuY2txIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MjYwNjIsImV4cCI6MjEwMDMwMjA2Mn0.npCcxMAf-tOVJh8Nv0GYO4j-vq-04koLOlavu5KJ-MY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;

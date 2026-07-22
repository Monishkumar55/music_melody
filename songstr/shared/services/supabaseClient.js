import { createClient } from '@supabase/supabase-js';

// In a real app, these should come from environment variables.
// For Web: process.env.REACT_APP_SUPABASE_URL
// For Expo: process.env.EXPO_PUBLIC_SUPABASE_URL
// Replace 'YOUR_SUPABASE_URL' and 'YOUR_SUPABASE_ANON_KEY' with actual credentials.

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

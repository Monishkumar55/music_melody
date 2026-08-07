-- ====================================================================
-- SUPABASE ROW LEVEL SECURITY (RLS) & FULL ACCESS SETUP
-- Run this script in your Supabase Dashboard SQL Editor:
-- https://supabase.com/dashboard/project/amcicvpnpcllzbrrnckq/sql/new
-- ====================================================================

-- 1. DISABLE RLS ON ALL TABLES SO YOUR LOCALHOST APP CAN STORE DATA INSTANTLY:
alter table if exists public.profiles disable row level security;
alter table if exists public.users disable row level security;
alter table if exists public.songs disable row level security;
alter table if exists public.playlists disable row level security;
alter table if exists public.playlist_songs disable row level security;
alter table if exists public.favorites disable row level security;
alter table if exists public.favorite_songs disable row level security;
alter table if exists public.user_moods disable row level security;
alter table if exists public.recently_played disable row level security;
alter table if exists public.listening_history disable row level security;
alter table if exists public.search_history disable row level security;
alter table if exists public.user_preferences disable row level security;
alter table if exists public.language_preferences disable row level security;
alter table if exists public.notifications disable row level security;
alter table if exists public.playback_sessions disable row level security;

-- 2. CREATE PUBLIC ACCESS POLICIES FOR ALL TABLES (SAFETY FALLBACK):
do $$
begin
  execute 'create policy "Public Access Profiles" on public.profiles for all using (true) with check (true)';
exception when others then null;
end $$;

do $$
begin
  execute 'create policy "Public Access Playlists" on public.playlists for all using (true) with check (true)';
exception when others then null;
end $$;

do $$
begin
  execute 'create policy "Public Access Favorites" on public.favorites for all using (true) with check (true)';
exception when others then null;
end $$;

do $$
begin
  execute 'create policy "Public Access User Moods" on public.user_moods for all using (true) with check (true)';
exception when others then null;
end $$;

do $$
begin
  execute 'create policy "Public Access Songs" on public.songs for all using (true) with check (true)';
exception when others then null;
end $$;

-- 3. ENSURE SONGS ID CAN ACCEPT STRING/UUID AND ADD SONG_ID COLUMN IF NEEDED
do $$ 
begin
  if not exists (select 1 from information_schema.columns where table_name='songs' and column_name='song_id') then
    alter table public.songs add column song_id text;
  end if;
end $$;

-- 4. UNLOCK FOREIGN KEY CONSTRAINTS FOR UNRESTRICTED DIRECT INSERTS:
alter table if exists public.profiles drop constraint if exists profiles_id_fkey;
alter table if exists public.playlists drop constraint if exists playlists_user_id_fkey;
alter table if exists public.favorites drop constraint if exists favorites_user_id_fkey;
alter table if exists public.favorite_songs drop constraint if exists favorite_songs_user_id_fkey;
alter table if exists public.recently_played drop constraint if exists recently_played_user_id_fkey;
alter table if exists public.listening_history drop constraint if exists listening_history_user_id_fkey;
alter table if exists public.search_history drop constraint if exists search_history_user_id_fkey;
alter table if exists public.user_moods drop constraint if exists user_moods_user_id_fkey;

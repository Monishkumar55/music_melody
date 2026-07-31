-- Songstr Supabase SQL Database Schema
-- Run this in your Supabase SQL Editor to set up all tables, foreign keys, indexes, and Row Level Security (RLS) policies.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. USERS TABLE
-- ============================================================
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  display_name text,
  profile_image text,
  password_hash text,
  provider text default 'email',
  created_at timestamptz default now(),
  last_login timestamptz default now(),
  device text,
  platform text,
  country text,
  language text,
  timezone text,
  preferred_language text,
  app_version text,
  updated_at timestamptz default now()
);

-- ============================================================
-- 2. SONGS TABLE
-- ============================================================
create table if not exists public.songs (
  song_id text primary key,
  title text not null,
  album text,
  artist text,
  album_id text,
  artist_id text,
  label text,
  duration integer,
  image text,
  language text,
  genre text,
  mood text,
  file_url text,
  release_year integer,
  explicit boolean default false,
  copyright text,
  lyrics_available boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 3. FAVORITE_SONGS TABLE
-- ============================================================
create table if not exists public.favorite_songs (
  user_id uuid references public.users(id) on delete cascade,
  song_id text references public.songs(song_id) on delete cascade,
  favorited_at timestamptz default now(),
  primary key (user_id, song_id)
);

-- ============================================================
-- 4. RECENTLY_PLAYED TABLE
-- ============================================================
create table if not exists public.recently_played (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  song_id text references public.songs(song_id) on delete cascade,
  played_at timestamptz default now()
);

-- ============================================================
-- 5. LISTENING_HISTORY TABLE
-- ============================================================
create table if not exists public.listening_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  song_id text references public.songs(song_id) on delete cascade,
  started_at timestamptz default now(),
  completed_at timestamptz,
  play_duration integer default 0,
  percentage_listened numeric default 0.0,
  playback_speed numeric default 1.0,
  repeat_mode text default 'off',
  shuffle boolean default false,
  device text,
  network text,
  language text,
  mood text
);

-- ============================================================
-- 6. PLAYLISTS TABLE
-- ============================================================
create table if not exists public.playlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  title text not null,
  cover_image text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 7. PLAYLIST_SONGS TABLE
-- ============================================================
create table if not exists public.playlist_songs (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid references public.playlists(id) on delete cascade,
  song_id text references public.songs(song_id) on delete cascade,
  added_at timestamptz default now(),
  position integer default 0
);

-- ============================================================
-- 8. SEARCH_HISTORY TABLE
-- ============================================================
create table if not exists public.search_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  keyword text not null,
  search_text text,
  search_time timestamptz default now(),
  result_count integer default 0,
  language text,
  device text,
  ip text,
  country text
);

-- ============================================================
-- 9. USER_MOODS TABLE
-- ============================================================
create table if not exists public.user_moods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  mood text not null,
  detected_mood text,
  confidence numeric default 1.0,
  source text default 'manual',
  recommended_song text,
  recommended_playlist text,
  timestamp timestamptz default now()
);

-- ============================================================
-- 10. LANGUAGE_PREFERENCES TABLE
-- ============================================================
create table if not exists public.language_preferences (
  user_id uuid references public.users(id) on delete cascade,
  language text not null,
  listen_count integer default 1,
  last_listened timestamptz default now(),
  primary key (user_id, language)
);

-- ============================================================
-- 11. USER_PREFERENCES TABLE
-- ============================================================
create table if not exists public.user_preferences (
  user_id uuid primary key references public.users(id) on delete cascade,
  theme text default 'dark',
  auto_play boolean default true,
  quality text default 'high',
  updated_at timestamptz default now()
);

-- ============================================================
-- 12. PLAYBACK_SESSIONS TABLE
-- ============================================================
create table if not exists public.playback_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  song_id text references public.songs(song_id) on delete cascade,
  session_token text,
  device text,
  created_at timestamptz default now()
);

-- ============================================================
-- 13. ANALYTICS TABLE
-- ============================================================
create table if not exists public.analytics (
  id uuid primary key default gen_random_uuid(),
  metric_name text not null,
  metric_value numeric default 0.0,
  metadata jsonb,
  timestamp timestamptz default now()
);

-- ============================================================
-- 14. NOTIFICATIONS TABLE
-- ============================================================
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  title text not null,
  body text,
  read boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- 15. APP_SETTINGS TABLE
-- ============================================================
create table if not exists public.app_settings (
  key text primary key,
  value text,
  updated_at timestamptz default now()
);

-- ============================================================
-- AUTO-UPDATE TIMESTAMPS
-- ============================================================
create or replace function update_modified_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_users_modtime before update on public.users for each row execute procedure update_modified_column();
create trigger update_songs_modtime before update on public.songs for each row execute procedure update_modified_column();
create trigger update_playlists_modtime before update on public.playlists for each row execute procedure update_modified_column();
create trigger update_user_preferences_modtime before update on public.user_preferences for each row execute procedure update_modified_column();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
alter table public.users enable row level security;
alter table public.favorite_songs enable row level security;
alter table public.recently_played enable row level security;
alter table public.listening_history enable row level security;
alter table public.playlists enable row level security;
alter table public.playlist_songs enable row level security;
alter table public.search_history enable row level security;
alter table public.user_moods enable row level security;
alter table public.language_preferences enable row level security;
alter table public.user_preferences enable row level security;
alter table public.playback_sessions enable row level security;
alter table public.notifications enable row level security;

-- Policies
create policy "Users can view and edit their own user profile" 
  on public.users for all using (auth.uid() = id);

create policy "Users can view and edit their own favorites" 
  on public.favorite_songs for all using (auth.uid() = user_id);

create policy "Users can view and edit their own recently played" 
  on public.recently_played for all using (auth.uid() = user_id);

create policy "Users can view and edit their own listening history" 
  on public.listening_history for all using (auth.uid() = user_id);

create policy "Users can view and edit their own playlists" 
  on public.playlists for all using (auth.uid() = user_id);

create policy "Users can view and edit their own playlist songs" 
  on public.playlist_songs for all using (
    exists (
      select 1 from public.playlists 
      where public.playlists.id = playlist_songs.playlist_id 
      and public.playlists.user_id = auth.uid()
    )
  );

create policy "Users can view and edit their own search history" 
  on public.search_history for all using (auth.uid() = user_id);

create policy "Users can view and edit their own moods" 
  on public.user_moods for all using (auth.uid() = user_id);

create policy "Users can view and edit their own language preferences" 
  on public.language_preferences for all using (auth.uid() = user_id);

create policy "Users can view and edit their own user preferences" 
  on public.user_preferences for all using (auth.uid() = user_id);

create policy "Users can view and edit their own playback sessions" 
  on public.playback_sessions for all using (auth.uid() = user_id);

create policy "Users can view and edit their own notifications" 
  on public.notifications for all using (auth.uid() = user_id);

-- ============================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================
create index if not exists idx_favorite_songs_user_id on public.favorite_songs(user_id);
create index if not exists idx_recently_played_user_id on public.recently_played(user_id);
create index if not exists idx_listening_history_user_id on public.listening_history(user_id);
create index if not exists idx_playlists_user_id on public.playlists(user_id);
create index if not exists idx_playlist_songs_playlist_id on public.playlist_songs(playlist_id);
create index if not exists idx_search_history_user_id on public.search_history(user_id);
create index if not exists idx_user_moods_user_id on public.user_moods(user_id);
create index if not exists idx_language_preferences_user_id on public.language_preferences(user_id);

-- ==========================================================================================

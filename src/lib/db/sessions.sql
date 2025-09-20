-- Emotion sessions (chat or diary) and RLS

create table if not exists public.emotion_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null check (source in ('chat','diary')),
  pre_emotion text,
  pre_intensity int check (pre_intensity between 1 and 5),
  post_emotion text,
  post_intensity int check (post_intensity between 1 and 5),
  summary text,
  content text,
  created_at timestamptz not null default now()
);

alter table public.emotion_sessions enable row level security;

drop policy if exists "emotion_sessions_select_own" on public.emotion_sessions;
create policy "emotion_sessions_select_own"
  on public.emotion_sessions for select using (auth.uid() = user_id);

drop policy if exists "emotion_sessions_insert_own" on public.emotion_sessions;
create policy "emotion_sessions_insert_own"
  on public.emotion_sessions for insert with check (auth.uid() = user_id);

drop policy if exists "emotion_sessions_update_own" on public.emotion_sessions;
create policy "emotion_sessions_update_own"
  on public.emotion_sessions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists emotion_sessions_user_created_idx on public.emotion_sessions (user_id, created_at desc);



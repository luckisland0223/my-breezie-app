-- Supabase SQL suggestions (run in SQL Editor)

create table if not exists public.mood_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mood int not null check (mood between 1 and 5),
  energy int not null check (energy between 1 and 5),
  tags text[] default '{}',
  note text,
  created_at timestamptz not null default now()
);

alter table public.mood_logs enable row level security;
create policy "Users can CRUD own mood logs" on public.mood_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);



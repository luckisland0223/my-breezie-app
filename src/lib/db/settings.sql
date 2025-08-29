-- Supabase SQL suggestions for settings table and RLS

create table if not exists public.settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  share_with_model boolean not null default true,
  reminders_enabled boolean not null default false,
  reminder_times text[] default '{}',
  updated_at timestamptz not null default now()
);

alter table public.settings enable row level security;
create policy "Users manage own settings" on public.settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);



-- Enable Row Level Security (RLS) and add owner-based policies for Breezie tables
-- NOTE:
-- - Policies use auth.uid() (Supabase Auth). When you access via Supabase client/HTTP, this enforces per-user access.
-- - Calls made with the service role or a superuser bypass RLS by design.

-- USERS ----------------------------------------------------------------------
alter table if exists public.users enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='users' and policyname='users_select_own'
  ) then
    create policy users_select_own on public.users
      for select using ( id = auth.uid()::text );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='users' and policyname='users_update_own'
  ) then
    create policy users_update_own on public.users
      for update using ( id = auth.uid()::text ) with check ( id = auth.uid()::text );
  end if;
end $$;

-- EMOTION RECORDS ------------------------------------------------------------
alter table if exists public.emotion_records enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='emotion_records' and policyname='emotion_records_select_own'
  ) then
    create policy emotion_records_select_own on public.emotion_records
      for select using ( user_id = auth.uid()::text );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='emotion_records' and policyname='emotion_records_insert_own'
  ) then
    create policy emotion_records_insert_own on public.emotion_records
      for insert with check ( user_id = auth.uid()::text );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='emotion_records' and policyname='emotion_records_update_own'
  ) then
    create policy emotion_records_update_own on public.emotion_records
      for update using ( user_id = auth.uid()::text ) with check ( user_id = auth.uid()::text );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='emotion_records' and policyname='emotion_records_delete_own'
  ) then
    create policy emotion_records_delete_own on public.emotion_records
      for delete using ( user_id = auth.uid()::text );
  end if;
end $$;

-- CHAT SESSIONS --------------------------------------------------------------
alter table if exists public.chat_sessions enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='chat_sessions' and policyname='chat_sessions_select_own'
  ) then
    create policy chat_sessions_select_own on public.chat_sessions
      for select using ( user_id = auth.uid()::text );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='chat_sessions' and policyname='chat_sessions_insert_own'
  ) then
    create policy chat_sessions_insert_own on public.chat_sessions
      for insert with check ( user_id = auth.uid()::text );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='chat_sessions' and policyname='chat_sessions_update_own'
  ) then
    create policy chat_sessions_update_own on public.chat_sessions
      for update using ( user_id = auth.uid()::text ) with check ( user_id = auth.uid()::text );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='chat_sessions' and policyname='chat_sessions_delete_own'
  ) then
    create policy chat_sessions_delete_own on public.chat_sessions
      for delete using ( user_id = auth.uid()::text );
  end if;
end $$;

-- CHAT MESSAGES --------------------------------------------------------------
alter table if exists public.chat_messages enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='chat_messages' and policyname='chat_messages_select_via_session'
  ) then
    create policy chat_messages_select_via_session on public.chat_messages
      for select using (
        exists (
          select 1 from public.chat_sessions s
          where s.id = chat_messages.session_id and s.user_id = auth.uid()::text
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='chat_messages' and policyname='chat_messages_insert_via_session'
  ) then
    create policy chat_messages_insert_via_session on public.chat_messages
      for insert with check (
        exists (
          select 1 from public.chat_sessions s
          where s.id = chat_messages.session_id and s.user_id = auth.uid()::text
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='chat_messages' and policyname='chat_messages_update_via_session'
  ) then
    create policy chat_messages_update_via_session on public.chat_messages
      for update using (
        exists (
          select 1 from public.chat_sessions s
          where s.id = chat_messages.session_id and s.user_id = auth.uid()::text
        )
      ) with check (
        exists (
          select 1 from public.chat_sessions s
          where s.id = chat_messages.session_id and s.user_id = auth.uid()::text
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='chat_messages' and policyname='chat_messages_delete_via_session'
  ) then
    create policy chat_messages_delete_via_session on public.chat_messages
      for delete using (
        exists (
          select 1 from public.chat_sessions s
          where s.id = chat_messages.session_id and s.user_id = auth.uid()::text
        )
      );
  end if;
end $$;

-- OPTIONAL: allow service role to bypass RLS explicitly via role (PostgREST)
-- In Supabase, the `service_role` already bypasses RLS. No extra policy needed.


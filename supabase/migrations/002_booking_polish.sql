-- Chaptr booking / matching polish
-- Run in Supabase SQL Editor after 001_initial.sql (safe to re-run).
--
-- IMPORTANT — auth profile trigger:
-- The `on_auth_user_created` trigger from 001_initial.sql was INTENTIONALLY REMOVED
-- in production because it caused "Database error saving new user" on signup.
-- Profiles are created client-side (AuthContext upsert + ensureOwnProfile before
-- inserting tutoring_requests). Do NOT re-add that trigger unless search_path,
-- grants, and error handling are carefully verified.

-- Ensure the broken signup trigger stays off
drop trigger if exists on_auth_user_created on auth.users;

-- Realtime so student matching / tutor pending can subscribe (polling still works without this)
do $$
begin
  alter publication supabase_realtime add table public.tutoring_requests;
exception
  when duplicate_object then null;
  when undefined_object then
    raise notice 'supabase_realtime publication missing — skip (polling still works)';
  when others then
    raise notice 'Could not add tutoring_requests to realtime: %', sqlerrm;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.sessions;
exception
  when duplicate_object then null;
  when undefined_object then null;
  when others then
    raise notice 'Could not add sessions to realtime: %', sqlerrm;
end $$;

-- Decline helper (optional; app can also UPDATE status via RLS)
create or replace function public.decline_tutoring_request(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'tutor'
  ) then
    raise exception 'Only tutors can decline requests';
  end if;

  update public.tutoring_requests
  set status = 'declined'
  where id = p_request_id
    and status = 'pending';

  if not found then
    raise exception 'Request is not pending';
  end if;
end;
$$;

grant execute on function public.decline_tutoring_request(uuid) to authenticated;

-- Make sure accept RPC remains executable
grant execute on function public.accept_tutoring_request(uuid) to authenticated;

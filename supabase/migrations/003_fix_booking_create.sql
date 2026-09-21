-- Chaptr: fix booking create + tutor pending visibility
-- Run in Supabase SQL Editor AFTER 001_initial.sql and 002_booking_polish.sql (safe to re-run).
--
-- Fixes:
-- 1) expires_at default was 3 minutes — pending rows vanish from tutor queries almost immediately.
-- 2) RLS on profiles / tutoring_requests can fail when the auth profile trigger is gone and
--    the client upsert is blocked — "I've paid" never creates a request.
-- 3) Tutors without a profiles row see an empty pending list (SELECT policy requires role=tutor).

-- ---------------------------------------------------------------------------
-- Longer request window (2 hours)
-- ---------------------------------------------------------------------------
alter table public.tutoring_requests
  alter column expires_at set default (now() + interval '2 hours');

update public.tutoring_requests
set expires_at = created_at + interval '2 hours'
where status = 'pending'
  and expires_at < now() + interval '1 hour';

-- ---------------------------------------------------------------------------
-- ensure_my_profile: security definer upsert for the signed-in user
-- ---------------------------------------------------------------------------
create or replace function public.ensure_my_profile(
  p_role text,
  p_name text,
  p_phone text default null
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  r text;
  n text;
  p text;
  row public.profiles%rowtype;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  r := coalesce(nullif(trim(p_role), ''), 'student');
  if r not in ('student', 'tutor') then
    r := 'student';
  end if;

  n := coalesce(nullif(trim(p_name), ''), 'User');
  p := nullif(trim(p_phone), '');

  insert into public.profiles (id, role, name, phone)
  values (uid, r, n, p)
  on conflict (id) do update
    set role = excluded.role,
        name = case
          when nullif(trim(excluded.name), '') is null then public.profiles.name
          when excluded.name in ('User', 'Student') and public.profiles.name is not null
            then public.profiles.name
          else excluded.name
        end,
        phone = coalesce(excluded.phone, public.profiles.phone),
        updated_at = now();

  select * into row from public.profiles where id = uid;
  return row;
end;
$$;

grant execute on function public.ensure_my_profile(text, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- create_my_tutoring_request: upsert student profile + insert request
-- ---------------------------------------------------------------------------
create or replace function public.create_my_tutoring_request(
  p_topic_key text,
  p_subject text,
  p_mins integer,
  p_price numeric,
  p_location text,
  p_note text default null,
  p_name text default null,
  p_phone text default null
)
returns public.tutoring_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  n text;
  req public.tutoring_requests%rowtype;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  if p_location is null or p_location not in ('inperson', 'video') then
    raise exception 'Invalid location';
  end if;

  if p_mins is null or p_mins <= 0 then
    raise exception 'Invalid mins';
  end if;

  if p_price is null or p_price < 0 then
    raise exception 'Invalid price';
  end if;

  n := coalesce(nullif(trim(p_name), ''), 'Student');

  -- Ensure profiles row as student (RLS bypass via security definer)
  perform public.ensure_my_profile('student', n, p_phone);

  insert into public.tutoring_requests (
    student_id,
    topic_key,
    subject,
    mins,
    price,
    location,
    note,
    status,
    expires_at
  )
  values (
    uid,
    p_topic_key,
    p_subject,
    p_mins,
    p_price,
    p_location,
    nullif(trim(p_note), ''),
    'pending',
    now() + interval '2 hours'
  )
  returning * into req;

  return req;
end;
$$;

grant execute on function public.create_my_tutoring_request(
  text, text, integer, numeric, text, text, text, text
) to authenticated;

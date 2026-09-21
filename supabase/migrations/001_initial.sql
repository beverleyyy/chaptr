-- Chaptr initial schema (Singapore tutoring marketplace)
-- Run in Supabase SQL Editor: Project → SQL → New query → paste → Run
-- Minimal PII (PDPA): name + optional phone only. No payment processing yet.

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('student', 'tutor')),
  name text not null,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);

-- ---------------------------------------------------------------------------
-- Tutoring requests (student books → tutors see pending)
-- ---------------------------------------------------------------------------
create table if not exists public.tutoring_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  topic_key text not null,
  subject text not null,
  mins integer not null check (mins > 0),
  price numeric(10, 2) not null check (price >= 0),
  location text not null check (location in ('inperson', 'video')),
  note text,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined', 'expired', 'cancelled')),
  tutor_id uuid references public.profiles (id) on delete set null,
  expires_at timestamptz not null default (now() + interval '3 minutes'),
  created_at timestamptz not null default now()
);

create index if not exists tutoring_requests_status_idx
  on public.tutoring_requests (status, created_at desc);
create index if not exists tutoring_requests_student_idx
  on public.tutoring_requests (student_id);
create index if not exists tutoring_requests_tutor_idx
  on public.tutoring_requests (tutor_id);

-- ---------------------------------------------------------------------------
-- Sessions (created when a tutor accepts a request)
-- ---------------------------------------------------------------------------
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.tutoring_requests (id) on delete set null,
  student_id uuid not null references public.profiles (id) on delete cascade,
  tutor_id uuid not null references public.profiles (id) on delete cascade,
  topic_key text not null,
  subject text not null,
  mins integer not null check (mins > 0),
  location text not null check (location in ('inperson', 'video')),
  scheduled_label text,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'completed', 'cancelled')),
  payout_amount numeric(10, 2),
  created_at timestamptz not null default now()
);

create index if not exists sessions_tutor_idx on public.sessions (tutor_id, created_at desc);
create index if not exists sessions_student_idx on public.sessions (student_id);

-- ---------------------------------------------------------------------------
-- Earnings stubs (tutor payout tracking — no real money movement)
-- ---------------------------------------------------------------------------
create table if not exists public.earnings (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references public.profiles (id) on delete cascade,
  session_id uuid references public.sessions (id) on delete set null,
  amount numeric(10, 2) not null check (amount >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'withdrawn')),
  created_at timestamptz not null default now()
);

create index if not exists earnings_tutor_idx on public.earnings (tutor_id, created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Auto-create profile from signup metadata (role, name, phone)
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  r text;
  n text;
  p text;
begin
  r := coalesce(new.raw_user_meta_data->>'role', 'student');
  if r not in ('student', 'tutor') then
    r := 'student';
  end if;
  n := coalesce(nullif(trim(new.raw_user_meta_data->>'name'), ''), split_part(new.email, '@', 1), 'User');
  p := nullif(trim(new.raw_user_meta_data->>'phone'), '');

  insert into public.profiles (id, role, name, phone)
  values (new.id, r, n, p)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Accept request: mark accepted, create session + earnings stub
-- ---------------------------------------------------------------------------
create or replace function public.accept_tutoring_request(p_request_id uuid)
returns public.sessions
language plpgsql
security definer
set search_path = public
as $$
declare
  req public.tutoring_requests%rowtype;
  sess public.sessions%rowtype;
  payout numeric(10, 2);
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select * into req
  from public.tutoring_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'Request not found';
  end if;

  if req.status <> 'pending' then
    raise exception 'Request is not pending';
  end if;

  if req.expires_at < now() then
    update public.tutoring_requests set status = 'expired' where id = req.id;
    raise exception 'Request expired';
  end if;

  -- Only tutors may accept
  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'tutor'
  ) then
    raise exception 'Only tutors can accept requests';
  end if;

  payout := case
    when req.mins <= 30 then 8
    when req.mins <= 60 then 16
    when req.mins <= 90 then 24
    else 32
  end;

  update public.tutoring_requests
  set status = 'accepted', tutor_id = auth.uid()
  where id = req.id;

  insert into public.sessions (
    request_id, student_id, tutor_id, topic_key, subject, mins, location,
    scheduled_label, status, payout_amount
  )
  values (
    req.id, req.student_id, auth.uid(), req.topic_key, req.subject, req.mins, req.location,
    'Today, soon', 'scheduled', payout
  )
  returning * into sess;

  insert into public.earnings (tutor_id, session_id, amount, status)
  values (auth.uid(), sess.id, payout, 'pending');

  return sess;
end;
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.tutoring_requests enable row level security;
alter table public.sessions enable row level security;
alter table public.earnings enable row level security;

-- Profiles: read own; tutors can read student display names for pending/own sessions
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_select_for_matching" on public.profiles;
create policy "profiles_select_for_matching"
  on public.profiles for select
  using (
    exists (
      select 1 from public.tutoring_requests tr
      where tr.student_id = profiles.id
        and (
          tr.status = 'pending'
          or tr.tutor_id = auth.uid()
          or tr.student_id = auth.uid()
        )
    )
    or exists (
      select 1 from public.sessions s
      where (s.student_id = profiles.id or s.tutor_id = profiles.id)
        and (s.student_id = auth.uid() or s.tutor_id = auth.uid())
    )
  );

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Requests
drop policy if exists "requests_select" on public.tutoring_requests;
create policy "requests_select"
  on public.tutoring_requests for select
  using (
    student_id = auth.uid()
    or tutor_id = auth.uid()
    or (
      status = 'pending'
      and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'tutor')
    )
  );

drop policy if exists "requests_insert_student" on public.tutoring_requests;
create policy "requests_insert_student"
  on public.tutoring_requests for insert
  with check (
    student_id = auth.uid()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'student')
  );

drop policy if exists "requests_update_participants" on public.tutoring_requests;
create policy "requests_update_participants"
  on public.tutoring_requests for update
  using (
    student_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'tutor')
  );

-- Sessions
drop policy if exists "sessions_select_own" on public.sessions;
create policy "sessions_select_own"
  on public.sessions for select
  using (student_id = auth.uid() or tutor_id = auth.uid());

drop policy if exists "sessions_update_own" on public.sessions;
create policy "sessions_update_own"
  on public.sessions for update
  using (student_id = auth.uid() or tutor_id = auth.uid());

-- Earnings (tutor only)
drop policy if exists "earnings_select_own" on public.earnings;
create policy "earnings_select_own"
  on public.earnings for select
  using (tutor_id = auth.uid());

drop policy if exists "earnings_update_own" on public.earnings;
create policy "earnings_update_own"
  on public.earnings for update
  using (tutor_id = auth.uid());

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.tutoring_requests to authenticated;
grant select, update on public.sessions to authenticated;
grant select, update on public.earnings to authenticated;
grant execute on function public.accept_tutoring_request(uuid) to authenticated;

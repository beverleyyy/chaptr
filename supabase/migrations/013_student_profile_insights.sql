-- Optional student profile insight fields + chapter weaknesses.
-- All fields optional; own-only write; tutors may read weaknesses for pending matches.

-- ---------------------------------------------------------------------------
-- profiles insight columns
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists school_year text;

alter table public.profiles
  add column if not exists tutoring_goal text;

alter table public.profiles
  add column if not exists tutor_notes text;

alter table public.profiles
  add column if not exists preferred_language text;

alter table public.profiles
  add column if not exists weakness_notes text;

alter table public.profiles
  drop constraint if exists profiles_school_year_check;
alter table public.profiles
  add constraint profiles_school_year_check
  check (
    school_year is null
    or school_year in (
      'Sec 1', 'Sec 2', 'Sec 3', 'Sec 4',
      'IP Year 1', 'IP Year 2', 'IP Year 3', 'IP Year 4'
    )
  );

alter table public.profiles
  drop constraint if exists profiles_tutoring_goal_check;
alter table public.profiles
  add constraint profiles_tutoring_goal_check
  check (
    tutoring_goal is null
    or tutoring_goal in ('upcoming_test', 'catch_up', 'exam_revision', 'enrichment')
  );

alter table public.profiles
  drop constraint if exists profiles_preferred_language_check;
alter table public.profiles
  add constraint profiles_preferred_language_check
  check (
    preferred_language is null
    or preferred_language in ('english', 'chinese', 'bilingual')
  );

alter table public.profiles
  drop constraint if exists profiles_tutor_notes_len;
alter table public.profiles
  add constraint profiles_tutor_notes_len
  check (tutor_notes is null or char_length(tutor_notes) <= 1000);

alter table public.profiles
  drop constraint if exists profiles_weakness_notes_len;
alter table public.profiles
  add constraint profiles_weakness_notes_len
  check (weakness_notes is null or char_length(weakness_notes) <= 500);

-- ---------------------------------------------------------------------------
-- student_weaknesses (multi-select chapters)
-- ---------------------------------------------------------------------------
create table if not exists public.student_weaknesses (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  topic_key text not null,
  created_at timestamptz not null default now(),
  unique (student_id, topic_key)
);

create index if not exists student_weaknesses_student_idx
  on public.student_weaknesses (student_id);

alter table public.student_weaknesses enable row level security;

drop policy if exists "student_weaknesses_select_own" on public.student_weaknesses;
create policy "student_weaknesses_select_own"
  on public.student_weaknesses for select
  using (auth.uid() = student_id);

drop policy if exists "student_weaknesses_select_tutor_pending" on public.student_weaknesses;
create policy "student_weaknesses_select_tutor_pending"
  on public.student_weaknesses for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'tutor'
    )
    and exists (
      select 1 from public.tutoring_requests tr
      where tr.student_id = student_weaknesses.student_id
        and tr.status = 'pending'
    )
  );

drop policy if exists "student_weaknesses_insert_own" on public.student_weaknesses;
create policy "student_weaknesses_insert_own"
  on public.student_weaknesses for insert
  with check (auth.uid() = student_id);

drop policy if exists "student_weaknesses_delete_own" on public.student_weaknesses;
create policy "student_weaknesses_delete_own"
  on public.student_weaknesses for delete
  using (auth.uid() = student_id);

grant select, insert, delete on public.student_weaknesses to authenticated;

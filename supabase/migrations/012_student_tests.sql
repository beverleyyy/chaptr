-- Student test dates tied to curriculum topics/chapters.
-- Own-only RLS; used to drive home topic tags (Test today / tomorrow / in N days).

create table if not exists public.student_tests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  topic_key text not null,
  test_date date not null,
  label text,
  created_at timestamptz not null default now(),
  constraint student_tests_label_len check (label is null or char_length(label) <= 80)
);

create index if not exists student_tests_student_date_idx
  on public.student_tests (student_id, test_date);

create index if not exists student_tests_student_topic_idx
  on public.student_tests (student_id, topic_key);

alter table public.student_tests enable row level security;

drop policy if exists "student_tests_select_own" on public.student_tests;
create policy "student_tests_select_own"
  on public.student_tests for select
  using (auth.uid() = student_id);

drop policy if exists "student_tests_insert_own" on public.student_tests;
create policy "student_tests_insert_own"
  on public.student_tests for insert
  with check (auth.uid() = student_id);

drop policy if exists "student_tests_update_own" on public.student_tests;
create policy "student_tests_update_own"
  on public.student_tests for update
  using (auth.uid() = student_id)
  with check (auth.uid() = student_id);

drop policy if exists "student_tests_delete_own" on public.student_tests;
create policy "student_tests_delete_own"
  on public.student_tests for delete
  using (auth.uid() = student_id);

grant select, insert, update, delete on public.student_tests to authenticated;

-- Student curriculum onboarding (Full SBB / SEC subject + G1|G2|G3 level)
-- Students must save ≥1 subject before booking; home filters topics by these keys.

-- ---------------------------------------------------------------------------
-- profiles.curriculum_completed_at (optional flag; non-empty rows also count)
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists curriculum_completed_at timestamptz;

-- ---------------------------------------------------------------------------
-- student_curriculum
-- ---------------------------------------------------------------------------
create table if not exists public.student_curriculum (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  subject_key text not null,
  level text not null check (level in ('G1', 'G2', 'G3')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, subject_key)
);

create index if not exists student_curriculum_student_idx
  on public.student_curriculum (student_id);

drop trigger if exists student_curriculum_set_updated_at on public.student_curriculum;
create trigger student_curriculum_set_updated_at
  before update on public.student_curriculum
  for each row execute function public.set_updated_at();

alter table public.student_curriculum enable row level security;

drop policy if exists "student_curriculum_select_own" on public.student_curriculum;
create policy "student_curriculum_select_own"
  on public.student_curriculum for select
  using (auth.uid() = student_id);

drop policy if exists "student_curriculum_insert_own" on public.student_curriculum;
create policy "student_curriculum_insert_own"
  on public.student_curriculum for insert
  with check (auth.uid() = student_id);

drop policy if exists "student_curriculum_update_own" on public.student_curriculum;
create policy "student_curriculum_update_own"
  on public.student_curriculum for update
  using (auth.uid() = student_id)
  with check (auth.uid() = student_id);

drop policy if exists "student_curriculum_delete_own" on public.student_curriculum;
create policy "student_curriculum_delete_own"
  on public.student_curriculum for delete
  using (auth.uid() = student_id);

grant select, insert, update, delete on public.student_curriculum to authenticated;

-- ---------------------------------------------------------------------------
-- Batch upsert: replace caller's curriculum with p_items
-- p_items: [{"subject_key":"chem","level":"G2"}, ...]
-- ---------------------------------------------------------------------------
create or replace function public.ensure_my_curriculum(p_items jsonb)
returns setof public.student_curriculum
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  item jsonb;
  sk text;
  lv text;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) < 1 then
    raise exception 'At least one subject is required';
  end if;

  -- Validate all items before mutating
  for item in select * from jsonb_array_elements(p_items)
  loop
    sk := nullif(trim(item->>'subject_key'), '');
    lv := nullif(trim(item->>'level'), '');
    if sk is null then
      raise exception 'subject_key is required';
    end if;
    if lv is null or lv not in ('G1', 'G2', 'G3') then
      raise exception 'level must be G1, G2, or G3';
    end if;
  end loop;

  delete from public.student_curriculum where student_id = uid;

  for item in select * from jsonb_array_elements(p_items)
  loop
    sk := trim(item->>'subject_key');
    lv := trim(item->>'level');
    insert into public.student_curriculum (student_id, subject_key, level)
    values (uid, sk, lv)
    on conflict (student_id, subject_key) do update
      set level = excluded.level,
          updated_at = now();
  end loop;

  update public.profiles
  set curriculum_completed_at = coalesce(curriculum_completed_at, now())
  where id = uid;

  return query
    select * from public.student_curriculum
    where student_id = uid
    order by created_at;
end;
$$;

grant execute on function public.ensure_my_curriculum(jsonb) to authenticated;
revoke execute on function public.ensure_my_curriculum(jsonb) from anon, public;
grant execute on function public.ensure_my_curriculum(jsonb) to authenticated;

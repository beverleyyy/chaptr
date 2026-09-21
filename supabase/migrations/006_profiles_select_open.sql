-- Demo: let signed-in users read/write their profile row reliably
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_select_for_matching" on public.profiles;
drop policy if exists "profiles_select_authenticated" on public.profiles;

create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Make sure ensure_my_profile writes full_name when column exists
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
  has_full_name boolean;
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

  select exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'full_name'
  ) into has_full_name;

  if has_full_name then
    execute $sql$
      insert into public.profiles (id, role, name, full_name, phone)
      values ($1, $2, $3, $3, $4)
      on conflict (id) do update
        set role = excluded.role,
            name = excluded.name,
            full_name = excluded.full_name,
            phone = coalesce(excluded.phone, public.profiles.phone),
            updated_at = now()
    $sql$ using uid, r, n, p;
  else
    insert into public.profiles (id, role, name, phone)
    values (uid, r, n, p)
    on conflict (id) do update
      set role = excluded.role,
          name = excluded.name,
          phone = coalesce(excluded.phone, public.profiles.phone),
          updated_at = now();
  end if;

  select * into row from public.profiles where id = uid;
  return row;
end;
$$;

grant execute on function public.ensure_my_profile(text, text, text) to authenticated;

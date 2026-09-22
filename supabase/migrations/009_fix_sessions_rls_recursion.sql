-- Drop recursive sessions <-> students policies if present; keep open demo select.
-- Already applied live as fix_sessions_students_rls_recursion.

do $$
begin
  if to_regclass('public.students') is not null then
    execute 'drop policy if exists "students_select_via_sessions" on public.students';
  end if;
exception when undefined_table then
  null;
end $$;

drop policy if exists "sessions_select_via_students" on public.sessions;
drop policy if exists "sessions_select_authenticated" on public.sessions;
create policy "sessions_select_authenticated"
  on public.sessions for select
  to authenticated
  using (true);

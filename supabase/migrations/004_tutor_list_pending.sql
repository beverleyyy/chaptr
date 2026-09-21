-- Let tutors list pending requests via security definer (avoids RLS edge cases)

create or replace function public.list_pending_tutoring_requests()
returns setof public.tutoring_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  -- Ensure caller is marked tutor (profiles may be missing/wrong after signup quirks)
  insert into public.profiles (id, role, name, full_name)
  values (
    uid,
    'tutor',
    coalesce((select name from public.profiles where id = uid), 'Tutor'),
    coalesce((select full_name from public.profiles where id = uid), 'Tutor')
  )
  on conflict (id) do update
    set role = 'tutor',
        updated_at = now();

  return query
  select *
  from public.tutoring_requests
  where status = 'pending'
    and expires_at > now()
  order by created_at desc;
end;
$$;

grant execute on function public.list_pending_tutoring_requests() to authenticated;

-- Also widen SELECT policy for pending so tutors with role=tutor can read
drop policy if exists "requests_select" on public.tutoring_requests;
create policy "requests_select"
  on public.tutoring_requests for select
  using (
    student_id = auth.uid()
    or tutor_id = auth.uid()
    or status = 'pending'
  );

-- Simplest possible pending list for authenticated users (demo-friendly)

create or replace function public.list_pending_tutoring_requests()
returns setof public.tutoring_requests
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  return query
  select *
  from public.tutoring_requests
  where status = 'pending'
    and expires_at > now()
  order by created_at desc;
end;
$$;

grant execute on function public.list_pending_tutoring_requests() to authenticated;

-- Any signed-in user can read tutoring_requests (tighten later for production)
drop policy if exists "requests_select" on public.tutoring_requests;
create policy "requests_select"
  on public.tutoring_requests for select
  to authenticated
  using (true);

-- Revive any recent requests that expired too fast
update public.tutoring_requests
set status = 'pending',
    expires_at = now() + interval '7 days'
where created_at > now() - interval '2 days'
  and status in ('pending', 'expired');

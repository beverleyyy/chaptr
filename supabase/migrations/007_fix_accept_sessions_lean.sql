-- Align accept_tutoring_request with the live sessions schema:
-- id, request_id, tutor_id, student_id, video_link, status, created_at, completed_at
-- Subject / topic / mins / location stay on tutoring_requests.

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
    request_id, student_id, tutor_id, status, video_link
  )
  values (
    req.id,
    req.student_id,
    auth.uid(),
    'scheduled',
    case
      when req.location = 'video' then 'https://meet.jit.si/chaptr-' || replace(req.id::text, '-', '')
      else null
    end
  )
  returning * into sess;

  insert into public.earnings (tutor_id, session_id, amount, status)
  values (auth.uid(), sess.id, payout, 'pending');

  return sess;
end;
$$;

grant execute on function public.accept_tutoring_request(uuid) to authenticated;

-- Shorter pending window for "accept soon" tutor UX (1 hour).
-- Also clamps leftover multi-day demo expiries from earlier migrations.

alter table public.tutoring_requests
  alter column expires_at set default (now() + interval '1 hour');

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
    now() + interval '1 hour'
  )
  returning * into req;

  return req;
end;
$$;

grant execute on function public.create_my_tutoring_request(
  text, text, integer, numeric, text, text, text, text
) to authenticated;

-- Clamp existing multi-day pending rows so tutor badges look sane
update public.tutoring_requests
set expires_at = now() + interval '1 hour'
where status = 'pending'
  and expires_at > now() + interval '2 hours';

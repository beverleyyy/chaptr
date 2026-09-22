-- Pre-match Stripe PayNow payments (not session-linked public.payments).
-- Also store stripe_payment_intent_id on tutoring_requests after booking is created.

create table if not exists public.booking_payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users (id) on delete cascade,
  stripe_payment_intent_id text not null unique,
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'sgd',
  status text not null default 'requires_action'
    check (status = any (array[
      'requires_action'::text,
      'requires_payment_method'::text,
      'processing'::text,
      'succeeded'::text,
      'canceled'::text,
      'failed'::text
    ])),
  topic_key text not null,
  subject text not null,
  mins integer not null check (mins > 0),
  price numeric not null check (price >= 0),
  location text not null check (location = any (array['inperson'::text, 'video'::text])),
  note text,
  tutoring_request_id uuid references public.tutoring_requests (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists booking_payments_student_idx
  on public.booking_payments (student_id, created_at desc);

create index if not exists booking_payments_status_idx
  on public.booking_payments (status);

alter table public.tutoring_requests
  add column if not exists stripe_payment_intent_id text;

create unique index if not exists tutoring_requests_stripe_pi_uidx
  on public.tutoring_requests (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

alter table public.booking_payments enable row level security;

drop policy if exists "booking_payments_select_own" on public.booking_payments;
create policy "booking_payments_select_own"
  on public.booking_payments for select
  to authenticated
  using (student_id = auth.uid());

-- Inserts/updates go through Edge Functions (service role); no client insert policy.

grant select on public.booking_payments to authenticated;

-- Extend create_my_tutoring_request to optionally record payment intent id
drop function if exists public.create_my_tutoring_request(
  text, text, integer, numeric, text, text, text, text
);

create or replace function public.create_my_tutoring_request(
  p_topic_key text,
  p_subject text,
  p_mins integer,
  p_price numeric,
  p_location text,
  p_note text default null,
  p_name text default null,
  p_phone text default null,
  p_stripe_payment_intent_id text default null
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

  -- If a payment intent is supplied, require a succeeded booking_payments row owned by caller
  if p_stripe_payment_intent_id is not null and length(trim(p_stripe_payment_intent_id)) > 0 then
    if not exists (
      select 1
      from public.booking_payments bp
      where bp.stripe_payment_intent_id = trim(p_stripe_payment_intent_id)
        and bp.student_id = uid
        and bp.status = 'succeeded'
        and bp.tutoring_request_id is null
    ) then
      raise exception 'Payment not confirmed for this booking';
    end if;
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
    expires_at,
    stripe_payment_intent_id
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
    now() + interval '1 hour',
    nullif(trim(p_stripe_payment_intent_id), '')
  )
  returning * into req;

  if req.stripe_payment_intent_id is not null then
    update public.booking_payments
    set tutoring_request_id = req.id,
        updated_at = now()
    where stripe_payment_intent_id = req.stripe_payment_intent_id
      and student_id = uid
      and tutoring_request_id is null;
  end if;

  return req;
end;
$$;

grant execute on function public.create_my_tutoring_request(
  text, text, integer, numeric, text, text, text, text, text
) to authenticated;

revoke execute on function public.create_my_tutoring_request(
  text, text, integer, numeric, text, text, text, text, text
) from anon, public;

grant execute on function public.create_my_tutoring_request(
  text, text, integer, numeric, text, text, text, text, text
) to authenticated;

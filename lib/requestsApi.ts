import { requireSupabase, getSupabase } from '@/lib/supabase';
import { abbreviatedName, initialsFromName } from '@/lib/privacy';
import type {
  EarningRowDb,
  LocationType,
  Profile,
  SessionRow,
  TutoringRequestRow,
  UserRole,
} from '@/lib/types';
import type { EarningRow, TutorRequest } from '@/constants/mockData';
import { TOPICS } from '@/constants/mockData';
import {
  fetchWeaknessesForStudents,
  formatTutorInsightPreview,
  insightsFromProfile,
} from '@/lib/studentProfileApi';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type CreateRequestInput = {
  studentId: string;
  topicKey: string;
  subject: string;
  mins: number;
  price: number;
  location: LocationType;
  note?: string | null;
  name?: string | null;
  phone?: string | null;
  stripePaymentIntentId?: string | null;
};

export type AcceptedMatch = {
  request: TutoringRequestRow;
  session: SessionRow;
  tutor: Profile;
};

export type MatchedTutorInfo = {
  requestId: string;
  sessionId: string;
  tutorId: string;
  name: string;
  initials: string;
  subject: string;
  topicKey: string;
  mins: number;
  location: LocationType;
  scheduledLabel: string | null;
};

function secondsUntil(iso: string): number {
  const ms = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.floor(ms / 1000));
}

function secondsElapsed(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(ms / 1000));
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const time = d.toLocaleTimeString('en-SG', { hour: 'numeric', minute: '2-digit' });
  if (sameDay) return `Today, ${time}`;
  return d.toLocaleString('en-SG', {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

async function fetchProfilesByIds(ids: string[]): Promise<Record<string, Profile>> {
  const unique = [...new Set(ids.filter(Boolean))];
  if (!unique.length) return {};
  const sb = requireSupabase();
  const { data, error } = await sb.from('profiles').select('*').in('id', unique);
  if (error) {
    console.warn('fetchProfilesByIds', error.message);
    return {};
  }
  const map: Record<string, Profile> = {};
  for (const row of data ?? []) {
    const p = row as Profile & { full_name?: string | null };
    if (!p.name && p.full_name) p.name = p.full_name;
    map[p.id] = p;
  }
  return map;
}

/**
 * Ensure a profiles row exists for the signed-in user.
 * Profiles are created client-side (the auth.users trigger was intentionally removed).
 */
/** Format Supabase / thrown errors for Alert + on-screen display. */
export function formatApiError(err: unknown): string {
  if (!err) return 'Unknown error';
  if (typeof err === 'string') return err;
  if (err instanceof Error) {
    const anyErr = err as Error & { code?: string; details?: string; hint?: string };
    const parts = [anyErr.message];
    if (anyErr.code) parts.push(`code=${anyErr.code}`);
    if (anyErr.details) parts.push(String(anyErr.details));
    if (anyErr.hint) parts.push(String(anyErr.hint));
    return parts.filter(Boolean).join(' · ');
  }
  if (typeof err === 'object') {
    const o = err as { message?: string; code?: string; details?: string; hint?: string };
    const parts = [o.message, o.code ? `code=${o.code}` : null, o.details, o.hint];
    const joined = parts.filter(Boolean).join(' · ');
    if (joined) return joined;
  }
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

function isMissingRpcError(err: unknown): boolean {
  const o = err as { code?: string; message?: string; details?: string };
  const code = o?.code ?? '';
  const msg = `${o?.message ?? ''} ${o?.details ?? ''}`.toLowerCase();
  return (
    code === 'PGRST202' ||
    code === '42883' ||
    msg.includes('could not find the function') ||
    msg.includes('function public.ensure_my_profile') ||
    msg.includes('function public.create_my_tutoring_request') ||
    (msg.includes('does not exist') && msg.includes('function'))
  );
}

export async function ensureOwnProfile(opts: {
  role: UserRole;
  name: string;
  phone?: string | null;
}): Promise<string> {
  const sb = requireSupabase();
  const { data: authData, error: authErr } = await sb.auth.getUser();
  if (authErr || !authData.user) throw new Error('Sign in required');
  const id = authData.user.id;
  const name =
    opts.name.trim() ||
    (typeof authData.user.user_metadata?.name === 'string'
      ? authData.user.user_metadata.name
      : '') ||
    authData.user.email?.split('@')[0] ||
    'User';
  const phone = opts.phone ?? null;

  // Prefer RPC (handles full_name + RLS). Fall back to direct upsert with full_name.
  const { error: rpcErr } = await sb.rpc('ensure_my_profile', {
    p_role: opts.role,
    p_name: name,
    p_phone: phone,
  });
  if (!rpcErr) return id;
  if (!isMissingRpcError(rpcErr)) {
    // Still try upsert below — then throw RPC error if that fails too
  }

  const { error } = await sb.from('profiles').upsert({
    id,
    role: opts.role,
    name,
    full_name: name,
    phone,
  });
  if (!error) return id;

  if (rpcErr && !isMissingRpcError(rpcErr)) throw rpcErr;
  throw error;
}

export function mapRequestToUi(
  row: TutoringRequestRow,
  student?: Profile | null,
  weaknessTopicKeys: string[] = [],
): TutorRequest {
  const name = student?.name ? abbreviatedName(student.name) : 'Student';
  const initials = student?.name ? initialsFromName(student.name) : 'ST';
  const insights = insightsFromProfile(student);
  const tutorInsight = formatTutorInsightPreview(insights, weaknessTopicKeys);
  return {
    id: row.id,
    name,
    initials,
    band: insights.schoolYear ?? 'Sec Express',
    continuity: 'Ping match',
    subject: row.subject,
    topicKey: row.topic_key,
    time: formatWhen(row.created_at),
    mins: row.mins,
    location: row.location,
    distance: row.location === 'inperson' ? 'Nearby venue' : null,
    note: row.note,
    timer: '',
    secondsWaiting: secondsElapsed(row.created_at),
    expiresAt: row.expires_at,
    tutorInsight,
  };
}

export async function createTutoringRequest(input: CreateRequestInput): Promise<TutoringRequestRow> {
  const sb = requireSupabase();

  // Prefer security-definer RPC (003) — upserts student profile + inserts request
  const { data: rpcData, error: rpcErr } = await sb.rpc('create_my_tutoring_request', {
    p_topic_key: input.topicKey,
    p_subject: input.subject,
    p_mins: input.mins,
    p_price: input.price,
    p_location: input.location,
    p_note: input.note ?? null,
    p_name: input.name ?? null,
    p_phone: input.phone ?? null,
    p_stripe_payment_intent_id: input.stripePaymentIntentId ?? null,
  });
  if (!rpcErr && rpcData) {
    return rpcData as TutoringRequestRow;
  }
  if (rpcErr && !isMissingRpcError(rpcErr)) {
    throw rpcErr;
  }

  // Fallback: direct insert (requires profiles row + RLS)
  const { data, error } = await sb
    .from('tutoring_requests')
    .insert({
      student_id: input.studentId,
      topic_key: input.topicKey,
      subject: input.subject,
      mins: input.mins,
      price: input.price,
      location: input.location,
      note: input.note ?? null,
      status: 'pending',
      stripe_payment_intent_id: input.stripePaymentIntentId ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as TutoringRequestRow;
}

export async function fetchTutoringRequest(requestId: string): Promise<TutoringRequestRow | null> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from('tutoring_requests')
    .select('*')
    .eq('id', requestId)
    .maybeSingle();
  if (error) throw error;
  return (data as TutoringRequestRow | null) ?? null;
}

export async function fetchAcceptedMatch(requestId: string): Promise<AcceptedMatch | null> {
  const sb = requireSupabase();
  const { data: request, error } = await sb
    .from('tutoring_requests')
    .select('*')
    .eq('id', requestId)
    .maybeSingle();
  if (error) throw error;
  if (!request || (request as TutoringRequestRow).status !== 'accepted') return null;

  const req = request as TutoringRequestRow;
  const { data: session, error: sErr } = await sb
    .from('sessions')
    .select('*')
    .eq('request_id', requestId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (sErr) throw sErr;
  if (!session) return null;

  const sess = session as SessionRow;
  const profiles = await fetchProfilesByIds([sess.tutor_id]);
  const tutor = profiles[sess.tutor_id];
  if (!tutor) return null;

  return { request: req, session: sess, tutor };
}

export function toMatchedTutorInfo(match: AcceptedMatch): MatchedTutorInfo {
  return {
    requestId: match.request.id,
    sessionId: match.session.id,
    tutorId: match.tutor.id,
    name: match.tutor.name,
    initials: initialsFromName(match.tutor.name),
    subject: match.request.subject,
    topicKey: match.request.topic_key,
    mins: match.request.mins,
    location: match.request.location,
    scheduledLabel: formatWhen(match.session.created_at),
  };
}

/** Poll + optional Realtime until request leaves pending. */
export function watchTutoringRequest(
  requestId: string,
  onRow: (row: TutoringRequestRow) => void,
  opts?: { pollMs?: number },
): () => void {
  const pollMs = opts?.pollMs ?? 2500;
  let stopped = false;
  let channel: RealtimeChannel | null = null;

  const tick = async () => {
    if (stopped) return;
    try {
      const row = await fetchTutoringRequest(requestId);
      if (row && !stopped) onRow(row);
    } catch (e) {
      console.warn('watchTutoringRequest poll', e);
    }
  };

  void tick();
  const interval = setInterval(() => void tick(), pollMs);

  const sb = getSupabase();
  if (sb) {
    channel = sb
      .channel(`tutoring_request:${requestId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tutoring_requests',
          filter: `id=eq.${requestId}`,
        },
        (payload) => {
          if (stopped) return;
          const row = payload.new as TutoringRequestRow;
          if (row?.id) onRow(row);
        },
      )
      .subscribe();
  }

  return () => {
    stopped = true;
    clearInterval(interval);
    if (channel) {
      const client = getSupabase();
      if (client) void client.removeChannel(channel);
    }
  };
}

export async function fetchPendingRequests(): Promise<{
  requests: Record<string, TutorRequest>;
  pendingIds: string[];
}> {
  const sb = requireSupabase();
  let rows: TutoringRequestRow[] = [];

  const { data: rpcData, error: rpcErr } = await sb.rpc('list_pending_tutoring_requests');
  if (!rpcErr && rpcData) {
    rows = rpcData as TutoringRequestRow[];
  } else {
    if (rpcErr && !isMissingRpcError(rpcErr)) {
      // Fall through to table select; if that also fails, throw below
      console.warn('list_pending_tutoring_requests', formatApiError(rpcErr));
    }
    const { data, error } = await sb
      .from('tutoring_requests')
      .select('*')
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });
    if (error) throw error;
    rows = (data ?? []) as TutoringRequestRow[];
  }

  const profiles = await fetchProfilesByIds(rows.map((r) => r.student_id));
  const weaknesses = await fetchWeaknessesForStudents(rows.map((r) => r.student_id));

  const requests: Record<string, TutorRequest> = {};
  const pendingIds: string[] = [];
  for (const row of rows) {
    const mapped = mapRequestToUi(
      row,
      profiles[row.student_id],
      weaknesses[row.student_id] ?? [],
    );
    requests[mapped.id] = mapped;
    pendingIds.push(mapped.id);
  }
  return { requests, pendingIds };
}

/** Realtime hint for tutors when a new pending request appears. */
export function watchPendingRequestInserts(onInsert: () => void): () => void {
  const sb = getSupabase();
  if (!sb) return () => undefined;

  const channel = sb
    .channel('tutoring_requests:pending')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'tutoring_requests',
      },
      () => onInsert(),
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'tutoring_requests',
      },
      () => onInsert(),
    )
    .subscribe();

  return () => {
    void sb.removeChannel(channel);
  };
}

export async function acceptTutoringRequest(requestId: string): Promise<SessionRow> {
  const sb = requireSupabase();
  const { data, error } = await sb.rpc('accept_tutoring_request', {
    p_request_id: requestId,
  });
  if (error) throw error;
  return data as SessionRow;
}

export async function declineTutoringRequest(requestId: string): Promise<void> {
  const sb = requireSupabase();
  // Prefer RPC from 002_booking_polish when present; fall back to RLS update
  const { error: rpcErr } = await sb.rpc('decline_tutoring_request', {
    p_request_id: requestId,
  });
  if (!rpcErr) return;

  const { data, error } = await sb
    .from('tutoring_requests')
    .update({ status: 'declined' })
    .eq('id', requestId)
    .eq('status', 'pending')
    .select('id')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error(rpcErr.message || 'Request is no longer pending');
}

type SessionWithRequest = SessionRow & {
  tutoring_requests: TutoringRequestRow | TutoringRequestRow[] | null;
};

function requestFromSession(s: SessionWithRequest): TutoringRequestRow | null {
  const nested = s.tutoring_requests;
  if (!nested) return null;
  return Array.isArray(nested) ? nested[0] ?? null : nested;
}

export async function fetchTutorSessions(tutorId: string): Promise<{
  requests: Record<string, TutorRequest>;
  acceptedIds: string[];
}> {
  const sb = requireSupabase();
  // Subject/topic/mins/location live on tutoring_requests, not sessions.
  const { data, error } = await sb
    .from('sessions')
    .select(
      'id, request_id, tutor_id, student_id, video_link, status, created_at, completed_at, tutoring_requests ( id, student_id, topic_key, subject, mins, price, location, note, status, tutor_id, expires_at, created_at )',
    )
    .eq('tutor_id', tutorId)
    .eq('status', 'scheduled')
    .order('created_at', { ascending: false });
  // Non-fatal: missing SELECT policies / RLS must not block pending requests
  if (error) {
    console.warn('fetchTutorSessions', formatApiError(error));
    return { requests: {}, acceptedIds: [] };
  }

  const rows = (data ?? []) as SessionWithRequest[];
  const profiles = await fetchProfilesByIds(rows.map((r) => r.student_id));

  const requests: Record<string, TutorRequest> = {};
  const acceptedIds: string[] = [];
  for (const s of rows) {
    const req = requestFromSession(s);
    const student = profiles[s.student_id];
    const name = student?.name ? abbreviatedName(student.name) : 'Student';
    const initials = student?.name ? initialsFromName(student.name) : 'ST';
    const insights = insightsFromProfile(student);
    const id = s.request_id || s.id;
    const location = (req?.location ?? 'video') as LocationType;
    requests[id] = {
      id,
      name,
      initials,
      band: insights.schoolYear ?? 'Sec Express',
      continuity: 'Ping match',
      subject: req?.subject ?? 'Session',
      topicKey: req?.topic_key ?? 'am_02',
      time: formatWhen(s.created_at),
      mins: req?.mins ?? 60,
      location,
      distance: location === 'inperson' ? 'Nearby venue' : null,
      note: req?.note ?? null,
      timer: '',
      secondsWaiting: 0,
    };
    acceptedIds.push(id);
  }
  return { requests, acceptedIds };
}

export async function fetchTutorEarnings(tutorId: string): Promise<{
  rows: EarningRow[];
  availableBalance: number;
  weekTotal: number;
  weekCount: number;
}> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from('earnings')
    .select('*')
    .eq('tutor_id', tutorId)
    .order('created_at', { ascending: false })
    .limit(40);
  // Non-fatal: earnings RLS failures must not block pending
  if (error) {
    console.warn('fetchTutorEarnings', formatApiError(error));
    return { rows: [], availableBalance: 0, weekTotal: 0, weekCount: 0 };
  }

  const earnings = (data ?? []) as EarningRowDb[];
  const sessionIds = earnings.map((e) => e.session_id).filter((id): id is string => !!id);

  let sessionsById: Record<string, SessionRow> = {};
  let requestBySessionId: Record<string, TutoringRequestRow> = {};
  let profiles: Record<string, Profile> = {};
  if (sessionIds.length) {
    const { data: sessions, error: sErr } = await sb
      .from('sessions')
      .select(
        'id, request_id, tutor_id, student_id, video_link, status, created_at, completed_at, tutoring_requests ( id, student_id, topic_key, subject, mins, price, location, note, status, tutor_id, expires_at, created_at )',
      )
      .in('id', sessionIds);
    if (sErr) {
      console.warn('fetchTutorEarnings sessions', formatApiError(sErr));
    } else {
      for (const raw of (sessions ?? []) as SessionWithRequest[]) {
        sessionsById[raw.id] = raw;
        const req = requestFromSession(raw);
        if (req) requestBySessionId[raw.id] = req;
      }
      profiles = await fetchProfilesByIds(
        Object.values(sessionsById).map((s) => s.student_id),
      );
    }
  }

  const rows: EarningRow[] = [];
  let availableBalance = 0;
  let weekTotal = 0;
  let weekCount = 0;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  for (const e of earnings) {
    const session = e.session_id ? sessionsById[e.session_id] : undefined;
    const req = e.session_id ? requestBySessionId[e.session_id] : undefined;
    const topic = req?.topic_key ? TOPICS[req.topic_key] : null;
    const student = session ? profiles[session.student_id] : undefined;
    const studentName = student?.name
      ? abbreviatedName(student.name).replace(/\s/g, '')
      : '—';

    rows.push({
      subject: req?.subject ?? 'Session',
      chapterSpine: topic?.spine ?? '—',
      time: session ? formatWhen(session.created_at) : formatWhen(e.created_at),
      student: studentName,
      amount: Number(e.amount),
      status: e.status === 'paid' || e.status === 'withdrawn' ? 'paid' : 'pending',
    });

    if (e.status === 'pending' || e.status === 'paid') {
      availableBalance += Number(e.amount);
    }
    if (new Date(e.created_at).getTime() >= weekAgo) {
      weekTotal += Number(e.amount);
      weekCount += 1;
    }
  }

  return { rows, availableBalance, weekTotal, weekCount };
}

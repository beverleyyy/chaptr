import { requireSupabase } from '@/lib/supabase';
import { abbreviatedName, initialsFromName } from '@/lib/privacy';
import type { EarningRowDb, LocationType, Profile, SessionRow, TutoringRequestRow } from '@/lib/types';
import type { EarningRow, TutorRequest } from '@/constants/mockData';
import { TOPICS } from '@/constants/mockData';

export type CreateRequestInput = {
  studentId: string;
  topicKey: string;
  subject: string;
  mins: number;
  price: number;
  location: LocationType;
  note?: string | null;
};

function secondsUntil(iso: string): number {
  const ms = new Date(iso).getTime() - Date.now();
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
  if (error) throw error;
  const map: Record<string, Profile> = {};
  for (const p of data ?? []) map[p.id] = p as Profile;
  return map;
}

export function mapRequestToUi(
  row: TutoringRequestRow,
  student?: Pick<Profile, 'name'> | null,
): TutorRequest {
  const name = student?.name ? abbreviatedName(student.name) : 'Student';
  const initials = student?.name ? initialsFromName(student.name) : 'ST';
  return {
    id: row.id,
    name,
    initials,
    band: 'Sec Express',
    continuity: 'Chaptr match',
    subject: row.subject,
    topicKey: row.topic_key,
    time: formatWhen(row.created_at),
    mins: row.mins,
    location: row.location,
    distance: row.location === 'inperson' ? 'Nearby venue' : null,
    note: row.note,
    timer: '',
    secondsLeft: secondsUntil(row.expires_at),
  };
}

export async function createTutoringRequest(input: CreateRequestInput): Promise<TutoringRequestRow> {
  const sb = requireSupabase();
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
    })
    .select()
    .single();
  if (error) throw error;
  return data as TutoringRequestRow;
}

export async function fetchPendingRequests(): Promise<{
  requests: Record<string, TutorRequest>;
  pendingIds: string[];
}> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from('tutoring_requests')
    .select('*')
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });
  if (error) throw error;

  const rows = (data ?? []) as TutoringRequestRow[];
  const profiles = await fetchProfilesByIds(rows.map((r) => r.student_id));

  const requests: Record<string, TutorRequest> = {};
  const pendingIds: string[] = [];
  for (const row of rows) {
    const mapped = mapRequestToUi(row, profiles[row.student_id]);
    requests[mapped.id] = mapped;
    pendingIds.push(mapped.id);
  }
  return { requests, pendingIds };
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
  const { error } = await sb
    .from('tutoring_requests')
    .update({ status: 'declined' })
    .eq('id', requestId)
    .eq('status', 'pending');
  if (error) throw error;
}

export async function fetchTutorSessions(tutorId: string): Promise<{
  requests: Record<string, TutorRequest>;
  acceptedIds: string[];
}> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from('sessions')
    .select('*')
    .eq('tutor_id', tutorId)
    .eq('status', 'scheduled')
    .order('created_at', { ascending: false });
  if (error) throw error;

  const rows = (data ?? []) as SessionRow[];
  const profiles = await fetchProfilesByIds(rows.map((r) => r.student_id));

  const requests: Record<string, TutorRequest> = {};
  const acceptedIds: string[] = [];
  for (const s of rows) {
    const student = profiles[s.student_id];
    const name = student?.name ? abbreviatedName(student.name) : 'Student';
    const initials = student?.name ? initialsFromName(student.name) : 'ST';
    const id = s.request_id ?? s.id;
    requests[id] = {
      id,
      name,
      initials,
      band: 'Sec Express',
      continuity: 'Chaptr match',
      subject: s.subject,
      topicKey: s.topic_key,
      time: s.scheduled_label ?? formatWhen(s.created_at),
      mins: s.mins,
      location: s.location,
      distance: s.location === 'inperson' ? 'Nearby venue' : null,
      note: null,
      timer: '',
      secondsLeft: 0,
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
  if (error) throw error;

  const earnings = (data ?? []) as EarningRowDb[];
  const sessionIds = earnings.map((e) => e.session_id).filter((id): id is string => !!id);

  let sessionsById: Record<string, SessionRow> = {};
  let profiles: Record<string, Profile> = {};
  if (sessionIds.length) {
    const { data: sessions, error: sErr } = await sb.from('sessions').select('*').in('id', sessionIds);
    if (sErr) throw sErr;
    for (const s of (sessions ?? []) as SessionRow[]) sessionsById[s.id] = s;
    profiles = await fetchProfilesByIds(
      Object.values(sessionsById).map((s) => s.student_id),
    );
  }

  const rows: EarningRow[] = [];
  let availableBalance = 0;
  let weekTotal = 0;
  let weekCount = 0;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  for (const e of earnings) {
    const session = e.session_id ? sessionsById[e.session_id] : undefined;
    const topic = session?.topic_key ? TOPICS[session.topic_key] : null;
    const student = session ? profiles[session.student_id] : undefined;
    const studentName = student?.name
      ? abbreviatedName(student.name).replace(/\s/g, '')
      : '—';

    rows.push({
      subject: session?.subject ?? 'Session',
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

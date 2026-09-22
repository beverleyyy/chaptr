import type { CurriculumSubjectKey } from '@/constants/curriculum';
import { CURRICULUM_SUBJECTS } from '@/constants/curriculum';
import { colors } from '@/constants/theme';
import { TOPICS as CATALOGUE_TOPICS, type Topic } from '@/constants/topicsCatalogue';

export type { Topic };
export {
  formatSessionTopicLine,
  resolveTopic,
  topicCountsBySubject,
} from '@/constants/topicsCatalogue';

export type TutorRequest = {
  id: string;
  name: string;
  initials: string;
  band: string;
  continuity: string;
  subject: string;
  topicKey: string;
  time: string;
  mins: number;
  location: 'inperson' | 'video';
  distance: string | null;
  note: string | null;
  timer: string;
  /** Seconds the student has been waiting (elapsed since created_at). */
  secondsWaiting: number;
  /** ISO expiry for prune; omit in pure mock rows that never auto-expire. */
  expiresAt?: string | null;
  /** Optional student insight blurb for tutor pending/accept. */
  tutorInsight?: string | null;
  /** Live sessions.video_link when this row came from an accepted session. */
  videoLink?: string | null;
};

export type ScheduleSeed = {
  id: string;
  name: string;
  initials: string;
  subject: string;
  topicKey: string;
  time: string;
  mins: number;
  location: 'inperson' | 'video';
};

export type EarningRow = {
  subject: string;
  chapterSpine: string;
  time: string;
  student: string;
  amount: number;
  status: 'paid' | 'pending';
};

/** Full SEAB / SEC chapter catalogues — see topicsCatalogue.ts. */
export const TOPICS: Record<string, Topic> = CATALOGUE_TOPICS;

/** Full curriculum subject list for pickers (ordered by tuition demand). */
export const SUBJECTS = CURRICULUM_SUBJECTS.map((s) => ({
  key: s.key,
  label: s.shortLabel,
}));

export function topicsForSubjectKey(
  subjectKey: CurriculumSubjectKey,
  level?: string,
): Topic[] {
  return Object.values(TOPICS)
    .filter((t) => t.subjectKey === subjectKey)
    .map((t) => (level ? { ...t, band: level } : t))
    .sort((a, b) => Number(a.spine) - Number(b.spine));
}

/** Pilot student prices. 60 min is $35; other lengths are whole-dollar scales of that hour. */
export const DURATIONS = [
  { mins: 30, price: 18, label: '30 min' },
  { mins: 60, price: 35, label: '1 hour' },
  { mins: 90, price: 50, label: '1.5 hr' },
  { mins: 120, price: 65, label: '2 hr' },
];

export function parseTimerToSeconds(str: string): number {
  const parts = str.split(':');
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

export function formatSeconds(s: number): string {
  if (s < 0) s = 0;
  if (s < 60) return `${s}s`;
  if (s < 60 * 60) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  }
  if (s < 24 * 60 * 60) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${h}h ${m}m`;
  }
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  return `${d}d ${h}h`;
}

export type WaitUrgency = 'fresh' | 'aging' | 'urgent';

export function waitUrgency(secondsWaiting: number): WaitUrgency {
  if (secondsWaiting < 5 * 60) return 'fresh';
  if (secondsWaiting < 10 * 60) return 'aging';
  return 'urgent';
}

export function waitToneColors(urgency: WaitUrgency): { fg: string; soft: string } {
  switch (urgency) {
    case 'fresh':
      return { fg: colors.success, soft: colors.successSoft };
    case 'aging':
      return { fg: colors.amber, soft: colors.amberSoft };
    case 'urgent':
      return { fg: colors.danger, soft: colors.dangerSoft };
  }
}

export function durationLabel(mins: number): string {
  if (mins === 30) return '30 min';
  if (mins === 60) return '1 hour';
  if (mins === 90) return '1.5 hr';
  return '2 hr';
}

export function locationLabel(loc: 'inperson' | 'video'): string {
  return loc === 'video' ? 'Video call' : 'In person';
}

/** Pilot tutor payout. $50/hr, same rate for every duration. */
export function payoutFor(mins: number): number {
  if (mins === 30) return 25;
  if (mins === 60) return 50;
  if (mins === 90) return 75;
  return 100;
}

function withSeconds(r: Omit<TutorRequest, 'secondsWaiting' | 'expiresAt'>): TutorRequest {
  // Mock: start the wait clock at the old timer string, then tick upward.
  return { ...r, secondsWaiting: parseTimerToSeconds(r.timer), expiresAt: null };
}

export const INITIAL_REQUESTS: Record<string, TutorRequest> = {
  req1: withSeconds({
    id: 'req1',
    name: 'A. L.',
    initials: 'AL',
    band: 'Sec 3 Express',
    continuity: '3rd session with you',
    subject: 'A Maths',
    topicKey: 'am_02',
    time: 'Today, 7:30pm',
    mins: 60,
    location: 'inperson',
    distance: '8 min away',
    note: 'Ch.2 Equations & Inequalities, with Ms. Tan — solid on factorising; still shaky on completing the square.',
    timer: '0:47',
  }),
  req2: withSeconds({
    id: 'req2',
    name: 'J. R.',
    initials: 'JR',
    band: 'Sec 4 Express',
    continuity: '1st session with you',
    subject: 'Physics',
    topicKey: 'ph_14',
    time: 'Today, 8:00pm',
    mins: 90,
    location: 'video',
    distance: null,
    note: null,
    timer: '1:12',
  }),
  req3: withSeconds({
    id: 'req3',
    name: 'S. K.',
    initials: 'SK',
    band: 'Sec 3 NA',
    continuity: '2nd session with you',
    subject: 'Chemistry',
    topicKey: 'cm_08',
    time: 'Today, 8:30pm',
    mins: 60,
    location: 'inperson',
    distance: '15 min away',
    note: 'Ch.4 Chemical Calculations — comfortable with moles, needs more practice on limiting reagent questions.',
    timer: '0:23',
  }),
  req4: withSeconds({
    id: 'req4',
    name: 'M. T.',
    initials: 'MT',
    band: 'Sec 4 Express',
    continuity: '5th session with you',
    subject: 'E Maths',
    topicKey: 'em_14',
    time: 'Today, 9:00pm',
    mins: 30,
    location: 'video',
    distance: null,
    note: 'Ch.7 Equations & Inequalities — strong overall; just double-check careless sign errors.',
    timer: '1:58',
  }),
  req5: withSeconds({
    id: 'req5',
    name: 'D. N.',
    initials: 'DN',
    band: 'Sec 3 Express',
    continuity: '1st session with you',
    subject: 'A Maths',
    topicKey: 'am_08',
    time: 'Tomorrow, 4:00pm',
    mins: 120,
    location: 'inperson',
    distance: '5 min away',
    note: null,
    timer: '2:30',
  }),
};

export const EXTRA_REQUEST: TutorRequest = withSeconds({
  id: 'req6',
  name: 'R. K.',
  initials: 'RK',
  band: 'Sec 3 NA',
  continuity: '1st session with you',
  subject: 'E Maths',
  topicKey: 'em_07',
  time: 'Today, 9:30pm',
  mins: 60,
  location: 'inperson',
  distance: '11 min away',
  note: null,
  timer: '3:00',
});

export const REQUEST_ORDER = ['req1', 'req2', 'req3', 'req4', 'req5'];

export const SCHEDULE_SEED: Record<string, ScheduleSeed> = {
  seed1: {
    id: 'seed1',
    name: 'P. W.',
    initials: 'PW',
    subject: 'Physics',
    topicKey: 'ph_02',
    time: 'Tomorrow, 6:00pm',
    mins: 60,
    location: 'video',
  },
  seed2: {
    id: 'seed2',
    name: 'A. L.',
    initials: 'AL',
    subject: 'A Maths',
    topicKey: 'am_08',
    time: 'Thu, 7:30pm',
    mins: 90,
    location: 'inperson',
  },
};

export const EARNINGS: EarningRow[] = [
  { subject: 'A Maths', chapterSpine: '9', time: 'Today, 7:30pm', student: 'A.L.', amount: 50, status: 'pending' },
  { subject: 'Physics', chapterSpine: '14', time: 'Yesterday, 4:00pm', student: 'J.R.', amount: 75, status: 'paid' },
  { subject: 'Chemistry', chapterSpine: '8', time: '2 days ago, 6:30pm', student: 'S.K.', amount: 50, status: 'paid' },
  { subject: 'E Maths', chapterSpine: '13', time: '3 days ago, 7:00pm', student: 'A.L.', amount: 100, status: 'paid' },
  { subject: 'A Maths', chapterSpine: '7', time: '5 days ago, 7:30pm', student: 'M.T.', amount: 50, status: 'paid' },
];

export const HANDOFF_NOTE =
  'Ch.8 Trigonometric Functions, with Ms. Tan — solid on factorising; still shaky on completing the square.';

export const DUMMY_ADDRESS = 'Ping Study Hub · 2 Science Drive 2, #01-08';
export const DUMMY_ADDRESS_PLAIN = 'Ping Study Hub, 2 Science Drive 2, #01-08';
export const DUMMY_ZOOM = 'zoom.us/j/88234015671';

/** Prefer a live session video link; demo confirm screens fall back to the sample Zoom room. */
export function resolveVideoJoinUrl(live?: string | null): string {
  const trimmed = live?.trim();
  return trimmed ? trimmed : DUMMY_ZOOM;
}

/** Ensure Linking.openURL gets a scheme. Dummy Zoom is stored without https://. */
export function openableUrl(raw: string): string {
  const trimmed = raw.trim();
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/+/, '')}`;
}

export function displayJoinTarget(raw: string): string {
  return raw.trim().replace(/^https?:\/\//i, '');
}

export function videoJoinLabel(raw: string): string {
  return /zoom\./i.test(raw) ? 'Join Zoom session' : 'Join video call';
}

export const AVAILABILITY_DAYS = [
  { key: 'mon', label: 'Monday', sub: 'evenings', on: true },
  { key: 'tue', label: 'Tuesday', sub: 'evenings', on: true },
  { key: 'wed', label: 'Wednesday', sub: 'evenings', on: false },
  { key: 'thu', label: 'Thursday', sub: 'evenings', on: true },
  { key: 'fri', label: 'Friday', sub: 'evenings', on: false },
  { key: 'sat', label: 'Saturday', sub: 'afternoons', on: true },
  { key: 'sun', label: 'Sunday', sub: 'afternoons', on: true },
];

export const TUTOR_SUBJECTS = ['A Maths', 'E Maths', 'Physics', 'Chemistry'];
export const STYLE_TAGS = ['Patient', 'Exam-focused', 'Visual explainer', 'Fast-paced', 'Encouraging'];

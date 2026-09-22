export type Topic = {
  id: string;
  spine: string;
  title: string;
  subject: string;
  subjectKey: 'amaths' | 'emaths' | 'physics' | 'chem';
  band: string;
  tag?: string;
  lastCovered?: string;
  highlight?: boolean;
};

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
  secondsLeft: number;
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

export const TOPICS: Record<string, Topic> = {
  ch9: {
    id: 'ch9',
    spine: '9',
    title: 'Quadratic Equations & Inequalities',
    subject: 'A Maths',
    subjectKey: 'amaths',
    band: 'G3',
    tag: 'Test in 5 days',
    highlight: true,
  },
  ch7: {
    id: 'ch7',
    spine: '7',
    title: 'Trigonometric Functions',
    subject: 'A Maths',
    subjectKey: 'amaths',
    band: 'G3',
    lastCovered: 'Last covered 2 weeks ago',
  },
  ch10: {
    id: 'ch10',
    spine: '10',
    title: 'Differentiation & Rates of Change',
    subject: 'A Maths',
    subjectKey: 'amaths',
    band: 'G3',
  },
  em13: {
    id: 'em13',
    spine: '13',
    title: "Pythagoras' Theorem & Trigonometry",
    subject: 'E Maths',
    subjectKey: 'emaths',
    band: 'G3',
    tag: 'Test in 4 days',
    highlight: true,
  },
  em7: {
    id: 'em7',
    spine: '7',
    title: 'Equations & Inequalities',
    subject: 'E Maths',
    subjectKey: 'emaths',
    band: 'G3',
    lastCovered: 'Last covered 1 week ago',
  },
  em14: {
    id: 'em14',
    spine: '14',
    title: 'Mensuration',
    subject: 'E Maths',
    subjectKey: 'emaths',
    band: 'G3',
  },
  ph14: {
    id: 'ph14',
    spine: '14',
    title: 'Current of Electricity',
    subject: 'Physics',
    subjectKey: 'physics',
    band: 'G3',
    tag: 'Test in 6 days',
    highlight: true,
  },
  ph2: {
    id: 'ph2',
    spine: '2',
    title: 'Kinematics',
    subject: 'Physics',
    subjectKey: 'physics',
    band: 'G3',
    lastCovered: 'Last covered 3 weeks ago',
  },
  ph18: {
    id: 'ph18',
    spine: '18',
    title: 'Electromagnetism',
    subject: 'Physics',
    subjectKey: 'physics',
    band: 'G3',
  },
  chem4: {
    id: 'chem4',
    spine: '4',
    title: 'Chemical Calculations',
    subject: 'Chemistry',
    subjectKey: 'chem',
    band: 'G3',
    tag: 'Test in 3 days',
    highlight: true,
  },
  chem8: {
    id: 'chem8',
    spine: '8',
    title: 'Patterns in the Periodic Table',
    subject: 'Chemistry',
    subjectKey: 'chem',
    band: 'G3',
    lastCovered: 'Last covered 1 week ago',
  },
  chem11: {
    id: 'chem11',
    spine: '11',
    title: 'Organic Chemistry',
    subject: 'Chemistry',
    subjectKey: 'chem',
    band: 'G3',
  },
};

export const SUBJECTS = [
  { key: 'amaths' as const, label: 'A Maths' },
  { key: 'emaths' as const, label: 'E Maths' },
  { key: 'physics' as const, label: 'Physics' },
  { key: 'chem' as const, label: 'Chem' },
];

export const DURATIONS = [
  { mins: 30, price: 10, label: '30 min' },
  { mins: 60, price: 20, label: '1 hour' },
  { mins: 90, price: 30, label: '1.5 hr' },
  { mins: 120, price: 40, label: '2 hr' },
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

export function durationLabel(mins: number): string {
  if (mins === 30) return '30 min';
  if (mins === 60) return '1 hour';
  if (mins === 90) return '1.5 hr';
  return '2 hr';
}

export function locationLabel(loc: 'inperson' | 'video'): string {
  return loc === 'video' ? 'Video call' : 'In person';
}

export function payoutFor(mins: number): number {
  if (mins === 30) return 8;
  if (mins === 60) return 16;
  if (mins === 90) return 24;
  return 32;
}

function withSeconds(r: Omit<TutorRequest, 'secondsLeft'>): TutorRequest {
  return { ...r, secondsLeft: parseTimerToSeconds(r.timer) };
}

export const INITIAL_REQUESTS: Record<string, TutorRequest> = {
  req1: withSeconds({
    id: 'req1',
    name: 'A. L.',
    initials: 'AL',
    band: 'Sec 3 Express',
    continuity: '3rd session with you',
    subject: 'A Maths',
    topicKey: 'ch9',
    time: 'Today, 7:30pm',
    mins: 60,
    location: 'inperson',
    distance: '8 min away',
    note: 'Ch.7 Trig Functions, with Ms. Tan — solid on factorising; still shaky on completing the square.',
    timer: '0:47',
  }),
  req2: withSeconds({
    id: 'req2',
    name: 'J. R.',
    initials: 'JR',
    band: 'Sec 4 Express',
    continuity: '1st session with you',
    subject: 'Physics',
    topicKey: 'ph14',
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
    topicKey: 'chem8',
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
    topicKey: 'em13',
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
    topicKey: 'ch7',
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
  topicKey: 'em7',
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
    topicKey: 'ph2',
    time: 'Tomorrow, 6:00pm',
    mins: 60,
    location: 'video',
  },
  seed2: {
    id: 'seed2',
    name: 'A. L.',
    initials: 'AL',
    subject: 'A Maths',
    topicKey: 'ch7',
    time: 'Thu, 7:30pm',
    mins: 90,
    location: 'inperson',
  },
};

export const EARNINGS: EarningRow[] = [
  { subject: 'A Maths', chapterSpine: '9', time: 'Today, 7:30pm', student: 'A.L.', amount: 16, status: 'pending' },
  { subject: 'Physics', chapterSpine: '14', time: 'Yesterday, 4:00pm', student: 'J.R.', amount: 24, status: 'paid' },
  { subject: 'Chemistry', chapterSpine: '8', time: '2 days ago, 6:30pm', student: 'S.K.', amount: 16, status: 'paid' },
  { subject: 'E Maths', chapterSpine: '13', time: '3 days ago, 7:00pm', student: 'A.L.', amount: 32, status: 'paid' },
  { subject: 'A Maths', chapterSpine: '7', time: '5 days ago, 7:30pm', student: 'M.T.', amount: 16, status: 'paid' },
];

export const HANDOFF_NOTE =
  'Ch.7 Trig Functions, with Ms. Tan — solid on factorising; still shaky on completing the square.';

export const DUMMY_ADDRESS = 'Chaptr Study Hub · 2 Science Drive 2, #01-08';
export const DUMMY_ADDRESS_PLAIN = 'Chaptr Study Hub, 2 Science Drive 2, #01-08';
export const DUMMY_ZOOM = 'zoom.us/j/88234015671';

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

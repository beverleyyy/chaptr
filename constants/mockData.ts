import type { CurriculumSubjectKey } from '@/constants/curriculum';
import { CURRICULUM_SUBJECTS } from '@/constants/curriculum';
import { colors } from '@/constants/theme';

export type Topic = {
  id: string;
  spine: string;
  title: string;
  subject: string;
  subjectKey: CurriculumSubjectKey;
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
  /** Seconds the student has been waiting (elapsed since created_at). */
  secondsWaiting: number;
  /** ISO expiry for prune; omit in pure mock rows that never auto-expire. */
  expiresAt?: string | null;
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
  // English Language
  eng1: {
    id: 'eng1',
    spine: '1',
    title: 'Continuous Writing & Situational Writing',
    subject: 'English',
    subjectKey: 'english',
    band: 'G3',
    highlight: true,
  },
  eng2: {
    id: 'eng2',
    spine: '2',
    title: 'Comprehension & Summary',
    subject: 'English',
    subjectKey: 'english',
    band: 'G3',
  },
  eng3: {
    id: 'eng3',
    spine: '3',
    title: 'Oral Communication & Listening',
    subject: 'English',
    subjectKey: 'english',
    band: 'G3',
  },
  // Biology
  bio1: {
    id: 'bio1',
    spine: '1',
    title: 'Cell Structure & Organisation',
    subject: 'Biology',
    subjectKey: 'biology',
    band: 'G3',
    highlight: true,
  },
  bio2: {
    id: 'bio2',
    spine: '2',
    title: 'Nutrition & Transport in Humans',
    subject: 'Biology',
    subjectKey: 'biology',
    band: 'G3',
  },
  bio3: {
    id: 'bio3',
    spine: '3',
    title: 'Coordination & Response',
    subject: 'Biology',
    subjectKey: 'biology',
    band: 'G3',
  },
  // Mother Tongue — Chinese
  zh1: {
    id: 'zh1',
    spine: '1',
    title: 'Paper 1 Composition',
    subject: 'Chinese',
    subjectKey: 'chinese',
    band: 'G3',
    highlight: true,
  },
  zh2: {
    id: 'zh2',
    spine: '2',
    title: 'Comprehension & Cloze',
    subject: 'Chinese',
    subjectKey: 'chinese',
    band: 'G3',
  },
  zh3: {
    id: 'zh3',
    spine: '3',
    title: 'Oral & Listening Comprehension',
    subject: 'Chinese',
    subjectKey: 'chinese',
    band: 'G3',
  },
  // Mother Tongue — Malay
  ms1: {
    id: 'ms1',
    spine: '1',
    title: 'Karangan (Composition)',
    subject: 'Malay',
    subjectKey: 'malay',
    band: 'G3',
    highlight: true,
  },
  ms2: {
    id: 'ms2',
    spine: '2',
    title: 'Kefahaman & Cloze',
    subject: 'Malay',
    subjectKey: 'malay',
    band: 'G3',
  },
  ms3: {
    id: 'ms3',
    spine: '3',
    title: 'Lisan & Pendengaran',
    subject: 'Malay',
    subjectKey: 'malay',
    band: 'G3',
  },
  // Mother Tongue — Tamil
  ta1: {
    id: 'ta1',
    spine: '1',
    title: 'Composition & Letter Writing',
    subject: 'Tamil',
    subjectKey: 'tamil',
    band: 'G3',
    highlight: true,
  },
  ta2: {
    id: 'ta2',
    spine: '2',
    title: 'Comprehension & Language Use',
    subject: 'Tamil',
    subjectKey: 'tamil',
    band: 'G3',
  },
  ta3: {
    id: 'ta3',
    spine: '3',
    title: 'Oral & Listening',
    subject: 'Tamil',
    subjectKey: 'tamil',
    band: 'G3',
  },
  // Combined Science — Physics/Chemistry
  cspc1: {
    id: 'cspc1',
    spine: '1',
    title: 'Forces, Pressure & Energy',
    subject: 'CS Phy/Chem',
    subjectKey: 'cs_phy_chem',
    band: 'G3',
    highlight: true,
  },
  cspc2: {
    id: 'cspc2',
    spine: '2',
    title: 'Atomic Structure & Chemical Bonding',
    subject: 'CS Phy/Chem',
    subjectKey: 'cs_phy_chem',
    band: 'G3',
  },
  cspc3: {
    id: 'cspc3',
    spine: '3',
    title: 'Electricity & Chemical Reactions',
    subject: 'CS Phy/Chem',
    subjectKey: 'cs_phy_chem',
    band: 'G3',
  },
  // Combined Science — Chemistry/Biology
  cscb1: {
    id: 'cscb1',
    spine: '1',
    title: 'Chemical Bonding & Stoichiometry',
    subject: 'CS Chem/Bio',
    subjectKey: 'cs_chem_bio',
    band: 'G3',
    highlight: true,
  },
  cscb2: {
    id: 'cscb2',
    spine: '2',
    title: 'Cell Biology & Enzymes',
    subject: 'CS Chem/Bio',
    subjectKey: 'cs_chem_bio',
    band: 'G3',
  },
  cscb3: {
    id: 'cscb3',
    spine: '3',
    title: 'Acids, Bases & Human Physiology',
    subject: 'CS Chem/Bio',
    subjectKey: 'cs_chem_bio',
    band: 'G3',
  },
  // Combined Science — Physics/Biology
  cspb1: {
    id: 'cspb1',
    spine: '1',
    title: 'Kinematics & Forces',
    subject: 'CS Phy/Bio',
    subjectKey: 'cs_phy_bio',
    band: 'G3',
    highlight: true,
  },
  cspb2: {
    id: 'cspb2',
    spine: '2',
    title: 'Energy & Waves',
    subject: 'CS Phy/Bio',
    subjectKey: 'cs_phy_bio',
    band: 'G3',
  },
  cspb3: {
    id: 'cspb3',
    spine: '3',
    title: 'Transport & Coordination in Humans',
    subject: 'CS Phy/Bio',
    subjectKey: 'cs_phy_bio',
    band: 'G3',
  },
  // Geography
  geo1: {
    id: 'geo1',
    spine: '1',
    title: 'Plate Tectonics & Weathering',
    subject: 'Geography',
    subjectKey: 'geography',
    band: 'G3',
    highlight: true,
  },
  geo2: {
    id: 'geo2',
    spine: '2',
    title: 'Weather & Climate',
    subject: 'Geography',
    subjectKey: 'geography',
    band: 'G3',
  },
  geo3: {
    id: 'geo3',
    spine: '3',
    title: 'Tourism & Living with Tectonic Hazards',
    subject: 'Geography',
    subjectKey: 'geography',
    band: 'G3',
  },
  // History
  hist1: {
    id: 'hist1',
    spine: '1',
    title: 'Source-Based Skills',
    subject: 'History',
    subjectKey: 'history',
    band: 'G3',
    highlight: true,
  },
  hist2: {
    id: 'hist2',
    spine: '2',
    title: 'Outbreak of WWII in Asia-Pacific',
    subject: 'History',
    subjectKey: 'history',
    band: 'G3',
  },
  hist3: {
    id: 'hist3',
    spine: '3',
    title: 'Cold War & Decolonisation',
    subject: 'History',
    subjectKey: 'history',
    band: 'G3',
  },
  // Literature in English
  lit1: {
    id: 'lit1',
    spine: '1',
    title: 'Poetry Analysis',
    subject: 'Literature',
    subjectKey: 'literature',
    band: 'G3',
    highlight: true,
  },
  lit2: {
    id: 'lit2',
    spine: '2',
    title: 'Prose & Unseen Texts',
    subject: 'Literature',
    subjectKey: 'literature',
    band: 'G3',
  },
  lit3: {
    id: 'lit3',
    spine: '3',
    title: 'Drama & Set Texts',
    subject: 'Literature',
    subjectKey: 'literature',
    band: 'G3',
  },
  // Principles of Accounts
  poa1: {
    id: 'poa1',
    spine: '1',
    title: 'Double-Entry & Journals',
    subject: 'POA',
    subjectKey: 'poa',
    band: 'G3',
    highlight: true,
  },
  poa2: {
    id: 'poa2',
    spine: '2',
    title: 'Ledger Accounts & Trial Balance',
    subject: 'POA',
    subjectKey: 'poa',
    band: 'G3',
  },
  poa3: {
    id: 'poa3',
    spine: '3',
    title: 'Financial Statements',
    subject: 'POA',
    subjectKey: 'poa',
    band: 'G3',
  },
  // Computing
  cmp1: {
    id: 'cmp1',
    spine: '1',
    title: 'Algorithms & Flowcharts',
    subject: 'Computing',
    subjectKey: 'computing',
    band: 'G3',
    highlight: true,
  },
  cmp2: {
    id: 'cmp2',
    spine: '2',
    title: 'Python Programming Basics',
    subject: 'Computing',
    subjectKey: 'computing',
    band: 'G3',
  },
  cmp3: {
    id: 'cmp3',
    spine: '3',
    title: 'Data Structures & Networks',
    subject: 'Computing',
    subjectKey: 'computing',
    band: 'G3',
  },
};

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
    .map((t) => (level ? { ...t, band: level } : t));
}

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

export function payoutFor(mins: number): number {
  if (mins === 30) return 8;
  if (mins === 60) return 16;
  if (mins === 90) return 24;
  return 32;
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

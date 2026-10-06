/**
 * Local sample data for the investor demo.
 * Pilot wedge: Singapore Sec 3–4 E-Math, video sessions, weeknights.
 * Nothing here is loaded from or written to Supabase.
 */
import type { StudentCurriculumEntry } from '@/constants/curriculum';
import type { EarningRow, ScheduleSeed, TutorRequest } from '@/constants/mockData';
import type { StudentInsights } from '@/constants/studentProfile';
import type { MatchedTutorInfo } from '@/lib/requestsApi';
import type { StudentTest } from '@/lib/testsApi';
import { calendarDaysUntil, singaporeToday } from '@/lib/testsApi';

export type DemoTutor = {
  id: string;
  name: string;
  initials: string;
  credential: string;
  school: string;
  rating: string;
  sessions: string;
  focus: string;
};

export const DEMO_STUDENT = {
  name: 'Aiden Tan',
  firstName: 'Aiden',
  initials: 'AT',
  schoolYear: 'Sec 4' as const,
  school: 'Victoria School',
  summary: 'Sec 4 · Victoria School · E-Math G3',
  weaknessLine: 'Weak on completing the square and the sine rule',
};

export const DEMO_TUTORS: DemoTutor[] = [
  {
    id: 'tan',
    name: 'Ms. Tan Wei Ling',
    initials: 'WT',
    credential: 'NUS Mathematics (Hons)',
    school: 'Relief teaching, Raffles Institution',
    rating: '4.9',
    sessions: '128 sessions',
    focus: 'Sec 4 E-Math · weeknight video',
  },
  {
    id: 'koh',
    name: 'Mr. Darren Koh',
    initials: 'DK',
    credential: 'NTU Mathematical Sciences',
    school: 'Hwa Chong Institution alumnus',
    rating: '4.8',
    sessions: '96 sessions',
    focus: 'Sec 3–4 E-Math · video',
  },
  {
    id: 'menon',
    name: 'Ms. Priya Menon',
    initials: 'PM',
    credential: 'NIE PGDE (Mathematics)',
    school: 'MOE-trained · Victoria School',
    rating: '4.9',
    sessions: '154 sessions',
    focus: 'Sec 4 prelim revision',
  },
];

/** The tutor whose dashboard the pitch opens on. */
export const DEMO_TUTOR_SELF = DEMO_TUTORS[0];

export const DEMO_TUTOR_BIO =
  'NUS Mathematics (Honours). I teach Sec 3–4 E-Math on weeknight video calls — exam questions first, then a handoff note so the next tutor can continue.';

export const DEMO_CURRICULUM: StudentCurriculumEntry[] = [
  { subjectKey: 'emaths', level: 'G3' },
  { subjectKey: 'amaths', level: 'G3' },
];

export const DEMO_INSIGHTS: StudentInsights = {
  schoolYear: 'Sec 4',
  tutoringGoal: 'upcoming_test',
  tutorNotes: 'Likes a worked example before he tries the exam question himself.',
  preferredLanguage: 'english',
  weaknessNotes:
    'Still shaky on completing the square and the sine rule. Fine with straightforward factorising.',
};

export const DEMO_WEAKNESSES = ['em_07', 'em_14'];

export const DEMO_BOOKING = {
  topicId: 'em_14',
  mins: 60,
  price: 35,
  location: 'video' as const,
};

function addDays(ymd: string, days: number): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

/** Upcoming tests relative to Singapore today so home tags stay fresh. */
export function demoStudentTests(today = singaporeToday()): StudentTest[] {
  const createdAt = new Date().toISOString();
  return [
    {
      id: 'demo_test_trig',
      topicKey: 'em_14',
      testDate: addDays(today, 4),
      label: 'Weighted assessment',
      createdAt,
    },
    {
      id: 'demo_test_eq',
      topicKey: 'em_07',
      testDate: addDays(today, 16),
      label: 'Common test',
      createdAt,
    },
  ];
}

export function demoPrelimLabel(today = singaporeToday()): string {
  const days = calendarDaysUntil(addDays(today, 4), today);
  if (days === 0) return 'Trig WA today';
  if (days === 1) return 'Trig WA tomorrow';
  return `Trig WA in ${days} days`;
}

function request(
  partial: Omit<TutorRequest, 'secondsWaiting' | 'expiresAt'> & { secondsWaiting: number },
): TutorRequest {
  return { ...partial, expiresAt: null };
}

/**
 * Wait clocks are seeded inside the colour bands:
 * green under 5 min, amber 5–10, red over 10.
 * The live ticker in AppContext keeps counting up from these.
 */
export const DEMO_REQUESTS: Record<string, TutorRequest> = {
  dreq_fresh: request({
    id: 'dreq_fresh',
    name: 'Nur A.',
    initials: 'NA',
    band: 'Sec 3',
    continuity: '1st session with you',
    subject: 'E Maths',
    topicKey: 'em_06',
    time: 'Tonight, 7:30pm',
    mins: 60,
    location: 'video',
    distance: null,
    note: null,
    timer: '2:10',
    secondsWaiting: 2 * 60 + 10,
    tutorInsight: 'Sec 3 E-Math. Wants help turning word problems into algebra before the WA.',
    videoLink: null,
  }),
  dreq_aging: request({
    id: 'dreq_aging',
    name: 'Lucas G.',
    initials: 'LG',
    band: 'Sec 4',
    continuity: '2nd session with you',
    subject: 'E Maths',
    topicKey: 'em_07',
    time: 'Tonight, 8:15pm',
    mins: 90,
    location: 'video',
    distance: null,
    note: 'Ch.7 Equations & Inequalities — solid on factorising; still shaky on completing the square.',
    timer: '6:40',
    secondsWaiting: 6 * 60 + 40,
    tutorInsight: 'Sec 4, Victoria School. Common test in just over two weeks. Completing the square is the gap.',
    videoLink: null,
  }),
  dreq_urgent: request({
    id: 'dreq_urgent',
    name: 'Megan C.',
    initials: 'MC',
    band: 'Sec 4',
    continuity: '3rd session with you',
    subject: 'E Maths',
    topicKey: 'em_14',
    time: 'Tonight, 9:00pm',
    mins: 30,
    location: 'video',
    distance: null,
    note: "Ch.14 Pythagoras & Trigonometry — sine rule questions from last week's handoff are still open.",
    timer: '13:20',
    secondsWaiting: 13 * 60 + 20,
    tutorInsight: 'Sec 4. Weighted assessment on trigonometry in a few days. Has been waiting past 10 minutes.',
    videoLink: null,
  }),
  dreq_confirmed: request({
    id: 'dreq_confirmed',
    name: 'Hannah L.',
    initials: 'HL',
    band: 'Sec 4',
    continuity: '4th session with you',
    subject: 'E Maths',
    topicKey: 'em_14',
    time: 'Today, 6:30pm',
    mins: 60,
    location: 'video',
    distance: null,
    note: null,
    timer: '0:00',
    secondsWaiting: 0,
    videoLink: 'https://zoom.us/j/88234015671',
  }),
};

export const DEMO_PENDING_IDS = ['dreq_fresh', 'dreq_aging', 'dreq_urgent'];
export const DEMO_ACCEPTED_IDS = ['dreq_confirmed'];

export const DEMO_SCHEDULE: Record<string, ScheduleSeed> = {
  dseed_wed: {
    id: 'dseed_wed',
    name: 'Lucas G.',
    initials: 'LG',
    subject: 'E Maths',
    topicKey: 'em_07',
    time: 'Wed, 8:00pm',
    mins: 60,
    location: 'video',
  },
  dseed_thu: {
    id: 'dseed_thu',
    name: 'Nur A.',
    initials: 'NA',
    subject: 'E Maths',
    topicKey: 'em_09',
    time: 'Thu, 7:30pm',
    mins: 90,
    location: 'video',
  },
};

/** Tutor payout tiers: $25 / $50 / $75 / $100. */
export const DEMO_EARNINGS: EarningRow[] = [
  {
    subject: 'E Maths',
    chapterSpine: '14',
    time: 'Today, 6:30pm',
    student: 'Hannah L.',
    amount: 50,
    status: 'pending',
  },
  {
    subject: 'E Maths',
    chapterSpine: '7',
    time: 'Yesterday, 8:15pm',
    student: 'Lucas G.',
    amount: 75,
    status: 'paid',
  },
  {
    subject: 'E Maths',
    chapterSpine: '6',
    time: 'Mon, 7:30pm',
    student: 'Nur A.',
    amount: 25,
    status: 'paid',
  },
  {
    subject: 'E Maths',
    chapterSpine: '9',
    time: 'Thu, 7:00pm',
    student: 'Megan C.',
    amount: 100,
    status: 'paid',
  },
];

export const DEMO_WEEK_TOTAL = 250;
export const DEMO_WEEK_SESSIONS = 4;
/** Paid rows only — the tonight session is still pending. */
export const DEMO_AVAILABLE_BALANCE = 200;

export const DEMO_AVAILABILITY: Record<string, boolean> = {
  mon: true,
  tue: true,
  wed: true,
  thu: true,
  fri: true,
  sat: false,
  sun: false,
};

export function demoMatchedTutor(input: {
  topicKey: string;
  subject: string;
  mins: number;
  location: 'inperson' | 'video';
}): MatchedTutorInfo {
  const tutor = DEMO_TUTORS[0];
  const video = input.location === 'video';
  return {
    requestId: 'demo-booking',
    sessionId: 'demo-session',
    tutorId: tutor.id,
    name: tutor.name,
    initials: tutor.initials,
    subject: input.subject,
    topicKey: input.topicKey,
    mins: input.mins,
    location: input.location,
    scheduledLabel: 'Tonight, 7:30pm',
    videoLink: video ? 'https://zoom.us/j/88234015671' : null,
    credential: `${tutor.credential} · ${tutor.school}`,
    ratingLabel: `★ ${tutor.rating} (${tutor.sessions})`,
  };
}

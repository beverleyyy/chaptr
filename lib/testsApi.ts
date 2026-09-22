/**
 * Student test dates (topic/chapter + calendar date) for home tags.
 * Supabase when configured; AsyncStorage offline demo fallback.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { TOPICS } from '@/constants/mockData';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

export const TESTS_STORAGE_KEY = 'chaptr_student_tests_v1';

/** Highlight spine when an upcoming test is within this many calendar days. */
export const TEST_HIGHLIGHT_DAYS = 7;

export const TEST_LABEL_PRESETS = [
  'Weighted assessment',
  'Common test',
  'Class test',
  'Exam',
] as const;

export type StudentTest = {
  id: string;
  topicKey: string;
  testDate: string; // YYYY-MM-DD
  label: string | null;
  createdAt: string;
};

type DbRow = {
  id: string;
  topic_key: string;
  test_date: string;
  label: string | null;
  created_at: string;
};

function fromRow(row: DbRow): StudentTest {
  return {
    id: row.id,
    topicKey: row.topic_key,
    testDate: String(row.test_date).slice(0, 10),
    label: row.label,
    createdAt: row.created_at,
  };
}

function newLocalId(): string {
  return `test_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Today's calendar date in Asia/Singapore as YYYY-MM-DD. */
export function singaporeToday(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Singapore',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/** Calendar-day delta from Singapore today to YYYY-MM-DD (negative = past). */
export function calendarDaysUntil(testDate: string, today = singaporeToday()): number {
  const [ty, tm, td] = today.split('-').map(Number);
  const [dy, dm, dd] = testDate.split('-').map(Number);
  if (![ty, tm, td, dy, dm, dd].every((n) => Number.isFinite(n))) return NaN;
  const t0 = Date.UTC(ty, tm - 1, td);
  const t1 = Date.UTC(dy, dm - 1, dd);
  return Math.round((t1 - t0) / 86_400_000);
}

export function formatTestTag(days: number): string | null {
  if (!Number.isFinite(days) || days < 0) return null;
  if (days === 0) return 'Test today';
  if (days === 1) return 'Test tomorrow';
  return `Test in ${days} days`;
}

export function isValidYmd(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

export function upcomingTests(tests: StudentTest[], today = singaporeToday()): StudentTest[] {
  return tests
    .filter((t) => calendarDaysUntil(t.testDate, today) >= 0)
    .sort((a, b) => a.testDate.localeCompare(b.testDate) || a.createdAt.localeCompare(b.createdAt));
}

/** Soonest upcoming test per topic_key. */
export function soonestTestByTopic(
  tests: StudentTest[],
  today = singaporeToday(),
): Map<string, StudentTest> {
  const map = new Map<string, StudentTest>();
  for (const t of upcomingTests(tests, today)) {
    if (!map.has(t.topicKey)) map.set(t.topicKey, t);
  }
  return map;
}

export function tagForTopic(
  topicKey: string,
  byTopic: Map<string, StudentTest>,
  today = singaporeToday(),
): { tag?: string; highlight: boolean } {
  const test = byTopic.get(topicKey);
  if (!test) return { highlight: false };
  const days = calendarDaysUntil(test.testDate, today);
  const tag = formatTestTag(days) ?? undefined;
  return {
    tag,
    highlight: tag != null && days <= TEST_HIGHLIGHT_DAYS,
  };
}

export async function loadLocalTests(): Promise<StudentTest[]> {
  try {
    const raw = await AsyncStorage.getItem(TESTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: StudentTest[] = [];
    for (const item of parsed) {
      const row = item as Partial<StudentTest>;
      if (!row.id || !row.topicKey || !row.testDate) continue;
      if (!TOPICS[row.topicKey]) continue;
      if (!isValidYmd(row.testDate)) continue;
      out.push({
        id: row.id,
        topicKey: row.topicKey,
        testDate: row.testDate,
        label: row.label ?? null,
        createdAt: row.createdAt ?? new Date().toISOString(),
      });
    }
    return out;
  } catch {
    return [];
  }
}

async function saveLocalTests(tests: StudentTest[]): Promise<StudentTest[]> {
  await AsyncStorage.setItem(TESTS_STORAGE_KEY, JSON.stringify(tests));
  return tests;
}

export async function fetchStudentTests(studentId: string): Promise<StudentTest[]> {
  const sb = getSupabase();
  if (!sb) return loadLocalTests();

  const { data, error } = await sb
    .from('student_tests')
    .select('id, topic_key, test_date, label, created_at')
    .eq('student_id', studentId)
    .order('test_date', { ascending: true });

  if (error) {
    console.warn('fetchStudentTests', error.message);
    throw error;
  }
  return ((data ?? []) as DbRow[]).map(fromRow);
}

export type TestInput = {
  topicKey: string;
  testDate: string;
  label?: string | null;
};

function validateInput(input: TestInput): void {
  if (!TOPICS[input.topicKey]) throw new Error('Unknown topic');
  if (!isValidYmd(input.testDate)) throw new Error('Enter a valid date (YYYY-MM-DD)');
  const label = input.label?.trim() || null;
  if (label && label.length > 80) throw new Error('Label is too long');
}

export async function createStudentTest(input: TestInput): Promise<StudentTest> {
  validateInput(input);
  const label = input.label?.trim() || null;

  if (!isSupabaseConfigured) {
    const list = await loadLocalTests();
    const row: StudentTest = {
      id: newLocalId(),
      topicKey: input.topicKey,
      testDate: input.testDate,
      label,
      createdAt: new Date().toISOString(),
    };
    await saveLocalTests([...list, row]);
    return row;
  }

  const sb = getSupabase();
  if (!sb) {
    const list = await loadLocalTests();
    const row: StudentTest = {
      id: newLocalId(),
      topicKey: input.topicKey,
      testDate: input.testDate,
      label,
      createdAt: new Date().toISOString(),
    };
    await saveLocalTests([...list, row]);
    return row;
  }

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const { data, error } = await sb
    .from('student_tests')
    .insert({
      student_id: user.id,
      topic_key: input.topicKey,
      test_date: input.testDate,
      label,
    })
    .select('id, topic_key, test_date, label, created_at')
    .single();

  if (error) throw error;
  return fromRow(data as DbRow);
}

export async function updateStudentTest(
  id: string,
  input: TestInput,
): Promise<StudentTest> {
  validateInput(input);
  const label = input.label?.trim() || null;

  if (!isSupabaseConfigured) {
    const list = await loadLocalTests();
    const idx = list.findIndex((t) => t.id === id);
    if (idx < 0) throw new Error('Test not found');
    const next = [...list];
    next[idx] = {
      ...next[idx],
      topicKey: input.topicKey,
      testDate: input.testDate,
      label,
    };
    await saveLocalTests(next);
    return next[idx];
  }

  const sb = getSupabase();
  if (!sb) {
    const list = await loadLocalTests();
    const idx = list.findIndex((t) => t.id === id);
    if (idx < 0) throw new Error('Test not found');
    const next = [...list];
    next[idx] = {
      ...next[idx],
      topicKey: input.topicKey,
      testDate: input.testDate,
      label,
    };
    await saveLocalTests(next);
    return next[idx];
  }

  const { data, error } = await sb
    .from('student_tests')
    .update({
      topic_key: input.topicKey,
      test_date: input.testDate,
      label,
    })
    .eq('id', id)
    .select('id, topic_key, test_date, label, created_at')
    .single();

  if (error) throw error;
  return fromRow(data as DbRow);
}

export async function deleteStudentTest(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const list = await loadLocalTests();
    await saveLocalTests(list.filter((t) => t.id !== id));
    return;
  }

  const sb = getSupabase();
  if (!sb) {
    const list = await loadLocalTests();
    await saveLocalTests(list.filter((t) => t.id !== id));
    return;
  }

  const { error } = await sb.from('student_tests').delete().eq('id', id);
  if (error) throw error;
}

export function formatDisplayDate(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number);
  if (![y, m, d].every((n) => Number.isFinite(n))) return ymd;
  return new Intl.DateTimeFormat('en-SG', {
    timeZone: 'Asia/Singapore',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(Date.UTC(y, m - 1, d, 12)));
}

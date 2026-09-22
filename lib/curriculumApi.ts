import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CURRICULUM_STORAGE_KEY,
  isCurriculumSubjectKey,
  isSubjectLevel,
  type CurriculumSubjectKey,
  type StudentCurriculumEntry,
  type SubjectLevel,
} from '@/constants/curriculum';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

type CurriculumRow = {
  subject_key: string;
  level: string;
};

function parseEntries(rows: CurriculumRow[]): StudentCurriculumEntry[] {
  const out: StudentCurriculumEntry[] = [];
  for (const row of rows) {
    if (!isCurriculumSubjectKey(row.subject_key) || !isSubjectLevel(row.level)) continue;
    out.push({ subjectKey: row.subject_key, level: row.level });
  }
  return out;
}

export async function loadLocalCurriculum(): Promise<StudentCurriculumEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(CURRICULUM_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parseEntries(
      parsed.map((item) => {
        const row = item as Partial<StudentCurriculumEntry & CurriculumRow>;
        return {
          subject_key: row.subjectKey ?? row.subject_key ?? '',
          level: row.level ?? '',
        };
      }),
    );
  } catch {
    return [];
  }
}

export async function saveLocalCurriculum(
  entries: StudentCurriculumEntry[],
): Promise<StudentCurriculumEntry[]> {
  await AsyncStorage.setItem(CURRICULUM_STORAGE_KEY, JSON.stringify(entries));
  return entries;
}

export async function fetchStudentCurriculum(
  studentId: string,
): Promise<StudentCurriculumEntry[]> {
  const sb = getSupabase();
  if (!sb) return loadLocalCurriculum();

  const { data, error } = await sb
    .from('student_curriculum')
    .select('subject_key, level')
    .eq('student_id', studentId)
    .order('created_at', { ascending: true });

  if (error) {
    console.warn('fetchStudentCurriculum', error.message);
    throw error;
  }
  return parseEntries((data ?? []) as CurriculumRow[]);
}

export async function saveStudentCurriculum(
  entries: StudentCurriculumEntry[],
): Promise<StudentCurriculumEntry[]> {
  if (entries.length < 1) {
    throw new Error('Select at least one subject with a level');
  }
  for (const e of entries) {
    if (!isCurriculumSubjectKey(e.subjectKey) || !isSubjectLevel(e.level)) {
      throw new Error('Invalid subject or level');
    }
  }

  if (!isSupabaseConfigured) {
    return saveLocalCurriculum(entries);
  }

  const sb = getSupabase();
  if (!sb) return saveLocalCurriculum(entries);

  const payload = entries.map((e) => ({
    subject_key: e.subjectKey,
    level: e.level,
  }));

  const { data, error } = await sb.rpc('ensure_my_curriculum', { p_items: payload });
  if (error) {
    console.warn('ensure_my_curriculum', error.message);
    // Fallback: direct table replace if RPC missing
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) throw error;

    await sb.from('student_curriculum').delete().eq('student_id', user.id);
    const { error: insErr } = await sb.from('student_curriculum').insert(
      entries.map((e) => ({
        student_id: user.id,
        subject_key: e.subjectKey,
        level: e.level,
      })),
    );
    if (insErr) throw insErr;

    await sb
      .from('profiles')
      .update({ curriculum_completed_at: new Date().toISOString() })
      .eq('id', user.id)
      .is('curriculum_completed_at', null);

    return fetchStudentCurriculum(user.id);
  }

  return parseEntries((data ?? []) as CurriculumRow[]);
}

export function levelForSubject(
  curriculum: StudentCurriculumEntry[],
  subjectKey: CurriculumSubjectKey,
): SubjectLevel | undefined {
  return curriculum.find((c) => c.subjectKey === subjectKey)?.level;
}

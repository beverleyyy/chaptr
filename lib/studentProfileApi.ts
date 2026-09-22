/**
 * Optional student profile insights + chapter weaknesses.
 * Supabase when configured; AsyncStorage offline demo fallback.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { TOPICS } from '@/constants/mockData';
import {
  EMPTY_INSIGHTS,
  isPreferredLanguageKey,
  isSchoolYear,
  isTutoringGoalKey,
  preferredLanguageLabel,
  tutoringGoalLabel,
  type StudentInsights,
} from '@/constants/studentProfile';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Profile } from '@/lib/types';

export const INSIGHTS_STORAGE_KEY = 'chaptr_student_insights_v1';
export const WEAKNESSES_STORAGE_KEY = 'chaptr_student_weaknesses_v1';

type LocalBundle = {
  insights: StudentInsights;
  weaknessTopicKeys: string[];
};

function normalizeInsights(raw: Partial<StudentInsights> | null | undefined): StudentInsights {
  return {
    schoolYear: isSchoolYear(raw?.schoolYear ?? null) ? raw!.schoolYear! : null,
    tutoringGoal: isTutoringGoalKey(raw?.tutoringGoal ?? null) ? raw!.tutoringGoal! : null,
    tutorNotes: raw?.tutorNotes?.trim() ? raw.tutorNotes.trim().slice(0, 1000) : null,
    preferredLanguage: isPreferredLanguageKey(raw?.preferredLanguage ?? null)
      ? raw!.preferredLanguage!
      : null,
    weaknessNotes: raw?.weaknessNotes?.trim()
      ? raw.weaknessNotes.trim().slice(0, 500)
      : null,
  };
}

export function insightsFromProfile(profile: Profile | null | undefined): StudentInsights {
  if (!profile) return { ...EMPTY_INSIGHTS };
  return normalizeInsights({
    schoolYear: isSchoolYear(profile.school_year) ? profile.school_year : null,
    tutoringGoal: isTutoringGoalKey(profile.tutoring_goal) ? profile.tutoring_goal : null,
    tutorNotes: profile.tutor_notes ?? null,
    preferredLanguage: isPreferredLanguageKey(profile.preferred_language)
      ? profile.preferred_language
      : null,
    weaknessNotes: profile.weakness_notes ?? null,
  });
}

export async function loadLocalInsightsBundle(): Promise<LocalBundle> {
  try {
    const [insightsRaw, weakRaw] = await Promise.all([
      AsyncStorage.getItem(INSIGHTS_STORAGE_KEY),
      AsyncStorage.getItem(WEAKNESSES_STORAGE_KEY),
    ]);
    let insights = { ...EMPTY_INSIGHTS };
    if (insightsRaw) {
      insights = normalizeInsights(JSON.parse(insightsRaw) as Partial<StudentInsights>);
    }
    let weaknessTopicKeys: string[] = [];
    if (weakRaw) {
      const parsed = JSON.parse(weakRaw) as unknown;
      if (Array.isArray(parsed)) {
        weaknessTopicKeys = parsed.filter(
          (k): k is string => typeof k === 'string' && !!TOPICS[k],
        );
      }
    }
    return { insights, weaknessTopicKeys };
  } catch {
    return { insights: { ...EMPTY_INSIGHTS }, weaknessTopicKeys: [] };
  }
}

export async function saveLocalInsights(insights: StudentInsights): Promise<StudentInsights> {
  const next = normalizeInsights(insights);
  await AsyncStorage.setItem(INSIGHTS_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export async function saveLocalWeaknesses(topicKeys: string[]): Promise<string[]> {
  const next = [...new Set(topicKeys.filter((k) => !!TOPICS[k]))];
  await AsyncStorage.setItem(WEAKNESSES_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export async function fetchStudentWeaknesses(studentId: string): Promise<string[]> {
  const sb = getSupabase();
  if (!sb) {
    const local = await loadLocalInsightsBundle();
    return local.weaknessTopicKeys;
  }
  const { data, error } = await sb
    .from('student_weaknesses')
    .select('topic_key')
    .eq('student_id', studentId);
  if (error) {
    console.warn('fetchStudentWeaknesses', error.message);
    throw error;
  }
  return (data ?? [])
    .map((r) => (r as { topic_key: string }).topic_key)
    .filter((k) => !!TOPICS[k]);
}

export async function fetchWeaknessesForStudents(
  studentIds: string[],
): Promise<Record<string, string[]>> {
  const unique = [...new Set(studentIds.filter(Boolean))];
  const out: Record<string, string[]> = {};
  for (const id of unique) out[id] = [];
  if (!unique.length) return out;

  const sb = getSupabase();
  if (!sb) return out;

  const { data, error } = await sb
    .from('student_weaknesses')
    .select('student_id, topic_key')
    .in('student_id', unique);
  if (error) {
    console.warn('fetchWeaknessesForStudents', error.message);
    return out;
  }
  for (const row of data ?? []) {
    const r = row as { student_id: string; topic_key: string };
    if (!TOPICS[r.topic_key]) continue;
    if (!out[r.student_id]) out[r.student_id] = [];
    out[r.student_id].push(r.topic_key);
  }
  return out;
}

export async function saveStudentInsights(insights: StudentInsights): Promise<StudentInsights> {
  const next = normalizeInsights(insights);

  if (!isSupabaseConfigured) {
    return saveLocalInsights(next);
  }

  const sb = getSupabase();
  if (!sb) return saveLocalInsights(next);

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const { error } = await sb
    .from('profiles')
    .update({
      school_year: next.schoolYear,
      tutoring_goal: next.tutoringGoal,
      tutor_notes: next.tutorNotes,
      preferred_language: next.preferredLanguage,
      weakness_notes: next.weaknessNotes,
    })
    .eq('id', user.id);

  if (error) throw error;
  return next;
}

export async function saveStudentWeaknesses(topicKeys: string[]): Promise<string[]> {
  const next = [...new Set(topicKeys.filter((k) => !!TOPICS[k]))];

  if (!isSupabaseConfigured) {
    return saveLocalWeaknesses(next);
  }

  const sb = getSupabase();
  if (!sb) return saveLocalWeaknesses(next);

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const { data: existing, error: fetchErr } = await sb
    .from('student_weaknesses')
    .select('topic_key')
    .eq('student_id', user.id);
  if (fetchErr) throw fetchErr;

  const current = new Set(
    (existing ?? []).map((r) => (r as { topic_key: string }).topic_key),
  );
  const desired = new Set(next);

  const toDelete = [...current].filter((k) => !desired.has(k));
  const toInsert = [...desired].filter((k) => !current.has(k));

  if (toDelete.length) {
    const { error } = await sb
      .from('student_weaknesses')
      .delete()
      .eq('student_id', user.id)
      .in('topic_key', toDelete);
    if (error) throw error;
  }
  if (toInsert.length) {
    const { error } = await sb.from('student_weaknesses').insert(
      toInsert.map((topic_key) => ({
        student_id: user.id,
        topic_key,
      })),
    );
    if (error) throw error;
  }
  return next;
}

export function formatWeaknessLabels(topicKeys: string[]): string[] {
  return topicKeys
    .map((k) => TOPICS[k])
    .filter(Boolean)
    .map((t) => `${t!.subject} Ch.${t!.spine} ${t!.title}`);
}

/** Short multi-line summary for student profile + tutor pending. */
export function formatTutorInsightPreview(
  insights: StudentInsights,
  weaknessTopicKeys: string[] = [],
): string | null {
  const lines: string[] = [];
  if (insights.schoolYear) lines.push(`Year: ${insights.schoolYear}`);
  const goal = tutoringGoalLabel(insights.tutoringGoal);
  if (goal) lines.push(`Goal: ${goal}`);
  const lang = preferredLanguageLabel(insights.preferredLanguage);
  if (lang) lines.push(`Explain in: ${lang}`);
  const weak = formatWeaknessLabels(weaknessTopicKeys);
  if (weak.length) {
    lines.push(`Weaknesses: ${weak.slice(0, 3).join('; ')}${weak.length > 3 ? '…' : ''}`);
  } else if (insights.weaknessNotes) {
    lines.push(`Weaknesses: ${insights.weaknessNotes}`);
  }
  if (insights.tutorNotes) lines.push(`Notes: ${insights.tutorNotes}`);
  if (!lines.length) return null;
  return lines.join('\n');
}

/** Optional student profile insight enums / labels (Sec + IP). */

export const SCHOOL_YEARS = [
  'Sec 1',
  'Sec 2',
  'Sec 3',
  'Sec 4',
  'IP Year 1',
  'IP Year 2',
  'IP Year 3',
  'IP Year 4',
] as const;

export type SchoolYear = (typeof SCHOOL_YEARS)[number];

export const TUTORING_GOALS = [
  { key: 'upcoming_test', label: 'Upcoming test' },
  { key: 'catch_up', label: 'Catch up' },
  { key: 'exam_revision', label: 'Exam revision' },
  { key: 'enrichment', label: 'Enrichment' },
] as const;

export type TutoringGoalKey = (typeof TUTORING_GOALS)[number]['key'];

export const PREFERRED_LANGUAGES = [
  { key: 'english', label: 'English' },
  { key: 'chinese', label: 'Chinese' },
  { key: 'bilingual', label: 'Bilingual' },
] as const;

export type PreferredLanguageKey = (typeof PREFERRED_LANGUAGES)[number]['key'];

export type StudentInsights = {
  schoolYear: SchoolYear | null;
  tutoringGoal: TutoringGoalKey | null;
  tutorNotes: string | null;
  preferredLanguage: PreferredLanguageKey | null;
  weaknessNotes: string | null;
};

export const EMPTY_INSIGHTS: StudentInsights = {
  schoolYear: null,
  tutoringGoal: null,
  tutorNotes: null,
  preferredLanguage: null,
  weaknessNotes: null,
};

export function isSchoolYear(v: string | null | undefined): v is SchoolYear {
  return !!v && (SCHOOL_YEARS as readonly string[]).includes(v);
}

export function isTutoringGoalKey(v: string | null | undefined): v is TutoringGoalKey {
  return !!v && TUTORING_GOALS.some((g) => g.key === v);
}

export function isPreferredLanguageKey(
  v: string | null | undefined,
): v is PreferredLanguageKey {
  return !!v && PREFERRED_LANGUAGES.some((g) => g.key === v);
}

export function tutoringGoalLabel(key: TutoringGoalKey | null): string | null {
  if (!key) return null;
  return TUTORING_GOALS.find((g) => g.key === key)?.label ?? key;
}

export function preferredLanguageLabel(
  key: PreferredLanguageKey | null,
): string | null {
  if (!key) return null;
  return PREFERRED_LANGUAGES.find((g) => g.key === key)?.label ?? key;
}

/**
 * SEAB Secondary / Full SBB examinable subjects for student curriculum onboarding.
 * Order is a working hypothesis: Singapore secondary tuition demand (most common first).
 * Keep subject keys stable (snake/kebab-style identifiers).
 */

export const SUBJECT_LEVELS = ['G1', 'G2', 'G3'] as const;
export type SubjectLevel = (typeof SUBJECT_LEVELS)[number];

export type CurriculumSubjectKey =
  | 'emaths'
  | 'amaths'
  | 'english'
  | 'chem'
  | 'physics'
  | 'biology'
  | 'chinese'
  | 'malay'
  | 'tamil'
  | 'cs_phy_chem'
  | 'cs_chem_bio'
  | 'cs_phy_bio'
  | 'geography'
  | 'history'
  | 'literature'
  | 'poa'
  | 'computing';

export type CurriculumSubject = {
  key: CurriculumSubjectKey;
  label: string;
  shortLabel: string;
  /** Higher-demand subjects for tuition / booking. */
  common: boolean;
};

export const CURRICULUM_SUBJECTS: readonly CurriculumSubject[] = [
  { key: 'emaths', label: 'Elementary Mathematics', shortLabel: 'E Maths', common: true },
  { key: 'amaths', label: 'Additional Mathematics', shortLabel: 'A Maths', common: true },
  { key: 'english', label: 'English Language', shortLabel: 'English', common: true },
  { key: 'chem', label: 'Chemistry', shortLabel: 'Chem', common: true },
  { key: 'physics', label: 'Physics', shortLabel: 'Physics', common: true },
  { key: 'biology', label: 'Biology', shortLabel: 'Biology', common: true },
  { key: 'chinese', label: 'Chinese', shortLabel: 'Chinese', common: true },
  { key: 'malay', label: 'Malay', shortLabel: 'Malay', common: false },
  { key: 'tamil', label: 'Tamil', shortLabel: 'Tamil', common: false },
  {
    key: 'cs_phy_chem',
    label: 'Combined Science (Physics/Chemistry)',
    shortLabel: 'CS Phy/Chem',
    common: true,
  },
  {
    key: 'cs_chem_bio',
    label: 'Combined Science (Chemistry/Biology)',
    shortLabel: 'CS Chem/Bio',
    common: true,
  },
  {
    key: 'cs_phy_bio',
    label: 'Combined Science (Physics/Biology)',
    shortLabel: 'CS Phy/Bio',
    common: false,
  },
  { key: 'geography', label: 'Geography', shortLabel: 'Geography', common: false },
  { key: 'history', label: 'History', shortLabel: 'History', common: false },
  { key: 'literature', label: 'Literature in English', shortLabel: 'Literature', common: false },
  { key: 'poa', label: 'Principles of Accounts', shortLabel: 'POA', common: false },
  { key: 'computing', label: 'Computing', shortLabel: 'Computing', common: false },
] as const;

export type StudentCurriculumEntry = {
  subjectKey: CurriculumSubjectKey;
  level: SubjectLevel;
};

export function isCurriculumSubjectKey(value: string): value is CurriculumSubjectKey {
  return CURRICULUM_SUBJECTS.some((s) => s.key === value);
}

export function isSubjectLevel(value: string): value is SubjectLevel {
  return (SUBJECT_LEVELS as readonly string[]).includes(value);
}

export function curriculumSubjectByKey(
  key: CurriculumSubjectKey,
): CurriculumSubject | undefined {
  return CURRICULUM_SUBJECTS.find((s) => s.key === key);
}

export function curriculumLabel(key: CurriculumSubjectKey, short = true): string {
  const s = curriculumSubjectByKey(key);
  if (!s) return key;
  return short ? s.shortLabel : s.label;
}

/** AsyncStorage key for demo / offline curriculum. */
export const CURRICULUM_STORAGE_KEY = 'chaptr_student_curriculum_v1';

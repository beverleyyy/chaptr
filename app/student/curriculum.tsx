import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import {
  CURRICULUM_SUBJECTS,
  SUBJECT_LEVELS,
  type CurriculumSubjectKey,
  type StudentCurriculumEntry,
  type SubjectLevel,
} from '@/constants/curriculum';
import { Screen, Display, BtnPrimary, DimText, Card } from '@/components/ui';
import { colors, fonts } from '@/constants/theme';

type DraftMap = Partial<Record<CurriculumSubjectKey, SubjectLevel | null>>;

function entriesFromDraft(draft: DraftMap): StudentCurriculumEntry[] {
  const out: StudentCurriculumEntry[] = [];
  for (const subject of CURRICULUM_SUBJECTS) {
    const level = draft[subject.key];
    if (level) out.push({ subjectKey: subject.key, level });
  }
  return out;
}

export default function StudentCurriculumScreen() {
  const router = useRouter();
  const { studentCurriculum, saveCurriculum, curriculumReady } = useApp();
  const [draft, setDraft] = useState<DraftMap>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const next: DraftMap = {};
    for (const entry of studentCurriculum) {
      next[entry.subjectKey] = entry.level;
    }
    setDraft(next);
    setHydrated(true);
  }, [studentCurriculum]);

  const selectedCount = useMemo(
    () => Object.values(draft).filter((v) => !!v).length,
    [draft],
  );
  const canContinue = selectedCount >= 1;

  const toggleSubject = (key: CurriculumSubjectKey) => {
    setDraft((prev) => {
      if (prev[key]) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: 'G3' };
    });
  };

  const setLevel = (key: CurriculumSubjectKey, level: SubjectLevel) => {
    setDraft((prev) => ({ ...prev, [key]: level }));
  };

  const onSave = async () => {
    setError(null);
    const entries = entriesFromDraft(draft);
    if (entries.length < 1) {
      setError('Select at least one subject and choose G1, G2, or G3.');
      return;
    }
    setBusy(true);
    try {
      await saveCurriculum(entries);
      router.replace('/student/home');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save curriculum');
    } finally {
      setBusy(false);
    }
  };

  if (!hydrated) {
    return (
      <Screen glow="none">
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen glow="none">
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          {curriculumReady ? (
            <Pressable onPress={() => router.back()} style={styles.backRow} hitSlop={8}>
              <Ionicons name="chevron-back" size={18} color={colors.accent} />
              <Text style={styles.backText}>Back</Text>
            </Pressable>
          ) : null}
          <Display style={{ fontSize: 22, lineHeight: 28 }}>Your subjects</Display>
          <DimText style={{ marginTop: 6, lineHeight: 19 }}>
            Pick every subject you take this year and set the Full SBB level (G1 / G2 / G3).
            We&apos;ll only show those topics when you book.
          </DimText>
        </View>

        <ScrollView
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {CURRICULUM_SUBJECTS.map((subject) => {
            const selected = !!draft[subject.key];
            const level = draft[subject.key];
            return (
              <Card
                key={subject.key}
                style={[styles.row, selected && styles.rowOn]}
              >
                <Pressable
                  onPress={() => toggleSubject(subject.key)}
                  style={styles.rowTop}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                >
                  <View style={[styles.check, selected && styles.checkOn]}>
                    {selected ? (
                      <Ionicons name="checkmark" size={13} color={colors.accentInk} />
                    ) : null}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{subject.label}</Text>
                    {subject.shortLabel !== subject.label ? (
                      <DimText style={{ fontSize: 12, marginTop: 2 }}>
                        {subject.shortLabel}
                      </DimText>
                    ) : null}
                  </View>
                  {subject.common ? (
                    <Text style={styles.commonTag}>Common</Text>
                  ) : null}
                </Pressable>

                {selected ? (
                  <View style={styles.levels}>
                    {SUBJECT_LEVELS.map((lv) => {
                      const on = level === lv;
                      return (
                        <Pressable
                          key={lv}
                          onPress={() => setLevel(subject.key, lv)}
                          style={[styles.levelChip, on && styles.levelChipOn]}
                        >
                          <Text style={[styles.levelText, on && styles.levelTextOn]}>
                            {lv}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : null}
              </Card>
            );
          })}
        </ScrollView>

        <View style={styles.footer}>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <DimText style={{ marginBottom: 10 }}>
            {selectedCount === 0
              ? 'Select at least one subject to continue'
              : `${selectedCount} subject${selectedCount === 1 ? '' : 's'} selected`}
          </DimText>
          {busy ? (
            <ActivityIndicator color={colors.accent} />
          ) : (
            <BtnPrimary
              label={curriculumReady ? 'Save subjects' : 'Continue'}
              disabled={!canContinue}
              onPress={onSave}
            />
          )}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { paddingTop: 54, paddingHorizontal: 22, paddingBottom: 8 },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  backText: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.accent },
  body: { paddingHorizontal: 22, paddingTop: 10, paddingBottom: 16, gap: 10 },
  row: { padding: 14, gap: 12 },
  rowOn: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  check: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: colors.hairline,
    backgroundColor: colors.ink2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  rowTitle: { fontFamily: fonts.semiBold, fontSize: 14.5, color: colors.text },
  commonTag: {
    fontFamily: fonts.semiBold,
    fontSize: 10.5,
    color: colors.accentDark,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  levels: { flexDirection: 'row', gap: 8, paddingLeft: 34 },
  levelChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.ink3,
  },
  levelChipOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  levelText: { fontFamily: fonts.bold, fontSize: 13, color: colors.text },
  levelTextOn: { color: colors.accentInk },
  footer: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  error: {
    marginBottom: 8,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.danger,
  },
});

import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import {
  curriculumLabel,
  type CurriculumSubjectKey,
} from '@/constants/curriculum';
import { TOPICS, topicsForSubjectKey } from '@/constants/mockData';
import {
  EMPTY_INSIGHTS,
  PREFERRED_LANGUAGES,
  SCHOOL_YEARS,
  TUTORING_GOALS,
  type PreferredLanguageKey,
  type SchoolYear,
  type StudentInsights,
  type TutoringGoalKey,
} from '@/constants/studentProfile';
import {
  TEST_LABEL_PRESETS,
  calendarDaysUntil,
  formatDisplayDate,
  formatTestTag,
  singaporeToday,
  upcomingTests,
  type StudentTest,
} from '@/lib/testsApi';
import {
  formatTutorInsightPreview,
  formatWeaknessLabels,
} from '@/lib/studentProfileApi';
import {
  Screen,
  Card,
  Avatar,
  BackHeader,
  SectionLabel,
  BtnPrimary,
  BtnGhost,
  DimText,
  Band,
  Tag,
} from '@/components/ui';
import { colors, fonts } from '@/constants/theme';
import { goBackOrReplace } from '@/lib/navigation';

function initialsFromName(name: string | null | undefined): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function addCalendarDays(ymd: string, days: number): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

type TestFormState = {
  subjectKey: CurriculumSubjectKey | null;
  topicKey: string | null;
  testDate: string;
  label: string;
};

const emptyTestForm = (): TestFormState => ({
  subjectKey: null,
  topicKey: null,
  testDate: singaporeToday(),
  label: '',
});

function formFromTest(test: StudentTest): TestFormState {
  const topic = TOPICS[test.topicKey];
  return {
    subjectKey: topic?.subjectKey ?? null,
    topicKey: test.topicKey,
    testDate: test.testDate,
    label: test.label ?? '',
  };
}

export default function StudentProfile() {
  const router = useRouter();
  const { profile, user, signOut } = useAuth();
  const {
    studentCurriculum,
    studentTests,
    testsLoading,
    addTest,
    editTest,
    removeTest,
    studentInsights,
    studentWeaknesses,
    insightsLoading,
    saveInsights,
  } = useApp();

  const [draft, setDraft] = useState<StudentInsights>({ ...EMPTY_INSIGHTS });
  const [weakKeys, setWeakKeys] = useState<string[]>([]);
  const [weakSubject, setWeakSubject] = useState<CurriculumSubjectKey | null>(null);
  const [insightSaved, setInsightSaved] = useState(false);
  const [insightBusy, setInsightBusy] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showTestForm, setShowTestForm] = useState(false);
  const [testForm, setTestForm] = useState<TestFormState>(emptyTestForm);
  const [testError, setTestError] = useState<string | null>(null);
  const [testBusy, setTestBusy] = useState(false);

  useEffect(() => {
    setDraft({ ...studentInsights });
    setWeakKeys([...studentWeaknesses]);
  }, [studentInsights, studentWeaknesses]);

  useEffect(() => {
    if (!studentCurriculum.length) {
      setWeakSubject(null);
      return;
    }
    setWeakSubject((prev) => {
      if (prev && studentCurriculum.some((c) => c.subjectKey === prev)) return prev;
      return studentCurriculum[0].subjectKey;
    });
  }, [studentCurriculum]);

  const name = profile?.name?.trim() || 'Student';
  const email = user?.email ?? '';
  const today = singaporeToday();
  const upcoming = useMemo(() => upcomingTests(studentTests, today), [studentTests, today]);

  const testTopicOptions = useMemo(() => {
    if (!testForm.subjectKey) return [];
    return topicsForSubjectKey(testForm.subjectKey);
  }, [testForm.subjectKey]);

  const weakTopicOptions = useMemo(() => {
    if (!weakSubject) return [];
    return topicsForSubjectKey(weakSubject);
  }, [weakSubject]);

  const insightPreview = useMemo(
    () => formatTutorInsightPreview(draft, weakKeys),
    [draft, weakKeys],
  );

  const toggleWeakness = (topicKey: string) => {
    setWeakKeys((prev) =>
      prev.includes(topicKey) ? prev.filter((k) => k !== topicKey) : [...prev, topicKey],
    );
  };

  const onSaveInsights = async () => {
    setInsightError(null);
    setInsightBusy(true);
    try {
      await saveInsights(draft, weakKeys);
      setInsightSaved(true);
      setTimeout(() => setInsightSaved(false), 1800);
    } catch (e) {
      setInsightError(e instanceof Error ? e.message : 'Could not save profile');
    } finally {
      setInsightBusy(false);
    }
  };

  const openAddTest = () => {
    const first = studentCurriculum[0]?.subjectKey ?? null;
    setEditingId(null);
    setTestForm({
      ...emptyTestForm(),
      subjectKey: first,
      topicKey: first ? topicsForSubjectKey(first)[0]?.id ?? null : null,
    });
    setTestError(null);
    setShowTestForm(true);
  };

  const openEditTest = (test: StudentTest) => {
    setEditingId(test.id);
    setTestForm(formFromTest(test));
    setTestError(null);
    setShowTestForm(true);
  };

  const onSaveTest = async () => {
    setTestError(null);
    if (!testForm.subjectKey || !testForm.topicKey) {
      setTestError('Pick a subject and chapter.');
      return;
    }
    setTestBusy(true);
    try {
      const input = {
        topicKey: testForm.topicKey,
        testDate: testForm.testDate.trim(),
        label: testForm.label.trim() || null,
      };
      if (editingId) await editTest(editingId, input);
      else await addTest(input);
      setShowTestForm(false);
      setEditingId(null);
    } catch (e) {
      setTestError(e instanceof Error ? e.message : 'Could not save test');
    } finally {
      setTestBusy(false);
    }
  };

  const confirmDeleteTest = (test: StudentTest) => {
    const topic = TOPICS[test.topicKey];
    const title = topic ? `${topic.subject} · Ch.${topic.spine}` : test.topicKey;
    const run = async () => {
      setTestBusy(true);
      try {
        await removeTest(test.id);
        if (editingId === test.id) {
          setShowTestForm(false);
          setEditingId(null);
        }
      } catch (e) {
        setTestError(e instanceof Error ? e.message : 'Could not delete');
      } finally {
        setTestBusy(false);
      }
    };
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(`Delete test for ${title}?`)) {
        void run();
      }
      return;
    }
    Alert.alert('Delete test?', title, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => void run() },
    ]);
  };

  return (
    <Screen>
      <BackHeader
        title="Your profile"
        onBack={() => goBackOrReplace(router, '/student/home')}
      />
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <Avatar initials={initialsFromName(name)} size={56} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{name}</Text>
            {email ? <DimText style={{ marginTop: 2 }}>{email}</DimText> : null}
            <Text style={styles.roleChip}>Student</Text>
          </View>
        </View>

        <Card style={styles.card}>
          <SectionLabel>My subjects</SectionLabel>
          {studentCurriculum.length === 0 ? (
            <DimText style={{ marginTop: 8, lineHeight: 18 }}>
              No subjects saved yet. Add the subjects you are taking so booking shows the right
              chapters.
            </DimText>
          ) : (
            <View style={styles.subjectList}>
              {studentCurriculum.map((row) => (
                <View key={row.subjectKey} style={styles.subjectRow}>
                  <Text style={styles.subjectName}>{curriculumLabel(row.subjectKey)}</Text>
                  <Text style={styles.level}>{row.level}</Text>
                </View>
              ))}
            </View>
          )}
          <Pressable onPress={() => router.push('/student/curriculum')} style={styles.linkBtn}>
            <Text style={styles.linkText}>
              {studentCurriculum.length ? 'Edit subjects' : 'Set subjects'}
            </Text>
          </Pressable>
        </Card>

        <Card style={styles.card}>
          <SectionLabel>Tutor insight preview</SectionLabel>
          {insightsLoading ? (
            <ActivityIndicator color={colors.accent} style={{ marginVertical: 12 }} />
          ) : insightPreview ? (
            <Text style={styles.previewText}>{insightPreview}</Text>
          ) : (
            <DimText style={{ marginTop: 8, lineHeight: 18 }}>
              Fill in the optional fields below — tutors will see this summary when they review your
              request.
            </DimText>
          )}
        </Card>

        <Card style={styles.card}>
          <SectionLabel>School year (optional)</SectionLabel>
          <View style={styles.chipsWrap}>
            {SCHOOL_YEARS.map((year) => {
              const on = draft.schoolYear === year;
              return (
                <Pressable
                  key={year}
                  onPress={() =>
                    setDraft((prev) => ({
                      ...prev,
                      schoolYear: prev.schoolYear === year ? null : (year as SchoolYear),
                    }))
                  }
                  style={[styles.chip, on && styles.chipOn]}
                >
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>{year}</Text>
                </Pressable>
              );
            })}
          </View>

          <SectionLabel>Tutoring goal (optional)</SectionLabel>
          <View style={styles.chipsWrap}>
            {TUTORING_GOALS.map((g) => {
              const on = draft.tutoringGoal === g.key;
              return (
                <Pressable
                  key={g.key}
                  onPress={() =>
                    setDraft((prev) => ({
                      ...prev,
                      tutoringGoal:
                        prev.tutoringGoal === g.key ? null : (g.key as TutoringGoalKey),
                    }))
                  }
                  style={[styles.chip, on && styles.chipOn]}
                >
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>{g.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <SectionLabel>Preferred explanation language (optional)</SectionLabel>
          <View style={styles.chipsWrap}>
            {PREFERRED_LANGUAGES.map((g) => {
              const on = draft.preferredLanguage === g.key;
              return (
                <Pressable
                  key={g.key}
                  onPress={() =>
                    setDraft((prev) => ({
                      ...prev,
                      preferredLanguage:
                        prev.preferredLanguage === g.key
                          ? null
                          : (g.key as PreferredLanguageKey),
                    }))
                  }
                  style={[styles.chip, on && styles.chipOn]}
                >
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>{g.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <SectionLabel>Weaknesses — chapters (optional)</SectionLabel>
          {studentCurriculum.length === 0 ? (
            <DimText style={{ marginTop: 6, lineHeight: 18 }}>
              Set subjects first to pick weak chapters.
            </DimText>
          ) : (
            <>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chips}
              >
                {studentCurriculum.map((entry) => {
                  const on = weakSubject === entry.subjectKey;
                  return (
                    <Pressable
                      key={entry.subjectKey}
                      onPress={() => setWeakSubject(entry.subjectKey)}
                      style={[styles.chip, on && styles.chipOn]}
                    >
                      <Text style={[styles.chipText, on && styles.chipTextOn]}>
                        {curriculumLabel(entry.subjectKey, true)}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
              <ScrollView style={styles.topicList} nestedScrollEnabled>
                {weakTopicOptions.map((t) => {
                  const on = weakKeys.includes(t.id);
                  return (
                    <Pressable
                      key={t.id}
                      onPress={() => toggleWeakness(t.id)}
                      style={[styles.topicPick, on && styles.topicPickOn]}
                    >
                      <Text style={styles.topicSpine}>{t.spine}</Text>
                      <Text style={[styles.topicPickTitle, on && styles.topicPickTitleOn]}>
                        {t.title}
                      </Text>
                      {on ? <Text style={styles.checkMark}>✓</Text> : null}
                    </Pressable>
                  );
                })}
              </ScrollView>
              {weakKeys.length ? (
                <DimText style={{ marginTop: 6, fontSize: 12, lineHeight: 17 }}>
                  Selected: {formatWeaknessLabels(weakKeys).join(' · ')}
                </DimText>
              ) : null}
            </>
          )}

          <SectionLabel>Weaknesses — free text (optional)</SectionLabel>
          <TextInput
            value={draft.weaknessNotes ?? ''}
            onChangeText={(v) => setDraft((prev) => ({ ...prev, weaknessNotes: v }))}
            placeholder="e.g. Still shaky on completing the square"
            placeholderTextColor={colors.textDim}
            multiline
            style={[styles.input, styles.textareaSm]}
            textAlignVertical="top"
          />

          <SectionLabel>Notes for tutor (optional)</SectionLabel>
          <TextInput
            value={draft.tutorNotes ?? ''}
            onChangeText={(v) => setDraft((prev) => ({ ...prev, tutorNotes: v }))}
            placeholder="Anything helpful before the session…"
            placeholderTextColor={colors.textDim}
            multiline
            style={[styles.input, styles.textarea]}
            textAlignVertical="top"
          />

          {insightError ? <Text style={styles.error}>{insightError}</Text> : null}
          <BtnPrimary
            label={insightBusy ? 'Saving…' : 'Save profile insights'}
            onPress={() => void onSaveInsights()}
            disabled={insightBusy}
            style={{ marginTop: 8 }}
          />
          {insightSaved ? <Text style={styles.saved}>Saved ✓</Text> : null}
        </Card>

        <Card style={styles.card}>
          <View style={styles.sectionHead}>
            <SectionLabel>Upcoming tests</SectionLabel>
            {studentCurriculum.length > 0 ? (
              <Pressable onPress={openAddTest} hitSlop={8}>
                <Text style={styles.linkText}>+ Add test</Text>
              </Pressable>
            ) : null}
          </View>

          {testsLoading ? (
            <ActivityIndicator color={colors.accent} style={{ marginVertical: 16 }} />
          ) : upcoming.length === 0 && !showTestForm ? (
            <View style={{ marginTop: 8, gap: 12 }}>
              <DimText style={{ lineHeight: 18 }}>
                Add a chapter and date — Home will show a countdown tag on that chapter.
              </DimText>
              {studentCurriculum.length > 0 ? (
                <BtnPrimary label="Add a test" onPress={openAddTest} />
              ) : (
                <DimText style={{ lineHeight: 18 }}>
                  Set your subjects first, then you can attach test dates to chapters.
                </DimText>
              )}
            </View>
          ) : (
            <View style={{ marginTop: 10, gap: 10 }}>
              {upcoming.map((test) => {
                const topic = TOPICS[test.topicKey];
                const days = calendarDaysUntil(test.testDate, today);
                const tag = formatTestTag(days);
                return (
                  <View key={test.id} style={styles.testCard}>
                    <View style={{ flex: 1, gap: 6 }}>
                      <Text style={styles.testTitle}>
                        {topic
                          ? `${topic.subject} · Ch.${topic.spine} ${topic.title}`
                          : test.topicKey}
                      </Text>
                      <View style={styles.metaRow}>
                        <Band label={formatDisplayDate(test.testDate)} />
                        {tag ? <Tag label={tag} amber /> : null}
                        {test.label ? (
                          <DimText style={{ fontSize: 12 }}>{test.label}</DimText>
                        ) : null}
                      </View>
                    </View>
                    <View style={styles.actions}>
                      <Pressable onPress={() => openEditTest(test)} hitSlop={8}>
                        <Text style={styles.linkText}>Edit</Text>
                      </Pressable>
                      <Pressable onPress={() => confirmDeleteTest(test)} hitSlop={8}>
                        <Text style={[styles.linkText, { color: colors.danger }]}>Delete</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {showTestForm ? (
            <View style={styles.form}>
              <Text style={styles.formTitle}>{editingId ? 'Edit test' : 'Add test'}</Text>

              <SectionLabel>Subject</SectionLabel>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chips}
              >
                {studentCurriculum.map((entry) => {
                  const on = testForm.subjectKey === entry.subjectKey;
                  return (
                    <Pressable
                      key={entry.subjectKey}
                      onPress={() => {
                        const topics = topicsForSubjectKey(entry.subjectKey);
                        setTestForm((prev) => ({
                          ...prev,
                          subjectKey: entry.subjectKey,
                          topicKey: topics[0]?.id ?? null,
                        }));
                      }}
                      style={[styles.chip, on && styles.chipOn]}
                    >
                      <Text style={[styles.chipText, on && styles.chipTextOn]}>
                        {curriculumLabel(entry.subjectKey, true)} {entry.level}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <SectionLabel>Chapter</SectionLabel>
              <ScrollView style={styles.topicList} nestedScrollEnabled>
                {testTopicOptions.map((t) => {
                  const on = testForm.topicKey === t.id;
                  return (
                    <Pressable
                      key={t.id}
                      onPress={() => setTestForm((prev) => ({ ...prev, topicKey: t.id }))}
                      style={[styles.topicPick, on && styles.topicPickOn]}
                    >
                      <Text style={styles.topicSpine}>{t.spine}</Text>
                      <Text style={[styles.topicPickTitle, on && styles.topicPickTitleOn]}>
                        {t.title}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <SectionLabel>Date (Singapore)</SectionLabel>
              <TextInput
                value={testForm.testDate}
                onChangeText={(v) => setTestForm((prev) => ({ ...prev, testDate: v }))}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textDim}
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />
              <View style={styles.quickDates}>
                {[
                  { label: 'Today', days: 0 },
                  { label: 'Tomorrow', days: 1 },
                  { label: '+3 days', days: 3 },
                  { label: '+1 week', days: 7 },
                ].map((q) => (
                  <Pressable
                    key={q.label}
                    onPress={() =>
                      setTestForm((prev) => ({
                        ...prev,
                        testDate: addCalendarDays(today, q.days),
                      }))
                    }
                    style={styles.quickChip}
                  >
                    <Text style={styles.quickChipText}>{q.label}</Text>
                  </Pressable>
                ))}
              </View>

              <SectionLabel>Label (optional)</SectionLabel>
              <View style={styles.chipsWrap}>
                {TEST_LABEL_PRESETS.map((preset) => {
                  const on = testForm.label === preset;
                  return (
                    <Pressable
                      key={preset}
                      onPress={() =>
                        setTestForm((prev) => ({
                          ...prev,
                          label: prev.label === preset ? '' : preset,
                        }))
                      }
                      style={[styles.chip, on && styles.chipOn]}
                    >
                      <Text style={[styles.chipText, on && styles.chipTextOn]}>{preset}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <TextInput
                value={testForm.label}
                onChangeText={(v) => setTestForm((prev) => ({ ...prev, label: v }))}
                placeholder="Or type a custom label"
                placeholderTextColor={colors.textDim}
                style={styles.input}
              />

              {testError ? <Text style={styles.error}>{testError}</Text> : null}

              <View style={styles.formActions}>
                <BtnGhost
                  label="Cancel"
                  onPress={() => {
                    setShowTestForm(false);
                    setEditingId(null);
                    setTestError(null);
                  }}
                  style={{ flex: 1 }}
                />
                <BtnPrimary
                  label={testBusy ? 'Saving…' : editingId ? 'Save' : 'Add test'}
                  onPress={() => void onSaveTest()}
                  disabled={testBusy}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          ) : null}
        </Card>

        <BtnGhost
          label="Sign out"
          onPress={async () => {
            await signOut();
            router.replace('/auth/sign-in');
          }}
          style={{ marginTop: 8 }}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 22, paddingBottom: 32, gap: 14 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 4 },
  name: { fontFamily: fonts.bold, fontSize: 18, color: colors.text },
  roleChip: {
    marginTop: 6,
    alignSelf: 'flex-start',
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: colors.accentDark,
    backgroundColor: colors.accentSoft,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  card: { padding: 16, gap: 4 },
  subjectList: { marginTop: 10, gap: 8 },
  subjectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  subjectName: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.text, flex: 1 },
  level: { fontFamily: fonts.bold, fontSize: 12, color: colors.accent },
  linkBtn: { marginTop: 12, alignSelf: 'flex-start' },
  linkText: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.accent },
  previewText: {
    marginTop: 8,
    fontFamily: fonts.medium,
    fontSize: 13.5,
    color: colors.text,
    lineHeight: 20,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chips: { gap: 8, paddingVertical: 6 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10, marginTop: 6 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.ink3,
  },
  chipOn: { backgroundColor: colors.accent, borderColor: 'transparent' },
  chipText: { fontFamily: fonts.semiBold, fontSize: 12, color: colors.textDim },
  chipTextOn: { color: '#fff' },
  topicList: { maxHeight: 160, marginTop: 4 },
  topicPick: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  topicPickOn: { backgroundColor: colors.accentSoft },
  topicSpine: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.textDim,
    width: 28,
    textAlign: 'center',
  },
  topicPickTitle: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 13.5,
    color: colors.text,
    lineHeight: 18,
  },
  topicPickTitleOn: { fontFamily: fonts.semiBold },
  checkMark: { fontFamily: fonts.bold, fontSize: 14, color: colors.accent },
  input: {
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.ink2,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: 12,
    marginBottom: 8,
  },
  textarea: { minHeight: 88 },
  textareaSm: { minHeight: 64 },
  testCard: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
  },
  testTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.text,
    lineHeight: 19,
  },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  actions: { gap: 10, paddingTop: 2 },
  form: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
    gap: 10,
  },
  formTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.text, marginBottom: 4 },
  quickDates: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: colors.ink3,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  quickChipText: { fontFamily: fonts.semiBold, fontSize: 11.5, color: colors.textDim },
  formActions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  error: {
    fontFamily: fonts.semiBold,
    fontSize: 12.5,
    color: colors.danger,
    lineHeight: 17,
    marginTop: 4,
  },
  saved: {
    textAlign: 'center',
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.accent,
    marginTop: 8,
  },
});

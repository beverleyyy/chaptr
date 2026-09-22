import { useMemo, useState } from 'react';
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
  TEST_LABEL_PRESETS,
  calendarDaysUntil,
  formatDisplayDate,
  formatTestTag,
  singaporeToday,
  upcomingTests,
  type StudentTest,
} from '@/lib/testsApi';
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

type FormState = {
  subjectKey: CurriculumSubjectKey | null;
  topicKey: string | null;
  testDate: string;
  label: string;
};

const emptyForm = (): FormState => ({
  subjectKey: null,
  topicKey: null,
  testDate: singaporeToday(),
  label: '',
});

function formFromTest(test: StudentTest): FormState {
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
  } = useApp();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const name = profile?.name?.trim() || 'Student';
  const email = user?.email ?? '';
  const today = singaporeToday();
  const upcoming = useMemo(() => upcomingTests(studentTests, today), [studentTests, today]);

  const topicOptions = useMemo(() => {
    if (!form.subjectKey) return [];
    return topicsForSubjectKey(form.subjectKey);
  }, [form.subjectKey]);

  const openAdd = () => {
    const first = studentCurriculum[0]?.subjectKey ?? null;
    setEditingId(null);
    setForm({
      ...emptyForm(),
      subjectKey: first,
      topicKey: first ? topicsForSubjectKey(first)[0]?.id ?? null : null,
    });
    setError(null);
    setShowForm(true);
  };

  const openEdit = (test: StudentTest) => {
    setEditingId(test.id);
    setForm(formFromTest(test));
    setError(null);
    setShowForm(true);
  };

  const onSave = async () => {
    setError(null);
    if (!form.subjectKey || !form.topicKey) {
      setError('Pick a subject and chapter.');
      return;
    }
    setBusy(true);
    try {
      const input = {
        topicKey: form.topicKey,
        testDate: form.testDate.trim(),
        label: form.label.trim() || null,
      };
      if (editingId) await editTest(editingId, input);
      else await addTest(input);
      setShowForm(false);
      setEditingId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save test');
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = (test: StudentTest) => {
    const topic = TOPICS[test.topicKey];
    const title = topic ? `${topic.subject} · Ch.${topic.spine}` : test.topicKey;
    const run = async () => {
      setBusy(true);
      try {
        await removeTest(test.id);
        if (editingId === test.id) {
          setShowForm(false);
          setEditingId(null);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not delete');
      } finally {
        setBusy(false);
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
      <BackHeader title="Your profile" onBack={() => router.back()} />
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
          <View style={styles.sectionHead}>
            <SectionLabel>Upcoming tests</SectionLabel>
            {studentCurriculum.length > 0 ? (
              <Pressable onPress={openAdd} hitSlop={8}>
                <Text style={styles.linkText}>+ Add test</Text>
              </Pressable>
            ) : null}
          </View>

          {testsLoading ? (
            <ActivityIndicator color={colors.accent} style={{ marginVertical: 16 }} />
          ) : upcoming.length === 0 && !showForm ? (
            <View style={{ marginTop: 8, gap: 12 }}>
              <DimText style={{ lineHeight: 18 }}>
                Add a chapter and date — Home will show a countdown tag on that chapter.
              </DimText>
              {studentCurriculum.length > 0 ? (
                <BtnPrimary label="Add a test" onPress={openAdd} />
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
                      <Pressable onPress={() => openEdit(test)} hitSlop={8}>
                        <Text style={styles.linkText}>Edit</Text>
                      </Pressable>
                      <Pressable onPress={() => confirmDelete(test)} hitSlop={8}>
                        <Text style={[styles.linkText, { color: colors.danger }]}>Delete</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {showForm ? (
            <View style={styles.form}>
              <Text style={styles.formTitle}>{editingId ? 'Edit test' : 'Add test'}</Text>

              <SectionLabel>Subject</SectionLabel>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chips}
              >
                {studentCurriculum.map((entry) => {
                  const on = form.subjectKey === entry.subjectKey;
                  return (
                    <Pressable
                      key={entry.subjectKey}
                      onPress={() => {
                        const topics = topicsForSubjectKey(entry.subjectKey);
                        setForm((prev) => ({
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
                {topicOptions.map((t) => {
                  const on = form.topicKey === t.id;
                  return (
                    <Pressable
                      key={t.id}
                      onPress={() => setForm((prev) => ({ ...prev, topicKey: t.id }))}
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
                value={form.testDate}
                onChangeText={(v) => setForm((prev) => ({ ...prev, testDate: v }))}
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
                      setForm((prev) => ({
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
                  const on = form.label === preset;
                  return (
                    <Pressable
                      key={preset}
                      onPress={() =>
                        setForm((prev) => ({
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
                value={form.label}
                onChangeText={(v) => setForm((prev) => ({ ...prev, label: v }))}
                placeholder="Or type a custom label"
                placeholderTextColor={colors.textDim}
                style={styles.input}
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <View style={styles.formActions}>
                <BtnGhost
                  label="Cancel"
                  onPress={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setError(null);
                  }}
                  style={{ flex: 1 }}
                />
                <BtnPrimary
                  label={busy ? 'Saving…' : editingId ? 'Save' : 'Add test'}
                  onPress={() => void onSave()}
                  disabled={busy}
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
  card: { padding: 16 },
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
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
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
  chips: { gap: 8, paddingBottom: 4 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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
  topicList: { maxHeight: 180 },
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
  },
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
  },
});

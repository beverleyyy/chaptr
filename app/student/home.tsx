import { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { Screen, Card, Display, Band, Tag, Spine, DimText } from '@/components/ui';
import {
  curriculumLabel,
  type CurriculumSubjectKey,
} from '@/constants/curriculum';
import { topicsForSubjectKey, Topic } from '@/constants/mockData';
import { colors, fonts } from '@/constants/theme';

export default function StudentHome() {
  const { setBooking, setRole, studentCurriculum, curriculumLoading, curriculumReady } =
    useApp();
  const { profile } = useAuth();
  const router = useRouter();

  const [subject, setSubject] = useState<CurriculumSubjectKey | null>(null);

  useEffect(() => {
    if (curriculumLoading) return;
    if (!curriculumReady) {
      router.replace('/student/curriculum');
    }
  }, [curriculumLoading, curriculumReady, router]);

  useEffect(() => {
    if (!studentCurriculum.length) {
      setSubject(null);
      return;
    }
    setSubject((prev) => {
      if (prev && studentCurriculum.some((c) => c.subjectKey === prev)) return prev;
      return studentCurriculum[0].subjectKey;
    });
  }, [studentCurriculum]);

  const activeLevel = useMemo(() => {
    if (!subject) return undefined;
    return studentCurriculum.find((c) => c.subjectKey === subject)?.level;
  }, [studentCurriculum, subject]);

  const topics = useMemo(() => {
    if (!subject || !activeLevel) return [] as Topic[];
    return topicsForSubjectKey(subject, activeLevel);
  }, [subject, activeLevel]);

  const subjectLabel = subject ? curriculumLabel(subject, true) : '';
  const firstName = profile?.name?.split(' ')[0] ?? 'Aiden';

  const openTopic = (t: Topic) => {
    setBooking({ topicId: t.id });
    router.push('/student/book');
  };

  if (curriculumLoading || !curriculumReady || !subject) {
    return (
      <Screen>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <DimText>Welcome back, {firstName}</DimText>
            <Pressable
              onPress={() => {
                setRole('tutor');
                router.replace('/role');
              }}
            >
              <Text style={styles.switchLink}>Switch role</Text>
            </Pressable>
          </View>
          <Display style={{ fontSize: 23, marginTop: 2, lineHeight: 30 }}>
            Which topic do you need help with?
          </Display>
          <Pressable onPress={() => router.push('/student/curriculum')} style={styles.editLink}>
            <Text style={styles.editText}>Edit subjects</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.accent} />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pillsScroll}
          contentContainerStyle={styles.pills}
        >
          {studentCurriculum.map((entry) => {
            const active = subject === entry.subjectKey;
            return (
              <Pressable
                key={entry.subjectKey}
                onPress={() => setSubject(entry.subjectKey)}
                style={[styles.pill, active && styles.pillActive]}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>
                  {curriculumLabel(entry.subjectKey, true)}
                </Text>
                <Text style={[styles.pillLevel, active && styles.pillLevelActive]}>
                  {entry.level}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>
            {subjectLabel} · {activeLevel} · {topics.length} chapter
            {topics.length === 1 ? '' : 's'}
          </Text>
          <Text style={styles.listHint}>Tap a topic to book</Text>
        </View>

        <ScrollView
          style={{ flex: 1, paddingHorizontal: 22 }}
          contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {topics.map((t) => (
            <Pressable key={t.id} onPress={() => openTopic(t)}>
              <Card style={styles.topicRow}>
                <Spine label={t.spine} accent={!!t.highlight} />
                <View style={{ flex: 1, paddingTop: 2, gap: 8 }}>
                  <Text style={styles.topicTitle}>{t.title}</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                    <Band label={t.band} />
                    {t.tag ? <Tag label={t.tag} amber /> : null}
                    {t.lastCovered ? <DimText style={{ fontSize: 12 }}>{t.lastCovered}</DimText> : null}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={17} color={colors.textDim} style={{ marginTop: 4 }} />
              </Card>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.bottomNav}>
          <View style={styles.navItemActive}>
            <Ionicons name="book-outline" size={21} color={colors.accent} />
            <Text style={[styles.navLabel, { color: colors.accent }]}>Home</Text>
          </View>
          <View style={styles.navItem}>
            <Ionicons name="time-outline" size={21} color={colors.textDim} />
            <Text style={styles.navLabel}>History</Text>
          </View>
          <Pressable
            style={styles.navItem}
            onPress={() => router.push('/student/profile')}
            accessibilityRole="button"
            accessibilityLabel="Profile"
          >
            <Ionicons name="person-outline" size={21} color={colors.textDim} />
            <Text style={styles.navLabel}>Profile</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { paddingTop: 54, paddingHorizontal: 22, paddingBottom: 4 },
  switchLink: { fontFamily: fonts.semiBold, fontSize: 12, color: colors.accent },
  editLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  editText: { fontFamily: fonts.semiBold, fontSize: 12.5, color: colors.accent },
  pillsScroll: { flexGrow: 0 },
  pills: {
    paddingHorizontal: 22,
    paddingVertical: 14,
    gap: 8,
    alignItems: 'center',
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.ink3,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pillActive: { backgroundColor: colors.accent, borderColor: 'transparent' },
  pillText: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.textDim },
  pillTextActive: { color: '#fff' },
  pillLevel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.textDim,
    opacity: 0.85,
  },
  pillLevelActive: { color: '#fff', opacity: 0.95 },
  listHeader: {
    paddingHorizontal: 22,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 11.5,
    color: colors.textDim,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  listHint: { fontFamily: fonts.medium, fontSize: 11.5, color: colors.textDim },
  topicRow: { flexDirection: 'row', paddingVertical: 16, paddingRight: 16, paddingLeft: 0, gap: 0 },
  topicTitle: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.text, lineHeight: 20 },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 22,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  navItem: { alignItems: 'center', gap: 5 },
  navItemActive: { alignItems: 'center', gap: 5 },
  navLabel: { fontFamily: fonts.semiBold, fontSize: 10.5, color: colors.textDim },
});

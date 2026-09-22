import { useEffect, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import {
  Screen,
  Card,
  Display,
  Band,
  Spine,
  BackHeader,
  SectionLabel,
  BtnPrimary,
  DimText,
  BodyText,
} from '@/components/ui';
import { levelForSubject } from '@/lib/curriculumApi';
import { DURATIONS, HANDOFF_NOTE, resolveTopic } from '@/constants/mockData';
import { colors, fonts } from '@/constants/theme';

export default function BookSession() {
  const {
    booking,
    setBooking,
    curriculumReady,
    curriculumLoading,
    studentCurriculum,
  } = useApp();
  const router = useRouter();
  const baseTopic = resolveTopic(booking.topicId);

  const topic = useMemo(() => {
    if (!baseTopic) return null;
    const level = levelForSubject(studentCurriculum, baseTopic.subjectKey);
    return level ? { ...baseTopic, band: level } : baseTopic;
  }, [baseTopic, studentCurriculum]);

  useEffect(() => {
    if (curriculumLoading) return;
    if (!curriculumReady) {
      router.replace('/student/curriculum');
      return;
    }
    if (baseTopic) {
      const allowed = studentCurriculum.some((c) => c.subjectKey === baseTopic.subjectKey);
      if (!allowed) {
        router.replace('/student/home');
      }
    }
  }, [
    curriculumLoading,
    curriculumReady,
    router,
    baseTopic,
    studentCurriculum,
  ]);

  if (!topic || !curriculumReady) {
    return (
      <Screen>
        <BackHeader title="Book a session" onBack={() => router.replace('/student/home')} />
        <View style={{ padding: 22 }}>
          <DimText>Choose your subjects before booking a session.</DimText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <BackHeader title="Book a session" onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.topicCard}>
          <Spine label={topic.spine} accent />
          <View style={{ flex: 1, paddingTop: 2 }}>
            <Text style={styles.topicTitle}>{topic.title}</Text>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 8, alignItems: 'center' }}>
              <Band label={topic.band} />
              <DimText style={{ fontSize: 12 }}>{topic.subject}</DimText>
            </View>
          </View>
        </Card>

        <View>
          <SectionLabel>How long do you need?</SectionLabel>
          <View style={styles.durRow}>
            {DURATIONS.map((d) => {
              const sel = booking.mins === d.mins;
              return (
                <Pressable
                  key={d.mins}
                  onPress={() => setBooking({ mins: d.mins, price: d.price })}
                  style={[styles.durPill, sel && styles.durPillSel]}
                >
                  <Text style={[styles.durLabel, sel && styles.durSelText]}>{d.label}</Text>
                  <Text style={[styles.durPrice, sel && styles.durSelText]}>${d.price}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View>
          <SectionLabel>Where would you like to meet?</SectionLabel>
          <View style={styles.locRow}>
            {(
              [
                {
                  key: 'inperson' as const,
                  icon: 'location-outline' as const,
                  label: 'In person',
                  sub: 'At a Ping venue',
                },
                {
                  key: 'video' as const,
                  icon: 'videocam-outline' as const,
                  label: 'Video call',
                  sub: 'Zoom link after matching',
                },
              ] as const
            ).map((opt) => {
              const sel = booking.location === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => setBooking({ location: opt.key })}
                  style={[styles.locOpt, sel && styles.locOptSel]}
                >
                  <Ionicons name={opt.icon} size={18} color={sel ? colors.accentInk : colors.text} />
                  <Text style={[styles.locLabel, sel && { color: colors.accentInk }]}>{opt.label}</Text>
                  <Text style={[styles.locSub, sel && { color: colors.accentInk, opacity: 0.85 }]}>{opt.sub}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Card style={{ padding: 16, gap: 8 }}>
          <Text style={styles.noteLabel}>Last session&apos;s handoff note</Text>
          <BodyText>{HANDOFF_NOTE}</BodyText>
        </Card>

        <View style={{ marginTop: 'auto', paddingTop: 12 }}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total due now</Text>
            <Display style={{ fontSize: 20 }}>${booking.price}.00</Display>
          </View>
          <BtnPrimary
            label={`Request tutor & pay $${booking.price} →`}
            onPress={() => router.push('/student/payment')}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 22, paddingBottom: 24, gap: 18, flexGrow: 1 },
  topicCard: { flexDirection: 'row', paddingVertical: 16, paddingRight: 16, paddingLeft: 0 },
  topicTitle: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.text, lineHeight: 20 },
  durRow: { flexDirection: 'row', gap: 8 },
  durPill: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.ink3,
    gap: 2,
  },
  durPillSel: { backgroundColor: colors.accent, borderColor: colors.accent },
  durLabel: { fontFamily: fonts.bold, fontSize: 14, color: colors.text },
  durPrice: { fontFamily: fonts.medium, fontSize: 11.5, color: colors.textDim },
  durSelText: { color: colors.accentInk },
  locRow: { flexDirection: 'row', gap: 8 },
  locOpt: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.ink3,
    gap: 4,
  },
  locOptSel: { backgroundColor: colors.accent, borderColor: colors.accent },
  locLabel: { fontFamily: fonts.bold, fontSize: 13.5, color: colors.text },
  locSub: { fontFamily: fonts.medium, fontSize: 10.5, color: colors.textDim, textAlign: 'center' },
  noteLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.textDim,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  totalLabel: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.textDim },
});

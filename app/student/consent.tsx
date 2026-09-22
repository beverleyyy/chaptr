import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { Screen, Card, Display, BtnPrimary, DimText } from '@/components/ui';
import { colors, fonts } from '@/constants/theme';

const ITEMS = [
  {
    icon: 'lock-closed-outline' as const,
    title: 'What we collect',
    body: 'Name, contact number, the subject/chapter you request, and the notes each tutor leaves in the Session Handoff Log afterwards.',
  },
  {
    icon: 'information-circle-outline' as const,
    title: 'Why',
    body: 'To match you with a qualified tutor right now, and so the next tutor can pick up where the last one left off.',
  },
  {
    icon: 'eye-outline' as const,
    title: 'Who sees it',
    body: "Only the tutor you're matched with for that session. Never sold or shared with anyone else.",
  },
];

export default function StudentConsent() {
  const [checked, setChecked] = useState(false);
  const { setStudentConsented, curriculumReady, curriculumLoading } = useApp();
  const router = useRouter();

  return (
    <Screen glow="none">
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <Display style={{ fontSize: 20 }}>Before you get started</Display>
          <DimText style={{ marginTop: 4 }}>One quick thing before your first request.</DimText>
        </View>
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {ITEMS.map((item) => (
            <Card key={item.title} style={styles.consentCard}>
              <Ionicons name={item.icon} size={17} color={colors.accent} style={{ marginTop: 1 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.ct}>{item.title}</Text>
                <Text style={styles.cd}>{item.body}</Text>
              </View>
            </Card>
          ))}
          <Text style={styles.pdpa}>
            If the student is under 18, a parent or guardian should be the one accepting this, per
            Singapore&apos;s Personal Data Protection Act (PDPA).
          </Text>
        </ScrollView>
        <View style={styles.footer}>
          <Pressable style={styles.checkRow} onPress={() => setChecked((v) => !v)}>
            <View style={[styles.box, checked && styles.boxOn]}>
              {checked && <Ionicons name="checkmark" size={14} color={colors.accentInk} />}
            </View>
            <Text style={styles.checkLabel}>
              I (or my parent/guardian, if I&apos;m under 18) have read this and agree.
            </Text>
          </Pressable>
          <BtnPrimary
            label="Accept & continue"
            disabled={!checked}
            onPress={() => {
              setStudentConsented(true);
              if (curriculumLoading) {
                router.replace('/student/home');
                return;
              }
              router.replace(curriculumReady ? '/student/home' : '/student/curriculum');
            }}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 54, paddingHorizontal: 22, paddingBottom: 6 },
  body: { paddingHorizontal: 22, paddingTop: 14, gap: 10, paddingBottom: 10 },
  consentCard: { flexDirection: 'row', gap: 11, padding: 14 },
  ct: { fontFamily: fonts.bold, fontSize: 13.5, color: colors.text, marginBottom: 2 },
  cd: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.textDim, lineHeight: 19 },
  pdpa: {
    fontFamily: fonts.medium,
    fontSize: 11.5,
    color: colors.textDim,
    lineHeight: 17,
    paddingHorizontal: 4,
    paddingTop: 4,
  },
  footer: { paddingHorizontal: 22, paddingBottom: 24, paddingTop: 8 },
  checkRow: { flexDirection: 'row', gap: 11, alignItems: 'flex-start', paddingVertical: 12 },
  box: {
    width: 19,
    height: 19,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.hairline,
    backgroundColor: colors.ink2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  boxOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  checkLabel: { flex: 1, fontFamily: fonts.medium, fontSize: 13, lineHeight: 20, color: colors.text },
});

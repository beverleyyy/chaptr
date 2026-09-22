import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { Screen, Card, Display, BtnPrimary, DimText } from '@/components/ui';
import { colors, fonts } from '@/constants/theme';

const ITEMS = [
  {
    icon: 'people-outline' as const,
    title: 'The basics',
    body: "You're an independent contractor, not a Ping employee — no CPF, and you set your own availability.",
  },
  {
    icon: 'cash-outline' as const,
    title: 'Payment',
    body: "Paid directly by the student after each session, at the rate you've agreed to.",
  },
  {
    icon: 'lock-closed-outline' as const,
    title: 'Keep it confidential',
    body: "Anything you see about a student stays private and isn't shared elsewhere. Most students are minors, so this matters under PDPA.",
  },
  {
    icon: 'book-outline' as const,
    title: 'Stay on Ping',
    body: "Keep using the app for students you're matched with here, rather than moving them off-platform.",
  },
];

export default function TutorConsent() {
  const [checked, setChecked] = useState(false);
  const { setTutorConsented } = useApp();
  const router = useRouter();

  return (
    <Screen glow="none">
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <Display style={{ fontSize: 20 }}>Before you start tutoring</Display>
          <DimText style={{ marginTop: 4 }}>The short version of the Ping Tutor Agreement.</DimText>
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
            This is a summary — the full Ping Tutor Agreement covers the complete terms.
          </Text>
        </ScrollView>
        <View style={styles.footer}>
          <Pressable style={styles.checkRow} onPress={() => setChecked((v) => !v)}>
            <View style={[styles.box, checked && styles.boxOn]}>
              {checked && <Ionicons name="checkmark" size={14} color={colors.accentInk} />}
            </View>
            <Text style={styles.checkLabel}>
              I&apos;ve read this and agree to the Ping Tutor Agreement.
            </Text>
          </Pressable>
          <BtnPrimary
            label="Accept & continue"
            disabled={!checked}
            onPress={() => {
              setTutorConsented(true);
              router.replace('/tutor/home');
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

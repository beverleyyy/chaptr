import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { useDemo, type DemoRole } from '@/context/DemoContext';
import { Screen, Display, BtnPrimary, DimText } from '@/components/ui';
import { colors, fonts } from '@/constants/theme';

function roleFromParam(value: string | string[] | undefined): DemoRole | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === 'student' || raw === 'tutor') return raw;
  return null;
}

/**
 * Deep link: /demo opens the chooser. /demo?as=student or /demo?as=tutor
 * enters that view immediately so a shared link can skip the picker.
 */
export default function DemoEntry() {
  const params = useLocalSearchParams<{ as?: string; role?: string }>();
  const router = useRouter();
  const { ready, enterDemo } = useDemo();
  const { setRole } = useApp();
  const jumped = useRef(false);
  const requested = roleFromParam(params.as) ?? roleFromParam(params.role);

  useEffect(() => {
    if (!ready || !requested || jumped.current) return;
    jumped.current = true;
    enterDemo(requested);
    setRole(requested);
    router.replace(requested === 'tutor' ? '/tutor/home' : '/student/home');
  }, [ready, requested, enterDemo, setRole, router]);

  const go = (role: DemoRole) => {
    enterDemo(role);
    setRole(role);
    router.replace(role === 'tutor' ? '/tutor/home' : '/student/home');
  };

  return (
    <Screen glow="none">
      <View style={styles.body}>
        <Text style={styles.kicker}>Investor demo</Text>
        <Display style={{ fontSize: 28, marginTop: 6 }}>Try Ping</Display>
        <DimText style={styles.sub}>
          No sign-in. Sample Sec 3–4 E-Math tutoring in Singapore — video sessions, weeknights.
          Nothing is saved to Ping, and payment is simulated.
        </DimText>

        <View style={styles.actions}>
          <BtnPrimary label="Continue as student" onPress={() => go('student')} />
          <BtnPrimary label="Continue as tutor" onPress={() => go('tutor')} />
        </View>

        <Text style={styles.note}>
          You can switch between student and tutor any time. Exit demo returns to the role picker
          and clears the sample session.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 32,
  },
  kicker: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.accent,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sub: {
    marginTop: 10,
    lineHeight: 21,
    maxWidth: 420,
  },
  actions: {
    marginTop: 28,
    gap: 12,
    maxWidth: 420,
  },
  note: {
    marginTop: 22,
    fontFamily: fonts.medium,
    fontSize: 12.5,
    color: colors.textDim,
    lineHeight: 18,
    maxWidth: 420,
  },
});

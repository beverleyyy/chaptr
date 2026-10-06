import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/context/AppContext';
import { useDemo } from '@/context/DemoContext';
import { colors, fonts } from '@/constants/theme';

function inDemoShell(path: string): boolean {
  return path.startsWith('/student') || path.startsWith('/tutor');
}

/** Persistent demo badge, role switch, and exit. Sits above the real screens. */
export function DemoChrome() {
  const { active, role, setDemoRole, exitDemo } = useDemo();
  const { setRole } = useApp();
  const router = useRouter();
  const path = usePathname();
  const insets = useSafeAreaInsets();

  if (!active || !inDemoShell(path)) return null;

  const next = role === 'tutor' ? 'student' : 'tutor';
  const switchLabel = next === 'tutor' ? 'Switch to tutor view' : 'Switch to student view';

  const onSwitch = () => {
    setDemoRole(next);
    setRole(next);
    router.replace(next === 'tutor' ? '/tutor/home' : '/student/home');
  };

  const onExit = () => {
    exitDemo();
    router.replace('/role');
  };

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { top: Math.max(insets.top, 0) }]}
    >
      <View style={styles.bar}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Demo</Text>
        </View>
        <Pressable
          onPress={onSwitch}
          accessibilityRole="button"
          accessibilityLabel={switchLabel}
          style={styles.switchBtn}
        >
          <Text style={styles.switchText}>{switchLabel}</Text>
        </Pressable>
        <Pressable
          onPress={onExit}
          accessibilityRole="button"
          accessibilityLabel="Exit demo"
          hitSlop={8}
        >
          <Text style={styles.exitText}>Exit demo</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 80,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  badge: {
    backgroundColor: colors.accentSoft,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.accentDark,
  },
  switchBtn: {
    paddingVertical: 2,
  },
  switchText: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.accent,
  },
  exitText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textDim,
  },
});

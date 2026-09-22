import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { colors, fonts } from '@/constants/theme';
import { isStripePublishableConfigured } from '@/lib/paynowApi';

export default function RolePicker() {
  const router = useRouter();
  const {
    setRole,
    studentConsented,
    tutorConsented,
    usingBackend,
    curriculumReady,
    curriculumLoading,
  } = useApp();
  const { configured, profile, signOut, session, loading } = useAuth();

  const needsSignIn = configured && !loading && !session;

  const goStudent = () => {
    if (needsSignIn) {
      router.replace('/auth/sign-in');
      return;
    }
    setRole('student');
    if (!studentConsented) {
      router.replace('/student/consent');
      return;
    }
    if (curriculumLoading) {
      router.replace('/student/home');
      return;
    }
    router.replace(curriculumReady ? '/student/home' : '/student/curriculum');
  };
  const goTutor = () => {
    if (needsSignIn) {
      router.replace('/auth/sign-in');
      return;
    }
    setRole('tutor');
    router.replace(tutorConsented ? '/tutor/home' : '/tutor/consent');
  };

  // When signed in with a fixed profile role, prefer that path but still allow demo switch in mock
  const lockedRole = configured && profile?.role ? profile.role : null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.brand}>Ping</Text>
      <Text style={styles.sub}>
        Just Ping a tutor — book a topic, get matched, and pay. A tutor accepts on demand.
      </Text>
      {configured && session ? (
        <Text style={styles.hint}>
          Signed in{profile?.name ? ` as ${profile.name}` : ''}
          {lockedRole ? ` · ${lockedRole}` : ''}
        </Text>
      ) : (
        <Text style={styles.hint}>
          {needsSignIn
            ? 'Sign in to open student or tutor'
            : usingBackend
              ? 'Choose how to continue'
              : 'Choose a demo role to continue'}
        </Text>
      )}

      {needsSignIn ? (
        <>
          <Pressable style={styles.signInBtn} onPress={() => router.replace('/auth/sign-in')}>
            <Text style={styles.signInBtnText}>Sign in</Text>
          </Pressable>
          <View style={[styles.switch, styles.switchDisabled]}>
            <View style={[styles.btn, styles.btnDisabled]}>
              <Text style={styles.btnText}>Student view</Text>
            </View>
            <View style={[styles.btn, styles.btnDisabled]}>
              <Text style={styles.btnText}>Tutor view</Text>
            </View>
          </View>
          <Text style={styles.note}>
            Live mode needs an account. Sign in (or create one) before opening Student or Tutor.
          </Text>
        </>
      ) : (
        <>
          <View style={styles.switch}>
            <Pressable
              style={[styles.btn, (!lockedRole || lockedRole === 'student') && styles.active]}
              onPress={goStudent}
            >
              <Text
                style={
                  !lockedRole || lockedRole === 'student' ? styles.btnActiveText : styles.btnText
                }
              >
                Student view
              </Text>
            </Pressable>
            <Pressable
              style={[styles.btn, lockedRole === 'tutor' && styles.active]}
              onPress={goTutor}
            >
              <Text style={lockedRole === 'tutor' ? styles.btnActiveText : styles.btnText}>
                Tutor view
              </Text>
            </Pressable>
          </View>
          <Text style={styles.note}>
            {configured
              ? isStripePublishableConfigured()
                ? 'Connected to Supabase — requests & sessions sync when online. PayNow uses Stripe test mode when the Edge Function secret is set.'
                : 'Connected to Supabase — requests & sessions sync when online. Add EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY for live PayNow QR.'
              : 'Mock data only — set EXPO_PUBLIC_SUPABASE_* in .env for real auth & data.'}
          </Text>
        </>
      )}

      {configured && session ? (
        <Pressable
          style={{ marginTop: 16 }}
          onPress={async () => {
            await signOut();
            router.replace('/auth/sign-in');
          }}
        >
          <Text style={styles.signOut}>Sign out</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.pageBg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  brand: {
    fontFamily: fonts.extraBold,
    fontSize: 28,
    color: colors.navy,
    marginBottom: 8,
  },
  sub: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textDim,
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 320,
    marginBottom: 28,
  },
  hint: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.textDim,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  signInBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 14,
    marginBottom: 18,
  },
  signInBtnText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.accentInk,
  },
  switch: {
    flexDirection: 'row',
    backgroundColor: colors.ink3,
    borderRadius: 14,
    padding: 4,
    gap: 6,
  },
  switchDisabled: {
    opacity: 0.45,
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 26,
    borderRadius: 11,
  },
  btnDisabled: {
    backgroundColor: 'transparent',
  },
  active: { backgroundColor: colors.accent },
  btnText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.textDim,
  },
  btnActiveText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.accentInk,
  },
  note: {
    marginTop: 24,
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textDim,
    textAlign: 'center',
    maxWidth: 340,
    lineHeight: 18,
  },
  signOut: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.accent,
  },
});

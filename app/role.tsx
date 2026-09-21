import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { colors, fonts } from '@/constants/theme';

export default function RolePicker() {
  const router = useRouter();
  const { setRole, studentConsented, tutorConsented, usingBackend } = useApp();
  const { configured, profile, signOut, session } = useAuth();

  const goStudent = () => {
    setRole('student');
    router.replace(studentConsented ? '/student/home' : '/student/consent');
  };
  const goTutor = () => {
    setRole('tutor');
    router.replace(tutorConsented ? '/tutor/home' : '/tutor/consent');
  };

  // When signed in with a fixed profile role, prefer that path but still allow demo switch in mock
  const lockedRole = configured && profile?.role ? profile.role : null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.brand}>Chaptr</Text>
      <Text style={styles.sub}>
        A student books a topic, gets matched, and pays — then a tutor accepts.
      </Text>
      {configured && session ? (
        <Text style={styles.hint}>
          Signed in{profile?.name ? ` as ${profile.name}` : ''}
          {lockedRole ? ` · ${lockedRole}` : ''}
        </Text>
      ) : (
        <Text style={styles.hint}>
          {usingBackend ? 'Choose how to continue' : 'Choose a demo role to continue'}
        </Text>
      )}
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
          ? 'Connected to Supabase — requests & sessions sync when online. Payments remain mock.'
          : 'Mock data only — set EXPO_PUBLIC_SUPABASE_* in .env for real auth & data.'}
      </Text>
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
    color: colors.accentDark,
    marginBottom: 8,
  },
  sub: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: '#767B84',
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
  switch: {
    flexDirection: 'row',
    backgroundColor: '#E4E7EB',
    borderRadius: 14,
    padding: 4,
    gap: 6,
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 26,
    borderRadius: 11,
  },
  active: { backgroundColor: colors.accent },
  btnText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: '#5B5F66',
  },
  btnActiveText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: '#fff',
  },
  note: {
    marginTop: 24,
    fontFamily: fonts.medium,
    fontSize: 12,
    color: '#767B84',
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

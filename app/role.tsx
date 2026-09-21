import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { colors, fonts } from '@/constants/theme';

export default function RolePicker() {
  const router = useRouter();
  const { setRole, studentConsented, tutorConsented } = useApp();

  const goStudent = () => {
    setRole('student');
    router.replace(studentConsented ? '/student/home' : '/student/consent');
  };
  const goTutor = () => {
    setRole('tutor');
    router.replace(tutorConsented ? '/tutor/home' : '/tutor/consent');
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.brand}>Chaptr</Text>
      <Text style={styles.sub}>
        A student books a topic, gets matched, and pays — then a tutor accepts.
      </Text>
      <Text style={styles.hint}>Choose a demo role to continue</Text>
      <View style={styles.switch}>
        <Pressable style={[styles.btn, styles.active]} onPress={goStudent}>
          <Text style={styles.btnActiveText}>Student view</Text>
        </Pressable>
        <Pressable style={styles.btn} onPress={goTutor}>
          <Text style={styles.btnText}>Tutor view</Text>
        </Pressable>
      </View>
      <Text style={styles.note}>Mock data only — no real payments or accounts.</Text>
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
  },
});

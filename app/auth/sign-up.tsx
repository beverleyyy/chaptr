import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/lib/types';
import { Screen, Display, BtnPrimary, DimText } from '@/components/ui';
import { colors, fonts } from '@/constants/theme';

export default function SignUp() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setInfo(null);
    if (!name.trim() || !email.trim() || password.length < 6) {
      setError('Name, email, and a password of at least 6 characters are required.');
      return;
    }
    setBusy(true);
    try {
      await signUp({
        email,
        password,
        name,
        role,
        phone: phone.trim() || undefined,
      });
      setInfo('Account created. If email confirmation is enabled, check your inbox; otherwise continue.');
      router.replace('/role');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign up failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen glow="none">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Display style={{ fontSize: 26 }}>Create account</Display>
          <DimText style={{ marginTop: 6, marginBottom: 18, lineHeight: 18 }}>
            We store only your name and optional phone (PDPA — minimal PII). No payment details.
          </DimText>

          <Text style={styles.label}>I am a</Text>
          <View style={styles.switch}>
            <Pressable
              style={[styles.btn, role === 'student' && styles.active]}
              onPress={() => setRole('student')}
            >
              <Text style={role === 'student' ? styles.btnActiveText : styles.btnText}>Student</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, role === 'tutor' && styles.active]}
              onPress={() => setRole('tutor')}
            >
              <Text style={role === 'tutor' ? styles.btnActiveText : styles.btnText}>Tutor</Text>
            </Pressable>
          </View>

          <Text style={styles.label}>Full name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Aiden Lim"
            placeholderTextColor={colors.textDim}
            textContentType="name"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.textDim}
          />

          <Text style={styles.label}>Phone (optional)</Text>
          <TextInput
            style={styles.input}
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            value={phone}
            onChangeText={setPhone}
            placeholder="+65 …"
            placeholderTextColor={colors.textDim}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            textContentType="newPassword"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            placeholderTextColor={colors.textDim}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {info ? <Text style={styles.info}>{info}</Text> : null}

          <View style={{ marginTop: 18 }}>
            {busy ? (
              <ActivityIndicator color={colors.accent} />
            ) : (
              <BtnPrimary label="Create account" onPress={onSubmit} />
            )}
          </View>

          <View style={styles.footer}>
            <DimText>Already have an account?</DimText>
            <Link href="/auth/sign-in" asChild>
              <Pressable>
                <Text style={styles.link}>Sign in</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 64,
    paddingBottom: 32,
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.textDim,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.ink2,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.text,
  },
  switch: {
    flexDirection: 'row',
    backgroundColor: colors.ink3,
    borderRadius: 14,
    padding: 4,
    gap: 6,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 11,
    alignItems: 'center',
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
  error: {
    marginTop: 12,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.danger,
  },
  info: {
    marginTop: 12,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.accentDark,
  },
  footer: {
    marginTop: 24,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.accent,
  },
});

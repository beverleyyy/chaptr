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
import { Screen, Display, BtnPrimary, DimText } from '@/components/ui';
import { colors, fonts } from '@/constants/theme';

export default function SignIn() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Enter email and password.');
      return;
    }
    setBusy(true);
    try {
      await signIn(email, password);
      router.replace('/role');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign in failed');
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
          <Display style={{ fontSize: 26 }}>Welcome back</Display>
          <DimText style={{ marginTop: 6, marginBottom: 22 }}>
            Sign in with your Chaptr email and password.
          </DimText>

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

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            textContentType="password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.textDim}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={{ marginTop: 18 }}>
            {busy ? (
              <ActivityIndicator color={colors.accent} />
            ) : (
              <BtnPrimary label="Sign in" onPress={onSubmit} />
            )}
          </View>

          <View style={styles.footer}>
            <DimText>New here?</DimText>
            <Link href="/auth/sign-up" asChild>
              <Pressable>
                <Text style={styles.link}>Create an account</Text>
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
    paddingTop: 72,
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
  error: {
    marginTop: 12,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.danger,
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

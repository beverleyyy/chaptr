import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { colors, fonts } from '@/constants/theme';

export default function Splash() {
  const router = useRouter();
  const { configured, loading, session } = useAuth();

  useEffect(() => {
    if (loading) return;
    const t = setTimeout(() => {
      if (configured && !session) {
        router.replace('/auth/sign-in');
      } else {
        router.replace('/role');
      }
    }, configured ? 900 : 1600);
    return () => clearTimeout(t);
  }, [router, configured, loading, session]);

  return (
    <View style={styles.wrap}>
      <View style={styles.iconBox}>
        <Ionicons name="book-outline" size={34} color="#fff" />
      </View>
      <Text style={styles.title}>Chaptr</Text>
      {loading ? <ActivityIndicator color="#fff" style={{ marginTop: 16 }} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.extraBold,
    fontSize: 30,
    color: '#fff',
    letterSpacing: -0.3,
  },
});

import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '@/constants/theme';

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.replace('/role'), 1600);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <View style={styles.wrap}>
      <View style={styles.iconBox}>
        <Ionicons name="book-outline" size={34} color="#fff" />
      </View>
      <Text style={styles.title}>Chaptr</Text>
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

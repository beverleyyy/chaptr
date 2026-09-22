import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/constants/theme';

export default function StudentLayout() {
  const router = useRouter();
  const { configured, loading, session } = useAuth();

  useEffect(() => {
    if (!configured || loading) return;
    if (!session) {
      router.replace('/auth/sign-in');
    }
  }, [configured, loading, session, router]);

  if (configured && !loading && !session) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.ink },
        animation: 'slide_from_right',
      }}
    />
  );
}

import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useDemo } from '@/context/DemoContext';
import { isInvestorDemo } from '@/lib/demoGate';
import { colors } from '@/constants/theme';

export default function TutorLayout() {
  const router = useRouter();
  const { configured, loading, session } = useAuth();
  const { ready: demoReady, active: demoActive } = useDemo();
  const inDemo = demoActive || isInvestorDemo();

  useEffect(() => {
    if (!demoReady || inDemo) return;
    if (!configured || loading) return;
    if (!session) {
      router.replace('/auth/sign-in');
    }
  }, [demoReady, inDemo, configured, loading, session, router]);

  if (!demoReady) return null;

  if (!inDemo && configured && !loading && !session) {
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

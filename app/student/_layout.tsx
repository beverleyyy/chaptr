import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { useDemo } from '@/context/DemoContext';
import { isInvestorDemo } from '@/lib/demoGate';
import { colors } from '@/constants/theme';

export default function StudentLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { configured, loading, session } = useAuth();
  const { ready: demoReady, active: demoActive } = useDemo();
  const { curriculumReady, curriculumLoading, studentConsented } = useApp();
  const inDemo = demoActive || isInvestorDemo();

  useEffect(() => {
    if (!demoReady || inDemo) return;
    if (!configured || loading) return;
    if (!session) {
      router.replace('/auth/sign-in');
    }
  }, [demoReady, inDemo, configured, loading, session, router]);

  useEffect(() => {
    if (curriculumLoading) return;
    const onCurriculum = segments.includes('curriculum');
    const onConsent = segments.includes('consent');
    if (!studentConsented && !onConsent) return;
    if (!curriculumReady && !onCurriculum && !onConsent) {
      router.replace('/student/curriculum');
    }
  }, [
    curriculumLoading,
    curriculumReady,
    studentConsented,
    segments,
    router,
  ]);

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

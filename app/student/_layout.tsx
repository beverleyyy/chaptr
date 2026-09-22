import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { colors } from '@/constants/theme';

export default function StudentLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { configured, loading, session } = useAuth();
  const { curriculumReady, curriculumLoading, studentConsented } = useApp();

  useEffect(() => {
    if (!configured || loading) return;
    if (!session) {
      router.replace('/auth/sign-in');
    }
  }, [configured, loading, session, router]);

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

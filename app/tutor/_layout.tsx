import { Stack } from 'expo-router';
import { colors } from '@/constants/theme';

export default function TutorLayout() {
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

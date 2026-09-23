import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { AuthProvider } from '@/context/AuthContext';
import { AppProvider } from '@/context/AppContext';
import { colors } from '@/constants/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

/** Native splash only. Web has no splash overlay, so this must not gate the tree. */
const FONT_SPLASH_TIMEOUT_MS = 2500;

function RootStack() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.ink },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen name="role" options={{ animation: 'fade' }} />
        <Stack.Screen name="auth" options={{ animation: 'fade' }} />
        <Stack.Screen name="student" />
        <Stack.Screen name="tutor" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync().catch(() => {});
      return;
    }
    // FontFaceObserver rejects after 12s on web when the file 404s or never
    // paints, and `loaded` stays false. Hide the native splash anyway so a
    // slow or failed font cannot leave a blank screen. The tree below renders
    // either way and falls back to the platform font.
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, FONT_SPLASH_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [loaded, error]);

  return (
    <AuthProvider>
      <AppProvider>
        <RootStack />
      </AppProvider>
    </AuthProvider>
  );
}

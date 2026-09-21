import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from '@/lib/types';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '';
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '';

/** True when both public env vars are set — otherwise the app stays in mock demo mode. */
export const isSupabaseConfigured = Boolean(url && anonKey);

const LARGE_VALUE = 2048;

/**
 * SecureStore on native (with AsyncStorage fallback for oversized JWTs / web).
 * Expo SecureStore has a ~2048 byte limit per value.
 */
const ChaptrStorage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return AsyncStorage.getItem(key);
    }
    try {
      const secure = await SecureStore.getItemAsync(key);
      if (secure != null) return secure;
      return AsyncStorage.getItem(key);
    } catch {
      return AsyncStorage.getItem(key);
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(key, value);
      return;
    }
    if (value.length > LARGE_VALUE) {
      await AsyncStorage.setItem(key, value);
      try {
        await SecureStore.deleteItemAsync(key);
      } catch {
        /* ignore */
      }
      return;
    }
    try {
      await SecureStore.setItemAsync(key, value);
      await AsyncStorage.removeItem(key);
    } catch {
      await AsyncStorage.setItem(key, value);
    }
  },
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(key);
      return;
    }
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      /* ignore */
    }
    await AsyncStorage.removeItem(key);
  },
};

let client: SupabaseClient<Database> | null = null;

export function getSupabase(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured) return null;
  if (!client) {
    client = createClient<Database>(url, anonKey, {
      auth: {
        storage: ChaptrStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}

/** Non-null client — throw if used outside configured mode. */
export function requireSupabase(): SupabaseClient<Database> {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase is not configured');
  return sb;
}

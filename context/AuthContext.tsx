import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Profile, UserRole } from '@/lib/types';

type SignUpInput = {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
};

type AuthState = {
  configured: boolean;
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

async function loadProfile(userId: string): Promise<Profile | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) {
    console.warn('Failed to load profile', error.message);
    return null;
  }
  return data as Profile | null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const refreshProfile = useCallback(async () => {
    const uid = session?.user?.id;
    if (!uid) {
      setProfile(null);
      return;
    }
    const p = await loadProfile(uid);
    setProfile(p);
  }, [session?.user?.id]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    const sb = getSupabase();
    if (!sb) {
      setLoading(false);
      return;
    }

    let mounted = true;

    sb.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session?.user) {
        const p = await loadProfile(data.session.user.id);
        if (mounted) setProfile(p);
      }
      if (mounted) setLoading(false);
    });

    const { data: sub } = sb.auth.onAuthStateChange(async (_event, next) => {
      setSession(next);
      if (next?.user) {
        const p = await loadProfile(next.user.id);
        setProfile(p);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase is not configured');
    const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async (input: SignUpInput) => {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase is not configured');
    const { data, error } = await sb.auth.signUp({
      email: input.email.trim(),
      password: input.password,
      options: {
        data: {
          role: input.role,
          name: input.name.trim(),
          phone: input.phone?.trim() || null,
        },
      },
    });
    if (error) throw error;

    // If email confirmation is off, session exists — ensure profile row
    if (data.user) {
      const { error: upsertErr } = await sb.from('profiles').upsert({
        id: data.user.id,
        role: input.role,
        name: input.name.trim(),
        phone: input.phone?.trim() || null,
      });
      if (upsertErr) console.warn('Profile upsert', upsertErr.message);
    }
  }, []);

  const signOut = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) return;
    const { error } = await sb.auth.signOut();
    if (error) throw error;
    setProfile(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      configured: isSupabaseConfigured,
      loading,
      session,
      user: session?.user ?? null,
      profile,
      signIn,
      signUp,
      signOut,
      refreshProfile,
    }),
    [loading, session, profile, signIn, signUp, signOut, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

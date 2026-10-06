import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setInvestorDemoActive } from '@/lib/demoGate';

const STORAGE_KEY = 'ping.investorDemo.v1';

export type DemoRole = 'student' | 'tutor';

type StoredDemo = {
  role?: string;
};

type DemoState = {
  /** False until AsyncStorage has been read. Route guards wait on this. */
  ready: boolean;
  active: boolean;
  role: DemoRole;
  enterDemo: (role: DemoRole) => void;
  setDemoRole: (role: DemoRole) => void;
  exitDemo: () => void;
};

const DemoContext = createContext<DemoState | null>(null);

function parseRole(value: string | undefined): DemoRole {
  return value === 'tutor' ? 'tutor' : 'student';
}

async function persist(role: DemoRole) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ role }));
  } catch (e) {
    console.warn('demo persist', e);
  }
}

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(false);
  const [role, setRole] = useState<DemoRole>('student');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (cancelled || !raw) return;
        const parsed = JSON.parse(raw) as StoredDemo;
        const next = parseRole(parsed.role);
        setInvestorDemoActive(true);
        setRole(next);
        setActive(true);
      } catch (e) {
        console.warn('demo hydrate', e);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const enterDemo = useCallback((next: DemoRole) => {
    setInvestorDemoActive(true);
    setRole(next);
    setActive(true);
    void persist(next);
  }, []);

  const setDemoRole = useCallback((next: DemoRole) => {
    setRole(next);
    void persist(next);
  }, []);

  const exitDemo = useCallback(() => {
    setInvestorDemoActive(false);
    setActive(false);
    void AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, []);

  const value = useMemo<DemoState>(
    () => ({ ready, active, role, enterDemo, setDemoRole, exitDemo }),
    [ready, active, role, enterDemo, setDemoRole, exitDemo],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemo must be used within DemoProvider');
  return ctx;
}

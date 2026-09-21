import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  AVAILABILITY_DAYS,
  EXTRA_REQUEST,
  INITIAL_REQUESTS,
  REQUEST_ORDER,
  STYLE_TAGS,
  TUTOR_SUBJECTS,
  TutorRequest,
} from '@/constants/mockData';

export type Role = 'student' | 'tutor';
export type LocationType = 'inperson' | 'video';

type Booking = {
  topicId: string;
  mins: number;
  price: number;
  location: LocationType;
};

type Withdrawal = {
  amount: number;
  bank: string;
  when: string;
};

type AppState = {
  role: Role;
  setRole: (r: Role) => void;
  studentConsented: boolean;
  setStudentConsented: (v: boolean) => void;
  tutorConsented: boolean;
  setTutorConsented: (v: boolean) => void;
  booking: Booking;
  setBooking: (b: Partial<Booking>) => void;
  tutorOnline: boolean;
  setTutorOnline: (v: boolean) => void;
  requests: Record<string, TutorRequest>;
  pendingRequestIds: string[];
  acceptedRequestIds: string[];
  currentRequestId: string | null;
  setCurrentRequestId: (id: string | null) => void;
  acceptRequest: (id: string) => void;
  declineRequest: (id: string) => void;
  cancelSession: (id: string) => void;
  cancelledSeedIds: string[];
  cancelConfirmId: string | null;
  setCancelConfirmId: (id: string | null) => void;
  availableBalance: number;
  lastWithdrawal: Withdrawal | null;
  withdrawAmount: number;
  confirmWithdraw: () => void;
  tutorSubjects: string[];
  toggleTutorSubject: (s: string) => void;
  availabilityDays: Record<string, boolean>;
  toggleDay: (key: string) => void;
  profileBio: string;
  setProfileBio: (v: string) => void;
  styleTags: string[];
  toggleStyleTag: (t: string) => void;
  toastRequestId: string | null;
  dismissToast: () => void;
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>('student');
  const [studentConsented, setStudentConsented] = useState(false);
  const [tutorConsented, setTutorConsented] = useState(false);
  const [booking, setBookingState] = useState<Booking>({
    topicId: 'ch9',
    mins: 60,
    price: 20,
    location: 'inperson',
  });
  const [tutorOnline, setTutorOnline] = useState(true);
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [pendingRequestIds, setPending] = useState<string[]>([...REQUEST_ORDER]);
  const [acceptedRequestIds, setAccepted] = useState<string[]>([]);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [cancelledSeedIds, setCancelledSeeds] = useState<string[]>([]);
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);
  const [availableBalance, setBalance] = useState(168);
  const [lastWithdrawal, setLastWithdrawal] = useState<Withdrawal | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState(168);
  const [tutorSubjects, setTutorSubjects] = useState(['A Maths', 'E Maths']);
  const [availabilityDays, setDays] = useState(
    Object.fromEntries(AVAILABILITY_DAYS.map((d) => [d.key, d.on])),
  );
  const [profileBio, setProfileBio] = useState(
    'NUS Math & Physics undergrad, 3 years tutoring Sec 3–4 students for O-Levels. I like breaking problems down step by step and connecting concepts to real exam questions.',
  );
  const [styleTags, setStyleTags] = useState(['Patient', 'Exam-focused', 'Visual explainer']);
  const [toastRequestId, setToast] = useState<string | null>(null);
  const [extraInjected, setExtraInjected] = useState(false);

  const setBooking = useCallback((b: Partial<Booking>) => {
    setBookingState((prev) => ({ ...prev, ...b }));
  }, []);

  const acceptRequest = useCallback((id: string) => {
    setPending((ids) => ids.filter((x) => x !== id));
    setAccepted((ids) => (ids.includes(id) ? ids : [...ids, id]));
  }, []);

  const declineRequest = useCallback((id: string) => {
    setPending((ids) => ids.filter((x) => x !== id));
    setCurrentRequestId(null);
  }, []);

  const cancelSession = useCallback((id: string) => {
    setAccepted((ids) => {
      if (ids.includes(id)) return ids.filter((x) => x !== id);
      return ids;
    });
    setCancelledSeeds((ids) => (ids.includes(id) ? ids : [...ids, id]));
    setCancelConfirmId(null);
  }, []);

  const confirmWithdraw = useCallback(() => {
    setWithdrawAmount(availableBalance);
    setLastWithdrawal({
      amount: availableBalance,
      bank: 'DBS Bank · ••••1234',
      when: 'just now',
    });
    setBalance(0);
  }, [availableBalance]);

  const toggleTutorSubject = useCallback((s: string) => {
    setTutorSubjects((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  }, []);

  const toggleDay = useCallback((key: string) => {
    setDays((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const toggleStyleTag = useCallback((t: string) => {
    setStyleTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );
  }, []);

  // Countdown timers for pending requests
  useEffect(() => {
    const tick = setInterval(() => {
      setRequests((prev) => {
        const next: typeof prev = { ...prev };
        let changed = false;
        Object.keys(next).forEach((id) => {
          if (next[id].secondsLeft > 0) {
            next[id] = { ...next[id], secondsLeft: next[id].secondsLeft - 1 };
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  // Prune expired pending requests when secondsLeft hits 0
  useEffect(() => {
    const expired = pendingRequestIds.filter((id) => (requests[id]?.secondsLeft ?? 0) <= 0);
    if (!expired.length) return;
    setPending((ids) => ids.filter((id) => !expired.includes(id)));
    if (currentRequestId && expired.includes(currentRequestId)) {
      setCurrentRequestId(null);
    }
  }, [requests, pendingRequestIds, currentRequestId]);

  // Inject extra request after 14s
  useEffect(() => {
    if (extraInjected) return;
    const t = setTimeout(() => {
      setExtraInjected(true);
      setRequests((prev) => ({ ...prev, [EXTRA_REQUEST.id]: EXTRA_REQUEST }));
      if (!tutorOnline) return;
      setPending((ids) => [...ids, EXTRA_REQUEST.id]);
      if (role === 'tutor') setToast(EXTRA_REQUEST.id);
    }, 14000);
    return () => clearTimeout(t);
  }, [extraInjected, tutorOnline, role]);

  const value = useMemo<AppState>(
    () => ({
      role,
      setRole,
      studentConsented,
      setStudentConsented,
      tutorConsented,
      setTutorConsented,
      booking,
      setBooking,
      tutorOnline,
      setTutorOnline,
      requests,
      pendingRequestIds,
      acceptedRequestIds,
      currentRequestId,
      setCurrentRequestId,
      acceptRequest,
      declineRequest,
      cancelSession,
      cancelledSeedIds,
      cancelConfirmId,
      setCancelConfirmId,
      availableBalance,
      lastWithdrawal,
      withdrawAmount,
      confirmWithdraw,
      tutorSubjects,
      toggleTutorSubject,
      availabilityDays,
      toggleDay,
      profileBio,
      setProfileBio,
      styleTags,
      toggleStyleTag,
      toastRequestId,
      dismissToast: () => setToast(null),
    }),
    [
      role,
      studentConsented,
      tutorConsented,
      booking,
      setBooking,
      tutorOnline,
      requests,
      pendingRequestIds,
      acceptedRequestIds,
      currentRequestId,
      acceptRequest,
      declineRequest,
      cancelSession,
      cancelledSeedIds,
      cancelConfirmId,
      availableBalance,
      lastWithdrawal,
      withdrawAmount,
      confirmWithdraw,
      tutorSubjects,
      toggleTutorSubject,
      availabilityDays,
      toggleDay,
      profileBio,
      styleTags,
      toggleStyleTag,
      toastRequestId,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

// re-export helpers used by screens
export { TUTOR_SUBJECTS, STYLE_TAGS };

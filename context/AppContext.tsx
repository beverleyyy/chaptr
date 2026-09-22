import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AVAILABILITY_DAYS,
  DURATIONS,
  EXTRA_REQUEST,
  EARNINGS,
  INITIAL_REQUESTS,
  REQUEST_ORDER,
  STYLE_TAGS,
  TOPICS,
  TUTOR_SUBJECTS,
  TutorRequest,
  EarningRow,
  resolveTopic,
} from '@/constants/mockData';
import type { StudentCurriculumEntry } from '@/constants/curriculum';
import {
  fetchStudentCurriculum,
  loadLocalCurriculum,
  saveStudentCurriculum,
} from '@/lib/curriculumApi';
import {
  createStudentTest,
  deleteStudentTest,
  fetchStudentTests,
  loadLocalTests,
  updateStudentTest,
  type StudentTest,
  type TestInput,
} from '@/lib/testsApi';
import {
  EMPTY_INSIGHTS,
  type StudentInsights,
} from '@/constants/studentProfile';
import {
  fetchStudentWeaknesses,
  insightsFromProfile,
  loadLocalInsightsBundle,
  saveStudentInsights,
  saveStudentWeaknesses,
} from '@/lib/studentProfileApi';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  acceptTutoringRequest,
  createTutoringRequest,
  declineTutoringRequest,
  ensureOwnProfile,
  fetchPendingRequests,
  fetchTutorEarnings,
  fetchTutorSessions,
  watchPendingRequestInserts,
  type MatchedTutorInfo,
  formatApiError,
} from '@/lib/requestsApi';
import { useAuth } from '@/context/AuthContext';

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
  /** Student request created after "I've paid" (backend). */
  liveRequestId: string | null;
  setLiveRequestId: (id: string | null) => void;
  /** Populated when a tutor accepts the live student request. */
  matchedTutor: MatchedTutorInfo | null;
  setMatchedTutor: (m: MatchedTutorInfo | null) => void;
  acceptRequest: (id: string) => Promise<void>;
  declineRequest: (id: string) => Promise<void>;
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
  /** Create a tutoring request after mock/real payment confirm. */
  submitBookingRequest: (
    subject: string,
    note?: string | null,
    stripePaymentIntentId?: string | null,
  ) => Promise<string | null>;
  refreshTutorData: () => Promise<void>;
  tutorDataError: string | null;
  earningsRows: EarningRow[];
  weekEarningsTotal: number;
  weekSessionCount: number;
  usingBackend: boolean;
  busyAction: boolean;
  /** Student Full SBB / SEC subjects + G1|G2|G3 levels. */
  studentCurriculum: StudentCurriculumEntry[];
  curriculumLoading: boolean;
  curriculumReady: boolean;
  refreshCurriculum: () => Promise<void>;
  saveCurriculum: (entries: StudentCurriculumEntry[]) => Promise<void>;
  /** Upcoming / saved test dates tied to topic keys. */
  studentTests: StudentTest[];
  testsLoading: boolean;
  refreshTests: () => Promise<void>;
  addTest: (input: TestInput) => Promise<StudentTest>;
  editTest: (id: string, input: TestInput) => Promise<StudentTest>;
  removeTest: (id: string) => Promise<void>;
  /** Optional student insight fields for tutors. */
  studentInsights: StudentInsights;
  studentWeaknesses: string[];
  insightsLoading: boolean;
  refreshInsights: () => Promise<void>;
  saveInsights: (insights: StudentInsights, weaknessTopicKeys: string[]) => Promise<void>;
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { profile, user, refreshProfile } = useAuth();
  const usingBackend = isSupabaseConfigured;

  const [role, setRole] = useState<Role>('student');
  const [studentConsented, setStudentConsented] = useState(false);
  const [tutorConsented, setTutorConsented] = useState(false);
  const [booking, setBookingState] = useState<Booking>({
    topicId: 'am_02',
    mins: 60,
    price: DURATIONS.find((d) => d.mins === 60)?.price ?? 35,
    location: 'inperson',
  });
  const [tutorOnline, setTutorOnline] = useState(true);
  const [requests, setRequests] = useState<Record<string, TutorRequest>>(
    usingBackend ? {} : INITIAL_REQUESTS,
  );
  const [pendingRequestIds, setPending] = useState<string[]>(
    usingBackend ? [] : [...REQUEST_ORDER],
  );
  const [acceptedRequestIds, setAccepted] = useState<string[]>([]);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [liveRequestId, setLiveRequestId] = useState<string | null>(null);
  const [matchedTutor, setMatchedTutor] = useState<MatchedTutorInfo | null>(null);
  const [cancelledSeedIds, setCancelledSeeds] = useState<string[]>([]);
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);
  const [availableBalance, setBalance] = useState(usingBackend ? 0 : 168);
  const [lastWithdrawal, setLastWithdrawal] = useState<Withdrawal | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState(usingBackend ? 0 : 168);
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
  const [earningsRows, setEarningsRows] = useState<EarningRow[]>(usingBackend ? [] : EARNINGS);
  const [weekEarningsTotal, setWeekTotal] = useState(usingBackend ? 0 : 184);
  const [weekSessionCount, setWeekCount] = useState(usingBackend ? 0 : 9);
  const [busyAction, setBusyAction] = useState(false);
  const [tutorDataError, setTutorDataError] = useState<string | null>(null);
  const knownPendingRef = useRef<Set<string>>(new Set());
  const [studentCurriculum, setStudentCurriculum] = useState<StudentCurriculumEntry[]>([]);
  const [curriculumLoading, setCurriculumLoading] = useState(true);
  const [studentTests, setStudentTests] = useState<StudentTest[]>([]);
  const [testsLoading, setTestsLoading] = useState(true);
  const [studentInsights, setStudentInsights] = useState<StudentInsights>({
    ...EMPTY_INSIGHTS,
  });
  const [studentWeaknesses, setStudentWeaknesses] = useState<string[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(true);

  // Sync role from authenticated profile when backend is on
  useEffect(() => {
    if (usingBackend && profile?.role) {
      setRole(profile.role);
    }
  }, [usingBackend, profile?.role]);

  const refreshCurriculum = useCallback(async () => {
    setCurriculumLoading(true);
    try {
      if (usingBackend && user?.id) {
        const rows = await fetchStudentCurriculum(user.id);
        setStudentCurriculum(rows);
      } else if (!usingBackend) {
        const rows = await loadLocalCurriculum();
        setStudentCurriculum(rows);
      } else {
        setStudentCurriculum([]);
      }
    } catch (e) {
      console.warn('refreshCurriculum', e);
      setStudentCurriculum([]);
    } finally {
      setCurriculumLoading(false);
    }
  }, [usingBackend, user?.id]);

  const refreshTests = useCallback(async () => {
    setTestsLoading(true);
    try {
      if (usingBackend && user?.id) {
        const rows = await fetchStudentTests(user.id);
        setStudentTests(rows);
      } else if (!usingBackend) {
        const rows = await loadLocalTests();
        setStudentTests(rows);
      } else {
        setStudentTests([]);
      }
    } catch (e) {
      console.warn('refreshTests', e);
      setStudentTests([]);
    } finally {
      setTestsLoading(false);
    }
  }, [usingBackend, user?.id]);

  const refreshInsights = useCallback(async () => {
    setInsightsLoading(true);
    try {
      if (usingBackend && user?.id) {
        const fromProfile = insightsFromProfile(profile);
        setStudentInsights(fromProfile);
        const weak = await fetchStudentWeaknesses(user.id);
        setStudentWeaknesses(weak);
      } else if (!usingBackend) {
        const local = await loadLocalInsightsBundle();
        setStudentInsights(local.insights);
        setStudentWeaknesses(local.weaknessTopicKeys);
      } else {
        setStudentInsights({ ...EMPTY_INSIGHTS });
        setStudentWeaknesses([]);
      }
    } catch (e) {
      console.warn('refreshInsights', e);
      setStudentInsights({ ...EMPTY_INSIGHTS });
      setStudentWeaknesses([]);
    } finally {
      setInsightsLoading(false);
    }
  }, [usingBackend, user?.id, profile]);

  useEffect(() => {
    void refreshCurriculum();
  }, [refreshCurriculum]);

  useEffect(() => {
    void refreshTests();
  }, [refreshTests]);

  useEffect(() => {
    void refreshInsights();
  }, [refreshInsights]);

  const saveCurriculum = useCallback(
    async (entries: StudentCurriculumEntry[]) => {
      const saved = await saveStudentCurriculum(entries);
      setStudentCurriculum(saved);
      const first = saved[0];
      if (first) {
        const firstTopic = Object.values(TOPICS).find((t) => t.subjectKey === first.subjectKey);
        if (firstTopic) {
          setBookingState((prev) => ({ ...prev, topicId: firstTopic.id }));
        }
      }
      if (usingBackend) {
        await refreshProfile();
      }
    },
    [usingBackend, refreshProfile],
  );

  const addTest = useCallback(async (input: TestInput) => {
    const row = await createStudentTest(input);
    setStudentTests((prev) => [...prev, row]);
    return row;
  }, []);

  const editTest = useCallback(async (id: string, input: TestInput) => {
    const row = await updateStudentTest(id, input);
    setStudentTests((prev) => prev.map((t) => (t.id === id ? row : t)));
    return row;
  }, []);

  const removeTest = useCallback(async (id: string) => {
    await deleteStudentTest(id);
    setStudentTests((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const saveInsights = useCallback(
    async (insights: StudentInsights, weaknessTopicKeys: string[]) => {
      const savedInsights = await saveStudentInsights(insights);
      const savedWeak = await saveStudentWeaknesses(weaknessTopicKeys);
      setStudentInsights(savedInsights);
      setStudentWeaknesses(savedWeak);
      if (usingBackend) {
        await refreshProfile();
      }
    },
    [usingBackend, refreshProfile],
  );

  const curriculumReady = studentCurriculum.length > 0;

  const setBooking = useCallback((b: Partial<Booking>) => {
    setBookingState((prev) => ({ ...prev, ...b }));
  }, []);

  const refreshTutorData = useCallback(async () => {
    if (!usingBackend || !user?.id) return;

    // Tutors without a profiles row fail RLS on pending SELECT — ensure first
    const meta = user.user_metadata ?? {};
    const name =
      profile?.name?.trim() ||
      (typeof meta.name === 'string' ? meta.name : '') ||
      user.email?.split('@')[0] ||
      'Tutor';
    try {
      await ensureOwnProfile({
        role: 'tutor',
        name,
        phone: profile?.phone ?? (typeof meta.phone === 'string' ? meta.phone : null),
      });
    } catch (profileErr) {
      console.warn('ensureOwnProfile tutor', profileErr);
    }

    // Pending must not be blocked by sessions/earnings failures (RLS, empty policies, etc.)
    const [pendingResult, sessionsResult, earningsResult] = await Promise.allSettled([
      fetchPendingRequests(),
      fetchTutorSessions(user.id),
      fetchTutorEarnings(user.id),
    ]);

    if (pendingResult.status === 'fulfilled') {
      const pending = pendingResult.value;
      const prevKnown = knownPendingRef.current;
      const nextKnown = new Set(pending.pendingIds);
      if (prevKnown.size > 0) {
        for (const id of pending.pendingIds) {
          if (!prevKnown.has(id) && tutorOnline && role === 'tutor') {
            setToast(id);
            break;
          }
        }
      }
      knownPendingRef.current = nextKnown;
      setPending(pending.pendingIds);
      setRequests((prev) => ({ ...prev, ...pending.requests }));
      setTutorDataError(null);
    } else {
      const msg = formatApiError(pendingResult.reason);
      console.warn('refreshTutorData pending', pendingResult.reason);
      setTutorDataError(msg);
    }

    if (sessionsResult.status === 'fulfilled') {
      const sessions = sessionsResult.value;
      setAccepted(sessions.acceptedIds);
      setRequests((prev) => ({ ...prev, ...sessions.requests }));
    } else {
      console.warn('refreshTutorData sessions', sessionsResult.reason);
    }

    if (earningsResult.status === 'fulfilled') {
      const earnings = earningsResult.value;
      setEarningsRows(earnings.rows);
      setBalance(earnings.availableBalance);
      setWithdrawAmount(earnings.availableBalance);
      setWeekTotal(earnings.weekTotal);
      setWeekCount(earnings.weekCount);
    } else {
      console.warn('refreshTutorData earnings', earningsResult.reason);
    }
  }, [usingBackend, user, profile, tutorOnline, role]);

  useEffect(() => {
    if (!usingBackend || !user?.id) return;
    // Tutor UI role picker OR loaded tutor profile — do not wait forever on profile.
    const isTutor = profile?.role === 'tutor' || role === 'tutor';
    if (!isTutor) return;
    void refreshTutorData();
    const t = setInterval(() => void refreshTutorData(), 5000);
    const unsub = watchPendingRequestInserts(() => {
      void refreshTutorData();
    });
    return () => {
      clearInterval(t);
      unsub();
    };
  }, [usingBackend, profile?.role, role, user?.id, refreshTutorData]);

  const acceptRequest = useCallback(
    async (id: string) => {
      if (usingBackend) {
        setBusyAction(true);
        try {
          const session = await acceptTutoringRequest(id);
          if (session?.video_link) {
            setRequests((prev) => {
              const existing = prev[id];
              if (!existing) return prev;
              return { ...prev, [id]: { ...existing, videoLink: session.video_link } };
            });
          }
          setPending((ids) => ids.filter((x) => x !== id));
          setAccepted((ids) => (ids.includes(id) ? ids : [...ids, id]));
          setCurrentRequestId(id);
          await refreshTutorData();
        } finally {
          setBusyAction(false);
        }
        return;
      }
      setPending((ids) => ids.filter((x) => x !== id));
      setAccepted((ids) => (ids.includes(id) ? ids : [...ids, id]));
      setCurrentRequestId(id);
    },
    [usingBackend, refreshTutorData],
  );

  const declineRequest = useCallback(
    async (id: string) => {
      if (usingBackend) {
        setBusyAction(true);
        try {
          await declineTutoringRequest(id);
          setPending((ids) => ids.filter((x) => x !== id));
          setCurrentRequestId(null);
          await refreshTutorData();
        } finally {
          setBusyAction(false);
        }
        return;
      }
      setPending((ids) => ids.filter((x) => x !== id));
      setCurrentRequestId(null);
    },
    [usingBackend, refreshTutorData],
  );

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

  const submitBookingRequest = useCallback(
    async (subject: string, note?: string | null, stripePaymentIntentId?: string | null) => {
      if (!usingBackend) return null;
      if (!user?.id) throw new Error('Sign in required to create a request');
      if (studentCurriculum.length < 1) {
        throw new Error('Save your subjects before booking a tutor');
      }

      setBusyAction(true);
      try {
        if (profile?.role === 'tutor') {
          throw new Error('Tutor accounts cannot create student booking requests');
        }

        const topic = resolveTopic(booking.topicId);
        if (topic) {
          const allowed = studentCurriculum.some((c) => c.subjectKey === topic.subjectKey);
          if (!allowed) {
            throw new Error('That topic is not in your saved curriculum');
          }
        }

        const name =
          profile?.name?.trim() ||
          (typeof user.user_metadata?.name === 'string' ? user.user_metadata.name : '') ||
          user.email?.split('@')[0] ||
          'Student';

        // Profiles are client-created (auth trigger intentionally removed)
        const studentId = await ensureOwnProfile({
          role: 'student',
          name,
          phone: profile?.phone ?? null,
        });
        if (studentId !== user.id) {
          throw new Error('Profile id mismatch');
        }
        await refreshProfile();

        const row = await createTutoringRequest({
          studentId: user.id,
          topicKey: booking.topicId,
          subject,
          mins: booking.mins,
          price: booking.price,
          location: booking.location,
          note: note ?? null,
          name,
          phone: profile?.phone ?? null,
          stripePaymentIntentId: stripePaymentIntentId ?? null,
        });
        setLiveRequestId(row.id);
        setMatchedTutor(null);
        return row.id;
      } finally {
        setBusyAction(false);
      }
    },
    [usingBackend, user, profile, booking, refreshProfile, studentCurriculum],
  );

  // Elapsed wait timers for pending request UI (count up)
  useEffect(() => {
    const tick = setInterval(() => {
      setRequests((prev) => {
        const next: typeof prev = { ...prev };
        let changed = false;
        Object.keys(next).forEach((id) => {
          next[id] = { ...next[id], secondsWaiting: (next[id].secondsWaiting ?? 0) + 1 };
          changed = true;
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  // Prune pending requests past expiresAt (live); mock rows without expiresAt stay
  useEffect(() => {
    const now = Date.now();
    const expired = pendingRequestIds.filter((id) => {
      const exp = requests[id]?.expiresAt;
      if (!exp) return false;
      return new Date(exp).getTime() <= now;
    });
    if (!expired.length) return;
    setPending((ids) => ids.filter((id) => !expired.includes(id)));
    if (currentRequestId && expired.includes(currentRequestId)) {
      setCurrentRequestId(null);
    }
  }, [requests, pendingRequestIds, currentRequestId]);

  // Mock-only: inject extra request after 14s
  useEffect(() => {
    if (usingBackend) return;
    if (extraInjected) return;
    const t = setTimeout(() => {
      setExtraInjected(true);
      setRequests((prev) => ({ ...prev, [EXTRA_REQUEST.id]: EXTRA_REQUEST }));
      if (!tutorOnline) return;
      setPending((ids) => [...ids, EXTRA_REQUEST.id]);
      if (role === 'tutor') setToast(EXTRA_REQUEST.id);
    }, 14000);
    return () => clearTimeout(t);
  }, [extraInjected, tutorOnline, role, usingBackend]);

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
      liveRequestId,
      setLiveRequestId,
      matchedTutor,
      setMatchedTutor,
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
      submitBookingRequest,
      refreshTutorData,
      tutorDataError,
      earningsRows,
      weekEarningsTotal,
      weekSessionCount,
      usingBackend,
      busyAction,
      studentCurriculum,
      curriculumLoading,
      curriculumReady,
      refreshCurriculum,
      saveCurriculum,
      studentTests,
      testsLoading,
      refreshTests,
      addTest,
      editTest,
      removeTest,
      studentInsights,
      studentWeaknesses,
      insightsLoading,
      refreshInsights,
      saveInsights,
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
      liveRequestId,
      matchedTutor,
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
      submitBookingRequest,
      refreshTutorData,
      tutorDataError,
      earningsRows,
      weekEarningsTotal,
      weekSessionCount,
      usingBackend,
      busyAction,
      studentCurriculum,
      curriculumLoading,
      curriculumReady,
      refreshCurriculum,
      saveCurriculum,
      studentTests,
      testsLoading,
      refreshTests,
      addTest,
      editTest,
      removeTest,
      studentInsights,
      studentWeaknesses,
      insightsLoading,
      refreshInsights,
      saveInsights,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export { TUTOR_SUBJECTS, STYLE_TAGS };

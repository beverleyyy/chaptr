import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Image,
  Linking,
  Pressable,
  AppState,
  type AppStateStatus,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { Screen, Card, Display, BackHeader, BtnPrimary, DimText } from '@/components/ui';
import { HANDOFF_NOTE, resolveTopic } from '@/constants/mockData';
import { colors, fonts } from '@/constants/theme';
import { PayNowQR } from '@/components/PayNowQR';
import { goBackOrReplace } from '@/lib/navigation';
import { formatApiError } from '@/lib/requestsApi';
import {
  createPaynowPayment,
  fetchPaynowStatus,
  isStripePublishableConfigured,
} from '@/lib/paynowApi';

type PayPhase =
  | 'idle'
  | 'creating'
  | 'awaiting_scan'
  | 'submitting'
  | 'done'
  | 'failed'
  | 'canceled';

function isPaymentReturnUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return (
    url.startsWith('ping://payment-return') ||
    url.startsWith('chaptr://payment-return') ||
    url.includes('://payment-return')
  );
}

export default function Payment() {
  const { booking, submitBookingRequest, usingBackend, busyAction } = useApp();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [phase, setPhase] = useState<PayPhase>('idle');
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [hostedUrl, setHostedUrl] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [checkingNow, setCheckingNow] = useState(false);
  const submittedRef = useRef(false);
  const topic = resolveTopic(booking.topicId);
  const subjectLabel = topic?.subject ?? 'Session';

  const stripeLive = usingBackend && isStripePublishableConfigured();

  const finishBooking = useCallback(
    async (piId: string | null) => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      setPhase('submitting');
      setBusy(true);
      setErrorText(null);
      try {
        if (usingBackend) {
          const result = await Promise.race([
            submitBookingRequest(subjectLabel, HANDOFF_NOTE, piId),
            new Promise<never>((_, reject) =>
              setTimeout(
                () =>
                  reject(
                    new Error(
                      'Timed out creating the request. Check Supabase Edge Function logs, then retry.',
                    ),
                  ),
                20000,
              ),
            ),
          ]);
          void result;
        } else {
          await new Promise((r) => setTimeout(r, 900));
        }
        setPhase('done');
        router.push('/student/matching');
      } catch (e) {
        submittedRef.current = false;
        const msg = formatApiError(e);
        setErrorText(msg);
        setPhase('failed');
        Alert.alert('Could not create request', msg);
      } finally {
        setBusy(false);
      }
    },
    [usingBackend, submitBookingRequest, subjectLabel, router],
  );

  const finishBookingRef = useRef(finishBooking);
  finishBookingRef.current = finishBooking;
  const startedPayRef = useRef(false);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const paymentIntentIdRef = useRef(paymentIntentId);
  paymentIntentIdRef.current = paymentIntentId;

  const pollOnce = useCallback(async (): Promise<'succeeded' | 'pending' | 'terminal'> => {
    const piId = paymentIntentIdRef.current;
    if (!piId) return 'pending';
    try {
      const st = await fetchPaynowStatus(piId);
      if (st.status === 'succeeded') {
        setPhase('submitting');
        await finishBookingRef.current(piId);
        return 'succeeded';
      }
      if (st.status === 'canceled') {
        setPhase('canceled');
        setErrorText('Payment was canceled. Go back and try again.');
        return 'terminal';
      }
      if (st.status === 'failed' || st.status === 'requires_payment_method') {
        setPhase('failed');
        setErrorText('Payment failed. Go back and try again.');
        return 'terminal';
      }
      return 'pending';
    } catch {
      // Keep polling on transient errors
      return 'pending';
    }
  }, []);

  // Start PayNow PaymentIntent once when Stripe + backend are configured
  useEffect(() => {
    if (!stripeLive || startedPayRef.current) return;
    startedPayRef.current = true;
    let cancelled = false;

    (async () => {
      setPhase('creating');
      setErrorText(null);
      try {
        const res = await createPaynowPayment({
          amountCents: Math.round(Number(booking.price) * 100),
          currency: 'sgd',
          topicKey: booking.topicId,
          subject: subjectLabel,
          mins: booking.mins,
          price: booking.price,
          location: booking.location,
          note: HANDOFF_NOTE,
        });
        if (cancelled) return;
        setPaymentIntentId(res.paymentIntentId);
        setQrImageUrl(res.qrImageUrl);
        setHostedUrl(res.hostedInstructionsUrl);
        if (res.status === 'succeeded') {
          await finishBookingRef.current(res.paymentIntentId);
        } else {
          setPhase('awaiting_scan');
        }
      } catch (e) {
        if (cancelled) return;
        const msg = formatApiError(e);
        setErrorText(msg);
        setPhase('failed');
      }
    })();

    return () => {
      cancelled = true;
    };
    // Intentionally once per mount for this booking screen
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stripeLive]);

  // Poll payment status ~every 2s
  useEffect(() => {
    if (!stripeLive || !paymentIntentId || phase !== 'awaiting_scan') return;
    let stopped = false;

    const tick = async () => {
      if (stopped) return;
      await pollOnce();
    };

    void tick();
    const id = setInterval(() => void tick(), 2000);
    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, [stripeLive, paymentIntentId, phase, pollOnce]);

  // When returning from browser / banking app, poll immediately (JS timers may have paused)
  useEffect(() => {
    if (!stripeLive) return;

    const onChange = (next: AppStateStatus) => {
      if (next !== 'active') return;
      if (phaseRef.current !== 'awaiting_scan') return;
      if (!paymentIntentIdRef.current) return;
      void pollOnce();
    };

    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [stripeLive, pollOnce]);

  // Lightweight deep-link: Stripe return_url is ping://payment-return.
  // chaptr:// stays accepted for PaymentIntents created before the scheme change.
  useEffect(() => {
    if (!stripeLive) return;

    const handleUrl = (url: string | null) => {
      if (!isPaymentReturnUrl(url)) return;
      if (phaseRef.current !== 'awaiting_scan') return;
      if (!paymentIntentIdRef.current) return;
      void pollOnce();
    };

    void Linking.getInitialURL().then(handleUrl);
    const sub = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => sub.remove();
  }, [stripeLive, pollOnce]);

  const checkPaymentNow = async () => {
    if (!stripeLive || phase !== 'awaiting_scan' || !paymentIntentId) return;
    if (busy || busyAction || checkingNow || submittedRef.current) return;
    setCheckingNow(true);
    setErrorText(null);
    try {
      const outcome = await pollOnce();
      if (outcome === 'pending') {
        setErrorText(
          'Payment not confirmed yet. If you already authorized on the Stripe page, wait a moment and tap again — or stay on this screen while we keep checking.',
        );
      }
    } finally {
      setCheckingNow(false);
    }
  };

  const confirmMock = async () => {
    if (busy || busyAction || stripeLive) return;
    await finishBooking(null);
  };

  const waiting =
    stripeLive &&
    (phase === 'creating' || phase === 'awaiting_scan' || phase === 'submitting');

  const awaitingScan = stripeLive && phase === 'awaiting_scan';
  const checkBusy = checkingNow || busy || busyAction;

  return (
    <Screen>
      <BackHeader title="Scan to pay" onBack={() => goBackOrReplace(router, '/student/home')} />
      <Text
        style={{
          marginHorizontal: 22,
          marginBottom: 8,
          fontFamily: fonts.medium,
          fontSize: 11,
          color: usingBackend ? colors.accentDark : colors.danger,
        }}
      >
        {usingBackend
          ? stripeLive
            ? 'LIVE PayNow (Stripe test) — request is created only after payment succeeds'
            : 'LIVE booking — tutors will see this request in Supabase (PayNow QR mock until Stripe is configured)'
          : 'DEMO MODE — not saving to Supabase. Fix .env and restart with npx expo start -c'}
      </Text>
      <View style={styles.body}>
        <View style={{ alignItems: 'center' }}>
          <DimText>Amount due</DimText>
          <Display style={{ fontSize: 28 }}>${booking.price}.00</Display>
        </View>

        <View style={styles.qrWrap}>
          {stripeLive && qrImageUrl ? (
            <Image
              source={{ uri: qrImageUrl }}
              style={{ width: 176, height: 176 }}
              accessibilityLabel="PayNow QR code"
            />
          ) : (
            <PayNowQR size={176} />
          )}
        </View>

        <View style={{ alignItems: 'center' }}>
          <Text style={styles.payTitle}>
            {stripeLive ? 'PayNow · Stripe test' : 'PayNow · UEN 202601234A'}
          </Text>
          <DimText style={{ marginTop: 2 }}>Ping Tutor Sessions</DimText>
          {hostedUrl ? (
            <Pressable
              onPress={() => void Linking.openURL(hostedUrl)}
              style={{ marginTop: 8 }}
              accessibilityRole="link"
            >
              <Text style={styles.link}>Open Stripe test PayNow page</Text>
            </Pressable>
          ) : null}
        </View>

        <Card style={styles.info}>
          <Ionicons name="time-outline" size={16} color={colors.textDim} />
          <DimText style={{ flex: 1, fontSize: 12, lineHeight: 17 }}>
            {stripeLive
              ? phase === 'creating'
                ? 'Creating your PayNow payment…'
                : phase === 'submitting'
                  ? 'Payment received — creating your tutoring request…'
                  : phase === 'canceled' || phase === 'failed'
                    ? errorText || 'Payment did not complete.'
                    : 'Authorize on the Stripe test page, then return to this Ping screen — the Stripe page will not open matching. We detect payment here (and when you come back to the app).'
              : usingBackend
                ? "Scan with your banking app, then confirm below once you've paid. Confirming creates a live tutoring request for tutors."
                : "Scan with your banking app, then confirm below once you've paid. (Mock payment — no money moves.)"}
          </DimText>
        </Card>

        {errorText && (phase === 'awaiting_scan' || phase === 'failed' || phase === 'canceled') ? (
          <Text style={styles.errorText} accessibilityRole="alert">
            {errorText}
          </Text>
        ) : null}

        <View style={{ marginTop: 'auto', width: '100%' }}>
          {stripeLive ? (
            <BtnPrimary
              label={
                phase === 'submitting' || busy || busyAction
                  ? 'Confirming payment…'
                  : phase === 'creating'
                    ? 'Preparing PayNow…'
                    : phase === 'failed' || phase === 'canceled'
                      ? 'Payment incomplete'
                      : awaitingScan
                        ? checkBusy
                          ? 'Checking payment…'
                          : "I've paid — check now"
                        : 'Waiting for payment…'
              }
              onPress={awaitingScan ? () => void checkPaymentNow() : () => {}}
              disabled={!awaitingScan || checkBusy}
            />
          ) : (
            <BtnPrimary
              label={busy || busyAction ? 'Confirming payment…' : "I've paid"}
              onPress={confirmMock}
              disabled={busy || busyAction || waiting}
            />
          )}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: 22,
    paddingBottom: 24,
    paddingTop: 10,
    alignItems: 'center',
    gap: 14,
  },
  qrWrap: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.hairline,
    shadowColor: '#14181C',
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  payTitle: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.text },
  info: { width: '100%', padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  errorText: {
    width: '100%',
    color: colors.danger,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  link: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.accent,
    textDecorationLine: 'underline',
  },
});

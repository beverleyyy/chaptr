import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Alert, Image, Linking, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { Screen, Card, Display, BackHeader, BtnPrimary, DimText } from '@/components/ui';
import { HANDOFF_NOTE, TOPICS } from '@/constants/mockData';
import { colors, fonts } from '@/constants/theme';
import { PayNowQR } from '@/components/PayNowQR';
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

export default function Payment() {
  const { booking, submitBookingRequest, usingBackend, busyAction } = useApp();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [phase, setPhase] = useState<PayPhase>('idle');
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [hostedUrl, setHostedUrl] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const submittedRef = useRef(false);
  const topic = TOPICS[booking.topicId];

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
            submitBookingRequest(topic.subject, HANDOFF_NOTE, piId),
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
    [usingBackend, submitBookingRequest, topic.subject, router],
  );

  const finishBookingRef = useRef(finishBooking);
  finishBookingRef.current = finishBooking;
  const startedPayRef = useRef(false);

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
          subject: topic.subject,
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
      try {
        const st = await fetchPaynowStatus(paymentIntentId);
        if (stopped) return;
        if (st.status === 'succeeded') {
          setPhase('submitting');
          await finishBookingRef.current(paymentIntentId);
        } else if (st.status === 'canceled') {
          setPhase('canceled');
          setErrorText('Payment was canceled. Go back and try again.');
        } else if (st.status === 'failed' || st.status === 'requires_payment_method') {
          setPhase('failed');
          setErrorText('Payment failed. Go back and try again.');
        }
      } catch {
        // Keep polling on transient errors
      }
    };

    void tick();
    const id = setInterval(() => void tick(), 2000);
    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, [stripeLive, paymentIntentId, phase]);

  const confirmMock = async () => {
    if (busy || busyAction || stripeLive) return;
    await finishBooking(null);
  };

  const waiting =
    stripeLive &&
    (phase === 'creating' || phase === 'awaiting_scan' || phase === 'submitting');

  return (
    <Screen>
      <BackHeader title="Scan to pay" onBack={() => router.back()} />
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
          <DimText style={{ marginTop: 2 }}>Chaptr Tutor Sessions</DimText>
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
                    : 'Scan with your banking app (or open the Stripe test page). We create the tutoring request automatically when payment succeeds.'
              : usingBackend
                ? "Scan with your banking app, then confirm below once you've paid. Confirming creates a live tutoring request for tutors."
                : "Scan with your banking app, then confirm below once you've paid. (Mock payment — no money moves.)"}
          </DimText>
        </Card>

        {errorText && phase !== 'awaiting_scan' ? (
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
                      : 'Waiting for payment…'
              }
              onPress={() => {}}
              disabled
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

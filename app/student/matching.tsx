import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import {
  Screen,
  Card,
  Band,
  Spine,
  Chip,
  BackHeader,
  BodyText,
  DimText,
  BtnGhost,
} from '@/components/ui';
import {
  durationLabel,
  locationLabel,
  resolveTopic,
} from '@/constants/mockData';
import { colors, fonts } from '@/constants/theme';
import { goBackOrReplace } from '@/lib/navigation';
import {
  fetchAcceptedMatch,
  toMatchedTutorInfo,
  watchTutoringRequest,
} from '@/lib/requestsApi';
import type { TutoringRequestRow } from '@/lib/types';

type WaitStatus = 'searching' | 'accepted' | 'ended' | 'error';

export default function Matching() {
  const {
    booking,
    usingBackend,
    liveRequestId,
    setMatchedTutor,
  } = useApp();
  const router = useRouter();
  const topic = resolveTopic(booking.topicId);
  const [status, setStatus] = useState<WaitStatus>('searching');
  const [statusDetail, setStatusDetail] = useState<string | null>(null);

  // Mock: fake timer → matched
  useEffect(() => {
    if (usingBackend) return;
    const t = setTimeout(() => router.replace('/student/matched'), 3500);
    return () => clearTimeout(t);
  }, [usingBackend, router]);

  // Backend: wait for real accept (poll + realtime)
  useEffect(() => {
    if (!usingBackend) return;
    if (!liveRequestId) {
      setStatus('error');
      setStatusDetail('No live request found. Go back and confirm payment again.');
      return;
    }

    let cancelled = false;

    const handleRow = async (row: TutoringRequestRow) => {
      if (cancelled) return;
      if (row.status === 'accepted') {
        setStatus('accepted');
        try {
          // Session row is created in the same RPC txn; retry briefly if realtime wins the race
          let match = await fetchAcceptedMatch(row.id);
          for (let i = 0; !match && i < 5; i++) {
            await new Promise((r) => setTimeout(r, 400));
            if (cancelled) return;
            match = await fetchAcceptedMatch(row.id);
          }
          if (cancelled) return;
          if (match) {
            setMatchedTutor(toMatchedTutorInfo(match));
          }
          router.replace('/student/matched');
        } catch (e) {
          if (cancelled) return;
          setStatus('error');
          setStatusDetail(e instanceof Error ? e.message : 'Could not load match');
        }
        return;
      }
      if (row.status === 'declined' || row.status === 'expired' || row.status === 'cancelled') {
        setStatus('ended');
        setStatusDetail(
          row.status === 'declined'
            ? 'No tutor accepted this request. Try booking again.'
            : row.status === 'expired'
              ? 'Request timed out before a tutor accepted. Try again.'
              : 'This request was cancelled.',
        );
      }
    };

    const unsub = watchTutoringRequest(liveRequestId, (row) => {
      void handleRow(row);
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, [usingBackend, liveRequestId, router, setMatchedTutor]);

  const searching = status === 'searching' || status === 'accepted';

  return (
    <Screen>
      <BackHeader
        title="Finding your tutor"
        onBack={() => goBackOrReplace(router, '/student/home')}
      />
      <View style={styles.body}>
        <Card style={styles.topicCard}>
          <Spine label={topic?.spine ?? '?'} accent />
          <View style={{ flex: 1 }}>
            <Text style={styles.topicTitle}>
              {topic?.title ?? (booking.topicId?.trim() || 'Topic')}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
              {topic ? <Band label={topic.band} /> : null}
              <Chip label={durationLabel(booking.mins)} />
              <Chip label={locationLabel(booking.location)} />
              <Chip label={`Paid $${booking.price}`} accent />
            </View>
          </View>
        </Card>

        {searching ? (
          <View style={styles.search}>
            {usingBackend ? (
              <ActivityIndicator size="large" color={colors.accent} style={{ marginBottom: 14 }} />
            ) : (
              <Ionicons name="search" size={44} color={colors.accent} style={{ marginBottom: 14 }} />
            )}
            <Text style={styles.searchTitle}>
              {status === 'accepted'
                ? 'Tutor found — opening match…'
                : usingBackend
                  ? 'Waiting for a tutor to accept…'
                  : 'Searching among 12 qualified tutors…'}
            </Text>
            <DimText style={{ marginTop: 6 }}>
              {usingBackend
                ? 'Stay on this screen — you will match as soon as someone accepts.'
                : 'Usually matched within 2–3 minutes'}
            </DimText>
          </View>
        ) : (
          <Card style={{ padding: 16, gap: 10 }}>
            <Text style={styles.searchTitle}>
              {status === 'error' ? 'Something went wrong' : 'No match yet'}
            </Text>
            <DimText style={{ lineHeight: 18 }}>{statusDetail}</DimText>
            <BtnGhost
              label="Back to home"
              onPress={() => router.replace('/student/home')}
              style={{ marginTop: 4 }}
            />
          </Card>
        )}

        <Card style={{ padding: 16, gap: 8 }}>
          <Text style={styles.noteLabel}>From your last session</Text>
          <BodyText>
            <Text style={{ color: colors.textDim }}>Ch.7 Trig Functions, with Ms. Tan — </Text>
            solid on factorising; still shaky on completing the square.
          </BodyText>
        </Card>

        {!usingBackend ? (
          <Pressable
            style={{ marginTop: 'auto', alignItems: 'center' }}
            onPress={() => router.replace('/student/matched')}
          >
            <Text style={styles.skip}>Skip wait (demo)</Text>
          </Pressable>
        ) : searching ? (
          <Pressable
            style={{ marginTop: 'auto', alignItems: 'center' }}
            onPress={() => router.replace('/student/home')}
          >
            <Text style={styles.skip}>Cancel and go home</Text>
          </Pressable>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: 22, paddingBottom: 24, paddingTop: 16, gap: 16 },
  topicCard: { flexDirection: 'row', padding: 16, gap: 0 },
  topicTitle: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.text },
  search: { alignItems: 'center', paddingVertical: 20, paddingHorizontal: 6 },
  searchTitle: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.text, textAlign: 'center' },
  noteLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.textDim,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  skip: {
    fontFamily: fonts.medium,
    fontSize: 12.5,
    color: colors.textDim,
    textDecorationLine: 'underline',
  },
});

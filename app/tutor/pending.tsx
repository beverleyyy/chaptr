import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/context/AppContext';
import {
  Screen,
  Card,
  Band,
  Tag,
  Chip,
  Avatar,
  BackHeader,
  BtnPrimary,
  BtnGhost,
  DimText,
  BodyText,
} from '@/components/ui';
import {
  durationLabel,
  formatSeconds,
  locationLabel,
  payoutFor,
  resolveTopic,
  waitToneColors,
  waitUrgency,
} from '@/constants/mockData';
import { colors, fonts } from '@/constants/theme';

export default function TutorPending() {
  const router = useRouter();
  const {
    currentRequestId,
    requests,
    acceptRequest,
    declineRequest,
    pendingRequestIds,
    busyAction,
    usingBackend,
    refreshTutorData,
  } = useApp();
  const [acting, setActing] = useState(false);

  const id = currentRequestId;
  const r = id ? requests[id] : null;

  useEffect(() => {
    if (usingBackend) void refreshTutorData();
  }, [usingBackend, refreshTutorData]);

  useEffect(() => {
    if (!id || !pendingRequestIds.includes(id)) {
      // Don't bounce away while accept just succeeded (navigating to accepted)
      if (acting) return;
      router.replace('/tutor/home');
    }
  }, [id, pendingRequestIds, router, acting]);

  if (!r || !id) return null;
  const t = resolveTopic(r.topicKey);
  const busy = acting || busyAction;
  const urgency = waitUrgency(r.secondsWaiting);
  const tone = waitToneColors(urgency);

  const onAccept = async () => {
    if (busy) return;
    setActing(true);
    try {
      await acceptRequest(id);
      router.replace('/tutor/accepted');
    } catch (e) {
      setActing(false);
      Alert.alert(
        'Could not accept',
        e instanceof Error ? e.message : 'Something went wrong',
      );
    }
  };

  const onDecline = async () => {
    if (busy) return;
    setActing(true);
    try {
      await declineRequest(id);
      router.replace('/tutor/home');
    } catch (e) {
      setActing(false);
      Alert.alert(
        'Could not decline',
        e instanceof Error ? e.message : 'Something went wrong',
      );
    }
  };

  return (
    <Screen glow="left">
      <BackHeader
        title="New request"
        titleStyle={{ color: tone.fg }}
        onBack={() => router.back()}
        right={<Tag label={`Wait ${formatSeconds(r.secondsWaiting)}`} tone={urgency} />}
      />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Card style={{ padding: 16, gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Avatar initials={r.initials} />
            <View>
              <Text style={styles.name}>{r.name}</Text>
              <DimText style={{ fontSize: 12 }}>
                {r.band} · {r.continuity}
              </DimText>
            </View>
          </View>
          <View style={styles.divider} />
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={styles.subject}>{r.subject}</Text>
              <Band label="G3" />
            </View>
            <DimText style={{ marginTop: 4, fontSize: 12.5 }}>
              Chapter {t?.spine ?? '?'} · {t?.title ?? r.subject}
            </DimText>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <Chip label={r.time} />
            <Chip label={durationLabel(r.mins)} />
            <Chip label={locationLabel(r.location)} />
            {r.distance ? <Chip label={r.distance} /> : null}
            <Chip label={`$${payoutFor(r.mins)} payout`} accent />
          </View>
        </Card>

        {r.tutorInsight ? (
          <Card style={{ padding: 16, gap: 8 }}>
            <Text style={styles.noteLabel}>Tutor insight</Text>
            <BodyText>{r.tutorInsight}</BodyText>
          </Card>
        ) : null}

        {r.note ? (
          <Card style={{ padding: 16, gap: 8 }}>
            <Text style={styles.noteLabel}>Last session&apos;s handoff note</Text>
            <BodyText>{r.note}</BodyText>
          </Card>
        ) : null}

        <View style={{ marginTop: 'auto', gap: 10 }}>
          <BtnPrimary
            label={busy ? 'Working…' : 'Accept request'}
            onPress={onAccept}
            disabled={busy}
          />
          <BtnGhost label="Decline" onPress={onDecline} disabled={busy} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 22, paddingBottom: 24, paddingTop: 16, gap: 16, flexGrow: 1 },
  name: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.text },
  divider: { height: 1, backgroundColor: colors.hairline },
  subject: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.text },
  noteLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.textDim,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});

import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { Screen, Card, CheckCircle, BtnGhost, DimText } from '@/components/ui';
import { MeetHero } from '@/components/MeetHero';
import {
  DUMMY_ADDRESS,
  durationLabel,
  payoutFor,
  resolveTopic,
  resolveVideoJoinUrl,
} from '@/constants/mockData';
import { colors, fonts } from '@/constants/theme';

export default function TutorAccepted() {
  const router = useRouter();
  const { currentRequestId, requests, acceptedRequestIds } = useApp();
  const id = currentRequestId ?? acceptedRequestIds[acceptedRequestIds.length - 1];
  const r = id ? requests[id] : null;
  if (!r) return null;
  const t = resolveTopic(r.topicKey);
  const topicHeading = t
    ? `${r.subject} · Ch.${t.spine}`
    : r.topicKey?.trim()
      ? `${r.subject} · ${r.topicKey}`
      : `${r.subject} · Topic`;
  const topicTitle = t?.title ?? (r.topicKey?.trim() || 'Topic details unavailable');
  const isVideo = r.location === 'video';

  return (
    <Screen glow="left">
      <ScrollView
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <CheckCircle size={36} />
        <Text style={styles.kicker}>You&apos;re confirmed</Text>

        {isVideo ? (
          <MeetHero mode="video" url={resolveVideoJoinUrl(r.videoLink)} />
        ) : (
          <MeetHero mode="inperson" address={DUMMY_ADDRESS} />
        )}

        <Card style={styles.card}>
          <DimText style={{ fontSize: 13.5 }}>
            {r.name} · {r.time} · {durationLabel(r.mins)}
          </DimText>
          <View style={styles.topicRow}>
            <Text style={styles.topic}>{topicHeading}</Text>
            <Text style={styles.payout}>${payoutFor(r.mins)} payout</Text>
          </View>
          <DimText style={{ marginTop: 8, fontSize: 12.5 }}>{topicTitle}</DimText>
          <View style={styles.divider} />
          <DimText style={{ fontSize: 12.5, lineHeight: 18 }}>
            Remember to fill in a Handoff Log at the end of the session — it&apos;s what the next tutor
            sees.
          </DimText>
        </Card>

        <BtnGhost
          label="Back to dashboard"
          style={{ width: '100%', marginTop: 'auto' }}
          onPress={() => router.replace('/tutor/home')}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flexGrow: 1,
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  kicker: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.textDim,
    textAlign: 'center',
  },
  card: { width: '100%', padding: 18, marginTop: 18 },
  topicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    gap: 12,
  },
  topic: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.text, flex: 1 },
  payout: { fontFamily: fonts.bold, fontSize: 15, color: colors.accent },
  divider: { height: 1, backgroundColor: colors.hairline, marginVertical: 14 },
});

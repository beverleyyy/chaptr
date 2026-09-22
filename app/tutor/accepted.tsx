import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { Screen, Card, Display, CheckCircle, BtnGhost, DimText } from '@/components/ui';
import {
  DUMMY_ADDRESS_PLAIN,
  DUMMY_ZOOM,
  durationLabel,
  payoutFor,
  resolveTopic,
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
  const meet =
    r.location === 'video' ? `Join at ${DUMMY_ZOOM}` : `Meet at ${DUMMY_ADDRESS_PLAIN}`;

  return (
    <Screen glow="left">
      <View style={styles.body}>
        <CheckCircle size={60} />
        <Display style={{ fontSize: 22, textAlign: 'center' }}>You&apos;re confirmed</Display>
        <DimText style={{ marginTop: 6, textAlign: 'center', lineHeight: 20, fontSize: 13.5 }}>
          {r.name} · {r.time} · {durationLabel(r.mins)}
          {'\n'}
          {meet}
        </DimText>

        <Card style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
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
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingTop: 74,
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  card: { width: '100%', padding: 18, marginTop: 22 },
  topic: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.text },
  payout: { fontFamily: fonts.bold, fontSize: 15, color: colors.accent },
  divider: { height: 1, backgroundColor: colors.hairline, marginVertical: 14 },
});

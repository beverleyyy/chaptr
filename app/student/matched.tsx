import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Screen,
  Card,
  Display,
  StyleChip,
  Avatar,
  CheckCircle,
  BtnGhost,
  DimText,
} from '@/components/ui';
import { useApp } from '@/context/AppContext';
import {
  DUMMY_ADDRESS,
  DUMMY_ZOOM,
  durationLabel,
  resolveTopic,
} from '@/constants/mockData';
import { colors, fonts } from '@/constants/theme';

export default function Matched() {
  const { booking, matchedTutor, usingBackend } = useApp();
  const router = useRouter();
  const topic =
    resolveTopic(matchedTutor?.topicKey) ?? resolveTopic(booking.topicId);
  const topicTitle =
    topic?.title ??
    ((matchedTutor?.topicKey || booking.topicId || '').trim() || 'Topic');
  const isVideo = (matchedTutor?.location ?? booking.location) === 'video';
  const tutorName = matchedTutor?.name ?? 'Mr. Rajan';
  const tutorInitials = matchedTutor?.initials ?? 'MR';
  const whenLabel = matchedTutor?.scheduledLabel ?? 'Today, 7:30pm';
  const mins = matchedTutor?.mins ?? booking.mins;

  return (
    <Screen>
      <View style={styles.body}>
        <CheckCircle />
        <Display style={{ fontSize: 21, textAlign: 'center' }}>Congrats, you&apos;re matched!</Display>
        <DimText style={{ marginTop: 8, textAlign: 'center', lineHeight: 20 }}>
          {isVideo ? 'Join your session at' : 'Please meet at'}
          {'\n'}
          <Text style={{ color: colors.text, fontFamily: fonts.semiBold }}>
            {isVideo ? DUMMY_ZOOM : DUMMY_ADDRESS}
          </Text>
        </DimText>

        <Card style={styles.tutorCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Avatar initials={tutorInitials} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{tutorName}</Text>
              <Text style={styles.stars}>
                ★ 4.9{' '}
                <Text style={{ color: colors.textDim, fontFamily: fonts.medium }}>
                  {usingBackend && matchedTutor ? '(Ping match)' : '(128 sessions)'}
                </Text>
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
            <StyleChip label="Patient" />
            <StyleChip label="Exam-focused" />
            <StyleChip label="Visual explainer" />
          </View>
          <View style={styles.divider} />
          <Text style={styles.topic}>{topicTitle}</Text>
          <DimText style={{ marginTop: 4 }}>
            {whenLabel} · {durationLabel(mins)}
          </DimText>
        </Card>

        <Card style={styles.paidRow}>
          <Text style={styles.paidLabel}>Paid via PayNow</Text>
          <Text style={styles.paidAmt}>${booking.price}.00 ✓</Text>
        </Card>

        <BtnGhost
          label="Back to home"
          style={{ width: '100%', marginTop: 'auto' }}
          onPress={() => router.replace('/student/home')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  tutorCard: { width: '100%', padding: 16, marginTop: 18 },
  name: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.text },
  stars: { fontFamily: fonts.bold, fontSize: 13, color: colors.star, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.hairline, marginVertical: 14 },
  topic: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.text },
  paidRow: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paidLabel: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.text },
  paidAmt: { fontFamily: fonts.bold, fontSize: 15, color: colors.accent },
});

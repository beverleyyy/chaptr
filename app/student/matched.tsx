import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Screen,
  Card,
  StyleChip,
  Avatar,
  CheckCircle,
  BtnGhost,
  DimText,
} from '@/components/ui';
import { MeetHero } from '@/components/MeetHero';
import { useApp } from '@/context/AppContext';
import {
  DUMMY_ADDRESS,
  durationLabel,
  resolveTopic,
  resolveVideoJoinUrl,
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
  const rawTutorName = matchedTutor?.name ?? 'Mr. Rajan';
  const tutorName = rawTutorName === 'Chaptr Tutor' ? 'Ping Tutor' : rawTutorName;
  const tutorInitials =
    rawTutorName === 'Chaptr Tutor' ? 'PT' : (matchedTutor?.initials ?? 'MR');
  const whenLabel = matchedTutor?.scheduledLabel ?? 'Today, 7:30pm';
  const mins = matchedTutor?.mins ?? booking.mins;

  return (
    <Screen>
      <ScrollView
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <CheckCircle size={36} />
        <Text style={styles.kicker}>Congrats, you&apos;re matched!</Text>

        {isVideo ? (
          <MeetHero mode="video" url={resolveVideoJoinUrl(matchedTutor?.videoLink)} />
        ) : (
          <MeetHero mode="inperson" address={DUMMY_ADDRESS} />
        )}

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
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flexGrow: 1,
    paddingTop: 36,
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

import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useApp } from '@/context/AppContext';
import { MeetHero } from '@/components/MeetHero';
import { Card, BtnGhost } from '@/components/ui';
import {
  DUMMY_ADDRESS,
  durationLabel,
  formatSessionTopicLine,
  locationLabel,
  resolveVideoJoinUrl,
  ScheduleSeed,
  TutorRequest,
} from '@/constants/mockData';
import { colors, fonts } from '@/constants/theme';

type SessionLike = TutorRequest | ScheduleSeed;

export function SessionCard({ id, session }: { id: string; session: SessionLike }) {
  const { cancelConfirmId, setCancelConfirmId, cancelSession } = useApp();
  const titleLine = formatSessionTopicLine(session.subject, session.topicKey);
  const confirming = cancelConfirmId === id;

  if (confirming) {
    return (
      <Card style={{ padding: 16 }}>
        <Text style={styles.warn}>Cancel this session?</Text>
        <Text style={styles.title}>{titleLine}</Text>
        <Text style={styles.sub}>
          {session.name} · {session.time}
        </Text>
        <Text style={styles.refund}>The student will be notified and refunded in full.</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          <BtnGhost
            label="Keep it"
            style={{ flex: 1, paddingVertical: 10 }}
            onPress={() => setCancelConfirmId(null)}
          />
          <Pressable
            style={styles.cancelBtn}
            onPress={() => cancelSession(id)}
          >
            <Text style={styles.cancelBtnText}>Yes, cancel</Text>
          </Pressable>
        </View>
      </Card>
    );
  }

  return (
    <Card style={{ padding: 16 }}>
      <View style={styles.row}>
        <Text style={styles.label}>Confirmed session</Text>
        <Pressable onPress={() => setCancelConfirmId(id)}>
          <Text style={styles.cancelLink}>Cancel</Text>
        </Pressable>
      </View>
      {session.location === 'video' ? (
        <MeetHero
          mode="video"
          url={resolveVideoJoinUrl('videoLink' in session ? session.videoLink : null)}
        />
      ) : (
        <MeetHero mode="inperson" address={DUMMY_ADDRESS} />
      )}
      <Text style={[styles.title, styles.titleAfterHero]}>{titleLine}</Text>
      <Text style={styles.sub}>
        {session.name} · {session.time} · {durationLabel(session.mins)} ·{' '}
        {locationLabel(session.location)}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  label: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.textDim,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  cancelLink: {
    fontFamily: fonts.semiBold,
    fontSize: 11.5,
    color: colors.textDim,
    textDecorationLine: 'underline',
  },
  title: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.text },
  titleAfterHero: { marginTop: 14 },
  sub: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.textDim, marginTop: 6 },
  warn: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.amber,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  refund: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textDim,
    marginTop: 8,
    lineHeight: 17,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: colors.danger,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelBtnText: { fontFamily: fonts.bold, fontSize: 14, color: '#fff' },
});

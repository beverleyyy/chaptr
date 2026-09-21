import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useApp } from '@/context/AppContext';
import { Screen, Card, Display, DimText } from '@/components/ui';
import { SessionCard } from '@/components/SessionCard';
import { SCHEDULE_SEED } from '@/constants/mockData';
import { fonts } from '@/constants/theme';
import { colors } from '@/constants/theme';

export default function TutorSchedule() {
  const { acceptedRequestIds, requests, cancelledSeedIds } = useApp();

  const all: { id: string; time: string; session: (typeof requests)[string] | (typeof SCHEDULE_SEED)[string] }[] = [];
  acceptedRequestIds.forEach((id) => all.push({ id, time: requests[id].time, session: requests[id] }));
  Object.keys(SCHEDULE_SEED).forEach((id) => {
    if (!cancelledSeedIds.includes(id)) {
      all.push({ id, time: SCHEDULE_SEED[id].time, session: SCHEDULE_SEED[id] });
    }
  });

  const today = all.filter((x) => x.time.startsWith('Today'));
  const upcoming = all.filter((x) => !x.time.startsWith('Today'));

  return (
    <Screen glow="left">
      <View style={styles.header}>
        <Display style={{ fontSize: 22 }}>Schedule</Display>
      </View>
      <ScrollView
        contentContainerStyle={{ padding: 22, gap: 10, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {today.length === 0 && upcoming.length === 0 ? (
          <Card style={{ padding: 18 }}>
            <DimText style={{ textAlign: 'center' }}>
              No upcoming sessions yet — accepted requests will show up here.
            </DimText>
          </Card>
        ) : null}
        {today.length > 0 ? (
          <>
            <Text style={styles.heading}>Today</Text>
            {today.map((x) => (
              <SessionCard key={x.id} id={x.id} session={x.session} />
            ))}
          </>
        ) : null}
        {upcoming.length > 0 ? (
          <>
            <Text style={[styles.heading, { marginTop: 4 }]}>Coming up</Text>
            {upcoming.map((x) => (
              <SessionCard key={x.id} id={x.id} session={x.session} />
            ))}
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 54, paddingHorizontal: 22, paddingBottom: 4 },
  heading: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.textDim,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});

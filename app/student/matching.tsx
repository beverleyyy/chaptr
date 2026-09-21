import { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
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
} from '@/components/ui';
import {
  durationLabel,
  locationLabel,
  TOPICS,
} from '@/constants/mockData';
import { colors, fonts } from '@/constants/theme';

export default function Matching() {
  const { booking } = useApp();
  const router = useRouter();
  const topic = TOPICS[booking.topicId];

  useEffect(() => {
    const t = setTimeout(() => router.replace('/student/matched'), 3500);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <Screen>
      <BackHeader title="Finding your tutor" onBack={() => router.back()} />
      <View style={styles.body}>
        <Card style={styles.topicCard}>
          <Spine label={topic.spine} accent />
          <View style={{ flex: 1 }}>
            <Text style={styles.topicTitle}>{topic.title}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
              <Band label={topic.band} />
              <Chip label={durationLabel(booking.mins)} />
              <Chip label={locationLabel(booking.location)} />
              <Chip label={`Paid $${booking.price}`} accent />
            </View>
          </View>
        </Card>

        <View style={styles.search}>
          <Ionicons name="search" size={44} color={colors.accent} style={{ marginBottom: 14 }} />
          <Text style={styles.searchTitle}>Searching among 12 qualified tutors…</Text>
          <DimText style={{ marginTop: 6 }}>Usually matched within 2–3 minutes</DimText>
        </View>

        <Card style={{ padding: 16, gap: 8 }}>
          <Text style={styles.noteLabel}>From your last session</Text>
          <BodyText>
            <Text style={{ color: colors.textDim }}>Ch.7 Trig Functions, with Ms. Tan — </Text>
            solid on factorising; still shaky on completing the square.
          </BodyText>
        </Card>

        <Pressable style={{ marginTop: 'auto', alignItems: 'center' }} onPress={() => router.replace('/student/matched')}>
          <Text style={styles.skip}>Skip wait (demo)</Text>
        </Pressable>
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

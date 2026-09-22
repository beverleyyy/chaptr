import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useApp, TUTOR_SUBJECTS } from '@/context/AppContext';
import { Screen, Card, Display, Toggle, SectionLabel } from '@/components/ui';
import { AVAILABILITY_DAYS } from '@/constants/mockData';
import { colors, fonts } from '@/constants/theme';

export default function TutorAvailability() {
  const {
    tutorOnline,
    setTutorOnline,
    tutorSubjects,
    toggleTutorSubject,
    availabilityDays,
    toggleDay,
  } = useApp();

  return (
    <Screen glow="left">
      <View style={styles.header}>
        <Display style={{ fontSize: 22 }}>Availability</Display>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={[styles.onlineLabel, !tutorOnline && { color: colors.textDim }]}>
            {tutorOnline ? 'Online' : 'Offline'}
          </Text>
          <Toggle
            on={tutorOnline}
            onToggle={() => setTutorOnline(!tutorOnline)}
            activeColor={colors.live}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 22, gap: 16 }} showsVerticalScrollIndicator={false}>
        <View>
          <SectionLabel>Subjects you tutor</SectionLabel>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {TUTOR_SUBJECTS.map((s) => {
              const on = tutorSubjects.includes(s);
              return (
                <Pressable
                  key={s}
                  onPress={() => toggleTutorSubject(s)}
                  style={[styles.chip, on && styles.chipOn]}
                >
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>{s}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Card style={{ paddingHorizontal: 18, paddingBottom: 6 }}>
          <Text style={styles.weekLabel}>Weekly schedule</Text>
          {AVAILABILITY_DAYS.map((d, i) => (
            <View
              key={d.key}
              style={[styles.dayRow, i === AVAILABILITY_DAYS.length - 1 && { borderBottomWidth: 0 }]}
            >
              <Text style={styles.dayLabel}>
                {d.label}{' '}
                <Text style={{ color: colors.textDim, fontFamily: fonts.medium }}>· {d.sub}</Text>
              </Text>
              <Toggle on={!!availabilityDays[d.key]} onToggle={() => toggleDay(d.key)} />
            </View>
          ))}
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 54,
    paddingHorizontal: 22,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  onlineLabel: { fontFamily: fonts.bold, fontSize: 11.5, color: colors.live },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.ink3,
  },
  chipOn: { backgroundColor: colors.accent, borderColor: 'transparent' },
  chipText: { fontFamily: fonts.semiBold, fontSize: 12.5, color: colors.textDim },
  chipTextOn: { color: colors.accentInk },
  weekLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.textDim,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingTop: 10,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  dayLabel: { fontFamily: fonts.semiBold, fontSize: 13.5, color: colors.text },
});

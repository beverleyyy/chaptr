import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { Screen, Card, Display, BtnPrimary, StatusChip, DimText } from '@/components/ui';
import { colors, fonts } from '@/constants/theme';

export default function TutorEarnings() {
  const router = useRouter();
  const { availableBalance, lastWithdrawal, earningsRows, weekEarningsTotal, weekSessionCount } = useApp();

  return (
    <Screen glow="left">
      <View style={styles.header}>
        <Display style={{ fontSize: 22 }}>Earnings</Display>
      </View>
      <View style={{ flex: 1, paddingHorizontal: 22, paddingTop: 16, gap: 14 }}>
        <Card style={{ padding: 18 }}>
          <Text style={styles.section}>This week</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 10 }}>
            <Display style={{ fontSize: 28 }}>${weekEarningsTotal}</Display>
            <DimText>
              {weekSessionCount} session{weekSessionCount === 1 ? '' : 's'}
              {weekSessionCount > 0
                ? ` · avg $${(weekEarningsTotal / weekSessionCount).toFixed(2)}`
                : ''}
            </DimText>
          </View>
        </Card>

        <Card style={{ padding: 16 }}>
          <Text style={styles.section}>Available to withdraw</Text>
          <View style={styles.withdrawRow}>
            <Display style={{ fontSize: 24 }}>${availableBalance.toFixed(2)}</Display>
            <BtnPrimary
              label="Withdraw"
              disabled={availableBalance <= 0}
              style={{ paddingVertical: 10, paddingHorizontal: 18 }}
              onPress={() => router.push('/tutor/withdraw')}
            />
          </View>
          {lastWithdrawal ? (
            <DimText style={{ marginTop: 10, fontSize: 11.5 }}>
              Last withdrawal: ${lastWithdrawal.amount.toFixed(2)} to {lastWithdrawal.bank} ·{' '}
              {lastWithdrawal.when}
            </DimText>
          ) : null}
        </Card>

        <Card style={{ padding: 16, flex: 1 }}>
          <Text style={[styles.section, { marginBottom: 4 }]}>Recent sessions</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {earningsRows.length === 0 ? (
              <DimText style={{ marginTop: 12 }}>No sessions yet.</DimText>
            ) : null}
            {earningsRows.map((e, i) => (
              <View key={i} style={[styles.earnRow, i === earningsRows.length - 1 && { borderBottomWidth: 0 }]}>
                <View>
                  <Text style={styles.earnTitle}>
                    {e.subject} · Ch.{e.chapterSpine}
                  </Text>
                  <DimText style={{ fontSize: 11.5, marginTop: 2 }}>
                    {e.time} · {e.student}
                  </DimText>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.earnAmt}>${e.amount}</Text>
                  <View style={{ marginTop: 3 }}>
                    <StatusChip status={e.status} />
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 54, paddingHorizontal: 22, paddingBottom: 4 },
  section: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.textDim,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  withdrawRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 10,
  },
  earnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  earnTitle: { fontFamily: fonts.semiBold, fontSize: 13.5, color: colors.text },
  earnAmt: { fontFamily: fonts.bold, fontSize: 14, color: colors.text },
});

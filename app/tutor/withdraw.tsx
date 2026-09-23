import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { Screen, Card, Display, BackHeader, BtnPrimary, DimText } from '@/components/ui';
import { colors, fonts } from '@/constants/theme';
import { goBackOrReplace } from '@/lib/navigation';

export default function Withdraw() {
  const router = useRouter();
  const { availableBalance, confirmWithdraw } = useApp();
  const [busy, setBusy] = useState(false);
  const amount = availableBalance;

  const go = () => {
    if (busy || amount <= 0) return;
    setBusy(true);
    setTimeout(() => {
      confirmWithdraw();
      setBusy(false);
      router.replace('/tutor/withdraw-success');
    }, 1000);
  };

  return (
    <Screen glow="left">
      <BackHeader
        title="Withdraw earnings"
        onBack={() => goBackOrReplace(router, '/tutor/earnings')}
      />
      <View style={styles.body}>
        <View style={{ alignItems: 'center' }}>
          <DimText>Amount to withdraw</DimText>
          <Display style={{ fontSize: 28 }}>${amount.toFixed(2)}</Display>
        </View>

        <Card style={styles.bank}>
          <View style={styles.bankBadge}>
            <Text style={styles.bankBadgeText}>DBS</Text>
          </View>
          <View>
            <Text style={styles.bankTitle}>DBS Bank · ••••1234</Text>
            <DimText style={{ fontSize: 11.5, marginTop: 2 }}>Linked payout account</DimText>
          </View>
        </Card>

        <Card style={styles.info}>
          <Ionicons name="time-outline" size={16} color={colors.textDim} />
          <DimText style={{ flex: 1, fontSize: 12, lineHeight: 17 }}>
            Transfers usually complete within 1 business day. This is a demo — no real money moves.
          </DimText>
        </Card>

        <View style={{ marginTop: 'auto', width: '100%' }}>
          <BtnPrimary
            label={busy ? 'Processing withdrawal…' : `Withdraw $${amount.toFixed(2)}`}
            onPress={go}
            disabled={busy || amount <= 0}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: 22,
    paddingBottom: 24,
    paddingTop: 10,
    alignItems: 'center',
    gap: 14,
  },
  bank: { width: '100%', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  bankBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.ink3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankBadgeText: { fontFamily: fonts.bold, fontSize: 11, color: colors.text },
  bankTitle: { fontFamily: fonts.semiBold, fontSize: 13.5, color: colors.text },
  info: { width: '100%', padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
});

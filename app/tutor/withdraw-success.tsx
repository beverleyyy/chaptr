import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { Screen, Card, Display, CheckCircle, BtnGhost, DimText, BodyText } from '@/components/ui';

export default function WithdrawSuccess() {
  const router = useRouter();
  const { withdrawAmount } = useApp();

  return (
    <Screen glow="left">
      <View style={styles.body}>
        <CheckCircle size={60} />
        <Display style={{ fontSize: 22, textAlign: 'center' }}>Withdrawal requested</Display>
        <DimText style={{ marginTop: 6, textAlign: 'center', fontSize: 13.5, lineHeight: 20 }}>
          ${withdrawAmount.toFixed(2)} to DBS Bank · ••••1234
        </DimText>

        <Card style={{ width: '100%', padding: 16, marginTop: 22 }}>
          <BodyText style={{ color: '#6D7178', fontSize: 12.5 }}>
            Expect it in your account within 1 business day. You&apos;ll see it reflected on your
            Earnings screen once it clears.
          </BodyText>
        </Card>

        <BtnGhost
          label="Back to earnings"
          style={{ width: '100%', marginTop: 'auto' }}
          onPress={() => router.replace('/tutor/earnings')}
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
});

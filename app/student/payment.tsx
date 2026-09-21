import { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { Screen, Card, Display, BackHeader, BtnPrimary, DimText } from '@/components/ui';
import { HANDOFF_NOTE, TOPICS } from '@/constants/mockData';
import { colors, fonts } from '@/constants/theme';
import { PayNowQR } from '@/components/PayNowQR';

export default function Payment() {
  const { booking, submitBookingRequest, usingBackend, busyAction } = useApp();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const topic = TOPICS[booking.topicId];

  const confirm = async () => {
    if (busy || busyAction) return;
    setBusy(true);
    try {
      if (usingBackend) {
        await submitBookingRequest(topic.subject, HANDOFF_NOTE);
      } else {
        await new Promise((r) => setTimeout(r, 900));
      }
      router.push('/student/matching');
    } catch (e) {
      Alert.alert(
        'Could not create request',
        e instanceof Error ? e.message : 'Something went wrong',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <BackHeader title="Scan to pay" onBack={() => router.back()} />
      <View style={styles.body}>
        <View style={{ alignItems: 'center' }}>
          <DimText>Amount due</DimText>
          <Display style={{ fontSize: 28 }}>${booking.price}.00</Display>
        </View>

        <View style={styles.qrWrap}>
          <PayNowQR size={176} />
        </View>

        <View style={{ alignItems: 'center' }}>
          <Text style={styles.payTitle}>PayNow · UEN 202601234A</Text>
          <DimText style={{ marginTop: 2 }}>Chaptr Tutor Sessions</DimText>
        </View>

        <Card style={styles.info}>
          <Ionicons name="time-outline" size={16} color={colors.textDim} />
          <DimText style={{ flex: 1, fontSize: 12, lineHeight: 17 }}>
            Scan with your banking app, then confirm below once you&apos;ve paid. Held for your tutor
            until payment clears.
            {usingBackend
              ? ' Confirming creates a live tutoring request for tutors.'
              : ' (Mock payment — no money moves.)'}
          </DimText>
        </Card>

        <View style={{ marginTop: 'auto', width: '100%' }}>
          <BtnPrimary
            label={busy || busyAction ? 'Confirming payment…' : "I've paid"}
            onPress={confirm}
            disabled={busy || busyAction}
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
  qrWrap: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.hairline,
    shadowColor: '#14181C',
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  payTitle: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.text },
  info: { width: '100%', padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
});

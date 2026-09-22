import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { Screen, Card, Display, Tag, Avatar, Toggle, DimText, BtnGhost } from '@/components/ui';
import { SessionCard } from '@/components/SessionCard';
import { formatSeconds, TOPICS, waitToneColors, waitUrgency, type WaitUrgency } from '@/constants/mockData';
import { colors, fonts } from '@/constants/theme';

export default function TutorHome() {
  const router = useRouter();
  const {
    tutorOnline,
    setTutorOnline,
    pendingRequestIds,
    acceptedRequestIds,
    requests,
    setCurrentRequestId,
    tutorSubjects,
    toastRequestId,
    dismissToast,
    setRole,
    weekEarningsTotal,
    weekSessionCount,
    usingBackend,
    refreshTutorData,
    tutorDataError,
  } = useApp();
  const { profile, user } = useAuth();
  const displayName = profile?.name ?? 'Mr. Rajan';
  const [refreshing, setRefreshing] = useState(false);

  // Always load pending on mount when signed in — do not wait on profile.role.
  useEffect(() => {
    if (!usingBackend || !user?.id) return;
    void refreshTutorData();
  }, [usingBackend, user?.id, refreshTutorData]);

  const openRequest = (id: string) => {
    setCurrentRequestId(id);
    dismissToast();
    router.push('/tutor/pending');
  };

  const onRefresh = useCallback(async () => {
    if (!usingBackend) return;
    setRefreshing(true);
    try {
      await refreshTutorData();
    } finally {
      setRefreshing(false);
    }
  }, [usingBackend, refreshTutorData]);

  return (
    <Screen glow="left">
      <View style={styles.debugBanner}>
        <Text style={styles.debugText}>
          {usingBackend
            ? `LIVE · pending ${pendingRequestIds.length} · you: ${profile?.role ?? 'no profile'} · ${user?.email ?? 'not signed in'}${
                tutorDataError ? ` · err: ${tutorDataError.slice(0, 80)}` : ''
              }`
            : 'DEMO MODE — .env not loaded. Stop Expo, confirm .env exists, run: npx expo start -c'}
        </Text>
      </View>
      {toastRequestId && requests[toastRequestId] ? (() => {
        const toastReq = requests[toastRequestId];
        const toastTone = waitToneColors(waitUrgency(toastReq.secondsWaiting));
        return (
          <View
            style={[
              styles.toast,
              {
                backgroundColor: toastTone.soft,
                borderLeftColor: toastTone.fg,
              },
            ]}
          >
            <Avatar initials={toastReq.initials} size={36} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.toastLabel, { color: toastTone.fg }]}>New request</Text>
              <Text style={styles.toastText}>
                {toastReq.name} · {toastReq.subject} Ch.
                {TOPICS[toastReq.topicKey]?.spine ?? '?'}
              </Text>
            </View>
            <Pressable style={styles.toastBtn} onPress={() => openRequest(toastRequestId)}>
              <Text style={styles.toastBtnText}>View</Text>
            </Pressable>
          </View>
        );
      })() : null}

      <View style={styles.header}>
        <View>
          <DimText>Good evening</DimText>
          <Display style={{ fontSize: 22, marginTop: 2 }}>{displayName}</Display>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
          <View style={{ alignItems: 'flex-end', gap: 6, marginTop: 4 }}>
            <Text style={[styles.onlineLabel, !tutorOnline && { color: colors.textDim }]}>
              {tutorOnline ? 'Online' : 'Offline'}
            </Text>
            <Toggle on={tutorOnline} onToggle={() => setTutorOnline(!tutorOnline)} />
          </View>
          <Pressable onPress={() => router.push('/tutor/profile')} style={{ marginTop: 3 }}>
            <Ionicons name="settings-outline" size={22} color={colors.textDim} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 22, gap: 14, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          usingBackend ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
          ) : undefined
        }
      >
        <Pressable
          onPress={() => {
            setRole('student');
            router.replace('/role');
          }}
        >
          <Text style={styles.switchLink}>Switch to student view</Text>
        </Pressable>

        {tutorDataError ? (
          <Card style={styles.centerCard}>
            <Text style={styles.errorTitle}>Couldn&apos;t load requests</Text>
            <DimText style={{ textAlign: 'center', lineHeight: 18, marginTop: 6 }}>
              {tutorDataError}
            </DimText>
            <BtnGhost label="Retry" onPress={() => void refreshTutorData()} style={{ marginTop: 12 }} />
          </Card>
        ) : null}

        {!tutorOnline ? (
          <Card style={styles.centerCard}>
            <DimText style={{ textAlign: 'center', lineHeight: 20 }}>
              You&apos;re offline — switch Online above to receive new requests. Pull to refresh
              anytime to load what&apos;s already waiting.
            </DimText>
          </Card>
        ) : null}

        <>
            {pendingRequestIds.length > 0 ? (
              <>
                {(() => {
                  const rank: Record<WaitUrgency, number> = { fresh: 0, aging: 1, urgent: 2 };
                  let worst: WaitUrgency | null = null;
                  for (const pid of pendingRequestIds) {
                    const req = requests[pid];
                    if (!req) continue;
                    const u = waitUrgency(req.secondsWaiting);
                    if (!worst || rank[u] > rank[worst]) worst = u;
                  }
                  const headingColor = worst ? waitToneColors(worst).fg : colors.textDim;
                  return (
                    <Text style={[styles.reqHeading, { color: headingColor }]}>
                      {pendingRequestIds.length === 1
                        ? '1 new request'
                        : `${pendingRequestIds.length} new requests`}
                    </Text>
                  );
                })()}
                {pendingRequestIds.map((id) => {
                  const r = requests[id];
                  if (!r) return null;
                  const t = TOPICS[r.topicKey];
                  const urgency = waitUrgency(r.secondsWaiting);
                  const tone = waitToneColors(urgency);
                  return (
                    <Pressable key={id} onPress={() => openRequest(id)}>
                      <Card
                        style={[
                          styles.reqCard,
                          {
                            borderLeftColor: tone.fg,
                            backgroundColor: tone.soft,
                          },
                        ]}
                      >
                        <Avatar initials={r.initials} />
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Text style={[styles.newReq, { color: tone.fg }]}>New request</Text>
                            <Tag label={`Wait ${formatSeconds(r.secondsWaiting)}`} tone={urgency} />
                          </View>
                          <Text style={styles.reqLine}>
                            {r.name} · {r.subject} Ch.{t?.spine ?? '?'} · {r.time}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={17} color={colors.textDim} />
                      </Card>
                    </Pressable>
                  );
                })}
              </>
            ) : (
              <Card style={styles.centerCard}>
                <DimText style={{ textAlign: 'center', lineHeight: 20 }}>
                  {usingBackend
                    ? 'No pending requests right now. Pull to refresh — new bookings appear within a few seconds.'
                    : "No new requests right now — we'll notify you the moment one comes in."}
                </DimText>
              </Card>
            )}

            {acceptedRequestIds.map((id) => {
              const session = requests[id];
              if (!session) return null;
              return <SessionCard key={id} id={id} session={session} />;
            })}
        </>

        <Card style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.section}>This week</Text>
            <Pressable onPress={() => router.push('/tutor/earnings')}>
              <Text style={styles.link}>View earnings →</Text>
            </Pressable>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 10 }}>
            <Display style={{ fontSize: 26 }}>${weekEarningsTotal}</Display>
            <DimText>
              from {weekSessionCount} session{weekSessionCount === 1 ? '' : 's'}
            </DimText>
          </View>
        </Card>

        <Card style={{ padding: 16, gap: 6 }}>
          <Text style={styles.section}>Open for</Text>
          <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.text }}>
            {tutorSubjects.length ? tutorSubjects.join(', ') : 'No subjects selected'}
          </Text>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  debugBanner: {
    marginHorizontal: 22,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FFF0E6',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  debugText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.accentDark,
    lineHeight: 15,
  },
  header: {
    paddingTop: 54,
    paddingHorizontal: 22,
    paddingBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  onlineLabel: { fontFamily: fonts.bold, fontSize: 11.5, color: colors.accent },
  switchLink: { fontFamily: fonts.semiBold, fontSize: 12, color: colors.accent },
  centerCard: { padding: 18 },
  errorTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.danger,
    textAlign: 'center',
  },
  reqHeading: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.success,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  reqCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
    backgroundColor: colors.successSoft,
  },
  newReq: {
    fontFamily: fonts.bold,
    fontSize: 13.5,
    color: colors.success,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  reqLine: { fontFamily: fonts.medium, fontSize: 13.5, color: colors.text, marginTop: 4 },
  section: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.textDim,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  link: { fontFamily: fonts.semiBold, fontSize: 12, color: colors.accent },
  toast: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 50,
    backgroundColor: colors.successSoft,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#14181C',
    shadowOpacity: 0.18,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 14 },
    elevation: 6,
  },
  toastLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.success,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  toastText: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.text, marginTop: 2 },
  toastBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  toastBtnText: { fontFamily: fonts.bold, fontSize: 12, color: '#fff' },
});

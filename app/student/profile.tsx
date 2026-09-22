import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import {
  Screen,
  Card,
  Avatar,
  BackHeader,
  SectionLabel,
  DimText,
  BtnGhost,
} from '@/components/ui';
import { curriculumLabel } from '@/constants/curriculum';
import { colors, fonts } from '@/constants/theme';

function initialsFromName(name: string | null | undefined): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function StudentProfile() {
  const router = useRouter();
  const { profile, user, signOut } = useAuth();
  const { studentCurriculum } = useApp();
  const name = profile?.name?.trim() || 'Student';
  const email = user?.email ?? '';

  return (
    <Screen>
      <BackHeader title="Your profile" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Avatar initials={initialsFromName(name)} size={56} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{name}</Text>
            {email ? <DimText style={{ marginTop: 2 }}>{email}</DimText> : null}
            <Text style={styles.roleChip}>Student</Text>
          </View>
        </View>

        <Card style={styles.card}>
          <SectionLabel>My subjects</SectionLabel>
          {studentCurriculum.length === 0 ? (
            <DimText style={{ marginTop: 8, lineHeight: 18 }}>
              No subjects saved yet. Add the subjects you are taking so booking shows the right chapters.
            </DimText>
          ) : (
            <View style={styles.subjectList}>
              {studentCurriculum.map((row) => (
                <View key={row.subjectKey} style={styles.subjectRow}>
                  <Text style={styles.subjectName}>{curriculumLabel(row.subjectKey)}</Text>
                  <Text style={styles.level}>{row.level}</Text>
                </View>
              ))}
            </View>
          )}
          <Pressable onPress={() => router.push('/student/curriculum')} style={styles.linkBtn}>
            <Text style={styles.linkText}>
              {studentCurriculum.length ? 'Edit subjects' : 'Set subjects'}
            </Text>
          </Pressable>
        </Card>

        <Card style={styles.card}>
          <SectionLabel>Upcoming tests</SectionLabel>
          <DimText style={{ marginTop: 8, lineHeight: 18 }}>
            You will be able to add test dates for each chapter here soon. Those dates will drive the
            “Test in N days” tags on Home.
          </DimText>
        </Card>

        <BtnGhost
          label="Sign out"
          onPress={async () => {
            await signOut();
            router.replace('/auth/sign-in');
          }}
          style={{ marginTop: 8 }}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 22, paddingBottom: 32, gap: 14 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 4 },
  name: { fontFamily: fonts.bold, fontSize: 18, color: colors.text },
  roleChip: {
    marginTop: 6,
    alignSelf: 'flex-start',
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: colors.accentDark,
    backgroundColor: colors.accentSoft,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  card: { padding: 16 },
  subjectList: { marginTop: 10, gap: 8 },
  subjectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  subjectName: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.text, flex: 1 },
  level: { fontFamily: fonts.bold, fontSize: 12, color: colors.accent },
  linkBtn: { marginTop: 12, alignSelf: 'flex-start' },
  linkText: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.accent },
});

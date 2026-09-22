import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp, STYLE_TAGS } from '@/context/AppContext';
import {
  Screen,
  Card,
  Avatar,
  BackHeader,
  SectionLabel,
  BtnPrimary,
  DimText,
} from '@/components/ui';
import { colors, fonts } from '@/constants/theme';

export default function TutorProfile() {
  const router = useRouter();
  const { profileBio, setProfileBio, styleTags, toggleStyleTag } = useApp();
  const [saved, setSaved] = useState(false);

  return (
    <Screen glow="left">
      <BackHeader title="Your profile" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Avatar initials="MR" size={56} />
          <View>
            <Text style={styles.name}>Mr. Rajan</Text>
            <Text style={styles.stars}>
              ★ 4.9 <Text style={{ color: colors.textDim, fontFamily: fonts.medium }}>(128 sessions)</Text>
            </Text>
          </View>
        </View>

        <View>
          <SectionLabel>Bio — shown to students when matched</SectionLabel>
          <TextInput
            value={profileBio}
            onChangeText={setProfileBio}
            multiline
            style={styles.bio}
            textAlignVertical="top"
          />
        </View>

        <View>
          <SectionLabel>Teaching style</SectionLabel>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {STYLE_TAGS.map((t) => {
              const on = styleTags.includes(t);
              return (
                <Pressable
                  key={t}
                  onPress={() => toggleStyleTag(t)}
                  style={[styles.chip, on && styles.chipOn]}
                >
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>{t}</Text>
                </Pressable>
              );
            })}
          </View>
          <DimText style={{ marginTop: 8, fontSize: 11, lineHeight: 16 }}>
            These tags show on your profile when students get matched with you.
          </DimText>
        </View>

        <Card style={styles.rateCard}>
          <View>
            <Text style={styles.rateTitle}>Base rate</Text>
            <DimText style={{ fontSize: 11.5, marginTop: 2 }}>Set by Ping</DimText>
          </View>
          <Text style={styles.rate}>$20/hr</Text>
        </Card>

        <View style={{ marginTop: 'auto' }}>
          <BtnPrimary
            label="Save changes"
            onPress={() => {
              setSaved(true);
              setTimeout(() => setSaved(false), 1800);
            }}
          />
          {saved ? <Text style={styles.saved}>Saved ✓</Text> : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 22, paddingBottom: 24, paddingTop: 16, gap: 18, flexGrow: 1 },
  name: { fontFamily: fonts.bold, fontSize: 17, color: colors.text },
  stars: { fontFamily: fonts.bold, fontSize: 13, color: colors.star, marginTop: 2 },
  bio: {
    width: '100%',
    minHeight: 84,
    padding: 12,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 20,
    color: colors.text,
    backgroundColor: colors.ink2,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
    borderBottomLeftRadius: 14,
  },
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
  rateCard: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rateTitle: { fontFamily: fonts.semiBold, fontSize: 13.5, color: colors.text },
  rate: { fontFamily: fonts.bold, fontSize: 15, color: colors.accent },
  saved: {
    textAlign: 'center',
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.accent,
    marginTop: 10,
  },
});

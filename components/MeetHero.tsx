import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import {
  displayJoinTarget,
  openableUrl,
  videoJoinLabel,
} from '@/constants/mockData';
import { colors, fonts } from '@/constants/theme';

type Props =
  | { mode: 'video'; url: string }
  | { mode: 'inperson'; address: string };

/** Confirm-screen hero. The join target is larger than the success title on purpose. */
export function MeetHero(props: Props) {
  if (props.mode === 'video') {
    const label = videoJoinLabel(props.url);
    const shown = displayJoinTarget(props.url);
    return (
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`${label}. ${shown}`}
        accessibilityHint="Opens the video call"
        onPress={() => {
          void Linking.openURL(openableUrl(props.url));
        }}
        style={({ pressed }) => [styles.video, pressed && styles.pressed]}
      >
        <Ionicons name="videocam" size={36} color={colors.accentInk} />
        <Text style={styles.videoLabel}>{label}</Text>
        <Text style={styles.videoTarget}>{shown}</Text>
        <Text style={styles.videoHint}>Tap to open</Text>
      </Pressable>
    );
  }

  return (
    <View
      style={styles.place}
      accessibilityRole="text"
      accessibilityLabel={`Meet here. ${props.address}`}
    >
      <Ionicons name="location" size={36} color={colors.accent} />
      <Text style={styles.placeLabel}>Meet here</Text>
      <Text style={styles.placeTarget}>{props.address}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  video: {
    width: '100%',
    minHeight: 248,
    backgroundColor: colors.accent,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
    borderBottomLeftRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 24,
    marginTop: 16,
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOpacity: 0.38,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  pressed: { opacity: 0.92 },
  place: {
    width: '100%',
    minHeight: 248,
    backgroundColor: colors.ink2,
    borderWidth: 3,
    borderColor: colors.accent,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
    borderBottomLeftRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 24,
    marginTop: 16,
    justifyContent: 'center',
  },
  videoLabel: {
    fontFamily: fonts.extraBold,
    fontSize: 32,
    lineHeight: 38,
    color: colors.accentInk,
    letterSpacing: -0.4,
    marginTop: 14,
  },
  videoTarget: {
    fontFamily: fonts.extraBold,
    fontSize: 24,
    lineHeight: 32,
    color: colors.accentInk,
    marginTop: 12,
  },
  videoHint: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: 'rgba(255,255,255,0.92)',
    marginTop: 16,
  },
  placeLabel: {
    fontFamily: fonts.extraBold,
    fontSize: 32,
    lineHeight: 38,
    color: colors.accent,
    letterSpacing: -0.4,
    marginTop: 14,
  },
  placeTarget: {
    fontFamily: fonts.extraBold,
    fontSize: 24,
    lineHeight: 32,
    color: colors.text,
    marginTop: 12,
  },
});

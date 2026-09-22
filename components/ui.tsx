import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  StyleProp,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '@/constants/theme';

export function Screen({
  children,
  style,
  glow = 'right',
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  glow?: 'right' | 'left' | 'none';
}) {
  return (
    <View style={[styles.screen, style]}>
      {glow !== 'none' && (
        <View
          pointerEvents="none"
          style={[
            styles.glow,
            glow === 'left' ? { left: -90 } : { right: -90 },
            glow === 'left'
              ? { backgroundColor: 'rgba(122,111,255,0.12)' }
              : { backgroundColor: 'rgba(91,77,255,0.12)' },
          ]}
        />
      )}
      {children}
    </View>
  );
}

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Display({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  return <Text style={[styles.display, style]}>{children}</Text>;
}

export function BtnPrimary({
  label,
  onPress,
  disabled,
  style,
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={[styles.btnPrimary, disabled && styles.btnDisabled, style]}
    >
      <Text style={styles.btnPrimaryText}>{label}</Text>
    </Pressable>
  );
}

export function BtnGhost({
  label,
  onPress,
  disabled,
  style,
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={[styles.btnGhost, disabled && styles.btnDisabled, style]}
    >
      <Text style={styles.btnGhostText}>{label}</Text>
    </Pressable>
  );
}

export function Band({ label }: { label: string }) {
  return (
    <View style={styles.band}>
      <Text style={styles.bandText}>{label}</Text>
    </View>
  );
}

export type TagTone = 'fresh' | 'aging' | 'urgent' | 'amber';

const TAG_TONES: Record<TagTone, { fg: string; soft: string }> = {
  fresh: { fg: colors.success, soft: colors.successSoft },
  aging: { fg: colors.amber, soft: colors.amberSoft },
  urgent: { fg: colors.danger, soft: colors.dangerSoft },
  amber: { fg: colors.amber, soft: colors.amberSoft },
};

export function Tag({
  label,
  amber,
  tone = amber ? 'amber' : undefined,
}: {
  label: string;
  /** Prefer `tone`. Kept for back-compat with existing amber callers. */
  amber?: boolean;
  tone?: TagTone;
}) {
  const resolved: TagTone = tone ?? 'amber';
  const palette = TAG_TONES[resolved];
  return (
    <View style={[styles.tag, { backgroundColor: palette.soft }]}>
      <Text style={[styles.tagText, { color: palette.fg }]}>{label}</Text>
    </View>
  );
}

export function Spine({
  label,
  accent,
}: {
  label: string;
  accent?: boolean;
}) {
  return (
    <View style={styles.spineWrap}>
      <View style={[styles.spine, accent ? styles.spineAccent : styles.spineMuted]}>
        <Text style={[styles.spineText, accent && { color: colors.accentInk }]}>{label}</Text>
      </View>
      <View
        style={[
          styles.spineTip,
          {
            borderTopColor: accent ? colors.accent : colors.ink3,
          },
        ]}
      />
    </View>
  );
}

export function Chip({
  label,
  accent,
}: {
  label: string;
  accent?: boolean;
}) {
  return (
    <View style={[styles.chip, accent && styles.chipAccent]}>
      <Text style={[styles.chipText, accent && styles.chipTextAccent]}>{label}</Text>
    </View>
  );
}

export function StyleChip({ label }: { label: string }) {
  return (
    <View style={styles.styleChip}>
      <Text style={styles.styleChipText}>{label}</Text>
    </View>
  );
}

export function StatusChip({ status }: { status: 'paid' | 'pending' }) {
  return (
    <View style={[styles.statusChip, status === 'paid' ? styles.statusPaid : styles.statusPending]}>
      <Text
        style={[
          styles.statusChipText,
          status === 'paid' ? { color: colors.accentDark } : { color: colors.amber },
        ]}
      >
        {status === 'paid' ? 'Paid' : 'Pending'}
      </Text>
    </View>
  );
}

export function Toggle({
  on,
  onToggle,
  activeColor = colors.accent,
}: {
  on: boolean;
  onToggle: () => void;
  /** Fill when on — use `colors.live` (indigo) for online status. */
  activeColor?: string;
}) {
  return (
    <Pressable
      onPress={onToggle}
      style={[styles.toggle, on && { backgroundColor: activeColor, borderColor: 'transparent' }]}
    >
      <View style={[styles.toggleKnob, on && styles.toggleKnobOn]} />
    </Pressable>
  );
}

export function BackHeader({
  title,
  onBack,
  right,
  titleStyle,
}: {
  title: string;
  onBack: () => void;
  right?: React.ReactNode;
  titleStyle?: StyleProp<TextStyle>;
}) {
  return (
    <View style={styles.backHeader}>
      <View style={styles.backHeaderLeft}>
        <Pressable onPress={onBack} hitSlop={12}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Display style={[{ fontSize: 19 }, titleStyle]}>{title}</Display>
      </View>
      {right}
    </View>
  );
}

export function SectionLabel({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  return <Text style={[styles.sectionLabel, style]}>{children}</Text>;
}

export function Avatar({
  initials,
  size = 42,
}: {
  initials: string;
  size?: number;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.ink3,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontFamily: fonts.extraBold, fontSize: size * 0.33, color: colors.text }}>
        {initials}
      </Text>
    </View>
  );
}

export function CheckCircle({ size = 56 }: { size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
      }}
    >
      <Ionicons name="checkmark" size={size * 0.46} color={colors.accentInk} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.ink,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: -130,
    width: 360,
    height: 360,
    borderRadius: 180,
    opacity: 1,
  },
  card: {
    backgroundColor: colors.ink2,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 18,
    shadowColor: '#0B1F3A',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  display: {
    fontFamily: fonts.extraBold,
    color: colors.text,
    letterSpacing: -0.2,
  },
  btnPrimary: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: colors.accent,
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  btnPrimaryText: {
    fontFamily: fonts.bold,
    fontSize: 14.5,
    color: colors.accentInk,
  },
  btnGhost: {
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: colors.ink2,
  },
  btnGhostText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.textDim,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  band: {
    backgroundColor: colors.bandSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  bandText: {
    fontFamily: fonts.bold,
    fontSize: 10.5,
    color: colors.band,
    letterSpacing: 0.2,
  },
  tag: {
    backgroundColor: colors.amberSoft,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  tagAmber: {},
  tagText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.amber,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  tagTextAmber: {},
  spineWrap: {
    width: 38,
    marginRight: 14,
    alignItems: 'center',
  },
  spine: {
    width: 38,
    paddingTop: 9,
    paddingBottom: 8,
    alignItems: 'center',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  spineAccent: { backgroundColor: colors.accent },
  spineMuted: { backgroundColor: colors.ink3 },
  spineText: {
    fontFamily: fonts.extraBold,
    fontSize: 16,
    color: colors.text,
  },
  spineTip: {
    width: 0,
    height: 0,
    borderLeftWidth: 19,
    borderRightWidth: 19,
    borderTopWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  chip: {
    backgroundColor: colors.ink3,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 20,
  },
  chipAccent: { backgroundColor: colors.accentSoft },
  chipText: {
    fontFamily: fonts.semiBold,
    fontSize: 11.5,
    color: colors.textDim,
  },
  chipTextAccent: {
    fontFamily: fonts.bold,
    color: colors.accentDark,
  },
  styleChip: {
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 20,
  },
  styleChipText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: colors.accentDark,
  },
  statusChip: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-end',
  },
  statusPaid: { backgroundColor: colors.accentSoft },
  statusPending: { backgroundColor: colors.amberSoft },
  statusChipText: {
    fontFamily: fonts.bold,
    fontSize: 10.5,
  },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: 14,
    backgroundColor: colors.ink3,
    borderWidth: 1,
    borderColor: colors.hairline,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleOn: {
    backgroundColor: colors.accent,
    borderColor: 'transparent',
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#14181C',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  toggleKnobOn: {
    alignSelf: 'flex-end',
  },
  backHeader: {
    paddingTop: 54,
    paddingHorizontal: 22,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  sectionLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 11.5,
    color: colors.textDim,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
});

export function DimText({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Text style={[{ fontFamily: fonts.medium, fontSize: 12.5, color: colors.textDim }, style]}>
      {children}
    </Text>
  );
}

export function BodyText({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Text style={[{ fontFamily: fonts.medium, fontSize: 13, color: colors.text, lineHeight: 20 }, style]}>
      {children}
    </Text>
  );
}

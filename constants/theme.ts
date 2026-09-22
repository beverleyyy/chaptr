/** Ping brand palette — cohesive light super-blue (focus / learning). */
export const colors = {
  // Surfaces (semantic: ink = page, ink2 = card, ink3 = soft blue chip)
  ink: '#EEF4FF',
  ink2: '#FFFFFF',
  ink3: '#DBE8FF',
  hairline: '#D7E3F8',

  // Type
  text: '#0A2540',
  textDim: '#64748B',

  // Brand anchors (blue family only)
  navy: '#0A2540',
  /** Ice page — kept as alias so older `cream` callers stay on-system. */
  cream: '#EEF4FF',
  /** Online / live — same primary blue (not cyan). */
  live: '#2B6CFF',
  liveSoft: '#DBE8FF',

  // Primary CTA — strong blue (white label)
  accent: '#2B6CFF',
  accentDark: '#1E54D6',
  accentSoft: '#DBE8FF',
  accentInk: '#FFFFFF',

  // Wait-time aging only (green → amber → red) — status, not brand
  amber: '#C4850A',
  amberSoft: '#FBF3D3',
  success: '#1B7A3D',
  successSoft: '#E6F6EC',
  band: '#2B6CFF',
  bandSoft: '#DBE8FF',
  danger: '#E1483D',
  dangerSoft: '#FCEDED',

  pageBg: '#EEF4FF',
  pageInk: '#0A2540',
  star: '#2B6CFF',
} as const;

export const spacing = {
  screen: 22,
  card: 16,
} as const;

export const fonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
} as const;

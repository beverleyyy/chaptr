/** Ping brand palette — light cream/white + electric indigo (no cyan). */
export const colors = {
  // Surfaces (semantic: ink = page, ink2 = card, ink3 = muted chip)
  ink: '#F4F1EA',
  ink2: '#FFFFFF',
  ink3: '#E8E4DC',
  hairline: 'rgba(11, 31, 58, 0.12)',

  // Type
  text: '#0B1F3A',
  textDim: '#8B9BB4',

  // Brand anchors
  navy: '#0B1F3A',
  cream: '#F4F1EA',
  /** Online / live — electric indigo (not cyan). */
  live: '#5B4DFF',
  liveSoft: 'rgba(91, 77, 255, 0.14)',
  liveMuted: '#7A6FFF',

  // Primary CTA — electric indigo (white label)
  accent: '#5B4DFF',
  accentDark: '#3F35C9',
  accentSoft: 'rgba(91, 77, 255, 0.14)',
  accentInk: '#FFFFFF',

  // Wait-time aging only (green → amber → red) — status, not brand
  amber: '#C4850A',
  amberSoft: '#FBF3D3',
  success: '#1B7A3D',
  successSoft: '#E6F6EC',
  band: '#5B4DFF',
  bandSoft: 'rgba(91, 77, 255, 0.12)',
  danger: '#E1483D',
  dangerSoft: '#FCEDED',

  pageBg: '#F4F1EA',
  pageInk: '#0B1F3A',
  star: '#5B4DFF',
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

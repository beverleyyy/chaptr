/** Ping brand palette — light cream/white + lime CTAs + cyan live (not Chaptr orange). */
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
  live: '#2DE2E6',
  liveSoft: 'rgba(45, 226, 230, 0.16)',

  // Primary CTA — electric lime (dark ink label on lime)
  accent: '#C8F542',
  accentDark: '#0B1F3A',
  accentSoft: 'rgba(200, 245, 66, 0.22)',
  accentInk: '#07101F',

  // Wait-time aging only (amber → red) — not brand orange
  amber: '#C4850A',
  amberSoft: '#FBF3D3',
  success: '#1B7A3D',
  successSoft: '#E6F6EC',
  band: '#0B6E72',
  bandSoft: 'rgba(45, 226, 230, 0.18)',
  danger: '#E1483D',
  dangerSoft: '#FCEDED',

  pageBg: '#F4F1EA',
  pageInk: '#0B1F3A',
  star: '#C8F542',
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

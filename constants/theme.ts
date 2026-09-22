/** Ping brand palette — navy + electric lime + cyan (not Chaptr orange). */
export const colors = {
  // Surfaces
  ink: '#07101F',
  ink2: '#0B1F3A',
  ink3: '#152A4A',
  hairline: 'rgba(139, 155, 180, 0.28)',

  // Type
  text: '#F4F1EA',
  textDim: '#8B9BB4',

  // Brand anchors
  navy: '#0B1F3A',
  cream: '#F4F1EA',
  live: '#2DE2E6',
  liveSoft: 'rgba(45, 226, 230, 0.16)',

  // Primary CTA — electric lime (black/ink label on lime)
  accent: '#C8F542',
  accentDark: '#A8D12A',
  accentSoft: 'rgba(200, 245, 66, 0.14)',
  accentInk: '#07101F',

  // Wait-time aging only (amber → red) — not brand orange
  amber: '#F5A623',
  amberSoft: 'rgba(245, 166, 35, 0.18)',
  success: '#3DDC87',
  successSoft: 'rgba(61, 220, 135, 0.16)',
  band: '#2DE2E6',
  bandSoft: 'rgba(45, 226, 230, 0.14)',
  danger: '#E1483D',
  dangerSoft: 'rgba(225, 72, 61, 0.18)',

  pageBg: '#07101F',
  pageInk: '#F4F1EA',
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

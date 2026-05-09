// ─── Najjashi Premium Design System ───
// Centralized theme tokens for consistent, premium UI across all screens

export const Colors = {
  // Backgrounds
  bg: {
    primary: '#080c0a',
    secondary: '#0d1210',
    card: '#141c18',
    cardHover: '#1e2a24',
    elevated: '#1e2a24',
    input: '#141c18',
    overlay: 'rgba(8,12,10,0.85)',
    glass: 'rgba(20,28,24,0.7)',
  },

  // Emerald
  emerald: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    850: '#033d30',
    900: '#022c22',
    950: '#011a12',
  },

  // Gold
  gold: {
    50: '#fdf8e1',
    100: '#f7e9a0',
    200: '#f0d875',
    300: '#e8c547',
    400: '#d4a843',
    500: '#b8860b',
    600: '#92702a',
  },

  // Midnight Blue
  midnight: {
    500: '#345070',
    600: '#253d5e',
    700: '#1a2d4a',
    800: '#111d35',
    900: '#0c1426',
  },

  // Ivory
  ivory: {
    100: '#faf8f0',
    200: '#f5f0e3',
    300: '#e8e0cc',
    400: '#d4c9a8',
  },

  // Charcoal
  charcoal: {
    100: '#c8d8d0',
    200: '#a0b8ac',
    300: '#7a9488',
    400: '#5a7068',
    500: '#3d4f45',
    600: '#2a3830',
    700: '#1e2a24',
    800: '#141c18',
    900: '#0d1210',
    950: '#080c0a',
  },

  // Semantic
  text: {
    primary: '#e8f5e9',
    secondary: '#a0b8ac',
    tertiary: '#7a9488',
    muted: '#5a7068',
    inverse: '#080c0a',
    arabic: '#f5f0e3',
    gold: '#d4a843',
  },

  border: {
    subtle: 'rgba(30,42,36,0.6)',
    default: 'rgba(30,42,36,0.8)',
    active: 'rgba(16,185,129,0.4)',
    gold: 'rgba(212,168,67,0.3)',
    focus: 'rgba(16,185,129,0.6)',
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const;

export const Radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  '2xl': 36,
  full: 9999,
} as const;

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 0,
  },
  glowGold: {
    shadowColor: '#d4a843',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 0,
  },
} as const;

export const Typography = {
  // English
  h1: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40, letterSpacing: -0.5 },
  h2: { fontSize: 24, fontWeight: '700' as const, lineHeight: 32, letterSpacing: -0.3 },
  h3: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  h4: { fontSize: 17, fontWeight: '600' as const, lineHeight: 24 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodyLg: { fontSize: 17, fontWeight: '400' as const, lineHeight: 26 },
  caption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  overline: { fontSize: 11, fontWeight: '600' as const, lineHeight: 16, letterSpacing: 1.5, textTransform: 'uppercase' as const },

  // Arabic
  arabicXl: { fontSize: 44, fontWeight: '400' as const, lineHeight: 76 },
  arabicLg: { fontSize: 36, fontWeight: '400' as const, lineHeight: 64 },
  arabicMd: { fontSize: 28, fontWeight: '400' as const, lineHeight: 50 },
  arabicBase: { fontSize: 22, fontWeight: '400' as const, lineHeight: 40 },
  arabicSm: { fontSize: 18, fontWeight: '400' as const, lineHeight: 32 },

  // Numbers
  timer: { fontSize: 48, fontWeight: '300' as const, lineHeight: 56, fontVariant: ['tabular-nums'] },
  counter: { fontSize: 56, fontWeight: '300' as const, lineHeight: 64, fontVariant: ['tabular-nums'] },
} as const;

// ─── Reusable Style Presets ───

export const CardPresets = {
  primary: {
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    ...Shadows.sm,
  },
  elevated: {
    backgroundColor: Colors.bg.elevated,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border.default,
    ...Shadows.md,
  },
  glass: {
    backgroundColor: Colors.bg.glass,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  gold: {
    backgroundColor: 'rgba(42,26,10,0.4)',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border.gold,
    ...Shadows.glowGold,
  },
  active: {
    backgroundColor: 'rgba(6,78,59,0.4)',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border.active,
    ...Shadows.glow,
  },
} as const;

export const ButtonPresets = {
  primary: {
    backgroundColor: Colors.emerald[600],
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center' as const,
    ...Shadows.md,
  },
  secondary: {
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center' as const,
  },
  gold: {
    backgroundColor: 'rgba(184,134,11,0.15)',
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: Colors.border.gold,
  },
} as const;

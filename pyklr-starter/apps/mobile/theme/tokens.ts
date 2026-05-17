/**
 * PYKLR theme tokens.
 * Light + dark variants for every color. Use via the `useTheme()` hook.
 */

export const colors = {
  brand: {
    green: '#67BF69',
    greenDark: '#4FA547',
    greenLight: '#EAF5E5',
    lime: '#A8E66A',
    limeDark: '#0A1F08',
    blue: '#4493CC',
    blueLight: '#E4F0F8',
  },
  light: {
    bg: '#FAFAF7',
    surface: '#FFFFFF',
    surface2: '#F4F4F2',
    border: '#F0F0F0',
    borderEmphasis: '#E5E5E5',
    text: '#0F0F0F',
    textMuted: '#666666',
    textFaint: '#999999',
    primary: '#67BF69',
    onPrimary: '#0A1F08',
    accent: '#4493CC',
  },
  dark: {
    bg: '#0B0B0B',
    surface: '#161616',
    surface2: '#1F1F1F',
    border: '#262626',
    borderEmphasis: '#333333',
    text: '#FFFFFF',
    textMuted: '#9A9A9A',
    textFaint: '#666666',
    primary: '#A8E66A',
    onPrimary: '#0A1F08',
    accent: '#4493CC',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 28,
  full: 9999,
} as const;

export const typography = {
  // Sizes
  size: {
    caption: 10,
    micro: 11,
    xs: 12,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 22,
    '2xl': 28,
    '3xl': 36,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    black: '900' as const,
  },
} as const;

export type ColorScheme = 'light' | 'dark';
export type ThemeColors = typeof colors.light;

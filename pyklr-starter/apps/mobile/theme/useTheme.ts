import { useColorScheme } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import { colors, type ThemeColors, type ColorScheme } from './tokens';

/**
 * Returns the active theme based on user preference (system / light / dark).
 * Falls back to system if user preference is "system".
 */
export function useTheme(): { scheme: ColorScheme; colors: ThemeColors } {
  const userPreference = useThemeStore((s) => s.preference);
  const systemScheme = useColorScheme() ?? 'light';
  const scheme: ColorScheme = userPreference === 'system' ? systemScheme : userPreference;
  return { scheme, colors: colors[scheme] };
}

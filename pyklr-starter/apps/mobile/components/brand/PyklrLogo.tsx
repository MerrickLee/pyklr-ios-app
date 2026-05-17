import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Polygon, Ellipse, Circle, Rect } from 'react-native-svg';
import { useTheme } from '@/theme/useTheme';
import { colors } from '@/theme/tokens';

/**
 * Compact simplified version of the PYKLR mark suitable for inline use at 16-32px.
 * For the high-fidelity logo (full traced paths), use FullPyklrLogo which references
 * the path data from `@/assets/logos/pyklr-logo-paths.ts`.
 */
export function PyklrMark({
  size = 32,
  paddleColor,
  triangleColor,
}: {
  size?: number;
  paddleColor?: string;
  triangleColor?: string;
}) {
  const { scheme } = useTheme();
  const paddle = paddleColor ?? (scheme === 'dark' ? colors.brand.lime : colors.brand.green);
  const triangle = triangleColor ?? colors.brand.blue;

  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      <Polygon points="5,12 5,80 60,46" fill={triangle} opacity={0.95} />
      <Ellipse cx="48" cy="34" rx="24" ry="28" fill="none" stroke={paddle} strokeWidth={5} />
      <Circle cx="32" cy="34" r="11" fill="none" stroke={paddle} strokeWidth={4} />
      <Circle cx="28" cy="32" r={1.8} fill={paddle} />
      <Circle cx="34" cy="30" r={1.8} fill={paddle} />
      <Circle cx="32" cy="37" r={1.8} fill={paddle} />
      <Rect x="44" y="62" width="5" height="18" fill={paddle} />
    </Svg>
  );
}

/**
 * Italic wordmark text. Used in headers next to the mark.
 */
export function PyklrWordmark({ size = 18 }: { size?: number }) {
  const { scheme } = useTheme();
  const color = scheme === 'dark' ? colors.brand.lime : colors.brand.greenDark;
  return (
    <Text
      style={{
        fontFamily: 'Inter',
        fontStyle: 'italic',
        fontWeight: '900',
        fontSize: size,
        letterSpacing: -0.5,
        color,
      }}
    >
      PYKLR
    </Text>
  );
}

/**
 * The standard header lockup: mark + wordmark, side by side.
 */
export function PyklrLockup({ size = 22 }: { size?: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <PyklrMark size={size} />
      <PyklrWordmark size={size * 0.85} />
    </View>
  );
}

/**
 * The splash-screen-style full brand block:
 * Blue square containing the mark, the wordmark below in big italic, and the
 * pixel-font tagline.
 */
export function PyklrSplashBrand() {
  const { scheme } = useTheme();
  const paddle = scheme === 'dark' ? colors.brand.lime : colors.brand.green;
  const wordmark = scheme === 'dark' ? colors.brand.lime : colors.brand.greenDark;
  const tagline = scheme === 'dark' ? colors.brand.lime : colors.brand.blue;

  return (
    <View style={{ alignItems: 'center', gap: 22 }}>
      <View
        style={{
          width: 140,
          height: 140,
          backgroundColor: colors.brand.blue,
          borderRadius: 32,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <PyklrMark size={100} paddleColor={paddle} />
      </View>
      <View style={{ alignItems: 'center' }}>
        <Text
          style={{
            fontFamily: 'Inter',
            fontStyle: 'italic',
            fontWeight: '900',
            fontSize: 44,
            letterSpacing: -1.5,
            color: wordmark,
            lineHeight: 44,
          }}
        >
          PYKLR
        </Text>
        <Text
          style={{
            fontFamily: 'Sink',
            fontSize: 10,
            letterSpacing: 2,
            color: tagline,
            marginTop: 4,
            opacity: scheme === 'dark' ? 0.7 : 1,
          }}
        >
          MEET PLAYERS. START MATCHES.
        </Text>
      </View>
    </View>
  );
}

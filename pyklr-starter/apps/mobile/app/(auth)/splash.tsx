import React from 'react';
import { View, Text, Pressable, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Polygon, Ellipse, Circle, Rect } from 'react-native-svg';

/**
 * Splash screen.
 *
 * Deliberately self-contained: no NativeWind classes, no dependency on the
 * shared Button or the useTheme() hook. Colors are hardcoded per scheme so
 * this screen physically cannot render empty/unstyled — it is the first
 * thing every user sees and must never break.
 */

const BRAND = {
  green: '#67BF69',
  greenDark: '#4FA547',
  lime: '#A8E66A',
  limeText: '#0A1F08',
  blue: '#4493CC',
  cream: '#F1EDEC',
};

function PyklrMark({ size = 58 }: { size?: number }) {
  return (
    <Svg viewBox="0 0 100 100" width={size} height={size}>
      <Polygon points="6,14 6,82 60,48" fill={BRAND.blue} />
      <Ellipse cx="50" cy="34" rx="25" ry="29" fill="none" stroke={BRAND.cream} strokeWidth={5} />
      <Circle cx="33" cy="34" r="12" fill="none" stroke={BRAND.cream} strokeWidth={4} />
      <Circle cx="28" cy="32" r={2} fill={BRAND.cream} />
      <Circle cx="35" cy="30" r={2} fill={BRAND.cream} />
      <Circle cx="33" cy="38" r={2} fill={BRAND.cream} />
      <Rect x="46" y="62" width="5" height="20" fill={BRAND.cream} />
    </Svg>
  );
}

export default function SplashScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';

  const bg = isDark ? '#0B0B0B' : '#FAFAF7';
  const wordmark = isDark ? BRAND.lime : BRAND.greenDark;
  const tagline = isDark ? BRAND.lime : BRAND.blue;
  const subtitle = isDark ? '#9A9A92' : '#7A7A72';
  const primaryBg = isDark ? BRAND.lime : BRAND.green;
  const ghostBorder = isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.2)';
  const ghostText = isDark ? '#FFFFFF' : '#0E0E0E';
  const proof = isDark ? '#666666' : '#A0A098';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <View style={styles.container}>
        <View style={styles.brandBlock}>
          <View style={styles.iconSquare}>
            <PyklrMark size={58} />
          </View>
          <Text style={[styles.wordmark, { color: wordmark }]}>PYKLR</Text>
          <Text style={[styles.tagline, { color: tagline, opacity: isDark ? 0.7 : 1 }]}>
            MEET PLAYERS. START MATCHES.
          </Text>
        </View>

        <Text style={[styles.subtitle, { color: subtitle }]}>
          Find players. Find courts.{'\n'}Find your game.
        </Text>

        <View style={styles.buttonGroup}>
          <Pressable
            onPress={() => router.push('/(auth)/sign-up')}
            style={({ pressed }) => [
              styles.btn,
              { backgroundColor: primaryBg, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={[styles.btnText, { color: BRAND.limeText }]}>Get started</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/(auth)/sign-in')}
            style={({ pressed }) => [
              styles.btn,
              styles.btnGhost,
              { borderColor: ghostBorder, opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Text style={[styles.btnText, { color: ghostText }]}>
              I already have an account
            </Text>
          </Pressable>
        </View>

        <Text style={[styles.proof, { color: proof }]}>
          Join 12,000+ players in the tri-state area
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBlock: { alignItems: 'center' },
  iconSquare: {
    width: 96,
    height: 96,
    backgroundColor: BRAND.green,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  wordmark: {
    fontSize: 38,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: -1,
    lineHeight: 40,
  },
  tagline: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 6,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 28,
    marginBottom: 36,
  },
  buttonGroup: { width: '100%', gap: 12 },
  btn: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
  btnText: { fontSize: 15, fontWeight: '600' },
  proof: {
    fontSize: 11,
    marginTop: 22,
    textAlign: 'center',
  },
});

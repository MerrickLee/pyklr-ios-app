import React from 'react';
import { View, Text, StyleSheet, useColorScheme, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { PYKLR_WORDMARK_PATH, PYKLR_WORDMARK_VIEWBOX } from '@/assets/logos/pyklr-logo-paths';

const BRAND = {
  green: '#67BF69',
  greenDark: '#4FA547',
  lime: '#A8E66A',
  limeText: '#0A1F08',
  blue: '#4493CC',
  cream: '#FAFAF5',
};

export default function SplashScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';

  // Theme-specific color values
  const bg = isDark ? '#0E0E0E' : '#FAFAF5';
  const taglineColor = isDark ? BRAND.lime : BRAND.blue;
  const subtitleColor = isDark ? '#A1A19A' : '#52524E';
  const proofColor = isDark ? '#6B7280' : '#9CA3AF';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <View style={styles.container}>
        {/* Brand Lockup */}
        <View style={styles.brandBlock}>
          <Image
            source={require('@/assets/logos/pyklr-app-icon-rounded.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          
          <Svg viewBox={PYKLR_WORDMARK_VIEWBOX} width={138} height={40} style={styles.wordmarkSvg}>
            <Path d={PYKLR_WORDMARK_PATH} fill={isDark ? BRAND.lime : BRAND.green} />
          </Svg>
          
          <Text style={[styles.tagline, { color: taglineColor }]}>
            MEET PLAYERS. START MATCHES.
          </Text>
        </View>

        <Text style={[styles.subtitle, { color: subtitleColor }]}>
          Find players. Find courts.{'\n'}Find your game.
        </Text>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/(auth)/sign-up')}
            style={[
              styles.btn,
              isDark ? styles.btnDarkTheme : styles.btnLightThemePrimary,
            ]}
          >
            <Text style={[styles.btnText, isDark ? styles.btnTextDarkTheme : styles.btnTextLightThemePrimary]}>
              Get started
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => router.push('/(auth)/sign-in')}
            style={[
              styles.btn,
              isDark ? styles.btnDarkTheme : styles.btnLightThemeSecondary,
            ]}
          >
            <Text style={[styles.btnText, isDark ? styles.btnTextDarkTheme : styles.btnTextLightThemeSecondary]}>
              I already have an account
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.proof, { color: proofColor }]}>
          Join 12,000+ players in the tri-state area
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBlock: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logoImage: {
    width: 108,
    height: 108,
    marginBottom: 20,
  },
  wordmarkSvg: {
    marginBottom: 6,
  },
  tagline: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 23,
    fontWeight: '500',
    marginTop: 34,
    marginBottom: 44,
  },
  buttonGroup: {
    width: '100%',
    gap: 12,
    paddingHorizontal: 4,
  },
  btn: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnLightThemePrimary: {
    backgroundColor: '#0E0E0E',
  },
  btnLightThemeSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#0E0E0E',
  },
  btnTextLightThemePrimary: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  btnTextLightThemeSecondary: {
    color: '#0E0E0E',
    fontWeight: '700',
  },
  btnDarkTheme: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  btnTextDarkTheme: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  btnText: {
    fontSize: 15,
  },
  proof: {
    fontSize: 11,
    marginTop: 24,
    textAlign: 'center',
    fontWeight: '500',
  },
});

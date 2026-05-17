import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { PYKLR_MARK_PATH, PYKLR_MARK_VIEWBOX, PYKLR_WORDMARK_PATH, PYKLR_WORDMARK_VIEWBOX } from '@/assets/logos/pyklr-logo-paths';
import { signInWithApple, signInWithGoogle, signInWithEmail } from '@/lib/auth';

/**
 * Sign In Screen.
 * Self-contained design to ensure zero bundling/styling dependencies and high reliability.
 */

const BRAND = {
  green: '#67BF69',
  greenDark: '#4FA547',
  lime: '#A8E66A',
  limeText: '#0A1F08',
  blue: '#4493CC',
};

// Custom Vector Icons for Apple and Google Social Sign-In
function AppleIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill={color}>
      <Path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.57 2.95-1.39" />
    </Svg>
  );
}

function GoogleIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.22-.66-.35-1.36-.35-2.09z" fill="#FBBC05" />
      <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
    </Svg>
  );
}

export default function SignInScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState<string | null>(null);

  // Focus states for custom high-contrast borders
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Theme colors matching mockups perfectly
  const bg = isDark ? '#0E0E0E' : '#FAFAF5';
  const headingColor = isDark ? '#FFFFFF' : '#0E0E0E';
  const subColor = isDark ? '#888888' : '#6E6D68';
  const accentColor = isDark ? BRAND.lime : BRAND.greenDark;
  
  const socialBg = isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF';
  const socialBorder = isDark ? '#FFFFFF' : '#0E0E0E';
  const socialText = isDark ? '#FFFFFF' : '#0E0E0E';
  
  const inputBg = isDark ? '#1C1C1C' : '#FFFFFF';
  const inputBorderDefault = isDark ? '#374151' : '#C9C7BD';
  const inputBorderActive = isDark ? BRAND.lime : BRAND.green;
  const inputText = isDark ? '#FFFFFF' : '#0E0E0E';
  const placeholderText = isDark ? '#6B7280' : '#8E8E8A';
  const dividerLine = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)';

  async function handleSubmit() {
    if (!email.trim() || !password) {
      Alert.alert('Missing info', 'Please enter your email and password.');
      return;
    }
    setLoading('email');
    const { error } = await signInWithEmail(email.trim(), password);
    setLoading(null);
    if (error) Alert.alert('Sign in failed', error.message);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Lockup at Top Left */}
        <View style={styles.lockup}>
          <Svg viewBox={PYKLR_MARK_VIEWBOX} width={18} height={25}>
            <Path d={PYKLR_MARK_PATH} fill="#67BF69" />
          </Svg>
          <Svg viewBox={PYKLR_WORDMARK_VIEWBOX} width={59} height={17}>
            <Path d={PYKLR_WORDMARK_PATH} fill={isDark ? BRAND.lime : BRAND.green} />
          </Svg>
        </View>

        {/* Heading & Subtitle */}
        <Text style={[styles.heading, { color: headingColor }]}>Welcome back</Text>
        <Text style={[styles.sub, { color: subColor }]}>Enter your email and password to log in</Text>

        {/* Apple Sign-In (iOS only) */}
        {Platform.OS === 'ios' && (
          <Pressable
            onPress={async () => {
              setLoading('apple');
              const { error } = await signInWithApple();
              setLoading(null);
              if (error) Alert.alert('Apple sign-in failed', error.message);
            }}
            style={({ pressed }) => [
              styles.btnSocial,
              { backgroundColor: socialBg, borderColor: socialBorder, opacity: pressed ? 0.75 : 1 },
            ]}
          >
            <View style={styles.socialBtnContent}>
              <AppleIcon color={socialText} />
              <Text style={[styles.btnText, { color: socialText, marginLeft: 10 }]}>
                {loading === 'apple' ? 'Connecting…' : 'Continue with Apple'}
              </Text>
            </View>
          </Pressable>
        )}

        {/* Google Sign-In */}
        <Pressable
          onPress={async () => {
            setLoading('google');
            const { error } = await signInWithGoogle();
            setLoading(null);
            if (error) Alert.alert('Google sign-in failed', error.message);
          }}
          style={({ pressed }) => [
            styles.btnSocial,
            { backgroundColor: socialBg, borderColor: socialBorder, opacity: pressed ? 0.75 : 1 },
          ]}
        >
          <View style={styles.socialBtnContent}>
            <GoogleIcon />
            <Text style={[styles.btnText, { color: socialText, marginLeft: 10 }]}>
              {loading === 'google' ? 'Connecting…' : 'Continue with Google'}
            </Text>
          </View>
        </Pressable>

        {/* Separator Divider */}
        <View style={styles.dividerRow}>
          <View style={[styles.line, { backgroundColor: dividerLine }]} />
          <Text style={[styles.dividerText, { color: placeholderText }]}>or</Text>
          <View style={[styles.line, { backgroundColor: dividerLine }]} />
        </View>

        {/* Email Input */}
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email address"
          placeholderTextColor={placeholderText}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          onFocus={() => setEmailFocused(true)}
          onBlur={() => setEmailFocused(false)}
          style={[
            styles.input,
            {
              backgroundColor: inputBg,
              borderColor: emailFocused ? inputBorderActive : inputBorderDefault,
              color: inputText,
            },
          ]}
        />

        {/* Password Input */}
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={placeholderText}
          secureTextEntry
          autoComplete="current-password"
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
          style={[
            styles.input,
            {
              backgroundColor: inputBg,
              borderColor: passwordFocused ? inputBorderActive : inputBorderDefault,
              color: inputText,
            },
          ]}
        />

        {/* Forgot Password wrap */}
        <Pressable
          onPress={() =>
            Alert.alert('Reset password', 'Password reset will be available soon.')
          }
          style={styles.forgotWrap}
        >
          <Text style={[styles.forgot, { color: accentColor }]}>Forgot password?</Text>
        </Pressable>

        {/* Main Submit Button */}
        <Pressable
          onPress={handleSubmit}
          style={({ pressed }) => [
            styles.btnSubmit,
            isDark ? styles.btnDarkSubmit : styles.btnLightSubmit,
            { opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={[styles.btnText, isDark ? styles.btnTextDarkSubmit : styles.btnTextLightSubmit]}>
            {loading === 'email' ? 'Signing in…' : 'Sign in'}
          </Text>
        </Pressable>

        {/* Footer Navigation */}
        <Pressable
          onPress={() => router.replace('/(auth)/sign-up')}
          style={styles.footerWrap}
        >
          <Text style={[styles.footer, { color: subColor }]}>
            No account yet? <Text style={{ color: accentColor, fontWeight: '700' }}>Create one</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 40,
  },
  lockup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 28,
  },
  heading: {
    fontSize: 32,
    fontFamily: 'Sink',
    lineHeight: 36,
    marginBottom: 6,
  },
  sub: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 24,
  },
  btnSocial: {
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  socialBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 14,
  },
  line: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    fontSize: 14,
    marginBottom: 12,
    fontWeight: '500',
  },
  forgotWrap: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginTop: -2,
  },
  forgot: {
    fontSize: 13,
    fontWeight: '700',
  },
  btnSubmit: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  btnLightSubmit: {
    backgroundColor: '#0E0E0E', // Light mode solid black submit button
  },
  btnTextLightSubmit: {
    color: '#FFFFFF',
  },
  btnDarkSubmit: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)', // Dark mode transparent outline submit button
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  btnTextDarkSubmit: {
    color: '#FFFFFF',
  },
  footerWrap: {
    alignSelf: 'center',
    marginTop: 22,
  },
  footer: {
    fontSize: 14,
    fontWeight: '500',
  },
});

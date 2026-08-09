import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
  useColorScheme,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { signInWithApple, signInWithGoogle, signInWithFacebook, signUpWithEmail } from '@/lib/auth';

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

function FacebookIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="#1877F2">
      <Path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </Svg>
  );
}

export default function SignUpScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  // Focus states for custom elegant borders
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
  const fineColor = isDark ? '#666666' : '#9CA3AF';

  async function handleSubmit() {
    setPasswordError(null);
    if (!email.trim()) {
      Alert.alert('Email required', 'Please enter your email address.');
      return;
    }
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      return;
    }
    setLoading('email');
    const { error } = await signUpWithEmail(email.trim(), password);
    setLoading(null);
    if (error) {
      Alert.alert('Sign up failed', error.message);
    } else {
      router.replace('/(auth)/survey');
    }
  }

  async function handleApple() {
    setLoading('apple');
    const { error } = await signInWithApple();
    setLoading(null);
    if (error) Alert.alert('Apple sign-in failed', error.message);
  }

  async function handleGoogle() {
    setLoading('google');
    const { error } = await signInWithGoogle();
    setLoading(null);
    if (error) Alert.alert('Google sign-in failed', error.message);
  }

  async function handleFacebook() {
    setLoading('facebook');
    const { error } = await signInWithFacebook();
    setLoading(null);
    if (error) Alert.alert('Facebook sign-in failed', error.message);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Exact PNG Brand Lockup at Top Left */}
        <View style={styles.lockup}>
          <Image
            source={isDark ? require('@/assets/lee-picked/Logo White.png') : require('@/assets/lee-picked/Logo Color.png')}
            style={{ width: 140, height: 49 }}
            resizeMode="contain"
          />
        </View>

        {/* Heading & Subtitle */}
        <Text
          style={[styles.heading, { color: headingColor }]}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          Create your account
        </Text>
        <Text style={[styles.sub, { color: subColor }]}>Join players nearby</Text>

        {/* Apple Sign-In (iOS only) */}
        {Platform.OS === 'ios' && (
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleApple}
            style={[styles.btnSocial, { backgroundColor: socialBg, borderColor: socialBorder }]}
          >
            <View style={styles.socialBtnContent}>
              <AppleIcon color={socialText} />
              <Text style={[styles.btnText, { color: socialText, marginLeft: 10 }]}>
                {loading === 'apple' ? 'Connecting…' : 'Continue with Apple'}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Google Sign-In */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={handleGoogle}
          style={[styles.btnSocial, { backgroundColor: socialBg, borderColor: socialBorder }]}
        >
          <View style={styles.socialBtnContent}>
            <GoogleIcon />
            <Text style={[styles.btnText, { color: socialText, marginLeft: 10 }]}>
              {loading === 'google' ? 'Connecting…' : 'Continue with Google'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Facebook Login */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={handleFacebook}
          style={[styles.btnSocial, { backgroundColor: socialBg, borderColor: socialBorder }]}
        >
          <View style={styles.socialBtnContent}>
            <FacebookIcon />
            <Text style={[styles.btnText, { color: socialText, marginLeft: 10 }]}>
              {loading === 'facebook' ? 'Connecting…' : 'Continue with Facebook'}
            </Text>
          </View>
        </TouchableOpacity>

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
          onChangeText={(t) => {
            setPassword(t);
            if (passwordError) setPasswordError(null);
          }}
          placeholder="Password"
          placeholderTextColor={placeholderText}
          secureTextEntry
          autoComplete="new-password"
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
          style={[
            styles.input,
            {
              backgroundColor: inputBg,
              borderColor: passwordError
                ? '#E24B4A'
                : passwordFocused
                ? inputBorderActive
                : inputBorderDefault,
              color: inputText,
            },
          ]}
        />
        {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}

        {/* Main Submit Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSubmit}
          style={[
            styles.btnSubmit,
            isDark ? styles.btnDarkSubmit : styles.btnLightSubmit,
          ]}
        >
          <Text style={[styles.btnText, isDark ? styles.btnTextDarkSubmit : styles.btnTextLightSubmit]}>
            {loading === 'email' ? 'Creating account…' : 'Sign up'}
          </Text>
        </TouchableOpacity>

        {/* Footer Navigation */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.replace('/(auth)/sign-in')}
          style={styles.footerWrap}
        >
          <Text style={[styles.footer, { color: subColor }]}>
            Already have an account? <Text style={{ color: accentColor, fontWeight: '700' }}>Sign in</Text>
          </Text>
        </TouchableOpacity>

        {/* Policy Fine Print */}
        <Text style={[styles.fine, { color: fineColor }]}>
          By signing up you agree to our{'\n'}Terms &amp; Privacy Policy
        </Text>
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
    alignItems: 'center',
    marginBottom: 24,
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
  errorText: {
    color: '#E24B4A',
    fontSize: 12,
    marginTop: -6,
    marginBottom: 10,
    fontWeight: '600',
  },
  btnSubmit: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
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
  fine: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 16,
    fontWeight: '500',
  },
});

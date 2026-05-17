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
import Svg, { Polygon, Ellipse, Circle, Rect } from 'react-native-svg';
import { signInWithApple, signInWithGoogle, signUpWithEmail } from '@/lib/auth';

const BRAND = {
  green: '#67BF69',
  greenDark: '#4FA547',
  lime: '#A8E66A',
  limeText: '#0A1F08',
  blue: '#4493CC',
};

function PyklrLockupMark({ stroke }: { stroke: string }) {
  return (
    <Svg viewBox="0 0 100 100" width={26} height={26}>
      <Polygon points="6,14 6,82 60,48" fill={BRAND.blue} />
      <Ellipse cx="50" cy="34" rx="25" ry="29" fill="none" stroke={stroke} strokeWidth={6} />
      <Circle cx="33" cy="34" r="12" fill="none" stroke={stroke} strokeWidth={5} />
      <Rect x="46" y="62" width="5" height="20" fill={stroke} />
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

  const bg = isDark ? '#0B0B0B' : '#FAFAF7';
  const heading = isDark ? '#FFFFFF' : '#0E0E0E';
  const sub = isDark ? '#888888' : '#8A8A82';
  const wordmark = isDark ? BRAND.lime : BRAND.greenDark;
  const markStroke = isDark ? BRAND.lime : BRAND.green;
  const primaryBg = isDark ? BRAND.lime : BRAND.green;
  const socialBg = isDark ? '#1C1C1C' : '#FFFFFF';
  const socialBorder = isDark ? '#353535' : '#C9C7BD';
  const socialText = isDark ? '#FFFFFF' : '#1A1A1A';
  const inputBg = isDark ? '#1A1A1A' : '#EDEBE0';
  const inputBorder = isDark ? '#2A2A2A' : '#DCDACF';
  const inputText = isDark ? '#FFFFFF' : '#333333';
  const placeholder = isDark ? '#777777' : '#999999';
  const dividerLine = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.14)';
  const fine = isDark ? '#666666' : '#A0A098';

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

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.lockup}>
          <PyklrLockupMark stroke={markStroke} />
          <Text style={[styles.lockupWord, { color: wordmark }]}>PYKLR</Text>
        </View>

        <Text style={[styles.heading, { color: heading }]}>Create your{'\n'}account</Text>
        <Text style={[styles.sub, { color: sub }]}>Join 12,000+ players nearby</Text>

        {Platform.OS === 'ios' && (
          <Pressable
            onPress={handleApple}
            style={({ pressed }) => [
              styles.btn,
              { backgroundColor: socialBg, borderColor: socialBorder, borderWidth: 1.5, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={[styles.btnText, { color: socialText }]}>
              {loading === 'apple' ? 'Connecting…' : ' Continue with Apple'}
            </Text>
          </Pressable>
        )}
        <Pressable
          onPress={handleGoogle}
          style={({ pressed }) => [
            styles.btn,
            { backgroundColor: socialBg, borderColor: socialBorder, borderWidth: 1.5, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Text style={[styles.btnText, { color: socialText }]}>
            {loading === 'google' ? 'Connecting…' : 'Continue with Google'}
          </Text>
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={[styles.line, { backgroundColor: dividerLine }]} />
          <Text style={[styles.dividerText, { color: placeholder }]}>or</Text>
          <View style={[styles.line, { backgroundColor: dividerLine }]} />
        </View>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email address"
          placeholderTextColor={placeholder}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: inputText }]}
        />
        <TextInput
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            if (passwordError) setPasswordError(null);
          }}
          placeholder="Password"
          placeholderTextColor={placeholder}
          secureTextEntry
          autoComplete="new-password"
          style={[
            styles.input,
            {
              backgroundColor: inputBg,
              borderColor: passwordError ? '#E24B4A' : inputBorder,
              color: inputText,
            },
          ]}
        />
        {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}

        <Pressable
          onPress={handleSubmit}
          style={({ pressed }) => [
            styles.btn,
            styles.primaryBtn,
            { backgroundColor: primaryBg, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={[styles.btnText, { color: BRAND.limeText }]}>
            {loading === 'email' ? 'Creating account…' : 'Sign up'}
          </Text>
        </Pressable>

        <Text style={[styles.fine, { color: fine }]}>
          By signing up you agree to our{'\n'}Terms &amp; Privacy Policy
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 24, paddingTop: 18 },
  lockup: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 20 },
  lockupWord: { fontSize: 16, fontWeight: '900', fontStyle: 'italic', letterSpacing: -0.5 },
  heading: { fontSize: 28, fontWeight: '700', lineHeight: 32 },
  sub: { fontSize: 13, marginTop: 8, marginBottom: 20 },
  btn: {
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  primaryBtn: { marginTop: 4 },
  btnText: { fontSize: 14, fontWeight: '600' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 8 },
  line: { flex: 1, height: 1 },
  dividerText: { fontSize: 11 },
  input: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 14,
    marginBottom: 10,
  },
  errorText: { color: '#E24B4A', fontSize: 12, marginTop: -4, marginBottom: 8 },
  fine: { fontSize: 11, textAlign: 'center', marginTop: 14, lineHeight: 16 },
});

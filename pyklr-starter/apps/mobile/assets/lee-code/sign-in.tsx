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
import { signInWithApple, signInWithGoogle, signInWithEmail } from '@/lib/auth';

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

export default function SignInScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState<string | null>(null);

  const bg = isDark ? '#0B0B0B' : '#FAFAF7';
  const heading = isDark ? '#FFFFFF' : '#0E0E0E';
  const sub = isDark ? '#888888' : '#8A8A82';
  const wordmark = isDark ? BRAND.lime : BRAND.greenDark;
  const markStroke = isDark ? BRAND.lime : BRAND.green;
  const accent = isDark ? BRAND.lime : BRAND.greenDark;
  const primaryBg = isDark ? BRAND.lime : BRAND.green;
  const socialBg = isDark ? '#1C1C1C' : '#FFFFFF';
  const socialBorder = isDark ? '#353535' : '#C9C7BD';
  const socialText = isDark ? '#FFFFFF' : '#1A1A1A';
  const inputBg = isDark ? '#1A1A1A' : '#EDEBE0';
  const inputBorder = isDark ? '#2A2A2A' : '#DCDACF';
  const inputText = isDark ? '#FFFFFF' : '#333333';
  const placeholder = isDark ? '#777777' : '#999999';
  const dividerLine = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.14)';

  async function handleSubmit() {
    if (!email.trim() || !password) {
      Alert.alert('Missing info', 'Enter your email and password.');
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
      >
        <View style={styles.lockup}>
          <PyklrLockupMark stroke={markStroke} />
          <Text style={[styles.lockupWord, { color: wordmark }]}>PYKLR</Text>
        </View>

        <Text style={[styles.heading, { color: heading }]}>Welcome back</Text>
        <Text style={[styles.sub, { color: sub }]}>Sign in to keep playing</Text>

        {Platform.OS === 'ios' && (
          <Pressable
            onPress={async () => {
              setLoading('apple');
              const { error } = await signInWithApple();
              setLoading(null);
              if (error) Alert.alert('Apple sign-in failed', error.message);
            }}
            style={({ pressed }) => [
              styles.btn,
              { backgroundColor: socialBg, borderColor: socialBorder, borderWidth: 1.5, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={[styles.btnText, { color: socialText }]}>
              {loading === 'apple' ? 'Connecting…' : 'Continue with Apple'}
            </Text>
          </Pressable>
        )}
        <Pressable
          onPress={async () => {
            setLoading('google');
            const { error } = await signInWithGoogle();
            setLoading(null);
            if (error) Alert.alert('Google sign-in failed', error.message);
          }}
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
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={placeholder}
          secureTextEntry
          autoComplete="current-password"
          style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: inputText }]}
        />

        <Pressable
          onPress={() =>
            Alert.alert('Reset password', 'Password reset will be available soon.')
          }
          style={styles.forgotWrap}
        >
          <Text style={[styles.forgot, { color: accent }]}>Forgot password?</Text>
        </Pressable>

        <Pressable
          onPress={handleSubmit}
          style={({ pressed }) => [
            styles.btn,
            { backgroundColor: primaryBg, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={[styles.btnText, { color: BRAND.limeText }]}>
            {loading === 'email' ? 'Signing in…' : 'Sign in'}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.replace('/(auth)/sign-up')}
          style={styles.footerWrap}
        >
          <Text style={[styles.footer, { color: sub }]}>
            No account yet? <Text style={{ color: accent, fontWeight: '600' }}>Create one</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 24, paddingTop: 18 },
  lockup: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 24 },
  lockupWord: { fontSize: 16, fontWeight: '900', fontStyle: 'italic', letterSpacing: -0.5 },
  heading: { fontSize: 28, fontWeight: '700', lineHeight: 32 },
  sub: { fontSize: 13, marginTop: 8, marginBottom: 22 },
  btn: {
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
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
  forgotWrap: { alignSelf: 'flex-end', marginBottom: 14, marginTop: -2 },
  forgot: { fontSize: 12, fontWeight: '600' },
  footerWrap: { alignSelf: 'center', marginTop: 18 },
  footer: { fontSize: 13 },
});

import React, { useState } from 'react';
import { View, Text, ScrollView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { PyklrLockup } from '@/components/brand/PyklrLogo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  signInWithApple,
  signInWithGoogle,
  signUpWithEmail,
} from '@/lib/auth';
import { useTheme } from '@/theme/useTheme';

export default function SignUpScreen() {
  const router = useRouter();
  const { colors: c } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState<string | null>(null);

  async function handleSubmit() {
    if (!email || password.length < 8) {
      Alert.alert('Check your input', 'Email and a password of 8+ characters are required.');
      return;
    }
    setLoading('email');
    const { error } = await signUpWithEmail(email, password);
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
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView
        contentContainerStyle={{ padding: 24, gap: 14 }}
        keyboardShouldPersistTaps="handled"
      >
        <PyklrLockup size={24} />
        <View style={{ marginTop: 8 }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: c.text, lineHeight: 32 }}>
            Create your{'\n'}account
          </Text>
          <Text style={{ fontSize: 13, color: c.textMuted, marginTop: 6 }}>
            Join 12,000+ players nearby
          </Text>
        </View>

        {Platform.OS === 'ios' && (
          <Button
            label="Continue with Apple"
            variant="ghost"
            loading={loading === 'apple'}
            onPress={handleApple}
          />
        )}
        <Button
          label="Continue with Google"
          variant="ghost"
          loading={loading === 'google'}
          onPress={handleGoogle}
        />

        <Text style={{ textAlign: 'center', color: c.textFaint, fontSize: 12, marginVertical: 4 }}>
          — or —
        </Text>

        <Input
          placeholder="Email address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <Input
          placeholder="Password (min. 8 characters)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
        />
        <Button label="Sign up" loading={loading === 'email'} onPress={handleSubmit} />

        <Text
          style={{
            textAlign: 'center',
            fontSize: 11,
            color: c.textFaint,
            marginTop: 4,
            lineHeight: 16,
          }}
        >
          By signing up you agree to our{'\n'}Terms & Privacy Policy
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

import React, { useState } from 'react';
import { View, Text, ScrollView, Platform, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { PyklrLockup } from '@/components/brand/PyklrLogo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  signInWithApple,
  signInWithGoogle,
  signInWithEmail,
} from '@/lib/auth';
import { useTheme } from '@/theme/useTheme';
import { colors } from '@/theme/tokens';

export default function SignInScreen() {
  const router = useRouter();
  const { scheme, colors: c } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState<string | null>(null);

  async function handleSubmit() {
    setLoading('email');
    const { error } = await signInWithEmail(email, password);
    setLoading(null);
    if (error) Alert.alert('Sign in failed', error.message);
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
            Welcome back
          </Text>
          <Text style={{ fontSize: 13, color: c.textMuted, marginTop: 6 }}>
            Sign in to keep playing
          </Text>
        </View>

        {Platform.OS === 'ios' && (
          <Button
            label="Continue with Apple"
            variant="ghost"
            loading={loading === 'apple'}
            onPress={async () => {
              setLoading('apple');
              const { error } = await signInWithApple();
              setLoading(null);
              if (error) Alert.alert('Apple sign-in failed', error.message);
            }}
          />
        )}
        <Button
          label="Continue with Google"
          variant="ghost"
          loading={loading === 'google'}
          onPress={async () => {
            setLoading('google');
            const { error } = await signInWithGoogle();
            setLoading(null);
            if (error) Alert.alert('Google sign-in failed', error.message);
          }}
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
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="current-password"
        />
        <Button label="Sign in" loading={loading === 'email'} onPress={handleSubmit} />

        <Pressable
          style={{ alignSelf: 'center', marginTop: 12 }}
          onPress={() => router.replace('/(auth)/sign-up')}
        >
          <Text style={{ color: scheme === 'dark' ? colors.brand.lime : colors.brand.greenDark, fontSize: 13 }}>
            No account yet? Create one
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

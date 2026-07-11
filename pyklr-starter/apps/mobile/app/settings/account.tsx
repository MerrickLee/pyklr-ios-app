import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, Mail, Lock, Download, UserCog } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/theme/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { colors } from '@/theme/tokens';

export default function AccountSettingsScreen() {
  const router = useRouter();
  const { scheme, colors: c } = useTheme();
  const primary = scheme === 'dark' ? colors.brand.lime : colors.brand.greenDark;
  const { user } = useAuth();

  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState<string | null>(null);

  async function handleChangeEmail() {
    if (!newEmail.trim()) {
      Alert.alert('Missing email', 'Please enter your new email address.');
      return;
    }
    setSaving('email');
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
    setSaving(null);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Check your email', 'We sent a confirmation link to your new email address. Click it to complete the change.');
      setNewEmail('');
    }
  }

  async function handleChangePassword() {
    if (!newPassword || newPassword.length < 8) {
      Alert.alert('Weak password', 'Password must be at least 8 characters.');
      return;
    }
    setSaving('password');
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(null);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Password updated', 'Your password has been changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
    }
  }

  async function handleDataExport() {
    if (!user) return;
    setSaving('export');

    try {
      const { data, error } = await supabase.functions.invoke('digest-mailer', {
        body: { type: 'data_export', user_id: user.id },
      });

      setSaving(null);
      if (error) {
        Alert.alert('Error', 'Could not process your data export. Please try again.');
      } else {
        Alert.alert(
          'Data export requested',
          'We\'re preparing your data export. You\'ll receive an email with all your PYKLR data shortly.',
        );
      }
    } catch {
      setSaving(null);
      Alert.alert('Error', 'Could not connect to the server. Please try again later.');
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 }}>
        <Pressable onPress={() => router.back()}>
          <ChevronLeft size={22} color={c.text} />
        </Pressable>
        <Text style={{ flex: 1, textAlign: 'center', fontWeight: '700', fontSize: 16, color: c.text }}>
          Account
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }}>
        {/* Edit Profile */}
        <Pressable onPress={() => router.push('/profile/edit' as never)}>
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <UserCog size={18} color={c.textMuted} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: c.text }}>Edit profile</Text>
                <Text style={{ fontSize: 12, color: c.textMuted }}>Change your display name, avatar, and bio</Text>
              </View>
              <ChevronRight size={16} color={c.textFaint} />
            </View>
          </Card>
        </Pressable>

        {/* Change Email */}
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Mail size={16} color={c.textMuted} />
            <Text style={{ fontSize: 14, fontWeight: '600', color: c.text }}>Change email</Text>
          </View>
          <Text style={{ fontSize: 12, color: c.textMuted, marginBottom: 10 }}>
            Current: {user?.email ?? 'Not set'}
          </Text>
          <Input
            value={newEmail}
            onChangeText={setNewEmail}
            placeholder="New email address"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Button
            label={saving === 'email' ? 'Updating…' : 'Update email'}
            variant="ghost"
            size="sm"
            onPress={handleChangeEmail}
            loading={saving === 'email'}
            style={{ marginTop: 8 }}
          />
        </Card>

        {/* Change Password */}
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Lock size={16} color={c.textMuted} />
            <Text style={{ fontSize: 14, fontWeight: '600', color: c.text }}>Change password</Text>
          </View>
          <Input
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="New password (min 8 chars)"
            secureTextEntry
          />
          <Button
            label={saving === 'password' ? 'Updating…' : 'Update password'}
            variant="ghost"
            size="sm"
            onPress={handleChangePassword}
            loading={saving === 'password'}
            style={{ marginTop: 8 }}
          />
        </Card>

        {/* Data Export */}
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Download size={16} color={c.textMuted} />
            <Text style={{ fontSize: 14, fontWeight: '600', color: c.text }}>Export my data</Text>
          </View>
          <Text style={{ fontSize: 12, color: c.textMuted, marginBottom: 10 }}>
            Download a copy of all your PYKLR data including your profile, messages, events, and forum posts.
          </Text>
          <Button
            label={saving === 'export' ? 'Preparing…' : 'Request data export'}
            variant="ghost"
            size="sm"
            onPress={handleDataExport}
            loading={saving === 'export'}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

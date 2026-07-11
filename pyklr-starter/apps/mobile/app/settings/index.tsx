import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Bell,
  Link2,
  Shield,
  Palette,
  LogOut,
  Trash2,
} from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/theme/useTheme';
import { useThemeStore, type ThemePreference } from '@/store/themeStore';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import { colors } from '@/theme/tokens';

function SectionHeader({ label }: { label: string }) {
  const { colors: c } = useTheme();
  return (
    <Text
      style={{
        fontSize: 11,
        fontWeight: '700',
        color: c.textMuted,
        letterSpacing: 1.5,
        marginTop: 16,
        marginBottom: 4,
      }}
    >
      {label}
    </Text>
  );
}

function SettingsRow({
  label,
  subtitle,
  rightText,
  showChevron,
  onPress,
  icon,
  danger,
}: {
  label: string;
  subtitle?: string;
  rightText?: string;
  showChevron?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  danger?: boolean;
}) {
  const { scheme, colors: c } = useTheme();
  const primary = scheme === 'dark' ? colors.brand.lime : colors.brand.greenDark;

  return (
    <Pressable onPress={onPress}>
      <Card style={{ marginTop: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {icon}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '500',
                color: danger ? '#E24B4A' : c.text,
              }}
            >
              {label}
            </Text>
            {subtitle && (
              <Text style={{ fontSize: 11, color: c.textMuted, marginTop: 1 }}>
                {subtitle}
              </Text>
            )}
          </View>
          {rightText && (
            <Text style={{ fontSize: 13, fontWeight: '600', color: primary }}>
              {rightText}
            </Text>
          )}
          {showChevron && <ChevronRight size={16} color={c.textFaint} />}
        </View>
      </Card>
    </Pressable>
  );
}

function ToggleRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  const { scheme, colors: c } = useTheme();
  const primary = scheme === 'dark' ? colors.brand.lime : colors.brand.green;

  return (
    <Card style={{ marginTop: 4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 14, fontWeight: '500', color: c.text, flex: 1 }}>{label}</Text>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: c.surface2, true: primary }}
          thumbColor="#FFFFFF"
        />
      </View>
    </Card>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { scheme, colors: c } = useTheme();
  const { preference, setPreference } = useThemeStore();
  const { data: profile } = useProfile();
  const { user } = useAuth();
  const primary = scheme === 'dark' ? colors.brand.lime : colors.brand.greenDark;

  // Privacy toggles (local state — synced to DB on change)
  const [showNearby, setShowNearby] = useState(profile?.available_to_match ?? true);
  const [allowDms, setAllowDms] = useState(profile?.dm_permission === 'anyone');
  const [availableToMatch, setAvailableToMatch] = useState(profile?.available_to_match ?? true);

  async function updateProfile(updates: Record<string, unknown>) {
    if (!user) return;
    await supabase.from('profiles').update(updates).eq('id', user.id);
  }

  const themeOptions: ThemePreference[] = ['system', 'light', 'dark'];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 12,
        }}
      >
        <Pressable onPress={() => router.back()}>
          <ChevronLeft size={22} color={c.text} />
        </Pressable>
        <Text
          style={{
            flex: 1,
            textAlign: 'center',
            fontWeight: '700',
            fontSize: 16,
            color: c.text,
          }}
        >
          Settings
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        {/* PRIVACY */}
        <SectionHeader label="PRIVACY" />
        <SettingsRow
          label="Privacy & visibility"
          subtitle="Profile visibility, DM permissions, matchmaking"
          showChevron
          onPress={() => router.push('/settings/privacy' as never)}
        />

        {/* INTEGRATIONS */}
        <SectionHeader label="INTEGRATIONS" />
        <SettingsRow
          label="Connected services"
          subtitle={
            profile?.dupr_verified
              ? `DUPR connected · ${profile.dupr_rating ?? '—'}`
              : 'DUPR, Calendar, Notifications'
          }
          showChevron
          onPress={() => router.push('/settings/integrations' as never)}
        />

        {/* APPEARANCE */}
        <SectionHeader label="APPEARANCE" />
        <Card style={{ marginTop: 4 }}>
          <Text style={{ fontWeight: '500', color: c.text, marginBottom: 10 }}>Theme</Text>
          {themeOptions.map((opt) => (
            <Pressable
              key={opt}
              onPress={() => setPreference(opt)}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 8,
              }}
            >
              <Text style={{ color: c.text, fontSize: 14, textTransform: 'capitalize' }}>
                {opt}
              </Text>
              {preference === opt && (
                <Text style={{ color: primary, fontSize: 13, fontWeight: '600' }}>✓</Text>
              )}
            </Pressable>
          ))}
        </Card>

        {/* ACCOUNT */}
        <SectionHeader label="ACCOUNT" />
        <SettingsRow
          label="Account settings"
          subtitle="Email, password, data export"
          showChevron
          onPress={() => router.push('/settings/account' as never)}
        />
        <SettingsRow
          label="Blocked users"
          subtitle="Manage your block list"
          showChevron
          onPress={() => router.push('/settings/blocked' as never)}
        />
        <SettingsRow
          label="Sign out"
          onPress={() => {
            Alert.alert('Sign out?', 'You can always sign back in.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Sign out', style: 'destructive', onPress: signOut },
            ]);
          }}
          icon={<LogOut size={16} color={c.textMuted} />}
        />
        <SettingsRow
          label="Delete account"
          danger
          onPress={() => {
            Alert.alert(
              'Delete account?',
              'Your account will be scheduled for permanent deletion in 30 days. During this period, you can sign back in to cancel. After 30 days, your profile, messages, and all data will be permanently deleted.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async () => {
                    if (!user) return;
                    // Soft-delete: mark profile with deletion timestamp
                    const deletionDate = new Date();
                    deletionDate.setDate(deletionDate.getDate() + 30);

                    const { error } = await supabase
                      .from('profiles')
                      .update({
                        deleted_at: new Date().toISOString(),
                        scheduled_deletion_at: deletionDate.toISOString(),
                      })
                      .eq('id', user.id);

                    if (error) {
                      Alert.alert('Error', 'Could not process your request. Please try again.');
                      return;
                    }

                    Alert.alert(
                      'Account scheduled for deletion',
                      'Your account will be permanently deleted on ' +
                        deletionDate.toLocaleDateString() +
                        '. Sign back in within 30 days to cancel.',
                      [
                        {
                          text: 'OK',
                          onPress: () => signOut(),
                        },
                      ]
                    );
                  },
                },
              ]
            );
          }}
          icon={<Trash2 size={16} color="#E24B4A" />}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

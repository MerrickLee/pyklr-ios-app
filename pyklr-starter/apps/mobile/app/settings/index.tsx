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
        <ToggleRow
          label="Show me to nearby players"
          value={showNearby}
          onValueChange={(v) => {
            setShowNearby(v);
            updateProfile({ available_to_match: v });
          }}
        />
        <ToggleRow
          label="Allow DMs from anyone"
          value={allowDms}
          onValueChange={(v) => {
            setAllowDms(v);
            updateProfile({ dm_permission: v ? 'anyone' : 'followers' });
          }}
        />
        <ToggleRow
          label='"Available to match" status'
          value={availableToMatch}
          onValueChange={(v) => {
            setAvailableToMatch(v);
            updateProfile({ available_to_match: v });
          }}
        />

        {/* INTEGRATIONS */}
        <SectionHeader label="INTEGRATIONS" />
        <SettingsRow
          label="DUPR sync"
          subtitle={
            profile?.dupr_verified
              ? `Connected · ${profile.dupr_rating ?? '—'}`
              : 'Not connected'
          }
          rightText={profile?.dupr_verified ? '✓ ON' : 'Connect'}
          onPress={() => {
            // TODO Phase 7: DUPR OAuth flow
            Alert.alert('DUPR Sync', 'OAuth integration coming in Phase 7.');
          }}
        />
        <SettingsRow
          label="Apple Calendar"
          subtitle="Sync match invites"
          rightText="Connect"
          onPress={() => {
            Alert.alert('Calendar Sync', 'Calendar integration coming in Phase 7.');
          }}
        />
        <SettingsRow
          label="Push notifications"
          subtitle="Manage notification preferences"
          showChevron
          onPress={() => router.push('/settings/notifications' as never)}
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
              'This will permanently delete your profile, messages, and all data. This cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => {
                    // TODO: implement account deletion
                    Alert.alert('Coming soon', 'Account deletion will be available in a future update.');
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

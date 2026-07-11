import React from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, Link2, Calendar, Bell, RefreshCw } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/theme/useTheme';
import { useProfile } from '@/hooks/useProfile';
import { colors } from '@/theme/tokens';

export default function IntegrationsSettingsScreen() {
  const router = useRouter();
  const { scheme, colors: c } = useTheme();
  const primary = scheme === 'dark' ? colors.brand.lime : colors.brand.greenDark;
  const { data: profile } = useProfile();

  const integrations = [
    {
      icon: Link2,
      title: 'DUPR Sync',
      subtitle: profile?.dupr_verified
        ? `Connected · Rating: ${profile.dupr_rating ?? '—'}`
        : 'Connect your DUPR account to sync your verified rating',
      connected: !!profile?.dupr_verified,
      lastSync: profile?.dupr_synced_at
        ? `Last synced: ${new Date(profile.dupr_synced_at).toLocaleDateString()}`
        : null,
      onPress: () => {
        Alert.alert(
          'DUPR Sync',
          'DUPR OAuth integration requires an approved DUPR API partnership. This feature will be enabled once the partnership is approved (estimated 4-8 weeks).',
        );
      },
    },
    {
      icon: Calendar,
      title: 'Apple Calendar',
      subtitle: 'Sync match invites to your calendar',
      connected: false,
      onPress: () => {
        Alert.alert(
          'Apple Calendar',
          'Calendar sync will request access to your EventKit. Match invites and event RSVPs will appear as calendar events.',
        );
      },
    },
    {
      icon: Calendar,
      title: 'Google Calendar',
      subtitle: 'Sync match invites to Google Calendar',
      connected: false,
      onPress: () => {
        Alert.alert(
          'Google Calendar',
          'Google Calendar sync requires an OAuth connection. This feature is coming in a future update.',
        );
      },
    },
    {
      icon: Bell,
      title: 'Push Notifications',
      subtitle: 'Manage notification delivery',
      connected: true,
      onPress: () => router.push('/settings/notifications' as never),
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 }}>
        <Pressable onPress={() => router.back()}>
          <ChevronLeft size={22} color={c.text} />
        </Pressable>
        <Text style={{ flex: 1, textAlign: 'center', fontWeight: '700', fontSize: 16, color: c.text }}>
          Integrations
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {integrations.map((item, index) => {
          const Icon = item.icon;
          return (
            <Pressable
              key={item.title}
              onPress={item.onPress}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Card style={{ marginTop: index > 0 ? 8 : 0 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: item.connected
                        ? `${primary}22`
                        : c.surface2,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={18} color={item.connected ? primary : c.textMuted} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: c.text }}>{item.title}</Text>
                      {item.connected && (
                        <Text style={{ fontSize: 10, fontWeight: '700', color: primary }}>✓ ON</Text>
                      )}
                    </View>
                    <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }}>{item.subtitle}</Text>
                    {item.lastSync && (
                      <Text style={{ fontSize: 10, color: c.textFaint, marginTop: 2 }}>{item.lastSync}</Text>
                    )}
                  </View>
                  <ChevronRight size={16} color={c.textFaint} />
                </View>
              </Card>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

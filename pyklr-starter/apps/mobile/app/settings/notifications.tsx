import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/theme/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { colors } from '@/theme/tokens';

interface NotifPrefs {
  push_dm: boolean;
  push_group_mention: boolean;
  push_event_invite: boolean;
  push_event_rsvp: boolean;
  push_follow: boolean;
  push_comment_reply: boolean;
  push_forum_activity: boolean;
  push_smart_suggestion: boolean;
}

const LABELS: Record<keyof NotifPrefs, string> = {
  push_dm: 'Direct messages',
  push_group_mention: 'Group mentions',
  push_event_invite: 'Event invites',
  push_event_rsvp: 'Event RSVPs',
  push_follow: 'New followers',
  push_comment_reply: 'Comment replies',
  push_forum_activity: 'Forum activity',
  push_smart_suggestion: 'Smart suggestions',
};

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { scheme, colors: c } = useTheme();
  const primary = scheme === 'dark' ? colors.brand.lime : colors.brand.green;

  const [prefs, setPrefs] = useState<NotifPrefs>({
    push_dm: true,
    push_group_mention: true,
    push_event_invite: true,
    push_event_rsvp: true,
    push_follow: true,
    push_comment_reply: true,
    push_forum_activity: false,
    push_smart_suggestion: true,
  });

  useEffect(() => {
    if (!user) return;
    supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setPrefs({
            push_dm: data.push_dm,
            push_group_mention: data.push_group_mention,
            push_event_invite: data.push_event_invite,
            push_event_rsvp: data.push_event_rsvp,
            push_follow: data.push_follow,
            push_comment_reply: data.push_comment_reply,
            push_forum_activity: data.push_forum_activity,
            push_smart_suggestion: data.push_smart_suggestion,
          });
        }
      });
  }, [user]);

  async function togglePref(key: keyof NotifPrefs) {
    const newVal = !prefs[key];
    setPrefs((prev) => ({ ...prev, [key]: newVal }));
    if (user) {
      await supabase
        .from('notification_preferences')
        .update({ [key]: newVal })
        .eq('user_id', user.id);
    }
  }

  const enabledCount = Object.values(prefs).filter(Boolean).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 }}>
        <Pressable onPress={() => router.back()}>
          <ChevronLeft size={22} color={c.text} />
        </Pressable>
        <Text style={{ flex: 1, textAlign: 'center', fontWeight: '700', fontSize: 16, color: c.text }}>
          Notifications
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        <Text style={{ fontSize: 12, color: c.textMuted, marginBottom: 12 }}>
          {enabledCount} of {Object.keys(prefs).length} enabled
        </Text>

        {(Object.keys(LABELS) as (keyof NotifPrefs)[]).map((key) => (
          <Card key={key} style={{ marginTop: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: c.text }}>{LABELS[key]}</Text>
              <Switch
                value={prefs[key]}
                onValueChange={() => togglePref(key)}
                trackColor={{ false: c.surface2, true: primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

import React from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  Check,
  Bell,
  Calendar,
  MessageCircle,
  UserPlus,
  MapPin,
  Sparkles,
} from 'lucide-react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { Skeleton, EmptyState } from '@/components/ui/Skeleton';
import { useTheme } from '@/theme/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { colors } from '@/theme/tokens';
import type { Database } from '@pyklr/shared/types/database';

type Notification = Database['public']['Tables']['notifications']['Row'];

const ICON_MAP: Record<string, typeof Bell> = {
  event_invite: Calendar,
  event_rsvp: Calendar,
  dm: MessageCircle,
  group_mention: MessageCircle,
  follow: UserPlus,
  court_approved: MapPin,
  smart_suggestion: Sparkles,
};

function NotificationRow({
  notif,
  onPress,
}: {
  notif: Notification;
  onPress: () => void;
}) {
  const { scheme, colors: c } = useTheme();
  const primary = scheme === 'dark' ? colors.brand.lime : colors.brand.green;
  const Icon = ICON_MAP[notif.type] ?? Bell;

  return (
    <Pressable onPress={onPress}>
      <Card
        variant={notif.read ? 'surface' : 'tint-blue'}
        style={{ marginTop: 6 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: notif.read
                ? c.surface2
                : `${primary}22`,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={16} color={notif.read ? c.textMuted : primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: notif.read ? '400' : '600',
                color: c.text,
              }}
              numberOfLines={2}
            >
              {notif.title}
            </Text>
            {notif.body && (
              <Text
                style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }}
                numberOfLines={1}
              >
                {notif.body}
              </Text>
            )}
          </View>
          <Text style={{ fontSize: 10, color: c.textFaint }}>
            {formatDistanceToNow(new Date(notif.created_at), { addSuffix: false })}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { scheme, colors: c } = useTheme();
  const primary = scheme === 'dark' ? colors.brand.lime : colors.brand.green;

  const {
    data: notifications,
    isLoading,
    isRefetching,
  } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async (): Promise<Notification[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  async function markAllRead() {
    if (!user) return;
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  }

  function handleNotifPress(notif: Notification) {
    // Mark as read
    supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notif.id)
      .then(() => {});

    // Deep link based on type + action_url
    if (notif.action_url) {
      router.push(notif.action_url as never);
    }
  }

  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

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
          Notifications
        </Text>
        <Pressable onPress={markAllRead}>
          <Check size={20} color={unreadCount > 0 ? primary : c.textMuted} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => queryClient.invalidateQueries({ queryKey: ['notifications'] })}
            tintColor={primary}
          />
        }
      >
        {unreadCount > 0 && (
          <Text style={{ fontSize: 12, color: c.textMuted, marginBottom: 4 }}>
            {unreadCount} unread
          </Text>
        )}

        {isLoading ? (
          <View style={{ gap: 6 }}>
            {[1, 2, 3, 4].map((i) => (
              <View
                key={i}
                style={{
                  height: 64,
                  borderRadius: 18,
                  backgroundColor: c.surface2,
                  marginTop: 6,
                }}
              />
            ))}
          </View>
        ) : notifications && notifications.length > 0 ? (
          notifications.map((notif) => (
            <NotificationRow
              key={notif.id}
              notif={notif}
              onPress={() => handleNotifPress(notif)}
            />
          ))
        ) : (
          <View style={{ alignItems: 'center', paddingVertical: 48, gap: 12 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                backgroundColor: `${primary}22`,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bell size={28} color={primary} />
            </View>
            <Text style={{ fontSize: 16, fontWeight: '600', color: c.text }}>
              You're all caught up
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: c.textMuted,
                textAlign: 'center',
                maxWidth: 260,
                lineHeight: 19,
              }}
            >
              New notifications will appear here when someone follows you, invites you to
              an event, or messages you.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

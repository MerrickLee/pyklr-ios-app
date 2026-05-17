import React from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, X } from 'lucide-react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/Skeleton';
import { useTheme } from '@/theme/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

export default function BlockedUsersScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors: c } = useTheme();
  const queryClient = useQueryClient();

  const { data: blockedUsers, isLoading } = useQuery({
    queryKey: ['blocked-users', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('blocks')
        .select('blocked_id, profiles!inner(display_name, username, avatar_url)')
        .eq('blocker_id', user.id);
      if (error) throw error;
      return (data ?? []).map((b) => {
        const profile = (b as unknown as {
          profiles: { display_name: string | null; username: string; avatar_url: string | null };
        }).profiles;
        return {
          id: b.blocked_id,
          displayName: profile?.display_name ?? profile?.username ?? 'Unknown',
          avatarUrl: profile?.avatar_url ?? null,
        };
      });
    },
    enabled: !!user,
  });

  async function unblock(blockedId: string) {
    if (!user) return;
    Alert.alert('Unblock?', 'They will be able to message and find you again.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Unblock',
        onPress: async () => {
          await supabase
            .from('blocks')
            .delete()
            .eq('blocker_id', user.id)
            .eq('blocked_id', blockedId);
          queryClient.invalidateQueries({ queryKey: ['blocked-users'] });
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 }}>
        <Pressable onPress={() => router.back()}>
          <ChevronLeft size={22} color={c.text} />
        </Pressable>
        <Text style={{ flex: 1, textAlign: 'center', fontWeight: '700', fontSize: 16, color: c.text }}>
          Blocked users
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        {blockedUsers && blockedUsers.length > 0 ? (
          blockedUsers.map((blocked) => (
            <Card key={blocked.id} style={{ marginTop: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Avatar uri={blocked.avatarUrl} fallbackInitials={blocked.displayName.charAt(0)} size={36} />
                <Text style={{ fontSize: 14, fontWeight: '500', color: c.text, flex: 1 }}>
                  {blocked.displayName}
                </Text>
                <Pressable onPress={() => unblock(blocked.id)} style={{ padding: 6 }}>
                  <X size={16} color="#E24B4A" />
                </Pressable>
              </View>
            </Card>
          ))
        ) : (
          <EmptyState
            title="No blocked users"
            subtitle="People you block won't be able to message you or see your profile."
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

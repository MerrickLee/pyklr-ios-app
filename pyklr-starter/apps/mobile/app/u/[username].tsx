import React from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, MessageCircle, UserPlus, Shield, Check, Trophy, Target, Flame } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { Skeleton, EmptyState } from '@/components/ui/Skeleton';
import { useTheme } from '@/theme/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { colors } from '@/theme/tokens';
import type { Database } from '@pyklr/shared/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function PublicProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { scheme, colors: c } = useTheme();
  const primary = scheme === 'dark' ? colors.brand.lime : colors.brand.green;
  const isDark = scheme === 'dark';

  const { data: profile, isLoading } = useQuery({
    queryKey: ['public-profile', username],
    queryFn: async (): Promise<Profile | null> => {
      if (!username) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!username,
  });

  // Check if current user follows this profile
  const { data: isFollowing } = useQuery({
    queryKey: ['following', user?.id, profile?.id],
    queryFn: async () => {
      if (!user || !profile) return false;
      const { count } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', user.id)
        .eq('followed_id', profile.id);
      return (count ?? 0) > 0;
    },
    enabled: !!user && !!profile,
  });

  // Follower count
  const { data: followerCount } = useQuery({
    queryKey: ['follower-count', profile?.id],
    queryFn: async () => {
      if (!profile) return 0;
      const { count } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('followed_id', profile.id);
      return count ?? 0;
    },
    enabled: !!profile,
  });

  const isOwnProfile = user?.id === profile?.id;

  async function toggleFollow() {
    if (!user || !profile) return;
    if (isFollowing) {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('followed_id', profile.id);
    } else {
      await supabase.from('follows').insert({
        follower_id: user.id,
        followed_id: profile.id,
      });
    }
  }

  const achievements = [
    { icon: Trophy, bg: isDark ? '#3A2D0F' : '#FFF8E1', color: '#F2C97A' },
    { icon: Target, bg: isDark ? `${colors.brand.blue}33` : '#E4F0F8', color: colors.brand.blue },
    { icon: Flame, bg: isDark ? `${colors.brand.lime}22` : '#EAF5E5', color: isDark ? colors.brand.lime : colors.brand.green },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 }}>
        <Pressable onPress={() => router.back()}>
          <ChevronLeft size={22} color={c.text} />
        </Pressable>
        <Text style={{ flex: 1, textAlign: 'center', fontWeight: '700', fontSize: 16, color: c.text }}>
          Profile
        </Text>
        <Pressable onPress={() => Alert.alert('Report', 'Report user functionality coming soon.')}>
          <Shield size={18} color={c.textMuted} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {isLoading ? (
          <View style={{ alignItems: 'center', gap: 12 }}>
            <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: c.surface2 }} />
            <Skeleton width={120} height={16} />
            <Skeleton width={180} height={12} />
          </View>
        ) : profile ? (
          <>
            <View style={{ alignItems: 'center', gap: 6 }}>
              <Avatar uri={profile.avatar_url} size={88} borderColor={primary} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: c.text }}>
                  {profile.display_name ?? profile.username}
                </Text>
                {profile.dupr_verified && <Check size={14} color={primary} />}
              </View>
              <Text style={{ fontSize: 12, color: c.textMuted }}>
                {profile.dupr_verified
                  ? `DUPR ${profile.dupr_rating}`
                  : profile.self_rating
                    ? `${profile.self_rating} self-reported`
                    : 'No rating'}
                {profile.location_city ? ` · ${profile.location_city}` : ''}
              </Text>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                {(profile.play_styles ?? []).map((s) => (
                  <Chip key={s} label={s} active size="sm" />
                ))}
                {(profile.availability ?? []).map((a) => (
                  <Chip key={a} label={a} size="sm" />
                ))}
              </View>
            </View>

            {/* Stats */}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 20 }}>
              {[
                { v: '—', l: 'Matches' },
                { v: '—', l: 'Win rate' },
                { v: `${followerCount ?? 0}`, l: 'Followers' },
              ].map((s) => (
                <Card key={s.l} style={{ flex: 1, alignItems: 'center', padding: 12 }}>
                  <Text style={{ fontSize: 20, fontWeight: '700', color: c.text }}>{s.v}</Text>
                  <Text style={{ fontSize: 11, color: c.textMuted, marginTop: 2 }}>{s.l}</Text>
                </Card>
              ))}
            </View>

            {/* Achievements */}
            <Text style={{ fontSize: 14, fontWeight: '700', color: c.text, marginTop: 20 }}>
              Achievements
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              {achievements.map(({ icon: Icon, bg, color }, i) => (
                <View
                  key={i}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: bg,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={18} color={color} />
                </View>
              ))}
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: c.surface2,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.4,
                }}
              >
                <Text style={{ fontSize: 16 }}>🔒</Text>
              </View>
            </View>

            {/* Action buttons */}
            {!isOwnProfile && (
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 20 }}>
                <View style={{ flex: 1 }}>
                  <Button
                    label={isFollowing ? 'Following' : 'Follow'}
                    variant={isFollowing ? 'ghost' : 'primary'}
                    size="md"
                    onPress={toggleFollow}
                    icon={<UserPlus size={16} color={isFollowing ? c.text : colors.brand.limeDark} />}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    label="Message"
                    variant="ghost"
                    size="md"
                    onPress={() => {
                      // TODO: create or navigate to DM
                      Alert.alert('DM', 'Direct messaging coming soon.');
                    }}
                    icon={<MessageCircle size={16} color={c.text} />}
                  />
                </View>
              </View>
            )}
          </>
        ) : (
          <EmptyState
            title="Player not found"
            subtitle="This profile may have been deleted or the link is invalid."
            ctaLabel="Go back"
            onCta={() => router.back()}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

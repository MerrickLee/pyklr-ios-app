import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Settings, Check, Trophy, Target, Flame, Edit3 } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/theme/useTheme';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { colors } from '@/theme/tokens';
import { signOut } from '@/lib/auth';

export default function ProfileScreen() {
  const router = useRouter();
  const { scheme, colors: c } = useTheme();
  const { data: profile } = useProfile();
  const { user } = useAuth();
  const primary = scheme === 'dark' ? colors.brand.lime : colors.brand.greenDark;
  const isDark = scheme === 'dark';

  // Follower count
  const { data: followerCount } = useQuery({
    queryKey: ['follower-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('followed_id', user.id);
      return count ?? 0;
    },
    enabled: !!user,
  });

  const achievements = [
    { icon: Trophy, bg: isDark ? '#3A2D0F' : '#FFF8E1', color: '#F2C97A' },
    { icon: Target, bg: isDark ? `${colors.brand.blue}33` : '#E4F0F8', color: colors.brand.blue },
    { icon: Flame, bg: isDark ? `${colors.brand.lime}22` : '#EAF5E5', color: isDark ? colors.brand.lime : colors.brand.green },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            gap: 12,
            marginBottom: 8,
          }}
        >
          <Pressable onPress={() => router.push('/settings')}>
            <Settings size={22} color={c.textMuted} />
          </Pressable>
        </View>

        {/* Avatar + info */}
        <View style={{ alignItems: 'center', gap: 6 }}>
          <Avatar uri={profile?.avatar_url} size={88} borderColor={primary} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: c.text }}>
              {profile?.display_name ?? 'Player'}
            </Text>
            {profile?.dupr_verified && <Check size={14} color={primary} />}
          </View>
          <Text style={{ fontSize: 12, color: c.textMuted }}>
            {profile?.dupr_verified
              ? `DUPR ${profile.dupr_rating}`
              : profile?.self_rating
                ? `${profile.self_rating} self-reported`
                : 'No rating yet'}
            {profile?.location_city ? ` · ${profile.location_city}` : ''}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              gap: 6,
              marginTop: 6,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {(profile?.play_styles ?? []).map((s) => (
              <Chip key={s} label={s} active size="sm" />
            ))}
            {(profile?.availability ?? []).map((a) => (
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

        {/* Admin Dashboard */}
        {profile?.is_admin && (
          <Pressable onPress={() => router.push('/admin/dashboard')}>
            <Card
              variant="tint-green"
              style={{ marginTop: 20 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Trophy size={18} color={primary} />
                  <View>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: c.text }}>Admin dashboard</Text>
                    <Text style={{ fontSize: 11, color: c.textMuted, marginTop: 2 }}>
                      Moderate courts, events, and reports
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: 16, color: primary }}>→</Text>
              </View>
            </Card>
          </Pressable>
        )}

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

        {/* Recent activity */}
        <Text style={{ fontSize: 14, fontWeight: '700', color: c.text, marginTop: 20 }}>
          Recent activity
        </Text>
        <Card style={{ marginTop: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Trophy size={14} color="#F2C97A" />
            <Text style={{ fontSize: 14, fontWeight: '500', color: c.text }}>
              Ready to start your journey!
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 4 }}>
            Join an event or find players to get started.
          </Text>
        </Card>

        {/* Edit profile + community */}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 20 }}>
          <View style={{ flex: 1 }}>
            <Button
              label="Edit profile"
              variant="ghost"
              size="md"
              icon={<Edit3 size={14} color={c.text} />}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              label="Community"
              variant="secondary"
              size="md"
              onPress={() => router.push('/community' as never)}
            />
          </View>
        </View>

        {/* Sign out */}
        <Pressable onPress={signOut} style={{ marginTop: 32, alignSelf: 'center' }}>
          <Text style={{ color: c.textMuted, fontSize: 13 }}>Sign out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

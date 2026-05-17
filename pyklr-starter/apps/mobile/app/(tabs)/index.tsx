import React, { useCallback } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Bell, Search, Star } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Skeleton, SkeletonCard, SkeletonFeaturedCard, EmptyState } from '@/components/ui/Skeleton';
import { PyklrMark } from '@/components/brand/PyklrLogo';
import { useTheme } from '@/theme/useTheme';
import { useProfile } from '@/hooks/useProfile';
import { useCourts, type Court } from '@/hooks/useCourts';
import { useFeaturedEvent } from '@/hooks/useEvents';
import { colors } from '@/theme/tokens';
import { format } from 'date-fns';

function CourtRow({ court }: { court: Court }) {
  const { scheme, colors: c } = useTheme();
  const primary = scheme === 'dark' ? colors.brand.lime : colors.brand.green;
  const router = useRouter();

  const feeLabel =
    court.fee_type === 'free'
      ? 'Free'
      : court.fee_type === 'paid' && court.fee_amount
        ? `$${court.fee_amount}/hr`
        : court.fee_type === 'members_only'
          ? 'Members'
          : 'Paid';

  return (
    <Pressable onPress={() => router.push(`/court/${court.id}` as never)}>
      <Card style={{ marginTop: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: c.text }}>
              {court.name}
            </Text>
            <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }}>
              {court.court_count} {court.court_type} · {feeLabel}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: court.fee_type === 'free' ? primary : c.surface2,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 999,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: '600',
                color: court.fee_type === 'free' ? colors.brand.limeDark : c.textMuted,
              }}
            >
              {feeLabel}
            </Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { scheme, colors: c } = useTheme();
  const { data: profile } = useProfile();
  const { data: courts, isLoading: courtsLoading, isRefetching: courtsRefetching } = useCourts(3);
  const { data: featuredEvent, isLoading: eventLoading } = useFeaturedEvent();
  const primary = scheme === 'dark' ? colors.brand.lime : colors.brand.green;

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['courts'] }),
      queryClient.invalidateQueries({ queryKey: ['events'] }),
      queryClient.invalidateQueries({ queryKey: ['profile'] }),
    ]);
    setRefreshing(false);
  }, [queryClient]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primary} />
        }
      >
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 14,
          }}
        >
          <View>
            <Text style={{ fontSize: 12, color: c.textMuted }}>Welcome back,</Text>
            <Text style={{ fontSize: 22, fontWeight: '700', color: c.text }}>
              {profile?.display_name ?? 'there'} 👋
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Pressable onPress={() => router.push('/notifications' as never)}>
              <Bell size={22} color={c.textMuted} />
            </Pressable>
            <Pressable onPress={() => router.push('/(tabs)/profile')}>
              <Avatar uri={profile?.avatar_url} size={36} />
            </Pressable>
          </View>
        </View>

        {/* Search */}
        <Input
          placeholder="Search courts, players, events"
          leftIcon={<Search size={16} color={c.textFaint} />}
        />

        {/* Featured event card */}
        {eventLoading ? (
          <SkeletonFeaturedCard />
        ) : featuredEvent ? (
          <Card variant="accent" style={{ marginTop: 16, overflow: 'hidden' }}>
            <Text
              style={{
                fontSize: 10,
                fontWeight: '700',
                color: 'rgba(255,255,255,0.8)',
                letterSpacing: 1.5,
              }}
            >
              {format(new Date(featuredEvent.starts_at), 'EEEE').toUpperCase()} ·{' '}
              {format(new Date(featuredEvent.starts_at), 'h:mm a')}
            </Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFF', marginTop: 4 }}>
              {featuredEvent.name}
              {featuredEvent.court_name ? ` @ ${featuredEvent.court_name}` : ''}
            </Text>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>
              {featuredEvent.skill_min && featuredEvent.skill_max
                ? `${featuredEvent.skill_min}–${featuredEvent.skill_max}`
                : 'All levels'}
            </Text>
            <Pressable
              onPress={() => router.push(`/event/${featuredEvent.id}` as never)}
              style={{
                backgroundColor: primary,
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 14,
                alignSelf: 'flex-start',
                marginTop: 10,
              }}
            >
              <Text style={{ color: colors.brand.limeDark, fontSize: 13, fontWeight: '600' }}>
                Join game →
              </Text>
            </Pressable>
            <View style={{ position: 'absolute', right: -8, bottom: -8, opacity: 0.18 }}>
              <PyklrMark size={120} paddleColor="white" triangleColor="white" />
            </View>
          </Card>
        ) : (
          <Card variant="accent" style={{ marginTop: 16, overflow: 'hidden' }}>
            <Text
              style={{
                fontSize: 10,
                fontWeight: '700',
                color: 'rgba(255,255,255,0.8)',
                letterSpacing: 1.5,
              }}
            >
              NO EVENTS TODAY
            </Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFF', marginTop: 4 }}>
              Be the first to create one!
            </Text>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>
              Tap the + button to organize a game
            </Text>
            <View style={{ position: 'absolute', right: -8, bottom: -8, opacity: 0.18 }}>
              <PyklrMark size={120} paddleColor="white" triangleColor="white" />
            </View>
          </Card>
        )}

        {/* Quick actions */}
        <Text style={{ fontSize: 14, fontWeight: '700', color: c.text, marginTop: 18 }}>
          Quick actions
        </Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
          <Pressable style={{ flex: 1 }} onPress={() => router.push('/(tabs)/discover')}>
            <Card variant="tint-green">
              <Text style={{ fontSize: 24 }}>👥</Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  marginTop: 6,
                  color: scheme === 'dark' ? colors.brand.lime : colors.brand.greenDark,
                }}
              >
                Find players
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: scheme === 'dark' ? colors.brand.lime : colors.brand.greenDark,
                  opacity: 0.7,
                }}
              >
                Nearby matches
              </Text>
            </Card>
          </Pressable>
          <Pressable style={{ flex: 1 }} onPress={() => router.push('/(tabs)/discover')}>
            <Card variant="tint-blue">
              <Text style={{ fontSize: 24 }}>📍</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', marginTop: 6, color: '#1A4D75' }}>
                Find courts
              </Text>
              <Text style={{ fontSize: 11, color: '#1A4D75', opacity: 0.7 }}>
                {courts ? `${courts.length} verified` : 'Loading…'}
              </Text>
            </Card>
          </Pressable>
        </View>

        {/* Popular near you */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 18,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '700', color: c.text }}>
            Popular near you
          </Text>
          <Pressable onPress={() => router.push('/(tabs)/discover')}>
            <Text style={{ fontSize: 12, fontWeight: '500', color: primary }}>See all →</Text>
          </Pressable>
        </View>

        {courtsLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : courts && courts.length > 0 ? (
          courts.map((court) => <CourtRow key={court.id} court={court} />)
        ) : (
          <EmptyState
            title="No courts near you yet"
            subtitle="Be the first to add a court! Help build the local pickleball community."
            ctaLabel="Add a court"
            onCta={() => router.push('/court/new' as never)}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

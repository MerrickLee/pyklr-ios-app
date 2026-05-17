import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Chip } from '@/components/ui/Chip';
import { Avatar } from '@/components/ui/Avatar';
import { SkeletonCard, EmptyState } from '@/components/ui/Skeleton';
import { useTheme } from '@/theme/useTheme';
import { useNearbyPlayers, type Profile } from '@/hooks/usePlayers';
import { useLocation, distanceMiles } from '@/hooks/useLocation';
import { colors } from '@/theme/tokens';

/**
 * Photo-forward player card matching the Figma mockup.
 * Shows gradient background (placeholder for avatar), DUPR badge, name, distance, tag.
 */
function PlayerCard({
  player,
  distance,
  onPress,
}: {
  player: Profile;
  distance: string | null;
  onPress: () => void;
}) {
  const { scheme, colors: c } = useTheme();
  const primary = scheme === 'dark' ? colors.brand.lime : colors.brand.green;
  const isDark = scheme === 'dark';

  // Pick a gradient based on hash of player id for visual variety
  const hash = player.id.charCodeAt(0) + player.id.charCodeAt(1);
  const gradients: [string, string][] = [
    [colors.brand.green, colors.brand.blue],
    [colors.brand.blue, colors.brand.lime],
    [colors.brand.lime, colors.brand.blue],
    [colors.brand.blue, colors.brand.green],
  ];
  const [grad1, grad2] = gradients[hash % gradients.length];

  const rating = player.dupr_verified
    ? `DUPR ${player.dupr_rating?.toFixed(2) ?? '—'}`
    : player.self_rating
      ? `${player.self_rating.toFixed(1)} self`
      : null;

  const tag = player.dupr_verified
    ? 'Verified'
    : player.availability?.[0]
      ? player.availability[0].charAt(0).toUpperCase() + player.availability[0].slice(1)
      : 'Active';

  return (
    <Pressable onPress={onPress} style={{ width: '48%', marginBottom: 10 }}>
      {/* Photo area */}
      <View
        style={{
          aspectRatio: 1.1,
          borderRadius: 18,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Gradient background / avatar placeholder */}
        {player.avatar_url ? (
          <View style={{ flex: 1, backgroundColor: c.surface2 }}>
            <Avatar uri={player.avatar_url} size={200} />
          </View>
        ) : (
          <View
            style={{
              flex: 1,
              backgroundColor: grad1,
            }}
          >
            {/* Second gradient layer */}
            <View
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: '50%',
                backgroundColor: grad2,
                opacity: 0.7,
              }}
            />
          </View>
        )}

        {/* Rating badge */}
        {rating && (
          <View
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 8,
              backgroundColor: player.dupr_verified
                ? primary
                : 'rgba(255,255,255,0.95)',
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: '700',
                color: colors.brand.limeDark,
              }}
            >
              {rating}
            </Text>
          </View>
        )}

        {/* Bottom gradient overlay for text legibility */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '55%',
            backgroundColor: 'transparent',
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.45)',
            }}
          />
        </View>

        {/* Info text */}
        <Text
          style={{
            position: 'absolute',
            bottom: 24,
            left: 10,
            fontSize: 9,
            color: 'rgba(255,255,255,0.9)',
          }}
        >
          {distance ?? ''}{distance && tag ? ' · ' : ''}{tag}
        </Text>
        <Text
          style={{
            position: 'absolute',
            bottom: 8,
            left: 10,
            fontSize: 13,
            fontWeight: '700',
            color: '#FFFFFF',
          }}
        >
          {player.display_name ?? player.username}
        </Text>
      </View>

      {/* Action button */}
      <Pressable
        onPress={onPress}
        style={{
          marginTop: 6,
          paddingVertical: 8,
          borderRadius: 12,
          alignItems: 'center',
          backgroundColor: player.dupr_verified ? primary : 'transparent',
          borderWidth: player.dupr_verified ? 0 : 1,
          borderColor: isDark ? colors.dark.border : '#E5E5E5',
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: '600',
            color: player.dupr_verified ? colors.brand.limeDark : c.text,
          }}
        >
          {player.dupr_verified ? 'Match' : 'View'}
        </Text>
      </Pressable>
    </Pressable>
  );
}

type PlayerFilter = 'nearby' | 'skill' | 'verified';

export default function FindPlayersScreen() {
  const router = useRouter();
  const { scheme, colors: c } = useTheme();
  const primary = scheme === 'dark' ? colors.brand.lime : colors.brand.green;
  const { data: players, isLoading } = useNearbyPlayers(20);
  const { location } = useLocation();

  const [activeFilter, setActiveFilter] = useState<PlayerFilter>('nearby');

  // Apply filters
  const filteredPlayers = useMemo(() => {
    if (!players) return [];
    switch (activeFilter) {
      case 'verified':
        return players.filter((p) => p.dupr_verified);
      case 'skill':
        return players.filter(
          (p) => (p.dupr_rating ?? p.self_rating ?? 0) >= 3.0 && (p.dupr_rating ?? p.self_rating ?? 0) <= 4.0
        );
      default:
        return players;
    }
  }, [players, activeFilter]);

  function getDistanceLabel(player: Profile): string | null {
    if (!location || !player.location_lat || !player.location_lng) return null;
    const dist = distanceMiles(
      location.latitude,
      location.longitude,
      player.location_lat,
      player.location_lng
    );
    return `${dist.toFixed(1)} mi`;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      {/* Header */}
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
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: c.text }}>Find players</Text>
          <Text style={{ fontSize: 12, color: c.textMuted }}>
            {filteredPlayers.length} nearby · matched to your style
          </Text>
        </View>
      </View>

      {/* Filter chips */}
      <View style={{ flexDirection: 'row', gap: 6, paddingHorizontal: 20, marginTop: 4 }}>
        <Chip label="Nearby" active={activeFilter === 'nearby'} onPress={() => setActiveFilter('nearby')} />
        <Chip label="3.0–4.0" active={activeFilter === 'skill'} onPress={() => setActiveFilter('skill')} />
        <Chip label="Verified" active={activeFilter === 'verified'} onPress={() => setActiveFilter('verified')} />
      </View>

      {/* Player grid */}
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 }}>
        {isLoading ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={{ width: '48%', marginBottom: 10 }}>
                <View
                  style={{
                    aspectRatio: 1.1,
                    borderRadius: 18,
                    backgroundColor: c.surface2,
                  }}
                />
                <View
                  style={{
                    marginTop: 6,
                    height: 32,
                    borderRadius: 12,
                    backgroundColor: c.surface2,
                  }}
                />
              </View>
            ))}
          </View>
        ) : filteredPlayers.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {filteredPlayers.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                distance={getDistanceLabel(player)}
                onPress={() => router.push(`/u/${player.username}` as never)}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            title="No players match your filters"
            subtitle="Try widening your search or check back later — more players are joining every day."
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

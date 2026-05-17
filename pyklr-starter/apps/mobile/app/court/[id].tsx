import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Heart, Navigation, Users } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Skeleton, SkeletonCard, EmptyState } from '@/components/ui/Skeleton';
import { PyklrMark } from '@/components/brand/PyklrLogo';
import { useTheme } from '@/theme/useTheme';
import { colors } from '@/theme/tokens';
import type { Database } from '@pyklr/shared/types/database';

type Court = Database['public']['Tables']['courts']['Row'];

export default function CourtDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { scheme, colors: c } = useTheme();
  const primary = scheme === 'dark' ? colors.brand.lime : colors.brand.green;

  const { data: court, isLoading } = useQuery({
    queryKey: ['court', id],
    queryFn: async (): Promise<Court | null> => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('courts')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const feeLabel =
    !court
      ? ''
      : court.fee_type === 'free'
        ? 'Free'
        : court.fee_type === 'paid' && court.fee_amount
          ? `$${court.fee_amount}/hr`
          : court.fee_type === 'members_only'
            ? 'Members only'
            : 'Paid';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 12,
        }}
      >
        <Pressable onPress={() => router.back()}>
          <ChevronLeft size={22} color={c.text} />
        </Pressable>
        <Pressable>
          <Heart size={20} color={c.textMuted} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        {isLoading ? (
          <View style={{ gap: 12 }}>
            <View
              style={{
                height: 200,
                borderRadius: 24,
                backgroundColor: colors.brand.blue,
                opacity: 0.6,
              }}
            />
            <Skeleton width="70%" height={20} />
            <Skeleton width="50%" height={14} />
            <SkeletonCard height={60} />
          </View>
        ) : court ? (
          <>
            {/* Photo placeholder */}
            <View
              style={{
                height: 200,
                borderRadius: 24,
                overflow: 'hidden',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: colors.brand.blue,
              }}
            >
              <PyklrMark size={80} paddleColor="rgba(255,255,255,0.3)" triangleColor="rgba(255,255,255,0.2)" />
              <View
                style={{
                  position: 'absolute',
                  bottom: 12,
                  left: 12,
                  flexDirection: 'row',
                  gap: 6,
                }}
              >
                <View style={{ width: 28, height: 3, borderRadius: 2, backgroundColor: '#FFF' }} />
                <View style={{ width: 28, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.4)' }} />
                <View style={{ width: 28, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.4)' }} />
              </View>
            </View>

            <Text style={{ fontSize: 20, fontWeight: '700', color: c.text, marginTop: 16 }}>
              {court.name}
            </Text>
            <Text style={{ fontSize: 13, color: c.textMuted, marginTop: 4 }}>
              📍 {court.address ?? 'Location not specified'} · {feeLabel}
            </Text>

            {/* Amenity chips */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
              <View
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 999,
                  backgroundColor: c.surface2,
                }}
              >
                <Text style={{ fontSize: 12, color: c.text, fontWeight: '500' }}>
                  {court.court_count} {court.court_type}
                </Text>
              </View>
              {court.amenities.map((amenity) => (
                <View
                  key={amenity}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 999,
                    backgroundColor: c.surface2,
                  }}
                >
                  <Text style={{ fontSize: 12, color: c.text, fontWeight: '500' }}>
                    {amenity === 'lights' ? '💡' :
                     amenity === 'restroom' ? '🚻' :
                     amenity === 'parking' ? '🅿️' :
                     amenity === 'water' ? '💧' :
                     amenity === 'shade' ? '🌳' :
                     amenity === 'pro_shop' ? '🏪' :
                     amenity === 'food' ? '🍔' : '✓'}{' '}
                    {amenity.charAt(0).toUpperCase() + amenity.slice(1).replace('_', ' ')}
                  </Text>
                </View>
              ))}
            </View>

            {/* CTAs */}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 24 }}>
              <Pressable
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: c.border,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Navigation size={16} color={c.text} />
                <Text style={{ fontSize: 14, fontWeight: '500', color: c.text }}>Directions</Text>
              </Pressable>
              <Pressable
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 18,
                  backgroundColor: primary,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Users size={16} color={colors.brand.limeDark} />
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.brand.limeDark }}>
                  Join game
                </Text>
              </Pressable>
            </View>

            {/* Reviews placeholder */}
            <Text style={{ fontSize: 14, fontWeight: '700', color: c.text, marginTop: 24 }}>
              Reviews
            </Text>
            <Card style={{ marginTop: 8 }}>
              <Text style={{ fontSize: 13, color: c.textMuted }}>
                No reviews yet. Be the first!
              </Text>
            </Card>
          </>
        ) : (
          <EmptyState
            title="Court not found"
            subtitle="This court may have been removed or the link is invalid."
            ctaLabel="Go back"
            onCta={() => router.back()}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

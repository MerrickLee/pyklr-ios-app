import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Filter, List, Map as MapIcon, Navigation } from 'lucide-react-native';
import { Chip } from '@/components/ui/Chip';
import { Card } from '@/components/ui/Card';
import { Skeleton, SkeletonCard, EmptyState } from '@/components/ui/Skeleton';
import { useTheme } from '@/theme/useTheme';
import { useCourts, type Court } from '@/hooks/useCourts';
import { useLocation, distanceMiles } from '@/hooks/useLocation';
import { colors } from '@/theme/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Default region centered on New Rochelle, NY (seed court area)
const DEFAULT_REGION = {
  latitude: 40.9059,
  longitude: -73.7843,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

type FilterKey = 'indoor' | 'lights' | 'free';

function CourtListCard({
  court,
  distance,
  onPress,
}: {
  court: Court;
  distance: string | null;
  onPress: () => void;
}) {
  const { scheme, colors: c } = useTheme();
  const primary = scheme === 'dark' ? colors.brand.lime : colors.brand.green;

  const feeLabel =
    court.fee_type === 'free'
      ? 'Free'
      : court.fee_type === 'paid' && court.fee_amount
        ? `$${court.fee_amount}/hr`
        : court.fee_type === 'members_only'
          ? 'Members'
          : 'Paid';

  return (
    <Pressable onPress={onPress}>
      <Card style={{ marginTop: 8 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: c.text }}>
              {court.name}
            </Text>
            <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }}>
              {court.court_count} {court.court_type} · {feeLabel}
              {distance ? ` · ${distance}` : ''}
            </Text>
            {court.amenities.length > 0 && (
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                {court.amenities.slice(0, 3).map((amenity) => (
                  <View
                    key={amenity}
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 999,
                      backgroundColor: c.surface2,
                    }}
                  >
                    <Text style={{ fontSize: 10, color: c.textMuted }}>
                      {amenity === 'lights'
                        ? '💡'
                        : amenity === 'restroom'
                          ? '🚻'
                          : amenity === 'parking'
                            ? '🅿️'
                            : amenity === 'water'
                              ? '💧'
                              : '✓'}{' '}
                      {amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
          <Pressable
            onPress={() => {
              const url = Platform.select({
                ios: `maps:?daddr=${court.lat},${court.lng}`,
                android: `google.navigation:q=${court.lat},${court.lng}`,
                default: `https://maps.google.com/?daddr=${court.lat},${court.lng}`,
              });
              Linking.openURL(url);
            }}
            style={{
              backgroundColor: primary,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 12,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.brand.limeDark }}>
              Directions
            </Text>
          </Pressable>
        </View>
      </Card>
    </Pressable>
  );
}

export default function DiscoverScreen() {
  const router = useRouter();
  const { scheme, colors: c } = useTheme();
  const primary = scheme === 'dark' ? colors.brand.lime : colors.brand.green;
  const isDark = scheme === 'dark';

  const { data: allCourts, isLoading: courtsLoading } = useCourts(50);
  const { location } = useLocation();
  const mapRef = useRef<MapView>(null);

  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [activeFilters, setActiveFilters] = useState<Set<FilterKey>>(new Set());
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [hasAnimatedToUser, setHasAnimatedToUser] = useState(false);

  useEffect(() => {
    if (location && mapRef.current && !hasAnimatedToUser) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      }, 1000);
      setHasAnimatedToUser(true);
    }
  }, [location, hasAnimatedToUser]);

  const toggleFilter = useCallback((filter: FilterKey) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(filter)) next.delete(filter);
      else next.add(filter);
      return next;
    });
  }, []);

  // Filter courts based on active filter chips
  const filteredCourts = useMemo(() => {
    if (!allCourts) return [];
    return allCourts.filter((court) => {
      if (activeFilters.has('indoor') && court.court_type !== 'indoor') return false;
      if (activeFilters.has('lights') && !court.amenities.includes('lights')) return false;
      if (activeFilters.has('free') && court.fee_type !== 'free') return false;
      return true;
    });
  }, [allCourts, activeFilters]);

  // Compute distance label for a court
  function getDistanceLabel(court: Court): string | null {
    if (!location) return null;
    const dist = distanceMiles(
      location.latitude,
      location.longitude,
      court.lat,
      court.lng
    );
    return `${dist.toFixed(1)} mi`;
  }

  // Initial map region: user location or default
  const initialRegion = location
    ? {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      }
    : DEFAULT_REGION;

  const filters: { key: FilterKey; label: string }[] = [
    { key: 'indoor', label: 'Indoor' },
    { key: 'lights', label: 'Lights' },
    { key: 'free', label: 'Free' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View>
            <Text style={{ fontSize: 18, fontWeight: '700', color: c.text }}>Find courts</Text>
            <Text style={{ fontSize: 12, color: c.textMuted }}>
              {filteredCourts.length} court{filteredCourts.length !== 1 ? 's' : ''} found
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {/* Map/List toggle */}
            <Pressable
              onPress={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                backgroundColor: c.surface2,
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 999,
              }}
            >
              {viewMode === 'map' ? (
                <List size={14} color={c.textMuted} />
              ) : (
                <MapIcon size={14} color={c.textMuted} />
              )}
              <Text style={{ fontSize: 12, fontWeight: '500', color: c.textMuted }}>
                {viewMode === 'map' ? 'List' : 'Map'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Filter chips */}
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
          {filters.map((f) => (
            <Chip
              key={f.key}
              label={f.label}
              active={activeFilters.has(f.key)}
              onPress={() => toggleFilter(f.key)}
            />
          ))}
          <Pressable
            onPress={() => router.push('/discover/players' as never)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 999,
              backgroundColor: isDark ? `${colors.brand.blue}22` : colors.brand.blueLight,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: '500',
                color: colors.brand.blue,
              }}
            >
              👥 Players
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Content */}
      {viewMode === 'map' ? (
        <View style={{ flex: 1, marginTop: 12, marginHorizontal: 16 }}>
          {/* Map */}
          <View
            style={{
              flex: 1,
              borderRadius: 24,
              overflow: 'hidden',
              backgroundColor: isDark ? '#0F1A0F' : '#EBF0E8',
            }}
          >
            <MapView
              ref={mapRef}
              style={{ flex: 1 }}
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
              initialRegion={initialRegion}
              showsUserLocation
              showsMyLocationButton={false}
              userInterfaceStyle={isDark ? 'dark' : 'light'}
              onPress={() => setSelectedCourt(null)}
            >
              {filteredCourts.map((court) => (
                <Marker
                  key={court.id}
                  coordinate={{ latitude: court.lat, longitude: court.lng }}
                  title={court.name}
                  onPress={() => setSelectedCourt(court)}
                >
                  <View
                    style={{
                      backgroundColor:
                        selectedCourt?.id === court.id
                          ? '#FFFFFF'
                          : primary,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 999,
                      borderWidth: selectedCourt?.id === court.id ? 2 : 0,
                      borderColor: primary,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 4,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: '700',
                        color:
                          selectedCourt?.id === court.id
                            ? colors.brand.limeDark
                            : colors.brand.limeDark,
                      }}
                    >
                      {court.fee_type === 'free'
                        ? 'Free'
                        : court.fee_amount
                          ? `$${court.fee_amount}/hr`
                          : court.fee_type}
                      {getDistanceLabel(court) ? ` · ${getDistanceLabel(court)}` : ''}
                    </Text>
                  </View>
                </Marker>
              ))}
            </MapView>
          </View>

          {/* Selected court bottom card */}
          {selectedCourt && (
            <Pressable
              onPress={() => router.push(`/court/${selectedCourt.id}` as never)}
              style={{ marginTop: 10, marginBottom: 80 }}
            >
              <Card>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: c.text }}>
                      {selectedCourt.name}
                    </Text>
                    <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }}>
                      {selectedCourt.court_count} {selectedCourt.court_type} ·{' '}
                      {selectedCourt.fee_type === 'free' ? 'Free' : selectedCourt.fee_type}
                      {getDistanceLabel(selectedCourt)
                        ? ` · ${getDistanceLabel(selectedCourt)}`
                        : ''}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
                      {selectedCourt.amenities.slice(0, 3).map((a) => (
                        <View
                          key={a}
                          style={{
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 999,
                            backgroundColor: c.surface2,
                          }}
                        >
                          <Text style={{ fontSize: 10, color: c.textMuted }}>
                            {a === 'lights'
                              ? '💡'
                              : a === 'restroom'
                                ? '🚻'
                                : a === 'parking'
                                  ? '🅿️'
                                  : '✓'}{' '}
                            {a.charAt(0).toUpperCase() + a.slice(1)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <Pressable
                    onPress={() => {
                      const url = Platform.select({
                        ios: `maps:?daddr=${selectedCourt.lat},${selectedCourt.lng}`,
                        android: `google.navigation:q=${selectedCourt.lat},${selectedCourt.lng}`,
                        default: `https://maps.google.com/?daddr=${selectedCourt.lat},${selectedCourt.lng}`,
                      });
                      Linking.openURL(url);
                    }}
                    style={{
                      backgroundColor: primary,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 12,
                    }}
                  >
                    <Text
                      style={{ fontSize: 12, fontWeight: '600', color: colors.brand.limeDark }}
                    >
                      Directions
                    </Text>
                  </Pressable>
                </View>
              </Card>
            </Pressable>
          )}
        </View>
      ) : (
        /* List view */
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100, paddingTop: 8 }}
        >
          {courtsLoading ? (
            <>
              <SkeletonCard height={80} />
              <SkeletonCard height={80} />
              <SkeletonCard height={80} />
            </>
          ) : filteredCourts.length > 0 ? (
            filteredCourts.map((court) => (
              <CourtListCard
                key={court.id}
                court={court}
                distance={getDistanceLabel(court)}
                onPress={() => router.push(`/court/${court.id}` as never)}
              />
            ))
          ) : (
            <EmptyState
              title="No courts match your filters"
              subtitle="Try adjusting your filters or add a new court to help the community."
              ctaLabel="Add a court"
              onCta={() => router.push('/court/new' as never)}
            />
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

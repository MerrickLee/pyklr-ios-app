import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ChevronLeft,
  Calendar,
  MapPin,
  Users,
  MessageCircle,
  Share2,
  Heart,
} from 'lucide-react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, isPast } from 'date-fns';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { Skeleton, EmptyState } from '@/components/ui/Skeleton';
import { PyklrMark } from '@/components/brand/PyklrLogo';
import { useTheme } from '@/theme/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { colors } from '@/theme/tokens';
import { track } from '@/lib/analytics';
import type { Database } from '@pyklr/shared/types/database';

type Event = Database['public']['Tables']['events']['Row'];
type RsvpStatus = 'going' | 'maybe' | 'not_going';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { scheme, colors: c } = useTheme();
  const primary = scheme === 'dark' ? colors.brand.lime : colors.brand.green;

  const [rsvpLoading, setRsvpLoading] = useState(false);

  // Event data with court name
  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: async (): Promise<(Event & { court_name?: string }) | null> => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('events')
        .select('*, courts!inner(name)')
        .eq('id', id)
        .single();
      if (error) throw error;
      const courtName = (data as Record<string, unknown>).courts
        ? ((data as Record<string, unknown>).courts as { name: string }).name
        : undefined;
      return { ...data, court_name: courtName };
    },
    enabled: !!id,
  });

  // RSVP list
  const { data: rsvps } = useQuery({
    queryKey: ['event-rsvps', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('event_rsvps')
        .select('*, profiles!inner(display_name, username, avatar_url)')
        .eq('event_id', id)
        .in('status', ['going', 'maybe']);
      if (error) return [];
      return (data ?? []).map((rsvp) => {
        const profile = (rsvp as unknown as {
          profiles: { display_name: string | null; username: string; avatar_url: string | null };
        }).profiles;
        return {
          ...rsvp,
          display_name: profile?.display_name ?? profile?.username ?? 'Player',
          avatar_url: profile?.avatar_url ?? null,
        };
      });
    },
    enabled: !!id,
  });

  // Current user's RSVP
  const { data: myRsvp } = useQuery({
    queryKey: ['my-rsvp', id, user?.id],
    queryFn: async (): Promise<RsvpStatus | null> => {
      if (!id || !user) return null;
      const { data } = await supabase
        .from('event_rsvps')
        .select('status')
        .eq('event_id', id)
        .eq('user_id', user.id)
        .maybeSingle();
      return (data?.status as RsvpStatus) ?? null;
    },
    enabled: !!id && !!user,
  });

  const goingCount = rsvps?.filter((r) => r.status === 'going').length ?? 0;
  const maybeCount = rsvps?.filter((r) => r.status === 'maybe').length ?? 0;

  async function handleRsvp(status: RsvpStatus) {
    if (!user || !id) return;
    setRsvpLoading(true);

    if (myRsvp) {
      // Update existing RSVP
      if (myRsvp === status) {
        // Un-RSVP
        await supabase
          .from('event_rsvps')
          .delete()
          .eq('event_id', id)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('event_rsvps')
          .update({ status })
          .eq('event_id', id)
          .eq('user_id', user.id);
      }
    } else {
      await supabase.from('event_rsvps').insert({
        event_id: id,
        user_id: user.id,
        status,
      });
    }

    // If going and there's a group chat, join the chat
    if (status === 'going' && event?.group_chat_id) {
      const { data: existing } = await supabase
        .from('chat_members')
        .select('id')
        .eq('chat_id', event.group_chat_id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!existing) {
        await supabase.from('chat_members').insert({
          chat_id: event.group_chat_id,
          user_id: user.id,
          role: 'member',
        });
      }
    }

    track('event.rsvp', { status, event_id: id });
    queryClient.invalidateQueries({ queryKey: ['my-rsvp', id] });
    queryClient.invalidateQueries({ queryKey: ['event-rsvps', id] });
    setRsvpLoading(false);
  }

  const eventPast = event?.starts_at ? isPast(new Date(event.starts_at)) : false;

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
          Event
        </Text>
        <Pressable
          onPress={() => {
            // TODO: native share sheet
            Alert.alert('Share', 'Deep link sharing coming soon.');
          }}
        >
          <Share2 size={18} color={c.textMuted} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {isLoading ? (
          <View style={{ gap: 12 }}>
            <View
              style={{
                height: 140,
                borderRadius: 18,
                backgroundColor: colors.brand.blue,
                opacity: 0.5,
              }}
            />
            <Skeleton width="60%" height={18} />
            <Skeleton width="40%" height={12} />
          </View>
        ) : event ? (
          <>
            {/* Header cover */}
            <View
              style={{
                height: 140,
                borderRadius: 18,
                backgroundColor: colors.brand.blue,
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
              }}
            >
              <PyklrMark
                size={60}
                paddleColor="rgba(255,255,255,0.3)"
                triangleColor="rgba(255,255,255,0.2)"
              />
              {eventPast && (
                <View
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ fontSize: 10, fontWeight: '700', color: '#FFF' }}>PAST</Text>
                </View>
              )}
            </View>

            {/* Title + status */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16 }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: c.text, flex: 1 }}>
                {event.name}
              </Text>
              {event.status && (
                <Chip
                  label={event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  active={event.status === 'open'}
                  size="sm"
                />
              )}
            </View>

            {/* Details */}
            <View style={{ gap: 10, marginTop: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Calendar size={16} color={c.textMuted} />
                <Text style={{ fontSize: 14, color: c.text }}>
                  {format(new Date(event.starts_at), 'EEEE, MMM d · h:mm a')}
                </Text>
              </View>
              {event.court_name && (
                <Pressable
                  onPress={() => router.push(`/court/${event.court_id}` as never)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
                >
                  <MapPin size={16} color={primary} />
                  <Text style={{ fontSize: 14, color: primary, fontWeight: '500' }}>
                    {event.court_name}
                  </Text>
                </Pressable>
              )}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Users size={16} color={c.textMuted} />
                <Text style={{ fontSize: 14, color: c.text }}>
                  {event.skill_min && event.skill_max
                    ? `${event.skill_min}–${event.skill_max} · `
                    : ''}
                  {event.format} · Max {event.max_players}
                </Text>
              </View>
            </View>

            {event.description && (
              <Text
                style={{
                  fontSize: 14,
                  color: c.textMuted,
                  marginTop: 14,
                  lineHeight: 20,
                }}
              >
                {event.description}
              </Text>
            )}

            {/* RSVP summary */}
            <Card style={{ marginTop: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: c.text, marginBottom: 8 }}>
                {goingCount} going{maybeCount > 0 ? ` · ${maybeCount} maybe` : ''}
              </Text>
              {rsvps && rsvps.length > 0 && (
                <View style={{ flexDirection: 'row', gap: -6 }}>
                  {rsvps.slice(0, 6).map((rsvp, i) => (
                    <View
                      key={rsvp.id}
                      style={{
                        marginLeft: i === 0 ? 0 : -8,
                        borderWidth: 2,
                        borderColor: c.surface,
                        borderRadius: 16,
                      }}
                    >
                      <Avatar
                        uri={rsvp.avatar_url}
                        fallbackInitials={rsvp.display_name?.charAt(0)}
                        size={28}
                      />
                    </View>
                  ))}
                  {rsvps.length > 6 && (
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: c.surface2,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: -8,
                        borderWidth: 2,
                        borderColor: c.surface,
                      }}
                    >
                      <Text style={{ fontSize: 10, fontWeight: '600', color: c.textMuted }}>
                        +{rsvps.length - 6}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </Card>

            {/* RSVP buttons */}
            {!eventPast && (
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
                <Pressable
                  disabled={rsvpLoading}
                  onPress={() => handleRsvp('going')}
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    borderRadius: 18,
                    backgroundColor: myRsvp === 'going' ? primary : 'transparent',
                    borderWidth: myRsvp === 'going' ? 0 : 1,
                    borderColor: c.border,
                    alignItems: 'center',
                    opacity: rsvpLoading ? 0.6 : 1,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: myRsvp === 'going' ? colors.brand.limeDark : c.text,
                    }}
                  >
                    {myRsvp === 'going' ? 'Going ✓' : 'Going'}
                  </Text>
                </Pressable>
                <Pressable
                  disabled={rsvpLoading}
                  onPress={() => handleRsvp('maybe')}
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    borderRadius: 18,
                    backgroundColor: myRsvp === 'maybe' ? c.surface2 : 'transparent',
                    borderWidth: 1,
                    borderColor: myRsvp === 'maybe' ? primary : c.border,
                    alignItems: 'center',
                    opacity: rsvpLoading ? 0.6 : 1,
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '500', color: c.text }}>
                    {myRsvp === 'maybe' ? 'Maybe ✓' : 'Maybe'}
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Open chat */}
            {event.group_chat_id && (
              <Button
                label="Open chat"
                variant="ghost"
                onPress={() => router.push(`/chat/${event.group_chat_id}` as never)}
                icon={<MessageCircle size={16} color={c.text} />}
                style={{ marginTop: 10 }}
              />
            )}
          </>
        ) : (
          <EmptyState
            title="Event not found"
            subtitle="This event may have been cancelled or the link is invalid."
            ctaLabel="Go back"
            onCta={() => router.back()}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

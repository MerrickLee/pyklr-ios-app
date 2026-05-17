import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@pyklr/shared/types/database';

export type Event = Database['public']['Tables']['events']['Row'];

/**
 * Fetch today's featured event — the first open event starting today.
 * Falls back to the next upcoming open event if nothing is today.
 */
export function useFeaturedEvent() {
  return useQuery({
    queryKey: ['events', 'featured'],
    queryFn: async (): Promise<(Event & { court_name?: string }) | null> => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('events')
        .select('*, courts!inner(name)')
        .eq('status', 'open')
        .gte('starts_at', todayStart.toISOString())
        .order('starts_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) {
        // If the join fails (no events yet), return null gracefully
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      if (!data) return null;

      // Extract court name from joined data
      const courtName = (data as Record<string, unknown>).courts
        ? ((data as Record<string, unknown>).courts as { name: string }).name
        : undefined;

      return { ...data, court_name: courtName };
    },
  });
}

/**
 * Fetch RSVP count for an event.
 */
export function useEventRsvpCount(eventId: string | undefined) {
  return useQuery({
    queryKey: ['event-rsvps', eventId],
    queryFn: async (): Promise<number> => {
      if (!eventId) return 0;
      const { count, error } = await supabase
        .from('event_rsvps')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('status', 'going');
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!eventId,
  });
}

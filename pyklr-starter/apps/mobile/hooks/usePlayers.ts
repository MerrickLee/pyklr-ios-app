import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@pyklr/shared/types/database';

export type Profile = Database['public']['Tables']['profiles']['Row'];

/**
 * Fetch nearby players for the "Find players" screen.
 * For now fetches all public profiles with `available_to_match = true`.
 * Phase 7 will add geo-filtering and skill matching.
 */
export function useNearbyPlayers(limit = 10) {
  return useQuery({
    queryKey: ['players', 'nearby', limit],
    queryFn: async (): Promise<Profile[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('available_to_match', true)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },
  });
}

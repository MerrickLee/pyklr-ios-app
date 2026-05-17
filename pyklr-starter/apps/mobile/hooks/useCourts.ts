import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@pyklr/shared/types/database';

export type Court = Database['public']['Tables']['courts']['Row'];

/**
 * Fetch verified courts, optionally sorted by proximity.
 * For now we fetch all verified courts and limit to `count`.
 * Phase 4 will add geo-filtering.
 */
export function useCourts(count = 3) {
  return useQuery({
    queryKey: ['courts', 'popular', count],
    queryFn: async (): Promise<Court[]> => {
      const { data, error } = await supabase
        .from('courts')
        .select('*')
        .eq('status', 'verified')
        .order('created_at', { ascending: false })
        .limit(count);
      if (error) throw error;
      return data ?? [];
    },
  });
}

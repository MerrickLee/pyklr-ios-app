import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import type { Database } from '@pyklr/shared/types/database';

export type Message = Database['public']['Tables']['messages']['Row'];

interface UseChatResult {
  messages: Message[];
  mutedUserIds: Set<string>;
  loading: boolean;
  send: (body: string) => Promise<{ error: Error | null }>;
  toggleUserMute: (targetUserId: string) => Promise<void>;
}

/**
 * Realtime chat hook.
 * - Fetches messages and mute list on mount
 * - Subscribes to INSERTs on `messages` for this chat via Supabase Realtime
 * - Exposes a `send` function and a `toggleUserMute` function
 *
 * The per-user mute is the PYKLR wedge. Muting a user does NOT remove them
 * from the chat; their messages just collapse to a pill in the UI.
 */
export function useChat(chatId: string): UseChatResult {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [mutedUserIds, setMutedUserIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Initial fetch + subscription
  useEffect(() => {
    if (!user || !chatId) return;

    let cancelled = false;

    async function load() {
      const [msgs, mutes] = await Promise.all([
        supabase
          .from('messages')
          .select('*')
          .eq('chat_id', chatId)
          .order('created_at', { ascending: true })
          .limit(200),
        supabase.from('chat_user_mutes').select('muted_id').eq('chat_id', chatId).eq('muter_id', user!.id),
      ]);

      if (cancelled) return;

      if (msgs.data) setMessages(msgs.data);
      if (mutes.data) setMutedUserIds(new Set(mutes.data.map((m) => m.muted_id)));
      setLoading(false);
    }

    load();

    const channel = supabase
      .channel(`chat:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [chatId, user]);

  async function send(body: string): Promise<{ error: Error | null }> {
    if (!user) return { error: new Error('Not signed in') };
    const { error } = await supabase.from('messages').insert({
      chat_id: chatId,
      sender_id: user.id,
      body,
    });
    return { error };
  }

  async function toggleUserMute(targetUserId: string): Promise<void> {
    if (!user) return;
    if (mutedUserIds.has(targetUserId)) {
      await supabase
        .from('chat_user_mutes')
        .delete()
        .eq('chat_id', chatId)
        .eq('muter_id', user.id)
        .eq('muted_id', targetUserId);
      setMutedUserIds((prev) => {
        const next = new Set(prev);
        next.delete(targetUserId);
        return next;
      });
    } else {
      await supabase.from('chat_user_mutes').insert({
        chat_id: chatId,
        muter_id: user.id,
        muted_id: targetUserId,
      });
      setMutedUserIds((prev) => new Set(prev).add(targetUserId));
    }
  }

  return { messages, mutedUserIds, loading, send, toggleUserMute };
}

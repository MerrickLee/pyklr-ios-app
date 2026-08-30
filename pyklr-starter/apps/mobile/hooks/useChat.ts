import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import type { Database } from '@pyklr/shared/types/database';

export type Message = Database['public']['Tables']['messages']['Row'];
export type MessageReaction = Database['public']['Tables']['message_reactions']['Row'];

export interface ReactionSummary {
  count: number;
  reacted: boolean;
}

interface UseChatResult {
  messages: Message[];
  mutedUserIds: Set<string>;
  loading: boolean;
  send: (body: string) => Promise<{ error: Error | null }>;
  toggleUserMute: (targetUserId: string) => Promise<void>;
  toggleReaction: (messageId: string, emoji: string) => Promise<void>;
  getReactionsForMessage: (messageId: string) => Map<string, ReactionSummary>;
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
  const [reactions, setReactions] = useState<MessageReaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial fetch + subscription
  useEffect(() => {
    if (!user || !chatId) return;

    let cancelled = false;

    async function load() {
      const [msgs, mutes, rxns] = await Promise.all([
        supabase
          .from('messages')
          .select('*')
          .eq('chat_id', chatId)
          .order('created_at', { ascending: true })
          .limit(200),
        supabase.from('chat_user_mutes').select('muted_id').eq('chat_id', chatId).eq('muter_id', user!.id),
        supabase.from('message_reactions').select('*').in(
          'message_id',
          // We'll re-fetch after messages load; for now use a placeholder
          []
        ),
      ]);

      if (cancelled) return;

      const messageIds = (msgs.data ?? []).map((m) => m.id);
      if (messageIds.length > 0) {
        const { data: reactionData } = await supabase
          .from('message_reactions')
          .select('*')
          .in('message_id', messageIds);
        if (reactionData) setReactions(reactionData);
      }

      if (msgs.data) setMessages(msgs.data);
      if (mutes.data) setMutedUserIds(new Set(mutes.data.map((m) => m.muted_id)));
      setLoading(false);
    }

    load();

    const channel = supabase
      .channel(`chat:${chatId}-${Date.now()}`)
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
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setReactions((prev) => [...prev, payload.new as MessageReaction]);
          } else if (payload.eventType === 'DELETE') {
            const old = payload.old as MessageReaction;
            setReactions((prev) =>
              prev.filter(
                (r) =>
                  !(r.message_id === old.message_id && r.user_id === old.user_id && r.emoji === old.emoji)
              )
            );
          }
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

  async function toggleReaction(messageId: string, emoji: string): Promise<void> {
    if (!user) return;

    const existing = reactions.find(
      (r) => r.message_id === messageId && r.user_id === user.id && r.emoji === emoji
    );

    if (existing) {
      // Remove reaction
      await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('emoji', emoji);
      setReactions((prev) =>
        prev.filter(
          (r) => !(r.message_id === messageId && r.user_id === user.id && r.emoji === emoji)
        )
      );
    } else {
      // Add reaction
      const { data } = await supabase
        .from('message_reactions')
        .insert({ message_id: messageId, user_id: user.id, emoji })
        .select()
        .single();
      if (data) {
        setReactions((prev) => [...prev, data]);
      }
    }
  }

  function getReactionsForMessage(messageId: string): Map<string, ReactionSummary> {
    const map = new Map<string, ReactionSummary>();
    for (const r of reactions) {
      if (r.message_id !== messageId) continue;
      const existing = map.get(r.emoji);
      if (existing) {
        existing.count++;
        if (r.user_id === user?.id) existing.reacted = true;
      } else {
        map.set(r.emoji, { count: 1, reacted: r.user_id === user?.id });
      }
    }
    return map;
  }

  return { messages, mutedUserIds, loading, send, toggleUserMute, toggleReaction, getReactionsForMessage };
}

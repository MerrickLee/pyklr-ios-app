import { useEffect, useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import type { Database } from '@pyklr/shared/types/database';

type Chat = Database['public']['Tables']['chats']['Row'];
type ChatMember = Database['public']['Tables']['chat_members']['Row'];

export type ChatTab = 'groups' | 'dms' | 'requests';

export interface ChatListItem extends Chat {
  /** Number of unread messages (approximation based on last_read_at) */
  unread_count: number;
  /** Preview of the last message body */
  last_message_preview: string | null;
  /** Display name of the last message sender */
  last_message_sender: string | null;
  /** Current user's membership info */
  member_role: ChatMember['role'];
}

/**
 * Fetches the user's chat list for the Messages tab.
 * - Joins chat_members to filter only chats the user belongs to
 * - Fetches the last message for each chat as a preview
 * - Subscribes to realtime updates on `chats.last_message_at` for ordering
 */
export function useChats() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['chats', user?.id],
    queryFn: async (): Promise<ChatListItem[]> => {
      if (!user) return [];

      // Get all chats the user is a member of
      const { data: memberships, error: memberError } = await supabase
        .from('chat_members')
        .select('chat_id, role, last_read_at')
        .eq('user_id', user.id);

      if (memberError) throw memberError;
      if (!memberships || memberships.length === 0) return [];

      const chatIds = memberships.map((m) => m.chat_id);

      // Fetch chat details
      const { data: chats, error: chatError } = await supabase
        .from('chats')
        .select('*')
        .in('id', chatIds)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (chatError) throw chatError;
      if (!chats) return [];

      // For each chat, get the last message as a preview
      const chatItems: ChatListItem[] = await Promise.all(
        chats.map(async (chat) => {
          const membership = memberships.find((m) => m.chat_id === chat.id)!;

          // Count unread messages (messages after last_read_at)
          let unread_count = 0;
          if (membership.last_read_at) {
            const { count } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('chat_id', chat.id)
              .gt('created_at', membership.last_read_at)
              .neq('sender_id', user.id);
            unread_count = count ?? 0;
          }

          // Get last message preview
          const { data: lastMsg } = await supabase
            .from('messages')
            .select('body, sender_id')
            .eq('chat_id', chat.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          // Get sender name for preview
          let senderName: string | null = null;
          if (lastMsg?.sender_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('display_name, username')
              .eq('id', lastMsg.sender_id)
              .single();
            senderName = profile?.display_name ?? profile?.username ?? null;
          }

          return {
            ...chat,
            unread_count,
            last_message_preview: lastMsg?.body ?? null,
            last_message_sender: lastMsg?.sender_id === user.id ? 'You' : senderName,
            member_role: membership.role,
          };
        })
      );

      return chatItems;
    },
    enabled: !!user,
    staleTime: 15_000,
  });

  // Subscribe to realtime updates on chats table for ordering changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`chats-list-updates-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chats',
        },
        () => {
          // Refetch when any chat is updated (new message changes last_message_at)
          queryClient.invalidateQueries({ queryKey: ['chats'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  return query;
}

/**
 * Fetch the member count + member names for a specific chat.
 */
export function useChatMembers(chatId: string) {
  return useQuery({
    queryKey: ['chat-members', chatId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_members')
        .select('user_id, role, profiles!inner(display_name, username, avatar_url)')
        .eq('chat_id', chatId);

      if (error) throw error;

      return (data ?? []).map((m) => {
        const profile = (m as unknown as { profiles: { display_name: string | null; username: string; avatar_url: string | null } }).profiles;
        return {
          userId: m.user_id,
          role: m.role,
          displayName: profile?.display_name ?? profile?.username ?? 'Unknown',
          avatarUrl: profile?.avatar_url ?? null,
        };
      });
    },
    enabled: !!chatId,
  });
}

/**
 * Fetch the chat name and metadata.
 */
export function useChatInfo(chatId: string) {
  return useQuery({
    queryKey: ['chat-info', chatId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('id', chatId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!chatId,
  });
}

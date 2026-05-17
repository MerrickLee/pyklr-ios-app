import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Edit3, Search } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import { SkeletonCard, EmptyState } from '@/components/ui/Skeleton';
import { useTheme } from '@/theme/useTheme';
import { useChats, type ChatListItem, type ChatTab } from '@/hooks/useChats';
import { colors } from '@/theme/tokens';

function ChatRow({
  chat,
  isHighlighted,
  onPress,
}: {
  chat: ChatListItem;
  isHighlighted: boolean;
  onPress: () => void;
}) {
  const { scheme, colors: c } = useTheme();
  const primary = scheme === 'dark' ? colors.brand.lime : colors.brand.green;

  // Generate initials from chat name
  const initials = (chat.name ?? 'Chat')
    .split(' ')
    .map((w) => w.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Pick avatar background based on chat type
  const avatarBg =
    chat.type === 'event'
      ? colors.brand.blue
      : chat.type === 'dm'
        ? primary
        : scheme === 'dark'
          ? '#555'
          : '#9A9A9A';

  const preview = chat.last_message_sender
    ? `${chat.last_message_sender}: ${chat.last_message_preview ?? ''}`
    : chat.last_message_preview ?? 'No messages yet';

  const timeLabel = chat.last_message_at
    ? formatDistanceToNow(new Date(chat.last_message_at), { addSuffix: false })
    : '';

  return (
    <Pressable onPress={onPress}>
      <Card
        variant={isHighlighted ? 'tint-blue' : 'surface'}
        style={{ marginTop: 8 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {/* Avatar */}
          {chat.type === 'dm' && chat.avatar_url ? (
            <Avatar uri={chat.avatar_url} size={42} />
          ) : (
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: chat.type === 'dm' ? 21 : 14,
                backgroundColor: avatarBg,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  color: '#FFF',
                  fontWeight: '700',
                  fontSize: 12,
                }}
              >
                {initials}
              </Text>
            </View>
          )}

          {/* Content */}
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: c.text,
                  flex: 1,
                }}
                numberOfLines={1}
              >
                {chat.name ?? 'Chat'}
              </Text>
              {chat.unread_count > 0 ? (
                <View
                  style={{
                    backgroundColor: colors.brand.blue,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 999,
                    minWidth: 22,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 10, fontWeight: '700', color: '#FFF' }}>
                    {chat.unread_count > 99 ? '99+' : chat.unread_count}
                  </Text>
                </View>
              ) : timeLabel ? (
                <Text style={{ fontSize: 10, color: c.textFaint }}>{timeLabel}</Text>
              ) : null}
            </View>
            <Text
              style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }}
              numberOfLines={1}
            >
              {preview}
            </Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

export default function MessagesScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { scheme, colors: c } = useTheme();
  const primary = scheme === 'dark' ? colors.brand.lime : colors.brand.green;

  const { data: chats, isLoading, isRefetching } = useChats();
  const [activeTab, setActiveTab] = useState<ChatTab>('groups');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['chats'] });
    setRefreshing(false);
  }, [queryClient]);

  // Filter chats by tab and search
  const filteredChats = useMemo(() => {
    if (!chats) return [];

    let filtered = chats;

    // Tab filter
    switch (activeTab) {
      case 'groups':
        filtered = filtered.filter((c) => c.type === 'group' || c.type === 'event');
        break;
      case 'dms':
        filtered = filtered.filter((c) => c.type === 'dm');
        break;
      case 'requests':
        // Requests = DMs where current user hasn't sent a message yet
        // For now, show DMs with no messages as "requests"
        filtered = filtered.filter((c) => c.type === 'dm' && !c.last_message_preview);
        break;
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.last_message_preview?.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [chats, activeTab, searchQuery]);

  // Featured chat = first event chat with unread messages
  const featuredChat = useMemo(() => {
    if (!chats) return null;
    return chats.find((c) => c.type === 'event' && c.unread_count > 0) ?? null;
  }, [chats]);

  const totalUnread = useMemo(() => {
    if (!chats) return 0;
    return chats.reduce((acc, c) => acc + c.unread_count, 0);
  }, [chats]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primary} />
        }
      >
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: '700', color: c.text }}>Messages</Text>
          <Pressable>
            <Edit3 size={20} color={c.textMuted} />
          </Pressable>
        </View>

        {/* Search */}
        <View style={{ marginTop: 10 }}>
          <Input
            placeholder="Search messages"
            leftIcon={<Search size={16} color={c.textFaint} />}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Tab filters */}
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 12 }}>
          <Chip
            label="My groups"
            active={activeTab === 'groups'}
            onPress={() => setActiveTab('groups')}
          />
          <Chip
            label="DMs"
            active={activeTab === 'dms'}
            onPress={() => setActiveTab('dms')}
          />
          <Chip
            label="Requests"
            active={activeTab === 'requests'}
            onPress={() => setActiveTab('requests')}
          />
        </View>

        {/* Chat list */}
        {isLoading ? (
          <View style={{ gap: 8, marginTop: 8 }}>
            <SkeletonCard height={64} />
            <SkeletonCard height={64} />
            <SkeletonCard height={64} />
          </View>
        ) : filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <ChatRow
              key={chat.id}
              chat={chat}
              isHighlighted={featuredChat?.id === chat.id}
              onPress={() => router.push(`/chat/${chat.id}` as never)}
            />
          ))
        ) : (
          <EmptyState
            title={
              activeTab === 'requests'
                ? 'No message requests'
                : activeTab === 'dms'
                  ? 'No direct messages yet'
                  : 'No group chats yet'
            }
            subtitle={
              activeTab === 'groups'
                ? 'Join an event or find players to start chatting with the community.'
                : 'Direct messages from other players will appear here.'
            }
            ctaLabel={activeTab === 'groups' ? 'Find players' : undefined}
            onCta={
              activeTab === 'groups'
                ? () => router.push('/discover/players' as never)
                : undefined
            }
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

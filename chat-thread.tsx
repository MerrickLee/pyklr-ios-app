import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import {
  ChevronLeft,
  MoreVertical,
  Send,
  VolumeX,
} from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { MutedMessagePill } from '@/components/chat/MutedMessagePill';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { SmartSuggestionCard } from '@/components/chat/SmartSuggestionCard';
import { useTheme } from '@/theme/useTheme';
import { colors } from '@/theme/tokens';

export default function ChatThreadScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { messages, mutedUserIds, loading, send } = useChat(id ?? '');
  const { scheme, colors: c } = useTheme();
  const primary = scheme === 'dark' ? colors.brand.lime : colors.brand.green;
  const listRef = useRef<FlashList<unknown>>(null);

  const [draft, setDraft] = useState('');

  async function handleSend() {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    const { error } = await send(text);
    if (error) {
      setDraft(text); // Restore on error
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={['top']}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingHorizontal: 20,
          paddingVertical: 10,
          borderBottomWidth: 0.5,
          borderBottomColor: c.border,
        }}
      >
        <Pressable onPress={() => router.back()}>
          <ChevronLeft size={22} color={c.text} />
        </Pressable>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            backgroundColor: colors.brand.blue,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 12 }}>NR</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: c.text }}>
            New Roc Open Play
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={{ fontSize: 11, color: c.textMuted }}>14 members</Text>
            {mutedUserIds.size > 0 && (
              <>
                <Text style={{ fontSize: 11, color: c.textMuted }}>·</Text>
                <VolumeX size={10} color={c.textMuted} />
                <Text style={{ fontSize: 11, color: c.textMuted }}>
                  {mutedUserIds.size} muted
                </Text>
              </>
            )}
          </View>
        </View>
        <Pressable>
          <MoreVertical size={20} color={c.textMuted} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Messages */}
        <FlashList
          ref={listRef}
          data={messages}
          contentContainerStyle={{ padding: 16 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          estimatedItemSize={80}
          renderItem={({ item }) => {
            const isOwn = item.sender_id === user?.id;
            const isSuggestion = item.is_suggestion;

            if (isSuggestion) {
              const payload = (item.suggestion_payload ?? {}) as {
                title?: string;
                subtitle?: string;
              };
              return (
                <SmartSuggestionCard
                  title={payload.title ?? item.body ?? 'Create an event'}
                  subtitle={payload.subtitle ?? 'Tap to schedule'}
                  payload={item.suggestion_payload as Record<string, unknown>}
                />
              );
            }

            if (item.sender_id && mutedUserIds.has(item.sender_id) && !isOwn) {
              return (
                <MutedMessagePill senderName="Muted user" body={item.body ?? ''} />
              );
            }

            return (
              <MessageBubble
                senderName="User"
                body={item.body ?? ''}
                timestamp={
                  item.created_at
                    ? formatDistanceToNow(new Date(item.created_at), { addSuffix: true })
                    : ''
                }
                isOwn={isOwn}
              />
            );
          }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 80 }}>
              <Text style={{ color: c.textMuted, fontSize: 13 }}>
                {loading ? 'Loading messages…' : 'No messages yet. Say hi!'}
              </Text>
            </View>
          }
        />

        {/* Input */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderTopWidth: 0.5,
            borderTopColor: c.border,
            backgroundColor: c.bg,
          }}
        >
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Message…"
            placeholderTextColor={c.textFaint}
            multiline
            style={{
              flex: 1,
              backgroundColor: c.surface2,
              borderRadius: 18,
              paddingHorizontal: 14,
              paddingVertical: 10,
              fontSize: 14,
              color: c.text,
              maxHeight: 100,
            }}
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          <Pressable
            onPress={handleSend}
            disabled={!draft.trim()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 14,
              backgroundColor: primary,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: draft.trim() ? 1 : 0.4,
            }}
          >
            <Send size={16} color={colors.brand.limeDark} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

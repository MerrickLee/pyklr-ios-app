import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { ReactionBar, ReactionChips } from '@/components/chat/ReactionBar';
import { useTheme } from '@/theme/useTheme';
import { colors } from '@/theme/tokens';
import type { ReactionSummary } from '@/hooks/useChat';

interface MessageBubbleProps {
  messageId: string;
  senderName: string;
  senderAvatarUrl?: string | null;
  body: string;
  timestamp: string;
  isOwn: boolean;
  /** Reaction counts for this message */
  reactions: Map<string, ReactionSummary>;
  /** Called when user picks or toggles an emoji */
  onReact: (emoji: string) => void;
}

export function MessageBubble({
  messageId,
  senderName,
  senderAvatarUrl,
  body,
  timestamp,
  isOwn,
  reactions,
  onReact,
}: MessageBubbleProps) {
  const { scheme, colors: c } = useTheme();
  const primary = scheme === 'dark' ? colors.brand.lime : colors.brand.green;
  const [showReactionBar, setShowReactionBar] = useState(false);

  if (isOwn) {
    return (
      <View style={{ alignItems: 'flex-end' }}>
        <Pressable
          onLongPress={() => setShowReactionBar(true)}
          delayLongPress={300}
          style={{ maxWidth: '75%', position: 'relative' }}
        >
          <ReactionBar
            visible={showReactionBar}
            onReact={onReact}
            onDismiss={() => setShowReactionBar(false)}
            position="above"
            align="right"
          />
          <View
            style={{
              backgroundColor: primary,
              paddingHorizontal: 12,
              paddingVertical: 9,
              borderRadius: 18,
              borderBottomRightRadius: 4,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '500', color: colors.brand.limeDark }}>
              {body}
            </Text>
          </View>
        </Pressable>
        <ReactionChips reactions={reactions} onToggle={onReact} />
      </View>
    );
  }

  return (
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
      <Avatar uri={senderAvatarUrl} size={32} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 11, color: c.textMuted, marginBottom: 2 }}>
          {senderName} · {timestamp}
        </Text>
        <Pressable
          onLongPress={() => setShowReactionBar(true)}
          delayLongPress={300}
          style={{ alignSelf: 'flex-start', maxWidth: '88%', position: 'relative' }}
        >
          <ReactionBar
            visible={showReactionBar}
            onReact={onReact}
            onDismiss={() => setShowReactionBar(false)}
            position="above"
            align="left"
          />
          <View
            style={{
              backgroundColor: c.surface,
              paddingHorizontal: 12,
              paddingVertical: 9,
              borderRadius: 18,
              borderBottomLeftRadius: 4,
            }}
          >
            <Text style={{ fontSize: 14, color: c.text }}>{body}</Text>
          </View>
        </Pressable>
        <ReactionChips reactions={reactions} onToggle={onReact} />
      </View>
    </View>
  );
}

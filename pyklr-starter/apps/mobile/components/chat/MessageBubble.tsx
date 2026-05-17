import React from 'react';
import { View, Text } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { useTheme } from '@/theme/useTheme';
import { colors } from '@/theme/tokens';

interface MessageBubbleProps {
  senderName: string;
  senderAvatarUrl?: string | null;
  body: string;
  timestamp: string;
  isOwn: boolean;
}

export function MessageBubble({
  senderName,
  senderAvatarUrl,
  body,
  timestamp,
  isOwn,
}: MessageBubbleProps) {
  const { scheme, colors: c } = useTheme();
  const primary = scheme === 'dark' ? colors.brand.lime : colors.brand.green;

  if (isOwn) {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
        <View
          style={{
            backgroundColor: primary,
            paddingHorizontal: 12,
            paddingVertical: 9,
            borderRadius: 18,
            borderBottomRightRadius: 4,
            maxWidth: '75%',
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '500', color: colors.brand.limeDark }}>
            {body}
          </Text>
        </View>
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
        <View
          style={{
            backgroundColor: c.surface,
            paddingHorizontal: 12,
            paddingVertical: 9,
            borderRadius: 18,
            borderBottomLeftRadius: 4,
            alignSelf: 'flex-start',
            maxWidth: '88%',
          }}
        >
          <Text style={{ fontSize: 14, color: c.text }}>{body}</Text>
        </View>
      </View>
    </View>
  );
}

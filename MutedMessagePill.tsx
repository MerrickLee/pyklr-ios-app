import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { VolumeX, Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '@/theme/useTheme';

interface MutedMessagePillProps {
  senderName: string;
  body: string;
}

/**
 * Renders a muted user's message as a single-line collapsed pill with an
 * eye icon. Tap to peek at the actual content. Tap again to re-collapse.
 *
 * This is core to the PYKLR product wedge. Do not replace with a "hide"
 * pattern — the user must always be able to reveal a muted message.
 */
export function MutedMessagePill({ senderName, body }: MutedMessagePillProps) {
  const [expanded, setExpanded] = useState(false);
  const { scheme, colors: c } = useTheme();
  const bg = scheme === 'dark' ? '#101015' : '#F4F4F2';

  return (
    <Pressable
      onPress={() => setExpanded((e) => !e)}
      style={{
        backgroundColor: bg,
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        opacity: expanded ? 0.85 : 0.6,
      }}
    >
      <VolumeX size={14} color={c.textFaint} />
      <View style={{ flex: 1 }}>
        {expanded ? (
          <>
            <Text style={{ fontSize: 11, color: c.textMuted, marginBottom: 2 }}>
              {senderName} (muted)
            </Text>
            <Text style={{ fontSize: 13, color: c.text, fontStyle: 'italic' }}>{body}</Text>
          </>
        ) : (
          <Text style={{ fontSize: 12, color: c.textMuted, fontStyle: 'italic' }}>
            {senderName} sent a message — muted
          </Text>
        )}
      </View>
      {expanded ? (
        <EyeOff size={14} color={c.textFaint} />
      ) : (
        <Eye size={14} color={c.textFaint} />
      )}
    </Pressable>
  );
}

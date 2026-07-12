import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { colors } from '@/theme/tokens';

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '🔥', '🏓'] as const;

interface ReactionBarProps {
  /** Whether the bar is visible */
  visible: boolean;
  /** Called when user picks an emoji */
  onReact: (emoji: string) => void;
  /** Called to dismiss the bar */
  onDismiss: () => void;
  /** Position the bar above or below the message */
  position?: 'above' | 'below';
  /** Align to the left (other's message) or right (own message) */
  align?: 'left' | 'right';
}

/**
 * Floating emoji reaction picker that appears on long-press of a message bubble.
 * Shows 6 emoji options in a horizontal pill.
 */
export function ReactionBar({
  visible,
  onReact,
  onDismiss,
  position = 'above',
  align = 'left',
}: ReactionBarProps) {
  const { colors: c, scheme } = useTheme();

  if (!visible) return null;

  return (
    <>
      {/* Invisible backdrop to dismiss */}
      <Pressable
        onPress={onDismiss}
        style={{
          position: 'absolute',
          top: -500,
          bottom: -500,
          left: -500,
          right: -500,
          zIndex: 99,
        }}
      />
      <View
        style={{
          flexDirection: 'row',
          gap: 2,
          backgroundColor: c.surface,
          borderRadius: 24,
          paddingHorizontal: 6,
          paddingVertical: 6,
          alignSelf: align === 'right' ? 'flex-end' : 'flex-start',
          position: 'absolute',
          [position === 'above' ? 'bottom' : 'top']: position === 'above' ? '100%' : '100%',
          marginBottom: position === 'above' ? 4 : 0,
          marginTop: position === 'below' ? 4 : 0,
          zIndex: 100,
          // Shadow
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 8,
          borderWidth: 1,
          borderColor: c.border,
        }}
      >
        {REACTION_EMOJIS.map((emoji) => (
          <Pressable
            key={emoji}
            onPress={() => {
              onReact(emoji);
              onDismiss();
            }}
            style={({ pressed }) => ({
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: pressed ? c.surface2 : 'transparent',
              transform: pressed ? [{ scale: 1.2 }] : [{ scale: 1 }],
            })}
          >
            <Text style={{ fontSize: 20 }}>{emoji}</Text>
          </Pressable>
        ))}
      </View>
    </>
  );
}

interface ReactionChipsProps {
  /** Map of emoji → count */
  reactions: Map<string, { count: number; reacted: boolean }>;
  /** Called when user taps a chip (to toggle their reaction) */
  onToggle: (emoji: string) => void;
}

/**
 * Displays small emoji chips below a message bubble showing reaction counts.
 */
export function ReactionChips({ reactions, onToggle }: ReactionChipsProps) {
  const { colors: c, scheme } = useTheme();
  const primary = scheme === 'dark' ? colors.brand.lime : colors.brand.green;

  if (reactions.size === 0) return null;

  return (
    <View style={{ flexDirection: 'row', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
      {Array.from(reactions.entries()).map(([emoji, { count, reacted }]) => (
        <Pressable
          key={emoji}
          onPress={() => onToggle(emoji)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 3,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            backgroundColor: reacted
              ? `${primary}22`
              : c.surface2,
            borderWidth: reacted ? 1 : 0,
            borderColor: reacted ? primary : 'transparent',
          }}
        >
          <Text style={{ fontSize: 13 }}>{emoji}</Text>
          <Text
            style={{
              fontSize: 11,
              fontWeight: '600',
              color: reacted ? primary : c.textMuted,
            }}
          >
            {count}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

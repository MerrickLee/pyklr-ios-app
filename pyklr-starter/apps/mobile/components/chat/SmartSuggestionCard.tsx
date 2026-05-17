import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { useTheme } from '@/theme/useTheme';
import { colors } from '@/theme/tokens';

interface SmartSuggestionCardProps {
  title: string;
  subtitle: string;
  payload?: Record<string, unknown>;
}

/**
 * The smart-suggestion card surfaces a system-generated action prompt
 * inside the chat thread. Currently used for "create an event from this
 * conversation" — when the smart-suggest edge function detects a meetup
 * forming in the chat, it inserts a message with `is_suggestion = true`
 * and a `suggestion_payload`.
 *
 * Tapping the card opens the relevant flow pre-filled.
 */
export function SmartSuggestionCard({ title, subtitle, payload }: SmartSuggestionCardProps) {
  const router = useRouter();
  const { scheme } = useTheme();
  const primary = scheme === 'dark' ? colors.brand.lime : colors.brand.green;
  const primaryDark = colors.brand.greenDark;

  return (
    <Pressable
      onPress={() => {
        // Route to event/new with pre-filled payload
        router.push({
          pathname: '/event/new',
          params: { fromSuggestion: '1', payload: JSON.stringify(payload ?? {}) },
        });
      }}
      style={({ pressed }) => ({
        opacity: pressed ? 0.92 : 1,
      })}
    >
      <View
        style={{
          borderRadius: 18,
          padding: 14,
          backgroundColor: primary,
          shadowColor: primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
          <Sparkles size={11} color={primaryDark} />
          <Text
            style={{
              fontSize: 10,
              fontWeight: '700',
              color: primaryDark,
              letterSpacing: 1.5,
            }}
          >
            SMART SUGGESTION
          </Text>
        </View>
        <Text style={{ fontSize: 15, fontWeight: '700', color: primaryDark }}>{title}</Text>
        <Text style={{ fontSize: 12, color: primaryDark, opacity: 0.85, marginTop: 2 }}>
          {subtitle}
        </Text>
      </View>
    </Pressable>
  );
}

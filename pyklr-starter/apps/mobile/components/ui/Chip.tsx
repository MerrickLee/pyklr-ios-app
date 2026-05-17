import React from 'react';
import { Pressable, Text } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { colors } from '@/theme/tokens';

interface ChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  size?: 'sm' | 'md';
}

export function Chip({ label, active = false, onPress, size = 'md' }: ChipProps) {
  const { scheme, colors: c } = useTheme();
  const primary = scheme === 'dark' ? colors.brand.lime : colors.brand.green;
  const onPrimary = colors.brand.limeDark;

  const fontSize = size === 'sm' ? 11 : 13;
  const paddingY = size === 'sm' ? 4 : 6;
  const paddingX = size === 'sm' ? 10 : 12;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: active ? primary : c.surface2,
        paddingVertical: paddingY,
        paddingHorizontal: paddingX,
        borderRadius: 999,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text
        style={{
          fontSize,
          fontWeight: '500',
          color: active ? onPrimary : c.textMuted,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

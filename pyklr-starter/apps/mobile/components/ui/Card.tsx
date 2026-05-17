import React from 'react';
import { View, type ViewProps } from 'react-native';
import { useTheme } from '@/theme/useTheme';

interface CardProps extends ViewProps {
  variant?: 'surface' | 'tint-green' | 'tint-blue' | 'accent';
}

export function Card({ variant = 'surface', style, children, ...rest }: CardProps) {
  const { scheme, colors: c } = useTheme();
  const isDark = scheme === 'dark';

  let bg: string;
  let border: string | undefined;

  switch (variant) {
    case 'tint-green':
      bg = isDark ? 'rgba(168, 230, 106, 0.10)' : '#EAF5E5';
      break;
    case 'tint-blue':
      bg = isDark ? 'rgba(68, 147, 204, 0.15)' : '#E4F0F8';
      break;
    case 'accent':
      bg = '#4493CC';
      break;
    case 'surface':
    default:
      bg = c.surface;
      border = c.border;
  }

  return (
    <View
      style={[
        {
          backgroundColor: bg,
          borderRadius: 18,
          padding: 14,
          borderWidth: border ? 0.5 : 0,
          borderColor: border,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

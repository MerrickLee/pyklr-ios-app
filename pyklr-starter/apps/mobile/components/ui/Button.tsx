import React from 'react';
import { Pressable, Text, ActivityIndicator, type PressableProps } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { colors } from '@/theme/tokens';

export type ButtonVariant = 'primary' | 'ghost' | 'secondary';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = true,
  disabled,
  icon,
  ...rest
}: ButtonProps) {
  const { scheme } = useTheme();
  const isDark = scheme === 'dark';
  const primary = isDark ? colors.brand.lime : colors.brand.green;
  const onPrimary = colors.brand.limeDark;

  const heights = { sm: 36, md: 48, lg: 56 };
  const fontSizes = { sm: 13, md: 15, lg: 16 };
  const paddings = { sm: 10, md: 14, lg: 16 };

  let bg: string;
  let fg: string;
  let borderColor: string | undefined;

  switch (variant) {
    case 'primary':
      bg = primary;
      fg = onPrimary;
      break;
    case 'ghost':
      bg = 'transparent';
      fg = isDark ? '#FFFFFF' : '#0F0F0F';
      borderColor = isDark ? '#262626' : '#E5E5E5';
      break;
    case 'secondary':
      bg = isDark ? '#1F1F1F' : '#F4F4F2';
      fg = isDark ? '#FFFFFF' : '#0F0F0F';
      break;
  }

  return (
    <Pressable
      disabled={disabled || loading}
      style={({ pressed }) => ({
        height: heights[size],
        paddingHorizontal: paddings[size],
        borderRadius: 16,
        backgroundColor: bg,
        borderWidth: borderColor ? 1 : 0,
        borderColor,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        width: fullWidth ? '100%' : undefined,
      })}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={fg} />
      ) : (
        <>
          {icon}
          <Text
            style={{
              color: fg,
              fontSize: fontSizes[size],
              fontWeight: '600',
            }}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

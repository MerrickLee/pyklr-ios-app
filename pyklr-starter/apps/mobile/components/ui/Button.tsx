import React from 'react';
import { Pressable, Text, ActivityIndicator, type PressableProps, type GestureResponderEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, LinearTransition } from 'react-native-reanimated';
import { useTheme } from '@/theme/useTheme';
import { colors } from '@/theme/tokens';
import { track } from '@/lib/analytics';

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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = true,
  disabled,
  icon,
  onPress,
  onPressIn,
  onPressOut,
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
      borderColor = isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.2)';
      break;
    case 'secondary':
      bg = isDark ? '#1F1F1F' : '#F4F4F2';
      fg = isDark ? '#FFFFFF' : '#0F0F0F';
      break;
  }

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  function handlePressIn(e: GestureResponderEvent) {
    scale.value = withSpring(0.95, { damping: 12, stiffness: 300 });
    if (onPressIn) onPressIn(e);
  }

  function handlePressOut(e: GestureResponderEvent) {
    scale.value = withSpring(1, { damping: 12, stiffness: 300 });
    if (onPressOut) onPressOut(e);
  }

  function handlePress(e: GestureResponderEvent) {
    track('ui.button_clicked', {
      label,
      variant,
      size,
    });
    if (onPress) {
      onPress(e);
    }
  }

  return (
    <AnimatedPressable
      disabled={disabled || loading}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      layout={LinearTransition.springify()}
      style={[
        {
          height: heights[size],
          paddingHorizontal: paddings[size],
          borderRadius: 16,
          backgroundColor: bg,
          borderWidth: borderColor ? 1.5 : 0,
          borderColor,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          opacity: disabled ? 0.5 : 1,
          width: fullWidth ? '100%' : undefined,
        },
        animatedStyle,
      ]}
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
    </AnimatedPressable>
  );
}

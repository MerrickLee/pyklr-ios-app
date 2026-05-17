import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { colors } from '@/theme/tokens';

/**
 * Skeleton placeholder for loading states.
 * Renders a pulsing rounded rectangle.
 */
export function Skeleton({
  width,
  height = 14,
  borderRadius = 8,
  style,
}: {
  width: number | '100%';
  height?: number;
  borderRadius?: number;
  style?: object;
}) {
  const { colors: c } = useTheme();
  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: c.surface2,
          opacity: 0.7,
        },
        style,
      ]}
    />
  );
}

/**
 * A loading card placeholder that matches the Card component dimensions.
 */
export function SkeletonCard({ height = 80 }: { height?: number }) {
  const { colors: c } = useTheme();
  return (
    <View
      style={{
        backgroundColor: c.surface,
        borderRadius: 18,
        padding: 14,
        borderWidth: 0.5,
        borderColor: c.border,
        gap: 8,
        height,
        justifyContent: 'center',
      }}
    >
      <Skeleton width="60%" height={12} />
      <Skeleton width="40%" height={10} />
    </View>
  );
}

/**
 * A larger skeleton for the featured event card.
 */
export function SkeletonFeaturedCard() {
  return (
    <View
      style={{
        backgroundColor: colors.brand.blue,
        borderRadius: 18,
        padding: 20,
        opacity: 0.7,
        gap: 8,
        height: 140,
      }}
    >
      <Skeleton width={100} height={8} borderRadius={4} />
      <Skeleton width="70%" height={14} />
      <Skeleton width="50%" height={10} />
    </View>
  );
}

/**
 * Empty state with a helpful message and optional CTA.
 */
export function EmptyState({
  title,
  subtitle,
  ctaLabel,
  onCta,
}: {
  title: string;
  subtitle: string;
  ctaLabel?: string;
  onCta?: () => void;
}) {
  const { scheme, colors: c } = useTheme();
  const primary = scheme === 'dark' ? colors.brand.lime : colors.brand.green;

  return (
    <View style={{ alignItems: 'center', paddingVertical: 32, paddingHorizontal: 20 }}>
      <Text style={{ fontSize: 15, fontWeight: '600', color: c.text, textAlign: 'center' }}>
        {title}
      </Text>
      <Text
        style={{
          fontSize: 13,
          color: c.textMuted,
          textAlign: 'center',
          marginTop: 6,
          maxWidth: 260,
          lineHeight: 19,
        }}
      >
        {subtitle}
      </Text>
      {ctaLabel && onCta && (
        <Pressable
          onPress={onCta}
          style={{
            backgroundColor: primary,
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 14,
            marginTop: 16,
          }}
        >
          <Text style={{ color: colors.brand.limeDark, fontSize: 13, fontWeight: '600' }}>
            {ctaLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

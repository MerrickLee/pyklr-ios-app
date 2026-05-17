import React from 'react';
import { View, Image, Text } from 'react-native';
import { colors } from '@/theme/tokens';

interface AvatarProps {
  uri?: string | null;
  fallbackInitials?: string;
  size?: number;
  borderColor?: string;
}

export function Avatar({ uri, fallbackInitials, size = 40, borderColor }: AvatarProps) {
  const dimensions = {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: borderColor ? 2 : 0,
    borderColor,
  };

  if (uri) {
    return <Image source={{ uri }} style={dimensions} />;
  }

  // Gradient placeholder
  return (
    <View
      style={[
        dimensions,
        {
          backgroundColor: colors.brand.green,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        },
      ]}
    >
      <View
        style={{
          position: 'absolute',
          inset: 0,
          width: size,
          height: size,
          backgroundColor: colors.brand.blue,
          opacity: 0.5,
          transform: [{ translateX: -size / 3 }, { translateY: -size / 3 }],
          borderRadius: size,
        }}
      />
      {fallbackInitials && (
        <Text
          style={{
            color: '#FFFFFF',
            fontWeight: '600',
            fontSize: size * 0.4,
          }}
        >
          {fallbackInitials}
        </Text>
      )}
    </View>
  );
}

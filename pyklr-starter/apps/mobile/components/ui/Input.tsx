import React from 'react';
import { TextInput, View, Text, type TextInputProps } from 'react-native';
import { useTheme } from '@/theme/useTheme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export function Input({ label, error, leftIcon, style, ...rest }: InputProps) {
  const { colors: c } = useTheme();
  return (
    <View>
      {label && (
        <Text
          style={{
            fontSize: 12,
            fontWeight: '500',
            color: c.textMuted,
            marginBottom: 6,
          }}
        >
          {label}
        </Text>
      )}
      <View
        style={{
          flexDirection: 'row',
          alignItems: rest.multiline ? 'flex-start' : 'center',
          backgroundColor: c.surface2,
          borderRadius: 14,
          paddingHorizontal: 16,
          paddingVertical: rest.multiline ? 12 : 0,
          minHeight: 48,
          height: rest.multiline ? undefined : 48,
          gap: 8,
          borderWidth: 1,
          borderColor: error ? '#E24B4A' : c.borderEmphasis,
        }}
      >
        {leftIcon}
        <TextInput
          placeholderTextColor={c.textFaint}
          style={[
            {
              flex: 1,
              color: c.text,
              fontSize: 15,
              padding: 0,
            },
            style,
          ]}
          {...rest}
        />
      </View>
      {error && (
        <Text style={{ fontSize: 12, color: '#E24B4A', marginTop: 4 }}>{error}</Text>
      )}
    </View>
  );
}

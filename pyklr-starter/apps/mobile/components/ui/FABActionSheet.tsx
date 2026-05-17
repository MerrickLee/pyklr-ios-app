import React from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { Calendar, MapPin, MessageSquarePlus, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { colors } from '@/theme/tokens';

interface FABSheetProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Bottom sheet triggered by the center FAB button.
 * Three actions: Create event, Add a court, New forum post.
 */
export function FABActionSheet({ visible, onClose }: FABSheetProps) {
  const router = useRouter();
  const { scheme, colors: c } = useTheme();
  const primary = scheme === 'dark' ? colors.brand.lime : colors.brand.green;

  const actions = [
    {
      icon: Calendar,
      label: 'Create event',
      subtitle: 'Organize a game or open play',
      route: '/event/new' as const,
      color: primary,
    },
    {
      icon: MapPin,
      label: 'Add a court',
      subtitle: 'Crowdsource a new court location',
      route: '/court/new' as const,
      color: colors.brand.blue,
    },
    {
      icon: MessageSquarePlus,
      label: 'New forum post',
      subtitle: 'Share with the community',
      route: '/forum/new' as const,
      color: scheme === 'dark' ? '#9C7BC4' : '#7C5BAA',
    },
  ];

  function handleAction(route: string) {
    onClose();
    // Small delay so the modal closes before navigating
    setTimeout(() => router.push(route as never), 150);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          justifyContent: 'flex-end',
        }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: c.surface,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 40,
          }}
        >
          {/* Handle bar */}
          <View
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              backgroundColor: c.border,
              alignSelf: 'center',
              marginBottom: 16,
            }}
          />

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: c.text }}>
              Create
            </Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <X size={20} color={c.textMuted} />
            </Pressable>
          </View>

          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Pressable
                key={action.label}
                onPress={() => handleAction(action.route)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                  paddingVertical: 14,
                  borderTopWidth: index > 0 ? 0.5 : 0,
                  borderTopColor: c.border,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 14,
                    backgroundColor: `${action.color}22`,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={20} color={action.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: c.text }}>
                    {action.label}
                  </Text>
                  <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }}>
                    {action.subtitle}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

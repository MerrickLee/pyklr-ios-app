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
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          justifyContent: 'flex-end',
        }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: c.surface,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: 48,
          }}
        >
          {/* Handle bar */}
          <View
            style={{
              width: 40,
              height: 5,
              borderRadius: 3,
              backgroundColor: c.border,
              alignSelf: 'center',
              marginBottom: 20,
            }}
          />

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 24,
            }}
          >
            <Text style={{ fontSize: 22, fontFamily: 'Sink', color: c.text }}>
              Create new
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={16} style={{ padding: 4, backgroundColor: c.surface2, borderRadius: 16 }}>
              <X size={20} color={c.textMuted} />
            </TouchableOpacity>
          </View>

          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <TouchableOpacity
                key={action.label}
                activeOpacity={0.7}
                onPress={() => handleAction(action.route)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 16,
                  paddingVertical: 18,
                  borderTopWidth: index > 0 ? 1 : 0,
                  borderTopColor: c.border,
                }}
              >
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    backgroundColor: `${action.color}15`,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: `${action.color}30`,
                  }}
                >
                  <Icon size={24} color={action.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 17, fontWeight: '700', color: c.text }}>
                    {action.label}
                  </Text>
                  <Text style={{ fontSize: 13, color: c.textMuted, marginTop: 4 }}>
                    {action.subtitle}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </Pressable>
      </Pressable
    </Modal>
  );
}

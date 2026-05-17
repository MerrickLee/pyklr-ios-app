import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { X, VolumeX, Volume2, Users, LogOut, Flag, Settings } from 'lucide-react-native';
import { Avatar } from '@/components/ui/Avatar';
import { useTheme } from '@/theme/useTheme';
import { colors } from '@/theme/tokens';
import { useChatMembers } from '@/hooks/useChats';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';

interface ChatOptionsSheetProps {
  visible: boolean;
  onClose: () => void;
  chatId: string;
  chatName: string;
}

/**
 * Three-dot menu bottom sheet for the chat thread.
 * Actions: View members (with mute toggles), Mute conversation, Leave group, Report.
 */
export function ChatOptionsSheet({
  visible,
  onClose,
  chatId,
  chatName,
}: ChatOptionsSheetProps) {
  const router = useRouter();
  const { colors: c, scheme } = useTheme();
  const primary = scheme === 'dark' ? colors.brand.lime : colors.brand.green;
  const { user } = useAuth();
  const { data: members } = useChatMembers(chatId);
  const { mutedUserIds, toggleUserMute } = useChat(chatId);

  const [showMembers, setShowMembers] = useState(false);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
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
            maxHeight: '70%',
          }}
        >
          {/* Handle */}
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
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: c.text }}>
              {showMembers ? 'Members' : chatName}
            </Text>
            <Pressable
              onPress={showMembers ? () => setShowMembers(false) : onClose}
              hitSlop={12}
            >
              <X size={20} color={c.textMuted} />
            </Pressable>
          </View>

          {showMembers ? (
            /* Member list with mute toggles */
            <View style={{ gap: 8 }}>
              {members?.map((member) => {
                const isSelf = member.userId === user?.id;
                const isMuted = mutedUserIds.has(member.userId);

                return (
                  <View
                    key={member.userId}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      paddingVertical: 10,
                      borderBottomWidth: 0.5,
                      borderBottomColor: c.border,
                    }}
                  >
                    <Avatar
                      uri={member.avatarUrl}
                      fallbackInitials={member.displayName.charAt(0)}
                      size={36}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '500', color: c.text }}>
                        {member.displayName}
                        {isSelf ? ' (you)' : ''}
                      </Text>
                      <Text style={{ fontSize: 11, color: c.textMuted }}>
                        {member.role}
                        {isMuted ? ' · muted' : ''}
                      </Text>
                    </View>
                    {!isSelf && (
                      <Pressable
                        onPress={() => toggleUserMute(member.userId)}
                        style={{
                          padding: 8,
                          borderRadius: 10,
                          backgroundColor: isMuted
                            ? `${primary}22`
                            : c.surface2,
                        }}
                      >
                        {isMuted ? (
                          <Volume2 size={16} color={primary} />
                        ) : (
                          <VolumeX size={16} color={c.textMuted} />
                        )}
                      </Pressable>
                    )}
                  </View>
                );
              })}
            </View>
          ) : (
            /* Main menu */
            <View style={{ gap: 4 }}>
              {[
                {
                  icon: Users,
                  label: `View members (${members?.length ?? '…'})`,
                  color: c.text,
                  action: () => setShowMembers(true),
                },
                {
                  icon: VolumeX,
                  label: 'Mute conversation',
                  color: c.text,
                  action: () => {
                    // TODO: implement conversation-level mute
                    onClose();
                  },
                },
                {
                  icon: LogOut,
                  label: 'Leave group',
                  color: '#E24B4A',
                  action: () => {
                    // TODO: implement leave group
                    onClose();
                  },
                },
                {
                  icon: Flag,
                  label: 'Report',
                  color: '#E24B4A',
                  action: () => {
                    // TODO: navigate to report flow
                    onClose();
                  },
                },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <Pressable
                    key={item.label}
                    onPress={item.action}
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
                    <Icon size={18} color={item.color} />
                    <Text
                      style={{ fontSize: 15, fontWeight: '500', color: item.color }}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

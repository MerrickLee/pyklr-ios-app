import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Camera } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/theme/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/lib/supabase';
import { uploadAvatar } from '@/lib/storage';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/tokens';

export default function EditProfileScreen() {
  const router = useRouter();
  const { scheme, colors: c } = useTheme();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();
  const primary = scheme === 'dark' ? colors.brand.lime : colors.brand.greenDark;

  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Pre-fill form when profile loads
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatar_url || null);
    }
  }, [profile]);

  async function handlePickImage() {
    if (!user) return;
    const result = await uploadAvatar(user.id, 'library');
    if (result) {
      setAvatarUrl(result.publicUrl);
      // Invalidate the query right away so avatar updates across the app
      queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
    }
  }

  const googleAvatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const hasNewGoogleAvatar = googleAvatarUrl && profile?.avatar_url !== googleAvatarUrl && avatarUrl !== googleAvatarUrl;

  async function handleSyncGoogleAvatar() {
    if (!user || !googleAvatarUrl) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: googleAvatarUrl })
      .eq('id', user.id);
      
    setSaving(false);
    if (error) {
      Alert.alert('Sync failed', error.message);
    } else {
      setAvatarUrl(googleAvatarUrl);
      queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
    }
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);

    const updates = {
      display_name: displayName.trim() || null,
      bio: bio.trim() || null,
    };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    setSaving(false);

    if (error) {
      Alert.alert('Save failed', error.message);
    } else {
      // Refresh profile data
      queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
      router.back();
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 }}>
        <Pressable onPress={() => router.back()} style={{ flex: 1 }}>
          <X size={22} color={c.text} />
        </Pressable>
        <Text style={{ flex: 2, textAlign: 'center', fontWeight: '700', fontSize: 16, color: c.text }}>
          Edit Profile
        </Text>
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <Pressable onPress={handleSave} disabled={saving} style={{ opacity: saving ? 0.5 : 1 }}>
            <Text style={{ fontWeight: '600', fontSize: 16, color: primary }}>
              {saving ? 'Saving...' : 'Save'}
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 24 }} keyboardShouldPersistTaps="handled">
        {/* Avatar Section */}
        <View style={{ alignItems: 'center' }}>
          <Pressable onPress={handlePickImage} style={{ position: 'relative' }}>
            <Avatar uri={avatarUrl} size={100} borderColor={primary} />
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: primary,
                width: 32,
                height: 32,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 3,
                borderColor: c.bg,
              }}
            >
              <Camera size={14} color={colors.brand.limeDark} />
            </View>
          </Pressable>
          <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 12 }}>
            Tap to change profile picture
          </Text>

          {hasNewGoogleAvatar && (
            <Pressable
              onPress={handleSyncGoogleAvatar}
              disabled={saving}
              style={{
                marginTop: 16,
                paddingVertical: 8,
                paddingHorizontal: 16,
                backgroundColor: `${colors.brand.blue}22`,
                borderRadius: 16,
                opacity: saving ? 0.5 : 1,
              }}
            >
              <Text style={{ color: colors.brand.blue, fontSize: 13, fontWeight: '600' }}>
                Sync newest Google picture
              </Text>
            </Pressable>
          )}
        </View>

        {/* Form Fields */}
        <View style={{ gap: 16 }}>
          <Input
            label="Display name"
            placeholder="Your name"
            value={displayName}
            onChangeText={setDisplayName}
          />
          <Input
            label="Bio"
            placeholder="Tell us about your game..."
            value={bio}
            onChangeText={setBio}
            multiline
            style={{ height: 100, textAlignVertical: 'top' }}
          />
          <Text style={{ fontSize: 11, color: c.textMuted, textAlign: 'right' }}>
            {bio.length}/160
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

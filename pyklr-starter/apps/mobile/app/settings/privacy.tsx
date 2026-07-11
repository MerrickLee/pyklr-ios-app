import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/theme/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/lib/supabase';
import { colors } from '@/theme/tokens';

type Visibility = 'public' | 'followers' | 'private';
type DmPermission = 'anyone' | 'followers' | 'nobody';

function RadioGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const { scheme, colors: c } = useTheme();
  const primary = scheme === 'dark' ? colors.brand.lime : colors.brand.greenDark;

  return (
    <Card style={{ marginTop: 4 }}>
      <Text style={{ fontWeight: '600', color: c.text, marginBottom: 10, fontSize: 14 }}>{label}</Text>
      {options.map((opt) => (
        <Pressable
          key={opt.value}
          onPress={() => onChange(opt.value)}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 10,
          }}
        >
          <Text style={{ color: c.text, fontSize: 14 }}>{opt.label}</Text>
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              borderWidth: 2,
              borderColor: value === opt.value ? primary : c.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {value === opt.value && (
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: primary,
                }}
              />
            )}
          </View>
        </Pressable>
      ))}
    </Card>
  );
}

export default function PrivacySettingsScreen() {
  const router = useRouter();
  const { scheme, colors: c } = useTheme();
  const primary = scheme === 'dark' ? colors.brand.lime : colors.brand.greenDark;
  const { user } = useAuth();
  const { data: profile } = useProfile();

  const [visibility, setVisibility] = useState<Visibility>('public');
  const [dmPermission, setDmPermission] = useState<DmPermission>('anyone');
  const [showNearby, setShowNearby] = useState(true);
  const [availableToMatch, setAvailableToMatch] = useState(true);
  const [hideDupr, setHideDupr] = useState(false);

  // Load current settings from profile
  useEffect(() => {
    if (!profile) return;
    if (profile.profile_visibility) setVisibility(profile.profile_visibility as Visibility);
    if (profile.dm_permission) setDmPermission(profile.dm_permission as DmPermission);
    if (profile.show_nearby !== undefined) setShowNearby(profile.show_nearby ?? true);
    if (profile.available_to_match !== undefined) setAvailableToMatch(profile.available_to_match ?? true);
    if (profile.hide_dupr !== undefined) setHideDupr(profile.hide_dupr ?? false);
  }, [profile]);

  async function save(field: string, value: unknown) {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ [field]: value })
      .eq('id', user.id);
    if (error) Alert.alert('Error', 'Could not update setting. Please try again.');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 }}>
        <Pressable onPress={() => router.back()}>
          <ChevronLeft size={22} color={c.text} />
        </Pressable>
        <Text style={{ flex: 1, textAlign: 'center', fontWeight: '700', fontSize: 16, color: c.text }}>
          Privacy
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <RadioGroup
          label="Profile visibility"
          options={[
            { value: 'public' as Visibility, label: 'Public — anyone can see your profile' },
            { value: 'followers' as Visibility, label: 'Followers — only people you follow' },
            { value: 'private' as Visibility, label: 'Private — only you' },
          ]}
          value={visibility}
          onChange={(v) => {
            setVisibility(v);
            save('profile_visibility', v);
          }}
        />

        <RadioGroup
          label="Who can DM you"
          options={[
            { value: 'anyone' as DmPermission, label: 'Anyone' },
            { value: 'followers' as DmPermission, label: 'Followers only' },
            { value: 'nobody' as DmPermission, label: 'Nobody' },
          ]}
          value={dmPermission}
          onChange={(v) => {
            setDmPermission(v);
            save('dm_permission', v);
          }}
        />

        <Card style={{ marginTop: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: c.text }}>Show me to nearby players</Text>
              <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }}>
                Appear in the "Find players" search
              </Text>
            </View>
            <Switch
              value={showNearby}
              onValueChange={(v) => {
                setShowNearby(v);
                save('show_nearby', v);
              }}
              trackColor={{ false: c.surface2, true: primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Card>

        <Card style={{ marginTop: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: c.text }}>Available to match</Text>
              <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }}>
                Show a green badge indicating you're looking for games
              </Text>
            </View>
            <Switch
              value={availableToMatch}
              onValueChange={(v) => {
                setAvailableToMatch(v);
                save('available_to_match', v);
              }}
              trackColor={{ false: c.surface2, true: primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Card>

        <Card style={{ marginTop: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: c.text }}>Hide my DUPR rating</Text>
              <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }}>
                Your rating won't be visible on your profile
              </Text>
            </View>
            <Switch
              value={hideDupr}
              onValueChange={(v) => {
                setHideDupr(v);
                save('hide_dupr', v);
              }}
              trackColor={{ false: c.surface2, true: primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { PyklrLockup } from '@/components/brand/PyklrLogo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Chip } from '@/components/ui/Chip';
import { useTheme } from '@/theme/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { colors } from '@/theme/tokens';

const PLAY_STYLES = [
  { key: 'competitive', label: 'Competitive', emoji: '🎯' },
  { key: 'social', label: 'Fun social', emoji: '🎉' },
  { key: 'drills', label: 'Drills', emoji: '🏃' },
  { key: 'open_play', label: 'Open play', emoji: '🌀' },
] as const;

const AVAILABILITY = ['mornings', 'afternoons', 'evenings', 'weekends'] as const;

export default function SurveyScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { scheme, colors: c } = useTheme();
  const primary = scheme === 'dark' ? colors.brand.lime : colors.brand.green;

  const [styles, setStyles] = useState<Set<string>>(new Set(['competitive', 'drills']));
  const [avail, setAvail] = useState<Set<string>>(new Set(['evenings', 'weekends']));
  const [dupr, setDupr] = useState('');
  const [saving, setSaving] = useState(false);

  function toggle<T extends string>(set: Set<T>, value: T, setter: (s: Set<T>) => void) {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setter(next);
  }

  async function handleContinue() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        play_styles: Array.from(styles),
        availability: Array.from(avail),
        self_rating: dupr ? parseFloat(dupr) : null,
        survey_completed: true,
      })
      .eq('id', user.id);
    setSaving(false);
    if (!error) router.replace('/(tabs)');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 14 }}>
        <PyklrLockup size={22} />
        <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 8 }}>Step 2 of 4</Text>
        <View
          style={{
            height: 4,
            backgroundColor: c.surface2,
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <View style={{ height: '100%', width: '50%', backgroundColor: primary }} />
        </View>
        <Text style={{ fontSize: 28, fontWeight: '700', color: c.text, lineHeight: 32, marginTop: 4 }}>
          What's{'\n'}your game?
        </Text>
        <Text style={{ fontSize: 13, color: c.textMuted }}>
          Pick all that apply — we'll match you better
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
          {PLAY_STYLES.map((s) => {
            const selected = styles.has(s.key);
            return (
              <Pressable
                key={s.key}
                onPress={() => toggle(styles, s.key, setStyles)}
                style={{
                  width: '48%',
                  paddingVertical: 18,
                  borderRadius: 18,
                  alignItems: 'center',
                  backgroundColor: selected
                    ? scheme === 'dark'
                      ? 'rgba(168, 230, 106, 0.15)'
                      : colors.brand.greenLight
                    : c.surface2,
                  borderWidth: 1.5,
                  borderColor: selected ? primary : 'transparent',
                }}
              >
                <Text style={{ fontSize: 24 }}>{s.emoji}</Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    marginTop: 4,
                    color: selected ? (scheme === 'dark' ? colors.brand.lime : colors.brand.greenDark) : c.text,
                  }}
                >
                  {s.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={{ fontSize: 12, fontWeight: '500', color: c.textMuted, marginTop: 8 }}>
          When do you play?
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {AVAILABILITY.map((a) => (
            <Chip
              key={a}
              label={a.charAt(0).toUpperCase() + a.slice(1)}
              active={avail.has(a)}
              onPress={() => toggle(avail, a, setAvail)}
            />
          ))}
        </View>

        <Input
          label="DUPR rating (if known)"
          value={dupr}
          onChangeText={setDupr}
          keyboardType="decimal-pad"
          placeholder="e.g. 3.5"
        />

        <Button
          label={saving ? 'Saving…' : 'Continue'}
          onPress={handleContinue}
          loading={saving}
          style={{ marginTop: 16 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

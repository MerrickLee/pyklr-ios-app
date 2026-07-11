import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
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
import { track } from '@/lib/analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PLAY_STYLES = [
  { key: 'competitive', label: 'Competitive', emoji: '🎯' },
  { key: 'social', label: 'Fun social', emoji: '🎉' },
  { key: 'drills', label: 'Drills', emoji: '🏃' },
  { key: 'open_play', label: 'Open play', emoji: '🌀' },
] as const;

const AVAILABILITY = ['mornings', 'afternoons', 'evenings', 'weekends'] as const;

const STEPS = ['profile', 'style', 'availability', 'rating'] as const;
type Step = (typeof STEPS)[number];

const STEP_TITLES: Record<Step, { title: string; subtitle: string }> = {
  profile: { title: "What's\nyour name?", subtitle: 'We need a few basics to get you started' },
  style: { title: "What's\nyour game?", subtitle: 'Pick all that apply — we\'ll match you better' },
  availability: { title: 'When do\nyou play?', subtitle: 'This helps us suggest matches at the right times' },
  rating: { title: 'What\'s your\nskill level?', subtitle: 'Optional — you can always add this later' },
};

const DRAFT_KEY = 'pyklr_survey_draft';

export default function SurveyScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { scheme, colors: c } = useTheme();
  const primary = scheme === 'dark' ? colors.brand.lime : colors.brand.green;

  const [step, setStep] = useState<Step>('profile');
  const [displayName, setDisplayName] = useState('');
  const [city, setCity] = useState('');
  const [styles, setStyles] = useState<Set<string>>(new Set());
  const [avail, setAvail] = useState<Set<string>>(new Set());
  const [dupr, setDupr] = useState('');
  const [saving, setSaving] = useState(false);

  // Load draft on mount
  React.useEffect(() => {
    AsyncStorage.getItem(DRAFT_KEY).then((raw) => {
      if (!raw) return;
      try {
        const draft = JSON.parse(raw);
        if (draft.displayName) setDisplayName(draft.displayName);
        if (draft.city) setCity(draft.city);
        if (draft.styles) setStyles(new Set(draft.styles));
        if (draft.avail) setAvail(new Set(draft.avail));
        if (draft.dupr) setDupr(draft.dupr);
        if (draft.step && STEPS.includes(draft.step)) setStep(draft.step);
      } catch {}
    });
  }, []);

  // Save draft whenever state changes
  const saveDraft = useCallback(() => {
    const draft = {
      displayName,
      city,
      styles: Array.from(styles),
      avail: Array.from(avail),
      dupr,
      step,
    };
    AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [displayName, city, styles, avail, dupr, step]);

  React.useEffect(() => {
    saveDraft();
  }, [saveDraft]);

  const currentStepIndex = STEPS.indexOf(step);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  function toggle<T extends string>(set: Set<T>, value: T, setter: (s: Set<T>) => void) {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setter(next);
  }

  function goNext() {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setStep(STEPS[nextIndex]);
    }
  }

  function goBack() {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setStep(STEPS[prevIndex]);
    }
  }

  async function handleFinish() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName.trim() || null,
        location_city: city.trim() || null,
        play_styles: Array.from(styles),
        availability: Array.from(avail),
        self_rating: dupr ? parseFloat(dupr) : null,
        survey_completed: true,
      })
      .eq('id', user.id);
    setSaving(false);

    if (!error) {
      // Clear draft on success
      AsyncStorage.removeItem(DRAFT_KEY);
      track('profile.completed_survey');
      router.replace('/(tabs)');
    } else {
      Alert.alert('Error', 'Could not save your profile. Please try again.');
    }
  }

  const { title, subtitle } = STEP_TITLES[step];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 14 }}>
        <PyklrLockup size={22} />

        {/* Progress bar */}
        <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 8 }}>
          Step {currentStepIndex + 1} of {STEPS.length}
        </Text>
        <View
          style={{
            height: 4,
            backgroundColor: c.surface2,
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <View style={{ height: '100%', width: `${progress}%`, backgroundColor: primary }} />
        </View>

        {/* Title */}
        <Text style={{ fontSize: 28, fontWeight: '700', color: c.text, lineHeight: 32, marginTop: 4 }}>
          {title}
        </Text>
        <Text style={{ fontSize: 13, color: c.textMuted }}>{subtitle}</Text>

        {/* Step 1: Display name + city */}
        {step === 'profile' && (
          <View style={{ gap: 12, marginTop: 8 }}>
            <Input
              label="Display name"
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="e.g. Sarah K."
              autoFocus
            />
            <Input
              label="City"
              value={city}
              onChangeText={setCity}
              placeholder="e.g. New Rochelle, NY"
            />
          </View>
        )}

        {/* Step 2: Play styles */}
        {step === 'style' && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
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
        )}

        {/* Step 3: Availability */}
        {step === 'availability' && (
          <View style={{ gap: 12, marginTop: 8 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {AVAILABILITY.map((a) => (
                <Chip
                  key={a}
                  label={a.charAt(0).toUpperCase() + a.slice(1)}
                  active={avail.has(a)}
                  onPress={() => toggle(avail, a, setAvail)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Step 4: DUPR rating */}
        {step === 'rating' && (
          <View style={{ gap: 12, marginTop: 8 }}>
            <Input
              label="DUPR rating (if known)"
              value={dupr}
              onChangeText={setDupr}
              keyboardType="decimal-pad"
              placeholder="e.g. 3.5"
            />
            <Pressable
              onPress={() => {
                Alert.alert('DUPR Sync', 'DUPR OAuth integration coming soon. For now, enter your rating manually.');
              }}
              style={{
                paddingVertical: 12,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: colors.brand.blue,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.brand.blue }}>
                Sync with DUPR
              </Text>
            </Pressable>
          </View>
        )}

        {/* Navigation buttons */}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
          {currentStepIndex > 0 && (
            <Pressable
              onPress={goBack}
              style={{
                flex: 1,
                paddingVertical: 16,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: c.border,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontWeight: '600', color: c.text }}>Back</Text>
            </Pressable>
          )}
          <View style={{ flex: currentStepIndex > 0 ? 2 : 1 }}>
            {step === 'rating' ? (
              <Button
                label={saving ? 'Saving…' : 'Finish'}
                onPress={handleFinish}
                loading={saving}
              />
            ) : (
              <Button
                label="Continue"
                onPress={goNext}
              />
            )}
          </View>
        </View>

        {/* Skip link */}
        {step === 'rating' && (
          <Pressable
            onPress={handleFinish}
            style={{ alignSelf: 'center', marginTop: 8 }}
          >
            <Text style={{ fontSize: 13, color: c.textMuted, fontWeight: '500' }}>
              Skip for now
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

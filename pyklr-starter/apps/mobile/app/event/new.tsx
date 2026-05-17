import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Alert, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, MapPin, Calendar, Clock } from 'lucide-react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/theme/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useCourts, type Court } from '@/hooks/useCourts';
import { supabase } from '@/lib/supabase';
import { colors } from '@/theme/tokens';
import { track } from '@/lib/analytics';

type Step = 'basics' | 'court' | 'skill' | 'datetime' | 'visibility';
type Format = 'singles' | 'doubles' | 'mixed';
type Visibility = 'public' | 'invite_only';

const STEPS: Step[] = ['basics', 'court', 'skill', 'datetime', 'visibility'];
const STEP_LABELS: Record<Step, string> = {
  basics: 'Basics',
  court: 'Court',
  skill: 'Skill range',
  datetime: 'Date & time',
  visibility: 'Visibility',
};

export default function NewEventScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { scheme, colors: c } = useTheme();
  const primary = scheme === 'dark' ? colors.brand.lime : colors.brand.green;
  const params = useLocalSearchParams<{ fromSuggestion?: string; payload?: string }>();

  const { data: courts } = useCourts(20);

  const [step, setStep] = useState<Step>('basics');
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [format, setFormat] = useState<Format>('doubles');
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [skillMin, setSkillMin] = useState('3.0');
  const [skillMax, setSkillMax] = useState('3.5');
  const [maxPlayers, setMaxPlayers] = useState('8');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [visibility, setVisibility] = useState<Visibility>('public');

  // Pre-fill from smart suggestion payload
  useMemo(() => {
    if (params.fromSuggestion === '1' && params.payload) {
      try {
        const payload = JSON.parse(params.payload);
        if (payload.title) setName(payload.title);
        if (payload.time) setTimeStr(payload.time);
      } catch {}
    }
  }, []);

  const stepIndex = STEPS.indexOf(step);
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  function nextStep() {
    if (step === 'basics' && !name.trim()) {
      Alert.alert('Missing name', 'Give your event a name.');
      return;
    }
    if (step === 'court' && !selectedCourt) {
      Alert.alert('Select a court', 'Choose where the event will be held.');
      return;
    }
    const nextIdx = stepIndex + 1;
    if (nextIdx < STEPS.length) setStep(STEPS[nextIdx]);
  }

  function prevStep() {
    const prevIdx = stepIndex - 1;
    if (prevIdx >= 0) setStep(STEPS[prevIdx]);
  }

  async function handleSubmit() {
    if (!user || !selectedCourt) return;
    setSaving(true);

    // Use the native date picker value
    const startsAt = eventDate.toISOString();

    const { data, error } = await supabase
      .from('events')
      .insert({
        name: name.trim(),
        format,
        court_id: selectedCourt.id,
        host_id: user.id,
        skill_min: parseFloat(skillMin) || null,
        skill_max: parseFloat(skillMax) || null,
        starts_at: startsAt,
        max_players: parseInt(maxPlayers, 10) || 8,
        visibility,
        description: description.trim() || null,
        status: 'open',
      })
      .select()
      .single();

    if (error) {
      setSaving(false);
      Alert.alert('Error', error.message);
      return;
    }

    // Auto-RSVP the host
    if (data) {
      await supabase.from('event_rsvps').insert({
        event_id: data.id,
        user_id: user.id,
        status: 'going',
      });

      // Auto-create a group chat for the event
      const { data: chat } = await supabase
        .from('chats')
        .insert({
          type: 'event',
          name: name.trim(),
          event_id: data.id,
          created_by: user.id,
        })
        .select()
        .single();

      if (chat) {
        // Add host as chat member
        await supabase.from('chat_members').insert({
          chat_id: chat.id,
          user_id: user.id,
          role: 'owner',
        });

        // Link chat to event
        await supabase
          .from('events')
          .update({ group_chat_id: chat.id })
          .eq('id', data.id);
      }
    }

    setSaving(false);
    track('event.created');
    Alert.alert('Event created! 🎉', 'Your event is live and a group chat has been created.', [
      { text: 'View event', onPress: () => router.replace(`/event/${data?.id}` as never) },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 }}>
        <Pressable onPress={stepIndex > 0 ? prevStep : () => router.back()}>
          {stepIndex > 0 ? (
            <Text style={{ fontSize: 14, color: c.textMuted }}>← Back</Text>
          ) : (
            <X size={22} color={c.text} />
          )}
        </Pressable>
        <Text style={{ flex: 1, textAlign: 'center', fontWeight: '700', fontSize: 16, color: c.text }}>
          New event
        </Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Progress */}
      <View style={{ paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 12, color: c.textMuted }}>
          Step {stepIndex + 1} of {STEPS.length} · {STEP_LABELS[step]}
        </Text>
        <View style={{ height: 4, backgroundColor: c.surface2, borderRadius: 2, overflow: 'hidden', marginTop: 4 }}>
          <View style={{ height: '100%', width: `${progress}%`, backgroundColor: primary, borderRadius: 2 }} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        {/* Step 1: Basics */}
        {step === 'basics' && (
          <>
            <Input label="Event name" placeholder="Saturday morning doubles" value={name} onChangeText={setName} />
            <Text style={{ fontSize: 12, fontWeight: '500', color: c.textMuted, marginTop: 4 }}>Format</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['doubles', 'singles', 'mixed'] as Format[]).map((f) => (
                <Pressable
                  key={f}
                  onPress={() => setFormat(f)}
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    borderRadius: 18,
                    backgroundColor: format === f ? primary : c.surface2,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '600', color: format === f ? colors.brand.limeDark : c.textMuted }}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Input label="Description (optional)" placeholder="What players should know…" value={description} onChangeText={setDescription} multiline />
          </>
        )}

        {/* Step 2: Court */}
        {step === 'court' && (
          <>
            <Text style={{ fontSize: 18, fontWeight: '700', color: c.text }}>Choose a court</Text>
            {courts?.map((court) => (
              <Pressable key={court.id} onPress={() => setSelectedCourt(court)}>
                <Card
                  variant={selectedCourt?.id === court.id ? 'tint-green' : 'surface'}
                  style={{ marginTop: 4 }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <MapPin size={16} color={selectedCourt?.id === court.id ? primary : c.textMuted} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: c.text }}>{court.name}</Text>
                      <Text style={{ fontSize: 12, color: c.textMuted }}>
                        {court.court_count} {court.court_type} · {court.fee_type === 'free' ? 'Free' : court.fee_type}
                      </Text>
                    </View>
                    {selectedCourt?.id === court.id && (
                      <Text style={{ fontSize: 16, color: primary }}>✓</Text>
                    )}
                  </View>
                </Card>
              </Pressable>
            ))}
          </>
        )}

        {/* Step 3: Skill range */}
        {step === 'skill' && (
          <>
            <Text style={{ fontSize: 18, fontWeight: '700', color: c.text }}>Skill range</Text>
            <Text style={{ fontSize: 13, color: c.textMuted }}>Set the DUPR range to attract the right players.</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Input label="Min" placeholder="3.0" value={skillMin} onChangeText={setSkillMin} keyboardType="decimal-pad" />
              </View>
              <View style={{ flex: 1 }}>
                <Input label="Max" placeholder="3.5" value={skillMax} onChangeText={setSkillMax} keyboardType="decimal-pad" />
              </View>
            </View>
            <Input label="Max players" placeholder="8" value={maxPlayers} onChangeText={setMaxPlayers} keyboardType="number-pad" />
          </>
        )}

        {/* Step 4: Date & time — native pickers */}
        {step === 'datetime' && (
          <>
            <Text style={{ fontSize: 18, fontWeight: '700', color: c.text }}>When?</Text>

            {/* Date picker */}
            <Pressable onPress={() => setShowDatePicker(true)}>
              <Card>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: `${primary}22`,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Calendar size={18} color={primary} />
                  </View>
                  <View>
                    <Text style={{ fontSize: 11, color: c.textMuted }}>Date</Text>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: c.text }}>
                      {format(eventDate, 'EEEE, MMM d, yyyy')}
                    </Text>
                  </View>
                </View>
              </Card>
            </Pressable>

            {/* Time picker */}
            <Pressable onPress={() => setShowTimePicker(true)}>
              <Card style={{ marginTop: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: `${colors.brand.blue}22`,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Clock size={18} color={colors.brand.blue} />
                  </View>
                  <View>
                    <Text style={{ fontSize: 11, color: c.textMuted }}>Time</Text>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: c.text }}>
                      {format(eventDate, 'h:mm a')}
                    </Text>
                  </View>
                </View>
              </Card>
            </Pressable>

            {/* Native pickers */}
            {showDatePicker && (
              <DateTimePicker
                value={eventDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={new Date()}
                onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    const merged = new Date(eventDate);
                    merged.setFullYear(selectedDate.getFullYear());
                    merged.setMonth(selectedDate.getMonth());
                    merged.setDate(selectedDate.getDate());
                    setEventDate(merged);
                  }
                }}
                themeVariant={scheme}
              />
            )}
            {showTimePicker && (
              <DateTimePicker
                value={eventDate}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minuteInterval={15}
                onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                  setShowTimePicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    const merged = new Date(eventDate);
                    merged.setHours(selectedDate.getHours());
                    merged.setMinutes(selectedDate.getMinutes());
                    setEventDate(merged);
                  }
                }}
                themeVariant={scheme}
              />
            )}
          </>
        )}

        {/* Step 5: Visibility */}
        {step === 'visibility' && (
          <>
            <Text style={{ fontSize: 18, fontWeight: '700', color: c.text }}>Who can see this?</Text>
            {([
              { key: 'public' as Visibility, label: 'Public', desc: 'Anyone in the area can find and join' },
              { key: 'invite_only' as Visibility, label: 'Invite only', desc: 'Only people you invite can see it' },
            ]).map((opt) => (
              <Pressable key={opt.key} onPress={() => setVisibility(opt.key)}>
                <Card variant={visibility === opt.key ? 'tint-green' : 'surface'} style={{ marginTop: 4 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: c.text }}>{opt.label}</Text>
                      <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }}>{opt.desc}</Text>
                    </View>
                    {visibility === opt.key && <Text style={{ fontSize: 16, color: primary }}>✓</Text>}
                  </View>
                </Card>
              </Pressable>
            ))}
          </>
        )}

        {/* Navigation */}
        <View style={{ marginTop: 16 }}>
          {step === 'visibility' ? (
            <Button label={saving ? 'Creating…' : 'Create event'} loading={saving} onPress={handleSubmit} />
          ) : (
            <Button label={`Continue → ${STEP_LABELS[STEPS[stepIndex + 1]]}`} onPress={nextStep} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

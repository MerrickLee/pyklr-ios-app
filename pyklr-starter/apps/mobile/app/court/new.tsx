import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Check, MapPin, Camera, X, ImagePlus } from 'lucide-react-native';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/theme/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { uploadCourtPhoto, type UploadResult } from '@/lib/storage';
import { colors } from '@/theme/tokens';
import { COURT_AMENITIES } from '@pyklr/shared/constants/app';
import { track } from '@/lib/analytics';

type Step = 'location' | 'details' | 'photos';
type CourtType = 'outdoor' | 'indoor' | 'mixed';
type Surface = 'asphalt' | 'concrete' | 'wood' | 'turf' | 'other';
type FeeType = 'free' | 'paid' | 'members_only';

const STEP_ORDER: Step[] = ['location', 'details', 'photos'];

export default function NewCourtScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { scheme, colors: c } = useTheme();
  const primary = scheme === 'dark' ? colors.brand.lime : colors.brand.green;

  const [step, setStep] = useState<Step>('location');
  const [saving, setSaving] = useState(false);
  const [photos, setPhotos] = useState<UploadResult[]>([]);
  const [uploading, setUploading] = useState(false);

  // Location
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  // Details
  const [courtCount, setCourtCount] = useState('');
  const [courtType, setCourtType] = useState<CourtType>('outdoor');
  const [surface, setSurface] = useState<Surface>('asphalt');
  const [feeType, setFeeType] = useState<FeeType>('free');
  const [amenities, setAmenities] = useState<Set<string>>(new Set());

  const stepIndex = STEP_ORDER.indexOf(step);
  const progress = ((stepIndex + 1) / STEP_ORDER.length) * 100;

  function toggleAmenity(a: string) {
    setAmenities((prev) => {
      const next = new Set(prev);
      if (next.has(a)) next.delete(a);
      else next.add(a);
      return next;
    });
  }

  function nextStep() {
    if (step === 'location') {
      if (!name.trim()) {
        Alert.alert('Missing name', 'Please enter a court name.');
        return;
      }
      setStep('details');
    } else if (step === 'details') {
      setStep('photos');
    }
  }

  function prevStep() {
    if (step === 'details') setStep('location');
    else if (step === 'photos') setStep('details');
  }

  async function handleSubmit() {
    if (!user) {
      Alert.alert('Not signed in', 'Please sign in to submit a court.');
      return;
    }
    setSaving(true);
    const { error, data } = await supabase.from('courts').insert({
      name: name.trim(),
      address: address.trim() || null,
      lat: parseFloat(lat) || 0,
      lng: parseFloat(lng) || 0,
      court_count: parseInt(courtCount, 10) || 2,
      court_type: courtType,
      surface,
      fee_type: feeType,
      amenities: Array.from(amenities),
      photos: photos.map((p) => p.publicUrl),
      submitted_by: user.id,
      status: 'pending',
    })
    .select()
    .single();
    setSaving(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      track('court.submitted');
      Alert.alert('Submitted!', 'Your court will be reviewed by a moderator.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 12,
        }}
      >
        <Pressable onPress={stepIndex > 0 ? prevStep : () => router.back()}>
          <ChevronLeft size={22} color={c.text} />
        </Pressable>
        <Text style={{ flex: 1, textAlign: 'center', fontWeight: '700', fontSize: 16, color: c.text }}>
          Add a court
        </Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Progress */}
      <View style={{ paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 12, color: c.textMuted }}>
          Step {stepIndex + 1} of {STEP_ORDER.length}
        </Text>
        <View
          style={{
            height: 4,
            backgroundColor: c.surface2,
            borderRadius: 2,
            overflow: 'hidden',
            marginTop: 4,
          }}
        >
          <View style={{ height: '100%', width: `${progress}%`, backgroundColor: primary }} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }} keyboardShouldPersistTaps="handled">
        {step === 'location' && (
          <>
            <Text style={{ fontSize: 24, fontWeight: '700', color: c.text, lineHeight: 30 }}>
              Where is{'\n'}the court?
            </Text>
            <Input
              label="Court name"
              placeholder="e.g. Flowers Park Courts"
              value={name}
              onChangeText={setName}
            />
            <Input
              label="Address"
              placeholder="123 Main St, City, State"
              value={address}
              onChangeText={setAddress}
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Latitude"
                  placeholder="40.9059"
                  value={lat}
                  onChangeText={setLat}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Longitude"
                  placeholder="-73.7843"
                  value={lng}
                  onChangeText={setLng}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
            <Text style={{ fontSize: 11, color: c.textFaint, marginTop: 4 }}>
              Tip: Long-press on Google Maps to copy coordinates.
            </Text>
          </>
        )}

        {step === 'details' && (
          <>
            <Text style={{ fontSize: 24, fontWeight: '700', color: c.text, lineHeight: 30 }}>
              Court{'\n'}details
            </Text>
            <Input
              label="Number of courts"
              placeholder="e.g. 4"
              value={courtCount}
              onChangeText={setCourtCount}
              keyboardType="number-pad"
            />

            <Text style={{ fontSize: 12, fontWeight: '500', color: c.textMuted, marginTop: 4 }}>Type</Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {(['outdoor', 'indoor', 'mixed'] as CourtType[]).map((t) => (
                <Chip key={t} label={t.charAt(0).toUpperCase() + t.slice(1)} active={courtType === t} onPress={() => setCourtType(t)} />
              ))}
            </View>

            <Text style={{ fontSize: 12, fontWeight: '500', color: c.textMuted, marginTop: 4 }}>Surface</Text>
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
              {(['asphalt', 'concrete', 'wood', 'turf', 'other'] as Surface[]).map((s) => (
                <Chip key={s} label={s.charAt(0).toUpperCase() + s.slice(1)} active={surface === s} onPress={() => setSurface(s)} />
              ))}
            </View>

            <Text style={{ fontSize: 12, fontWeight: '500', color: c.textMuted, marginTop: 4 }}>Fee</Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {[
                { key: 'free' as FeeType, label: 'Free' },
                { key: 'paid' as FeeType, label: 'Paid' },
                { key: 'members_only' as FeeType, label: 'Members' },
              ].map((f) => (
                <Chip key={f.key} label={f.label} active={feeType === f.key} onPress={() => setFeeType(f.key)} />
              ))}
            </View>

            <Text style={{ fontSize: 12, fontWeight: '500', color: c.textMuted, marginTop: 4 }}>Amenities</Text>
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
              {COURT_AMENITIES.map((a) => (
                <Chip
                  key={a}
                  label={a.charAt(0).toUpperCase() + a.slice(1).replace('_', ' ')}
                  active={amenities.has(a)}
                  onPress={() => toggleAmenity(a)}
                />
              ))}
            </View>
          </>
        )}

        {step === 'photos' && (
          <>
            <Text style={{ fontSize: 24, fontWeight: '700', color: c.text, lineHeight: 30 }}>
              Add{'\n'}photos
            </Text>
            <Text style={{ fontSize: 13, color: c.textMuted, lineHeight: 19 }}>
              Photos help other players know what to expect. You can add up to 4 photos.
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
              {/* Uploaded photos */}
              {photos.map((photo, idx) => (
                <View
                  key={photo.path}
                  style={{
                    width: '47%',
                    aspectRatio: 4 / 3,
                    borderRadius: 14,
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <Image
                    source={{ uri: photo.publicUrl }}
                    style={{ width: '100%', height: '100%' }}
                  />
                  <Pressable
                    onPress={() => setPhotos((prev) => prev.filter((_, i) => i !== idx))}
                    style={{
                      position: 'absolute',
                      top: 6,
                      right: 6,
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <X size={14} color="#FFF" />
                  </Pressable>
                </View>
              ))}

              {/* Add photo buttons (camera + library) */}
              {photos.length < 4 && (
                <>
                  <Pressable
                    onPress={async () => {
                      setUploading(true);
                      const result = await uploadCourtPhoto('temp-' + Date.now(), 'library');
                      if (result) setPhotos((prev) => [...prev, result]);
                      setUploading(false);
                    }}
                    style={{
                      width: '47%',
                      aspectRatio: 4 / 3,
                      borderRadius: 14,
                      backgroundColor: c.surface2,
                      borderWidth: 1.5,
                      borderColor: c.border,
                      borderStyle: 'dashed',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                    }}
                  >
                    <ImagePlus size={20} color={c.textFaint} />
                    <Text style={{ fontSize: 10, color: c.textFaint }}>Gallery</Text>
                  </Pressable>
                  <Pressable
                    onPress={async () => {
                      setUploading(true);
                      const result = await uploadCourtPhoto('temp-' + Date.now(), 'camera');
                      if (result) setPhotos((prev) => [...prev, result]);
                      setUploading(false);
                    }}
                    style={{
                      width: '47%',
                      aspectRatio: 4 / 3,
                      borderRadius: 14,
                      backgroundColor: c.surface2,
                      borderWidth: 1.5,
                      borderColor: c.border,
                      borderStyle: 'dashed',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                    }}
                  >
                    <Camera size={20} color={c.textFaint} />
                    <Text style={{ fontSize: 10, color: c.textFaint }}>Camera</Text>
                  </Pressable>
                </>
              )}
            </View>
            {uploading && (
              <Text style={{ fontSize: 12, color: primary, textAlign: 'center', marginTop: 8 }}>
                Uploading…
              </Text>
            )}
            <Text style={{ fontSize: 11, color: c.textFaint, textAlign: 'center', marginTop: 4 }}>
              {photos.length}/4 photos added{photos.length === 0 ? ' (optional)' : ''}
            </Text>
          </>
        )}

        {/* Navigation buttons */}
        <View style={{ marginTop: 16 }}>
          {step === 'photos' ? (
            <Button
              label={saving ? 'Submitting…' : 'Submit court'}
              loading={saving}
              onPress={handleSubmit}
            />
          ) : (
            <Button label="Continue" onPress={nextStep} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

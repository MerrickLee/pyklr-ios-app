import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/theme/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { colors } from '@/theme/tokens';
import { track } from '@/lib/analytics';

type ForumTag = 'gear' | 'strategy' | 'courts' | 'general';

const TAGS: { key: ForumTag; label: string }[] = [
  { key: 'gear', label: '🎾 Gear' },
  { key: 'strategy', label: '🧠 Strategy' },
  { key: 'courts', label: '📍 Courts' },
  { key: 'general', label: '💬 General' },
];

export default function NewForumPostScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { scheme, colors: c } = useTheme();
  const primary = scheme === 'dark' ? colors.brand.lime : colors.brand.green;

  const [tag, setTag] = useState<ForumTag>('general');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!user) {
      Alert.alert('Not signed in', 'Please sign in to post.');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Missing title', 'Give your post a title.');
      return;
    }

    setSubmitting(true);
    const { data, error } = await supabase
      .from('forum_posts')
      .insert({
        author_id: user.id,
        tag,
        title: title.trim(),
        body: body.trim() || null,
        status: 'published',
        upvotes: 0,
        comment_count: 0,
      })
      .select()
      .single();

    setSubmitting(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      track('forum.post_created');
      Alert.alert('Posted! 🎉', 'Your post is now live in the community.', [
        { text: 'View', onPress: () => router.replace(`/p/${data?.id}` as never) },
      ]);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 12,
        }}
      >
        <Pressable onPress={() => router.back()}>
          <X size={22} color={c.text} />
        </Pressable>
        <Text
          style={{
            flex: 1,
            textAlign: 'center',
            fontWeight: '700',
            fontSize: 16,
            color: c.text,
          }}
        >
          New post
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ fontSize: 22, fontWeight: '700', color: c.text }}>
          Share with the community
        </Text>

        {/* Tag selection */}
        <View>
          <Text style={{ fontSize: 12, fontWeight: '500', color: c.textMuted, marginBottom: 8 }}>
            Choose a tag
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {TAGS.map((t) => (
              <Chip
                key={t.key}
                label={t.label}
                active={tag === t.key}
                onPress={() => setTag(t.key)}
              />
            ))}
          </View>
        </View>

        {/* Title */}
        <Input
          label="Title"
          placeholder="What's on your mind?"
          value={title}
          onChangeText={setTitle}
        />

        {/* Body */}
        <View>
          <Text style={{ fontSize: 12, fontWeight: '500', color: c.textMuted, marginBottom: 4 }}>
            Body (optional)
          </Text>
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="Share details, ask a question, or start a discussion…"
            placeholderTextColor={c.textFaint}
            multiline
            textAlignVertical="top"
            style={{
              backgroundColor: c.surface2,
              borderRadius: 14,
              padding: 16,
              minHeight: 140,
              fontSize: 14,
              color: c.text,
              lineHeight: 20,
            }}
          />
        </View>

        <Button
          label={submitting ? 'Posting…' : 'Post'}
          loading={submitting}
          onPress={handleSubmit}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

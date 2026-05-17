import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, ArrowUp, ArrowDown, Send } from 'lucide-react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Skeleton, EmptyState } from '@/components/ui/Skeleton';
import { useTheme } from '@/theme/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { colors } from '@/theme/tokens';
import type { Database } from '@pyklr/shared/types/database';

type ForumPost = Database['public']['Tables']['forum_posts']['Row'];
type ForumComment = Database['public']['Tables']['forum_comments']['Row'];

export default function ForumPostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { scheme, colors: c } = useTheme();
  const primary = scheme === 'dark' ? colors.brand.lime : colors.brand.green;

  const [commentBody, setCommentBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: post, isLoading: postLoading } = useQuery({
    queryKey: ['forum-post', id],
    queryFn: async (): Promise<ForumPost | null> => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('forum_posts')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!id,
  });

  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ['forum-comments', id],
    queryFn: async (): Promise<(ForumComment & { author_name?: string })[]> => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('forum_comments')
        .select('*, profiles!inner(display_name, username)')
        .eq('post_id', id)
        .order('created_at', { ascending: true });
      if (error) return [];
      return (data ?? []).map((comment) => {
        const profile = (comment as unknown as {
          profiles: { display_name: string | null; username: string };
        }).profiles;
        return {
          ...comment,
          author_name: profile?.display_name ?? profile?.username ?? 'Unknown',
        };
      });
    },
    enabled: !!id,
  });

  async function submitComment() {
    if (!user || !id || !commentBody.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from('forum_comments').insert({
      post_id: id,
      author_id: user.id,
      body: commentBody.trim(),
    });
    setSubmitting(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setCommentBody('');
      queryClient.invalidateQueries({ queryKey: ['forum-comments', id] });
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 }}>
        <Pressable onPress={() => router.back()}>
          <ChevronLeft size={22} color={c.text} />
        </Pressable>
        <Text style={{ flex: 1, textAlign: 'center', fontWeight: '700', fontSize: 16, color: c.text }}>
          Post
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>
        {postLoading ? (
          <View style={{ gap: 8 }}>
            <Skeleton width="80%" height={18} />
            <Skeleton width="60%" height={12} />
            <Skeleton width="100%" height={60} />
          </View>
        ) : post ? (
          <>
            {/* Post */}
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 999,
                backgroundColor: `${primary}22`,
                alignSelf: 'flex-start',
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '600', color: primary }}>
                {post.tag.charAt(0).toUpperCase() + post.tag.slice(1)}
              </Text>
            </View>
            <Text style={{ fontSize: 20, fontWeight: '700', color: c.text }}>{post.title}</Text>
            <Text style={{ fontSize: 11, color: c.textMuted, marginTop: 4 }}>
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </Text>
            {post.body && (
              <Text style={{ fontSize: 14, color: c.text, lineHeight: 21, marginTop: 12 }}>
                {post.body}
              </Text>
            )}

            {/* Vote bar */}
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 16, paddingBottom: 16, borderBottomWidth: 0.5, borderBottomColor: c.border }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Pressable><ArrowUp size={18} color={primary} /></Pressable>
                <Text style={{ fontSize: 14, fontWeight: '600', color: c.text }}>{post.upvotes}</Text>
                <Pressable><ArrowDown size={18} color={c.textMuted} /></Pressable>
              </View>
              <Text style={{ fontSize: 13, color: c.textMuted }}>
                {post.comment_count} comment{post.comment_count !== 1 ? 's' : ''}
              </Text>
            </View>

            {/* Comments */}
            <Text style={{ fontSize: 14, fontWeight: '700', color: c.text, marginTop: 16 }}>
              Comments
            </Text>
            {commentsLoading ? (
              <View style={{ gap: 8, marginTop: 8 }}>
                <Skeleton width="100%" height={40} />
                <Skeleton width="100%" height={40} />
              </View>
            ) : comments && comments.length > 0 ? (
              comments.map((comment) => (
                <Card key={comment.id} style={{ marginTop: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Avatar size={20} />
                    <Text style={{ fontSize: 11, fontWeight: '500', color: c.textMuted }}>
                      {comment.author_name} · {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 13, color: c.text, lineHeight: 19 }}>{comment.body}</Text>
                </Card>
              ))
            ) : (
              <Text style={{ fontSize: 13, color: c.textMuted, marginTop: 8 }}>
                No comments yet. Be the first!
              </Text>
            )}
          </>
        ) : (
          <EmptyState title="Post not found" subtitle="This post may have been removed." ctaLabel="Go back" onCta={() => router.back()} />
        )}
      </ScrollView>

      {/* Comment input */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderTopWidth: 0.5,
          borderTopColor: c.border,
          backgroundColor: c.bg,
        }}
      >
        <TextInput
          value={commentBody}
          onChangeText={setCommentBody}
          placeholder="Add a comment…"
          placeholderTextColor={c.textFaint}
          style={{
            flex: 1,
            backgroundColor: c.surface2,
            borderRadius: 18,
            paddingHorizontal: 14,
            paddingVertical: 10,
            fontSize: 14,
            color: c.text,
          }}
        />
        <Pressable
          onPress={submitComment}
          disabled={!commentBody.trim() || submitting}
          style={{
            width: 40,
            height: 40,
            borderRadius: 14,
            backgroundColor: primary,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: commentBody.trim() ? 1 : 0.4,
          }}
        >
          <Send size={16} color={colors.brand.limeDark} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

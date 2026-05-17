import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, ArrowUp, MessageCircle } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import { SkeletonCard, EmptyState } from '@/components/ui/Skeleton';
import { useTheme } from '@/theme/useTheme';
import { supabase } from '@/lib/supabase';
import { colors } from '@/theme/tokens';
import type { Database } from '@pyklr/shared/types/database';

type ForumPost = Database['public']['Tables']['forum_posts']['Row'];
type ForumTag = ForumPost['tag'] | 'all';

function PostCard({ post, onPress }: { post: ForumPost; onPress: () => void }) {
  const { scheme, colors: c } = useTheme();
  const primary = scheme === 'dark' ? colors.brand.lime : colors.brand.green;
  const isHot = post.upvotes >= 50;

  return (
    <Pressable onPress={onPress}>
      <Card style={{ marginTop: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Avatar size={24} />
          <Text style={{ fontSize: 10, color: c.textMuted }}>
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </Text>
          <View style={{ marginLeft: 'auto' }}>
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 999,
                backgroundColor: `${primary}22`,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '600', color: primary }}>
                {post.tag.charAt(0).toUpperCase() + post.tag.slice(1)}
              </Text>
            </View>
          </View>
        </View>
        <Text style={{ fontSize: 14, fontWeight: '600', color: c.text }}>{post.title}</Text>
        {post.body && (
          <Text
            style={{ fontSize: 12, color: c.textMuted, marginTop: 4 }}
            numberOfLines={2}
          >
            {post.body}
          </Text>
        )}
        <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <ArrowUp
              size={12}
              color={isHot ? primary : c.textMuted}
              strokeWidth={isHot ? 2.5 : 2}
            />
            <Text
              style={{
                fontSize: 12,
                fontWeight: isHot ? '600' : '400',
                color: isHot ? primary : c.textMuted,
              }}
            >
              {post.upvotes}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <MessageCircle size={12} color={c.textMuted} />
            <Text style={{ fontSize: 12, color: c.textMuted }}>{post.comment_count}</Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

export default function CommunityScreen() {
  const router = useRouter();
  const { scheme, colors: c } = useTheme();
  const primary = scheme === 'dark' ? colors.brand.lime : colors.brand.green;

  const [activeTag, setActiveTag] = useState<ForumTag>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: posts, isLoading } = useQuery({
    queryKey: ['forum-posts', activeTag],
    queryFn: async (): Promise<ForumPost[]> => {
      let query = supabase
        .from('forum_posts')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(30);

      if (activeTag !== 'all') {
        query = query.eq('tag', activeTag);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });

  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    if (!searchQuery.trim()) return posts;
    const q = searchQuery.toLowerCase();
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.body?.toLowerCase().includes(q)
    );
  }, [posts, searchQuery]);

  const tags: { key: ForumTag; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'gear', label: '🎾 Gear' },
    { key: 'strategy', label: '🧠 Strategy' },
    { key: 'courts', label: '📍 Courts' },
    { key: 'general', label: '💬 General' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingTop: 8,
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: '700', color: c.text }}>Community</Text>
        <Pressable>
          <Search size={20} color={c.textMuted} />
        </Pressable>
      </View>

      {/* Tag filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 6, marginTop: 10 }}
      >
        {tags.map((t) => (
          <Chip
            key={t.key}
            label={t.label}
            active={activeTag === t.key}
            onPress={() => setActiveTag(t.key)}
          />
        ))}
      </ScrollView>

      {/* Posts */}
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100, paddingTop: 4 }}>
        {isLoading ? (
          <>
            <SkeletonCard height={100} />
            <SkeletonCard height={100} />
            <SkeletonCard height={100} />
          </>
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onPress={() => router.push(`/p/${post.id}` as never)}
            />
          ))
        ) : (
          <EmptyState
            title="No posts yet"
            subtitle="Be the first to start a conversation in the community!"
            ctaLabel="New post"
            onCta={() => router.push('/forum/new' as never)}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

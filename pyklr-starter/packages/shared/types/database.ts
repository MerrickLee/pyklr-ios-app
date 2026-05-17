// ============================================================
// PYKLR — Supabase database types
// ============================================================
// This file is a STARTER STUB. Once you have your Supabase project
// running with the migrations applied, regenerate it with:
//
//   pnpm db:gen-types
//
// which runs `supabase gen types typescript --linked` against your
// linked project and writes the real types here.
//
// Until then, this hand-written stub lets the rest of the codebase
// compile. The shape matches the migration in
// packages/supabase/migrations/00000_init.sql.
// ============================================================

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          bio: string | null;
          avatar_url: string | null;
          cover_url: string | null;
          location_city: string | null;
          location_lat: number | null;
          location_lng: number | null;
          dupr_rating: number | null;
          dupr_verified: boolean;
          dupr_synced_at: string | null;
          self_rating: number | null;
          play_styles: string[];
          availability: string[];
          visibility: 'public' | 'followers' | 'private';
          dm_permission: 'anyone' | 'followers' | 'nobody';
          available_to_match: boolean;
          hide_rating: boolean;
          survey_completed: boolean;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { id: string; username: string };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
      follows: {
        Row: { follower_id: string; followed_id: string; created_at: string };
        Insert: { follower_id: string; followed_id: string; created_at?: string };
        Update: Partial<{ follower_id: string; followed_id: string }>;
      };
      blocks: {
        Row: { blocker_id: string; blocked_id: string; created_at: string };
        Insert: { blocker_id: string; blocked_id: string; created_at?: string };
        Update: Partial<{ blocker_id: string; blocked_id: string }>;
      };
      courts: {
        Row: {
          id: string;
          name: string;
          address: string | null;
          lat: number;
          lng: number;
          court_count: number;
          court_type: 'outdoor' | 'indoor' | 'mixed';
          surface: 'asphalt' | 'concrete' | 'wood' | 'turf' | 'other';
          fee_type: 'free' | 'paid' | 'members_only';
          fee_amount: number | null;
          amenities: string[];
          hours: Json | null;
          photos: string[];
          status: 'pending' | 'verified' | 'closed' | 'flagged';
          submitted_by: string | null;
          verified_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['courts']['Row']> & { name: string; lat: number; lng: number };
        Update: Partial<Database['public']['Tables']['courts']['Row']>;
      };
      events: {
        Row: {
          id: string;
          name: string;
          format: 'singles' | 'doubles' | 'mixed';
          court_id: string;
          host_id: string;
          skill_min: number | null;
          skill_max: number | null;
          starts_at: string;
          ends_at: string | null;
          max_players: number;
          visibility: 'public' | 'invite_only';
          description: string | null;
          status: 'open' | 'full' | 'cancelled' | 'completed';
          group_chat_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['events']['Row']> & {
          name: string;
          court_id: string;
          host_id: string;
          starts_at: string;
        };
        Update: Partial<Database['public']['Tables']['events']['Row']>;
      };
      event_rsvps: {
        Row: { event_id: string; user_id: string; status: 'going' | 'maybe' | 'declined'; created_at: string };
        Insert: { event_id: string; user_id: string; status?: 'going' | 'maybe' | 'declined' };
        Update: Partial<{ status: 'going' | 'maybe' | 'declined' }>;
      };
      chats: {
        Row: {
          id: string;
          type: 'dm' | 'group' | 'event';
          name: string | null;
          avatar_url: string | null;
          event_id: string | null;
          created_by: string | null;
          last_message_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['chats']['Row']> & { type: 'dm' | 'group' | 'event' };
        Update: Partial<Database['public']['Tables']['chats']['Row']>;
      };
      chat_members: {
        Row: {
          chat_id: string;
          user_id: string;
          role: 'owner' | 'admin' | 'member';
          joined_at: string;
          last_read_at: string | null;
        };
        Insert: { chat_id: string; user_id: string; role?: 'owner' | 'admin' | 'member' };
        Update: Partial<Database['public']['Tables']['chat_members']['Row']>;
      };
      chat_user_mutes: {
        Row: { chat_id: string; muter_id: string; muted_id: string; created_at: string };
        Insert: { chat_id: string; muter_id: string; muted_id: string };
        Update: never;
      };
      messages: {
        Row: {
          id: string;
          chat_id: string;
          sender_id: string | null;
          body: string | null;
          attachments: Json | null;
          reply_to: string | null;
          is_suggestion: boolean;
          suggestion_payload: Json | null;
          created_at: string;
          edited_at: string | null;
          deleted_at: string | null;
        };
        Insert: { chat_id: string; sender_id?: string | null; body?: string | null } & Partial<
          Database['public']['Tables']['messages']['Row']
        >;
        Update: Partial<Database['public']['Tables']['messages']['Row']>;
      };
      message_reactions: {
        Row: { message_id: string; user_id: string; emoji: string; created_at: string };
        Insert: { message_id: string; user_id: string; emoji: string };
        Update: never;
      };
      forum_posts: {
        Row: {
          id: string;
          author_id: string;
          title: string;
          body: string | null;
          tag: 'gear' | 'strategy' | 'courts' | 'general';
          image_url: string | null;
          upvotes: number;
          downvotes: number;
          comment_count: number;
          status: 'published' | 'flagged' | 'removed';
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['forum_posts']['Row']> & {
          author_id: string;
          title: string;
        };
        Update: Partial<Database['public']['Tables']['forum_posts']['Row']>;
      };
      forum_comments: {
        Row: {
          id: string;
          post_id: string;
          author_id: string;
          body: string;
          parent_comment_id: string | null;
          upvotes: number;
          downvotes: number;
          created_at: string;
        };
        Insert: {
          post_id: string;
          author_id: string;
          body: string;
          parent_comment_id?: string | null;
        };
        Update: Partial<Database['public']['Tables']['forum_comments']['Row']>;
      };
      forum_votes: {
        Row: { user_id: string; target_type: 'post' | 'comment'; target_id: string; vote: 1 | -1; created_at: string };
        Insert: { user_id: string; target_type: 'post' | 'comment'; target_id: string; vote: 1 | -1 };
        Update: { vote: 1 | -1 };
      };
      forum_saves: {
        Row: { user_id: string; post_id: string; created_at: string };
        Insert: { user_id: string; post_id: string };
        Update: never;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type:
            | 'dm'
            | 'group_mention'
            | 'event_invite'
            | 'event_rsvp'
            | 'follow'
            | 'comment_reply'
            | 'forum_upvote'
            | 'smart_suggestion';
          title: string | null;
          body: string | null;
          action_url: string | null;
          read: boolean;
          actor_id: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['notifications']['Row']> & {
          user_id: string;
          type: Database['public']['Tables']['notifications']['Row']['type'];
        };
        Update: Partial<Database['public']['Tables']['notifications']['Row']>;
      };
      push_tokens: {
        Row: { user_id: string; token: string; platform: 'ios' | 'android'; created_at: string; last_used_at: string };
        Insert: { user_id: string; token: string; platform: 'ios' | 'android' };
        Update: { last_used_at?: string };
      };
      notification_preferences: {
        Row: {
          user_id: string;
          push_dm: boolean;
          push_group_mention: boolean;
          push_event_invite: boolean;
          push_event_rsvp: boolean;
          push_follow: boolean;
          push_comment_reply: boolean;
          push_forum_activity: boolean;
          push_smart_suggestion: boolean;
          email_digest: 'never' | 'daily' | 'weekly';
        };
        Insert: { user_id: string } & Partial<Database['public']['Tables']['notification_preferences']['Row']>;
        Update: Partial<Database['public']['Tables']['notification_preferences']['Row']>;
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          target_type: 'user' | 'message' | 'post' | 'comment' | 'court' | 'event';
          target_id: string;
          reason: 'spam' | 'harassment' | 'inappropriate' | 'safety' | 'other';
          description: string | null;
          status: 'open' | 'reviewing' | 'actioned' | 'dismissed';
          resolved_by: string | null;
          resolved_at: string | null;
          created_at: string;
        };
        Insert: {
          reporter_id: string;
          target_type: Database['public']['Tables']['reports']['Row']['target_type'];
          target_id: string;
          reason: Database['public']['Tables']['reports']['Row']['reason'];
          description?: string | null;
        };
        Update: Partial<Database['public']['Tables']['reports']['Row']>;
      };
      referrals: {
        Row: {
          id: string;
          referrer_id: string;
          code: string;
          referred_user_id: string | null;
          created_at: string;
          claimed_at: string | null;
        };
        Insert: { referrer_id: string; code: string };
        Update: Partial<Database['public']['Tables']['referrals']['Row']>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      not_blocked: { Args: { other_user: string }; Returns: boolean };
      is_following: { Args: { target: string }; Returns: boolean };
      is_chat_member: { Args: { target_chat: string }; Returns: boolean };
    };
    Enums: Record<string, never>;
  };
}

-- ============================================================
-- PYKLR — Initial schema
-- ============================================================
-- This migration creates every table referenced in the README.
-- RLS policies are in 00001_rls.sql; triggers/functions in 00002_functions.sql.
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";  -- For geospatial queries on courts

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE profile_visibility AS ENUM ('public', 'followers', 'private');
CREATE TYPE dm_permission AS ENUM ('anyone', 'followers', 'nobody');

CREATE TYPE court_type AS ENUM ('outdoor', 'indoor', 'mixed');
CREATE TYPE court_surface AS ENUM ('asphalt', 'concrete', 'wood', 'turf', 'other');
CREATE TYPE court_fee_type AS ENUM ('free', 'paid', 'members_only');
CREATE TYPE court_status AS ENUM ('pending', 'verified', 'closed', 'flagged');

CREATE TYPE event_format AS ENUM ('singles', 'doubles', 'mixed');
CREATE TYPE event_visibility AS ENUM ('public', 'invite_only');
CREATE TYPE event_status AS ENUM ('open', 'full', 'cancelled', 'completed');
CREATE TYPE rsvp_status AS ENUM ('going', 'maybe', 'declined');

CREATE TYPE chat_type AS ENUM ('dm', 'group', 'event');
CREATE TYPE chat_member_role AS ENUM ('owner', 'admin', 'member');

CREATE TYPE forum_tag AS ENUM ('gear', 'strategy', 'courts', 'general');
CREATE TYPE forum_status AS ENUM ('published', 'flagged', 'removed');
CREATE TYPE forum_target_type AS ENUM ('post', 'comment');

CREATE TYPE notification_type AS ENUM (
  'dm', 'group_mention', 'event_invite', 'event_rsvp',
  'follow', 'comment_reply', 'forum_upvote', 'smart_suggestion'
);
CREATE TYPE push_platform AS ENUM ('ios', 'android');
CREATE TYPE email_digest_frequency AS ENUM ('never', 'daily', 'weekly');

CREATE TYPE report_target_type AS ENUM ('user', 'message', 'post', 'comment', 'court', 'event');
CREATE TYPE report_reason AS ENUM ('spam', 'harassment', 'inappropriate', 'safety', 'other');
CREATE TYPE report_status AS ENUM ('open', 'reviewing', 'actioned', 'dismissed');


-- ============================================================
-- USERS & PROFILES
-- ============================================================
CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username        TEXT UNIQUE NOT NULL CHECK (length(username) BETWEEN 3 AND 30 AND username ~ '^[a-z0-9_]+$'),
  display_name    TEXT,
  bio             TEXT CHECK (length(bio) <= 160),
  avatar_url      TEXT,
  cover_url       TEXT,
  location_city   TEXT,
  location_lat    DOUBLE PRECISION,
  location_lng    DOUBLE PRECISION,
  dupr_rating     NUMERIC(3,2) CHECK (dupr_rating BETWEEN 1.0 AND 8.0),
  dupr_verified   BOOLEAN NOT NULL DEFAULT FALSE,
  dupr_synced_at  TIMESTAMPTZ,
  self_rating     NUMERIC(3,2) CHECK (self_rating BETWEEN 1.0 AND 6.0),
  play_styles     TEXT[] NOT NULL DEFAULT '{}',
  availability    TEXT[] NOT NULL DEFAULT '{}',
  visibility      profile_visibility NOT NULL DEFAULT 'public',
  dm_permission   dm_permission NOT NULL DEFAULT 'anyone',
  available_to_match BOOLEAN NOT NULL DEFAULT TRUE,
  hide_rating     BOOLEAN NOT NULL DEFAULT FALSE,
  survey_completed BOOLEAN NOT NULL DEFAULT FALSE,
  is_admin        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX profiles_username_idx ON profiles(username);
CREATE INDEX profiles_location_idx ON profiles(location_lat, location_lng);
CREATE INDEX profiles_visibility_idx ON profiles(visibility);

CREATE TABLE follows (
  follower_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  followed_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (follower_id, followed_id),
  CHECK (follower_id != followed_id)
);

CREATE INDEX follows_followed_idx ON follows(followed_id);

CREATE TABLE blocks (
  blocker_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);

CREATE INDEX blocks_blocked_idx ON blocks(blocked_id);


-- ============================================================
-- COURTS (crowdsourced)
-- ============================================================
CREATE TABLE courts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  address      TEXT,
  lat          DOUBLE PRECISION NOT NULL,
  lng          DOUBLE PRECISION NOT NULL,
  court_count  INT NOT NULL DEFAULT 1,
  court_type   court_type NOT NULL DEFAULT 'outdoor',
  surface      court_surface NOT NULL DEFAULT 'asphalt',
  fee_type     court_fee_type NOT NULL DEFAULT 'free',
  fee_amount   NUMERIC(8,2),
  amenities    TEXT[] NOT NULL DEFAULT '{}',
  hours        JSONB,
  photos       TEXT[] NOT NULL DEFAULT '{}',
  status       court_status NOT NULL DEFAULT 'pending',
  submitted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  verified_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX courts_location_idx ON courts(lat, lng);
CREATE INDEX courts_status_idx ON courts(status);

CREATE TABLE court_edits (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  court_id      UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  edited_by     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  field_changed TEXT NOT NULL,
  old_value     JSONB,
  new_value     JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX court_edits_court_idx ON court_edits(court_id);

CREATE TABLE court_reviews (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  court_id   UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating     INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT,
  photos     TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (court_id, user_id)
);


-- ============================================================
-- EVENTS
-- ============================================================
CREATE TABLE chats (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type        chat_type NOT NULL,
  name        TEXT,
  avatar_url  TEXT,
  event_id    UUID,  -- forward declared; FK added after events table
  created_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  last_message_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  format          event_format NOT NULL DEFAULT 'doubles',
  court_id        UUID NOT NULL REFERENCES courts(id) ON DELETE RESTRICT,
  host_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  skill_min       NUMERIC(3,2),
  skill_max       NUMERIC(3,2),
  starts_at       TIMESTAMPTZ NOT NULL,
  ends_at         TIMESTAMPTZ,
  max_players     INT NOT NULL DEFAULT 8 CHECK (max_players BETWEEN 2 AND 32),
  visibility      event_visibility NOT NULL DEFAULT 'public',
  description     TEXT,
  status          event_status NOT NULL DEFAULT 'open',
  group_chat_id   UUID REFERENCES chats(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (skill_max IS NULL OR skill_min IS NULL OR skill_max >= skill_min)
);

CREATE INDEX events_starts_at_idx ON events(starts_at);
CREATE INDEX events_court_idx ON events(court_id);
CREATE INDEX events_host_idx ON events(host_id);

-- Now back-fill the FK from chats.event_id
ALTER TABLE chats
  ADD CONSTRAINT chats_event_id_fkey
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

CREATE TABLE event_rsvps (
  event_id  UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status    rsvp_status NOT NULL DEFAULT 'going',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (event_id, user_id)
);


-- ============================================================
-- MESSAGING (THE WEDGE)
-- ============================================================
CREATE TABLE chat_members (
  chat_id      UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role         chat_member_role NOT NULL DEFAULT 'member',
  joined_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_read_at TIMESTAMPTZ,
  PRIMARY KEY (chat_id, user_id)
);

CREATE INDEX chat_members_user_idx ON chat_members(user_id);

-- The PYKLR wedge: per-user, per-chat muting
CREATE TABLE chat_user_mutes (
  chat_id    UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  muter_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  muted_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (chat_id, muter_id, muted_id),
  CHECK (muter_id != muted_id)
);

CREATE INDEX chat_user_mutes_muter_idx ON chat_user_mutes(muter_id, chat_id);

CREATE TABLE messages (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id             UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_id           UUID REFERENCES profiles(id) ON DELETE SET NULL,  -- NULL for system/suggestions
  body                TEXT,
  attachments         JSONB,
  reply_to            UUID REFERENCES messages(id) ON DELETE SET NULL,
  is_suggestion       BOOLEAN NOT NULL DEFAULT FALSE,
  suggestion_payload  JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  edited_at           TIMESTAMPTZ,
  deleted_at          TIMESTAMPTZ
);

CREATE INDEX messages_chat_created_idx ON messages(chat_id, created_at);
CREATE INDEX messages_sender_idx ON messages(sender_id);

CREATE TABLE message_reactions (
  message_id  UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  emoji       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (message_id, user_id, emoji)
);


-- ============================================================
-- FORUM
-- ============================================================
CREATE TABLE forum_posts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title         TEXT NOT NULL CHECK (length(title) BETWEEN 4 AND 200),
  body          TEXT,
  tag           forum_tag NOT NULL DEFAULT 'general',
  image_url     TEXT,
  upvotes       INT NOT NULL DEFAULT 0,
  downvotes     INT NOT NULL DEFAULT 0,
  comment_count INT NOT NULL DEFAULT 0,
  status        forum_status NOT NULL DEFAULT 'published',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX forum_posts_created_idx ON forum_posts(created_at DESC);
CREATE INDEX forum_posts_tag_idx ON forum_posts(tag);

CREATE TABLE forum_comments (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id            UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  author_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body               TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 5000),
  parent_comment_id  UUID REFERENCES forum_comments(id) ON DELETE CASCADE,
  upvotes            INT NOT NULL DEFAULT 0,
  downvotes          INT NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX forum_comments_post_idx ON forum_comments(post_id);

CREATE TABLE forum_votes (
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type  forum_target_type NOT NULL,
  target_id    UUID NOT NULL,
  vote         SMALLINT NOT NULL CHECK (vote IN (-1, 1)),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, target_type, target_id)
);

CREATE TABLE forum_saves (
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id    UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);


-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type         notification_type NOT NULL,
  actor_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  target_type  TEXT,
  target_id    UUID,
  body         TEXT,
  read_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX notifications_recipient_created_idx ON notifications(recipient_id, created_at DESC);

CREATE TABLE push_tokens (
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token        TEXT NOT NULL,
  platform     push_platform NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, token)
);

CREATE TABLE notification_preferences (
  user_id                UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  push_dm                BOOLEAN NOT NULL DEFAULT TRUE,
  push_group_mention     BOOLEAN NOT NULL DEFAULT TRUE,
  push_event_invite      BOOLEAN NOT NULL DEFAULT TRUE,
  push_event_rsvp        BOOLEAN NOT NULL DEFAULT TRUE,
  push_follow            BOOLEAN NOT NULL DEFAULT TRUE,
  push_comment_reply     BOOLEAN NOT NULL DEFAULT TRUE,
  push_forum_activity    BOOLEAN NOT NULL DEFAULT FALSE,
  push_smart_suggestion  BOOLEAN NOT NULL DEFAULT TRUE,
  email_digest           email_digest_frequency NOT NULL DEFAULT 'weekly'
);


-- ============================================================
-- MODERATION
-- ============================================================
CREATE TABLE reports (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type report_target_type NOT NULL,
  target_id   UUID NOT NULL,
  reason      report_reason NOT NULL,
  description TEXT,
  status      report_status NOT NULL DEFAULT 'open',
  resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX reports_status_idx ON reports(status, created_at DESC);


-- ============================================================
-- REFERRALS
-- ============================================================
CREATE TABLE referrals (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  code             TEXT NOT NULL UNIQUE,
  referred_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  claimed_at       TIMESTAMPTZ
);

CREATE INDEX referrals_code_idx ON referrals(code);

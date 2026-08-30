-- ============================================================
-- PYKLR — Row Level Security
-- ============================================================
-- Every table has RLS enabled. Policies enforce:
--   - User-scoped access (you can only see your own data unless public)
--   - Block/mute semantics (blocked users hidden from each other)
--   - Admin override via profiles.is_admin
-- ============================================================

-- Helper: is the current user an admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL SECURITY DEFINER STABLE
AS $$
  SELECT COALESCE((SELECT is_admin FROM profiles WHERE id = auth.uid()), FALSE);
$$;

-- Helper: are two users mutually unblocked?
CREATE OR REPLACE FUNCTION public.not_blocked(other_user UUID)
RETURNS BOOLEAN
LANGUAGE SQL SECURITY DEFINER STABLE
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM blocks
    WHERE (blocker_id = auth.uid() AND blocked_id = other_user)
       OR (blocker_id = other_user AND blocked_id = auth.uid())
  );
$$;

-- Helper: does the current user follow the given user?
CREATE OR REPLACE FUNCTION public.is_following(target UUID)
RETURNS BOOLEAN
LANGUAGE SQL SECURITY DEFINER STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM follows WHERE follower_id = auth.uid() AND followed_id = target
  );
$$;

-- Helper: is the user a member of the given chat?
CREATE OR REPLACE FUNCTION public.is_chat_member(target_chat UUID)
RETURNS BOOLEAN
LANGUAGE SQL SECURITY DEFINER STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM chat_members WHERE chat_id = target_chat AND user_id = auth.uid()
  );
$$;

-- ============================================================
-- PROFILES
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select ON profiles FOR SELECT
  USING (
    is_admin()
    OR id = auth.uid()
    OR (
      not_blocked(id)
      AND (
        visibility = 'public'
        OR (visibility = 'followers' AND is_following(id))
      )
    )
  );

CREATE POLICY profiles_update ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Inserts handled by trigger from auth.users; no direct insert policy needed.


-- ============================================================
-- FOLLOWS
-- ============================================================
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY follows_select ON follows FOR SELECT
  USING (follower_id = auth.uid() OR followed_id = auth.uid() OR is_admin());

CREATE POLICY follows_insert ON follows FOR INSERT
  WITH CHECK (follower_id = auth.uid() AND not_blocked(followed_id));

CREATE POLICY follows_delete ON follows FOR DELETE
  USING (follower_id = auth.uid());


-- ============================================================
-- BLOCKS (only the blocker can see/manage their own list)
-- ============================================================
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY blocks_all ON blocks FOR ALL
  USING (blocker_id = auth.uid())
  WITH CHECK (blocker_id = auth.uid());


-- ============================================================
-- COURTS
-- ============================================================
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;

CREATE POLICY courts_select ON courts FOR SELECT
  USING (status = 'verified' OR submitted_by = auth.uid() OR is_admin());

CREATE POLICY courts_insert ON courts FOR INSERT
  WITH CHECK (submitted_by = auth.uid());

CREATE POLICY courts_update ON courts FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Court edits: any authed user can suggest an edit; admins can apply.
ALTER TABLE court_edits ENABLE ROW LEVEL SECURITY;
CREATE POLICY court_edits_select ON court_edits FOR SELECT USING (TRUE);
CREATE POLICY court_edits_insert ON court_edits FOR INSERT
  WITH CHECK (edited_by = auth.uid());

ALTER TABLE court_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY court_reviews_select ON court_reviews FOR SELECT USING (TRUE);
CREATE POLICY court_reviews_insert ON court_reviews FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY court_reviews_update ON court_reviews FOR UPDATE
  USING (user_id = auth.uid());
CREATE POLICY court_reviews_delete ON court_reviews FOR DELETE
  USING (user_id = auth.uid() OR is_admin());


-- ============================================================
-- EVENTS
-- ============================================================
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY events_select ON events FOR SELECT
  USING (
    is_admin()
    OR visibility = 'public'
    OR host_id = auth.uid()
    OR EXISTS (SELECT 1 FROM event_rsvps WHERE event_id = events.id AND user_id = auth.uid())
  );

CREATE POLICY events_insert ON events FOR INSERT
  WITH CHECK (host_id = auth.uid());

CREATE POLICY events_update ON events FOR UPDATE
  USING (host_id = auth.uid() OR is_admin());

CREATE POLICY events_delete ON events FOR DELETE
  USING (host_id = auth.uid() OR is_admin());

ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;
CREATE POLICY event_rsvps_select ON event_rsvps FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM events WHERE id = event_rsvps.event_id AND host_id = auth.uid())
    OR EXISTS (SELECT 1 FROM events WHERE id = event_rsvps.event_id AND visibility = 'public')
  );
CREATE POLICY event_rsvps_insert ON event_rsvps FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY event_rsvps_update ON event_rsvps FOR UPDATE
  USING (user_id = auth.uid());
CREATE POLICY event_rsvps_delete ON event_rsvps FOR DELETE
  USING (user_id = auth.uid());


-- ============================================================
-- MESSAGING
-- ============================================================
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY chats_select ON chats FOR SELECT
  USING (created_by = auth.uid() OR is_chat_member(id) OR is_admin());

CREATE POLICY chats_insert ON chats FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY chats_update ON chats FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM chat_members
      WHERE chat_id = chats.id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

ALTER TABLE chat_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY chat_members_select ON chat_members FOR SELECT
  USING (is_chat_member(chat_id) OR user_id = auth.uid() OR is_admin());

CREATE POLICY chat_members_insert ON chat_members FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM chat_members cm
      WHERE cm.chat_id = chat_members.chat_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY chat_members_delete ON chat_members FOR DELETE
  USING (
    user_id = auth.uid()  -- you can always leave
    OR EXISTS (
      SELECT 1 FROM chat_members cm
      WHERE cm.chat_id = chat_members.chat_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('owner', 'admin')
    )
  );

-- THE WEDGE: mutes are private to the muter, full CRUD only by the muter.
ALTER TABLE chat_user_mutes ENABLE ROW LEVEL SECURITY;
CREATE POLICY chat_user_mutes_all ON chat_user_mutes FOR ALL
  USING (muter_id = auth.uid())
  WITH CHECK (muter_id = auth.uid() AND is_chat_member(chat_id));

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY messages_select ON messages FOR SELECT
  USING (is_chat_member(chat_id) OR is_admin());

CREATE POLICY messages_insert ON messages FOR INSERT
  WITH CHECK (
    is_chat_member(chat_id)
    AND (sender_id = auth.uid() OR sender_id IS NULL)  -- NULL for system suggestions
  );

CREATE POLICY messages_update ON messages FOR UPDATE
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY messages_delete ON messages FOR DELETE
  USING (sender_id = auth.uid() OR is_admin());

ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY message_reactions_select ON message_reactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM messages m
      WHERE m.id = message_reactions.message_id AND is_chat_member(m.chat_id)
    )
  );
CREATE POLICY message_reactions_insert ON message_reactions FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY message_reactions_delete ON message_reactions FOR DELETE
  USING (user_id = auth.uid());


-- ============================================================
-- FORUM
-- ============================================================
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY forum_posts_select ON forum_posts FOR SELECT
  USING (
    (status = 'published' AND not_blocked(author_id))
    OR author_id = auth.uid()
    OR is_admin()
  );
CREATE POLICY forum_posts_insert ON forum_posts FOR INSERT
  WITH CHECK (author_id = auth.uid());
CREATE POLICY forum_posts_update ON forum_posts FOR UPDATE
  USING (author_id = auth.uid() OR is_admin());
CREATE POLICY forum_posts_delete ON forum_posts FOR DELETE
  USING (author_id = auth.uid() OR is_admin());

ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY forum_comments_select ON forum_comments FOR SELECT
  USING (not_blocked(author_id) OR is_admin());
CREATE POLICY forum_comments_insert ON forum_comments FOR INSERT
  WITH CHECK (author_id = auth.uid());
CREATE POLICY forum_comments_update ON forum_comments FOR UPDATE
  USING (author_id = auth.uid());
CREATE POLICY forum_comments_delete ON forum_comments FOR DELETE
  USING (author_id = auth.uid() OR is_admin());

ALTER TABLE forum_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY forum_votes_all ON forum_votes FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

ALTER TABLE forum_saves ENABLE ROW LEVEL SECURITY;
CREATE POLICY forum_saves_all ON forum_saves FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- ============================================================
-- NOTIFICATIONS
-- ============================================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY notifications_select ON notifications FOR SELECT
  USING (recipient_id = auth.uid());
CREATE POLICY notifications_update ON notifications FOR UPDATE
  USING (recipient_id = auth.uid());

ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY push_tokens_all ON push_tokens FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY notification_preferences_all ON notification_preferences FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- ============================================================
-- MODERATION
-- ============================================================
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY reports_select ON reports FOR SELECT
  USING (reporter_id = auth.uid() OR is_admin());
CREATE POLICY reports_insert ON reports FOR INSERT
  WITH CHECK (reporter_id = auth.uid());
CREATE POLICY reports_update ON reports FOR UPDATE
  USING (is_admin());


-- ============================================================
-- REFERRALS
-- ============================================================
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY referrals_select ON referrals FOR SELECT
  USING (referrer_id = auth.uid() OR referred_user_id = auth.uid() OR is_admin());
CREATE POLICY referrals_insert ON referrals FOR INSERT
  WITH CHECK (referrer_id = auth.uid());

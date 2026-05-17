-- ============================================================
-- PYKLR — Triggers & functions
-- ============================================================
-- Auto-create profile on sign-up, maintain denormalized counters,
-- update timestamps, sanitize edits.
-- ============================================================

-- --- updated_at maintenance ---
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION tg_set_updated_at();
CREATE TRIGGER courts_set_updated_at BEFORE UPDATE ON courts
  FOR EACH ROW EXECUTE FUNCTION tg_set_updated_at();
CREATE TRIGGER events_set_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION tg_set_updated_at();
CREATE TRIGGER chats_set_updated_at BEFORE UPDATE ON chats
  FOR EACH ROW EXECUTE FUNCTION tg_set_updated_at();
CREATE TRIGGER forum_posts_set_updated_at BEFORE UPDATE ON forum_posts
  FOR EACH ROW EXECUTE FUNCTION tg_set_updated_at();


-- --- Auto-create profile when auth.users gets a new row ---
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  generated_username TEXT;
  attempt INT := 0;
BEGIN
  -- Try email-based username first, then fall back to a UUID-based one
  generated_username := lower(regexp_replace(split_part(NEW.email, '@', 1), '[^a-z0-9_]', '', 'g'));
  IF length(generated_username) < 3 THEN
    generated_username := 'player_' || substr(NEW.id::text, 1, 8);
  END IF;

  -- Append a suffix if it collides
  WHILE EXISTS (SELECT 1 FROM profiles WHERE username = generated_username) AND attempt < 5 LOOP
    attempt := attempt + 1;
    generated_username := generated_username || '_' || floor(random() * 9999)::text;
  END LOOP;

  INSERT INTO profiles (id, username, display_name)
  VALUES (
    NEW.id,
    generated_username,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );

  INSERT INTO notification_preferences (user_id) VALUES (NEW.id);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- --- Maintain chats.last_message_at ---
CREATE OR REPLACE FUNCTION public.tg_update_chat_last_message_at()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE chats SET last_message_at = NEW.created_at WHERE id = NEW.chat_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER messages_update_chat_last_message
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION tg_update_chat_last_message_at();


-- --- Maintain forum_posts.comment_count ---
CREATE OR REPLACE FUNCTION public.tg_update_post_comment_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER forum_comments_count_trigger
  AFTER INSERT OR DELETE ON forum_comments
  FOR EACH ROW EXECUTE FUNCTION tg_update_post_comment_count();


-- --- Maintain forum_posts/comments upvotes/downvotes from forum_votes ---
CREATE OR REPLACE FUNCTION public.tg_apply_forum_vote()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  delta_up INT := 0;
  delta_down INT := 0;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote = 1 THEN delta_up := 1; ELSE delta_down := 1; END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote = 1 THEN delta_up := -1; ELSE delta_down := -1; END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.vote = 1 AND NEW.vote = -1 THEN delta_up := -1; delta_down := 1;
    ELSIF OLD.vote = -1 AND NEW.vote = 1 THEN delta_up := 1; delta_down := -1; END IF;
  END IF;

  IF COALESCE(NEW.target_type, OLD.target_type) = 'post' THEN
    UPDATE forum_posts
      SET upvotes = GREATEST(upvotes + delta_up, 0),
          downvotes = GREATEST(downvotes + delta_down, 0)
      WHERE id = COALESCE(NEW.target_id, OLD.target_id);
  ELSE
    UPDATE forum_comments
      SET upvotes = GREATEST(upvotes + delta_up, 0),
          downvotes = GREATEST(downvotes + delta_down, 0)
      WHERE id = COALESCE(NEW.target_id, OLD.target_id);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER forum_votes_apply_trigger
  AFTER INSERT OR UPDATE OR DELETE ON forum_votes
  FOR EACH ROW EXECUTE FUNCTION tg_apply_forum_vote();


-- --- Block cascade: if A blocks B, remove any existing follow in either direction ---
CREATE OR REPLACE FUNCTION public.tg_cascade_block()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  DELETE FROM follows
  WHERE (follower_id = NEW.blocker_id AND followed_id = NEW.blocked_id)
     OR (follower_id = NEW.blocked_id AND followed_id = NEW.blocker_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER blocks_cascade_trigger
  AFTER INSERT ON blocks
  FOR EACH ROW EXECUTE FUNCTION tg_cascade_block();


-- --- Create a notification for a new follow ---
CREATE OR REPLACE FUNCTION public.tg_notify_on_follow()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO notifications (recipient_id, type, actor_id, target_type, target_id, body)
  VALUES (
    NEW.followed_id,
    'follow',
    NEW.follower_id,
    'profile',
    NEW.follower_id,
    'started following you'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER follows_notify_trigger
  AFTER INSERT ON follows
  FOR EACH ROW EXECUTE FUNCTION tg_notify_on_follow();


-- --- Create notifications when someone RSVPs to your event ---
CREATE OR REPLACE FUNCTION public.tg_notify_on_event_rsvp()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  host UUID;
BEGIN
  SELECT host_id INTO host FROM events WHERE id = NEW.event_id;
  IF host IS NOT NULL AND host != NEW.user_id THEN
    INSERT INTO notifications (recipient_id, type, actor_id, target_type, target_id, body)
    VALUES (host, 'event_rsvp', NEW.user_id, 'event', NEW.event_id, NEW.status::text || ' your event');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER event_rsvps_notify_trigger
  AFTER INSERT ON event_rsvps
  FOR EACH ROW EXECUTE FUNCTION tg_notify_on_event_rsvp();

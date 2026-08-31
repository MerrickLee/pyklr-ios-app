-- ========================================================================================
-- NOTIFICATION TRIGGERS
-- Implements the push notification UX strategy via Database Webhooks (Triggers -> Notifications Table -> Edge Function)
-- ========================================================================================

BEGIN;

-- 1. Notify on New Chat Message (DM or Group Mention)
CREATE OR REPLACE FUNCTION public.tg_notify_on_message()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  chat_name TEXT;
  chat_member_count INT;
  sender_name TEXT;
  msg_body TEXT;
  recipient RECORD;
  is_dm BOOLEAN;
BEGIN
  -- We don't notify for system suggestions directly via this trigger
  IF NEW.sender_id IS NULL OR NEW.is_suggestion THEN
    RETURN NEW;
  END IF;

  -- Get sender name
  SELECT display_name INTO sender_name FROM profiles WHERE id = NEW.sender_id;

  -- Check if it's a DM (2 members) or Group Chat
  SELECT c.name, (SELECT COUNT(*) FROM chat_members cm WHERE cm.chat_id = NEW.chat_id) 
  INTO chat_name, chat_member_count
  FROM chats c WHERE c.id = NEW.chat_id;

  is_dm := (chat_member_count <= 2);

  -- Determine message snippet for push body
  msg_body := left(NEW.body, 100);
  IF length(NEW.body) > 100 THEN
    msg_body := msg_body || '...';
  END IF;

  -- Insert notifications for all members EXCEPT the sender and muted users
  FOR recipient IN
    SELECT user_id FROM chat_members 
    WHERE chat_id = NEW.chat_id 
      AND user_id != NEW.sender_id
      AND NOT EXISTS (
        SELECT 1 FROM chat_user_mutes 
        WHERE chat_id = NEW.chat_id AND user_id = chat_members.user_id
      )
  LOOP
    IF is_dm THEN
      -- Direct Message
      INSERT INTO notifications (recipient_id, type, actor_id, target_type, target_id, body)
      VALUES (recipient.user_id, 'dm', NEW.sender_id, 'message', NEW.chat_id, COALESCE(sender_name, 'Someone') || ': ' || COALESCE(msg_body, 'Sent an image'));
    ELSE
      -- Group Chat
      INSERT INTO notifications (recipient_id, type, actor_id, target_type, target_id, body)
      VALUES (recipient.user_id, 'group_mention', NEW.sender_id, 'message', NEW.chat_id, COALESCE(sender_name, 'Someone') || ' in ' || COALESCE(chat_name, 'Group') || ': ' || COALESCE(msg_body, 'Sent an image'));
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS messages_notify_trigger ON messages;
CREATE TRIGGER messages_notify_trigger
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION tg_notify_on_message();


-- 2. Notify on Forum Comment Reply
CREATE OR REPLACE FUNCTION public.tg_notify_on_comment_reply()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  parent_author UUID;
  post_author UUID;
  sender_name TEXT;
  msg_body TEXT;
BEGIN
  SELECT display_name INTO sender_name FROM profiles WHERE id = NEW.author_id;
  msg_body := left(NEW.body, 100);

  IF NEW.parent_comment_id IS NOT NULL THEN
    -- It's a reply to a comment
    SELECT author_id INTO parent_author FROM forum_comments WHERE id = NEW.parent_comment_id;
    IF parent_author IS NOT NULL AND parent_author != NEW.author_id THEN
      INSERT INTO notifications (recipient_id, type, actor_id, target_type, target_id, body)
      VALUES (parent_author, 'comment_reply', NEW.author_id, 'comment', NEW.id, COALESCE(sender_name, 'Someone') || ' replied: "' || msg_body || '"');
    END IF;
  ELSE
    -- It's a top-level comment on a post
    SELECT author_id INTO post_author FROM forum_posts WHERE id = NEW.post_id;
    IF post_author IS NOT NULL AND post_author != NEW.author_id THEN
      INSERT INTO notifications (recipient_id, type, actor_id, target_type, target_id, body)
      VALUES (post_author, 'comment_reply', NEW.author_id, 'post', NEW.post_id, COALESCE(sender_name, 'Someone') || ' commented: "' || msg_body || '"');
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS comment_reply_notify_trigger ON forum_comments;
CREATE TRIGGER comment_reply_notify_trigger
  AFTER INSERT ON forum_comments
  FOR EACH ROW EXECUTE FUNCTION tg_notify_on_comment_reply();


-- 3. Notify on Event Invite & Enhance RSVP
CREATE OR REPLACE FUNCTION public.tg_notify_on_event_rsvp()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  host UUID;
  court_name TEXT;
  event_time TIMESTAMPTZ;
  actor_name TEXT;
BEGIN
  SELECT e.host_id, c.name, e.start_time INTO host, court_name, event_time
  FROM events e
  LEFT JOIN courts c ON c.id = e.court_id
  WHERE e.id = NEW.event_id;

  SELECT display_name INTO actor_name FROM profiles WHERE id = NEW.user_id;

  IF NEW.status = 'invited' THEN
    -- Notify the user that they were invited
    IF host != NEW.user_id THEN
      INSERT INTO notifications (recipient_id, type, actor_id, target_type, target_id, body)
      VALUES (NEW.user_id, 'event_invite', host, 'event', NEW.event_id, 'You have been invited to play at ' || COALESCE(court_name, 'a court') || '!');
    END IF;
  ELSEIF NEW.status = 'going' OR NEW.status = 'declined' THEN
    -- Notify the host of the RSVP update
    IF host IS NOT NULL AND host != NEW.user_id THEN
      INSERT INTO notifications (recipient_id, type, actor_id, target_type, target_id, body)
      VALUES (host, 'event_rsvp', NEW.user_id, 'event', NEW.event_id, COALESCE(actor_name, 'Someone') || ' RSVPd ' || NEW.status || ' for your match at ' || COALESCE(court_name, 'the court'));
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS event_rsvps_notify_insert_trigger ON event_rsvps;
CREATE TRIGGER event_rsvps_notify_insert_trigger
  AFTER INSERT ON event_rsvps
  FOR EACH ROW 
  EXECUTE FUNCTION tg_notify_on_event_rsvp();

DROP TRIGGER IF EXISTS event_rsvps_notify_update_trigger ON event_rsvps;
CREATE TRIGGER event_rsvps_notify_update_trigger
  AFTER UPDATE OF status ON event_rsvps
  FOR EACH ROW 
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION tg_notify_on_event_rsvp();

-- Also drop the old trigger name just in case
DROP TRIGGER IF EXISTS event_rsvps_notify_trigger ON event_rsvps;


-- 4. Follows trigger (Update copy slightly to match UX plan)
CREATE OR REPLACE FUNCTION public.tg_notify_on_follow()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  actor_name TEXT;
BEGIN
  SELECT display_name INTO actor_name FROM profiles WHERE id = NEW.follower_id;

  INSERT INTO notifications (recipient_id, type, actor_id, target_type, target_id, body)
  VALUES (NEW.followed_id, 'follow', NEW.follower_id, 'profile', NEW.follower_id, COALESCE(actor_name, 'Someone') || ' just started following you. 🎾');
  RETURN NEW;
END;
$$;

COMMIT;

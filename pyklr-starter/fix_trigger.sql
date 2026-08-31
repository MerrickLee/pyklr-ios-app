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

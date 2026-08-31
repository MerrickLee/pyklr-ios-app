// ============================================================
// PYKLR — push-dispatcher edge function
// ============================================================
// Triggered by a Database Webhook on `notifications` INSERT events.
// For each new notification:
//   1. Look up the recipient's notification_preferences
//   2. Check whether push for this notification type is enabled
//   3. Look up the recipient's active push_tokens
//   4. POST to Expo Push API with appropriate title/body/deep-link
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.0';
import * as jose from 'https://deno.land/x/jose@v5.2.3/index.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const APNS_KEY_ID = Deno.env.get('APNS_KEY_ID')!;
const APNS_TEAM_ID = Deno.env.get('APNS_TEAM_ID')!;
const APNS_BUNDLE_ID = Deno.env.get('APNS_BUNDLE_ID')!;
const APNS_KEY = Deno.env.get('APNS_KEY')!; // The .p8 key contents (e.g., passed as base64 or raw string)
const APNS_TOPIC = APNS_BUNDLE_ID;
const IS_PRODUCTION = Deno.env.get('NODE_ENV') === 'production';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

interface WebhookPayload {
  type: 'INSERT';
  table: 'notifications';
  record: {
    id: string;
    recipient_id: string;
    type: string;
    actor_id: string | null;
    target_type: string | null;
    target_id: string | null;
    body: string | null;
  };
}

const PREF_KEY: Record<string, string> = {
  dm: 'push_dm',
  group_mention: 'push_group_mention',
  event_invite: 'push_event_invite',
  event_rsvp: 'push_event_rsvp',
  follow: 'push_follow',
  comment_reply: 'push_comment_reply',
  forum_upvote: 'push_forum_activity',
  smart_suggestion: 'push_smart_suggestion',
};

function deepLinkFor(targetType: string | null, targetId: string | null): string | undefined {
  if (!targetId || !targetType) return undefined;
  switch (targetType) {
    case 'profile': return `pyklr://u/${targetId}`;
    case 'event':   return `pyklr://event/${targetId}`;
    case 'court':   return `pyklr://court/${targetId}`;
    case 'message': return `pyklr://chat/${targetId}`;
    case 'post':    return `pyklr://p/${targetId}`;
    case 'comment': return `pyklr://p/${targetId}`;
    default: return undefined;
  }
}

function defaultTitle(type: string): string {
  switch (type) {
    case 'dm':                return 'New message';
    case 'group_mention':     return 'Mentioned in chat';
    case 'event_invite':      return 'Event invite';
    case 'event_rsvp':        return 'New RSVP';
    case 'follow':            return 'New follower';
    case 'comment_reply':     return 'New reply';
    case 'forum_upvote':      return 'Your post got upvoted';
    case 'smart_suggestion':  return 'Game forming';
    default:                  return 'PYKLR';
  }
}

async function sendApnsPush(token: string, title: string, body: string, data: any) {
  // Parse the private key
  const privateKey = await jose.importPKCS8(APNS_KEY.replace(/\\n/g, '\n'), 'ES256');
  
  // Generate JWT token
  const jwt = await new jose.SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: APNS_KEY_ID })
    .setIssuer(APNS_TEAM_ID)
    .setIssuedAt()
    .sign(privateKey);

  const apnsEnv = IS_PRODUCTION ? 'api.push.apple.com' : 'api.development.push.apple.com';
  const url = `https://${apnsEnv}/3/device/${token}`;

  const payload = {
    aps: {
      alert: {
        title,
        body,
      },
      badge: 1,
      sound: 'default',
    },
    ...data,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'authorization': `bearer ${jwt}`,
      'apns-topic': APNS_TOPIC,
      'apns-push-type': 'alert',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`APNs failed for token ${token}:`, response.status, errorText);
  }
  return response.ok;
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const notif = payload.record;
  const prefKey = PREF_KEY[notif.type];
  if (!prefKey) {
    return new Response('unknown notification type', { status: 200 });
  }

  // Check user preferences
  const { data: prefs } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', notif.recipient_id)
    .single();

  if (!prefs) {
    return new Response('no prefs', { status: 200 });
  }
  if (!prefs[prefKey]) {
    return new Response(`disabled by user: ${prefKey}`, { status: 200 });
  }

  // Fetch tokens
  const { data: tokens } = await supabase
    .from('push_tokens')
    .select('token, platform')
    .eq('user_id', notif.recipient_id);

  if (!tokens || tokens.length === 0) {
    return new Response('no push tokens', { status: 200 });
  }

  const link = deepLinkFor(notif.target_type, notif.target_id);
  const title = defaultTitle(notif.type);
  const body = notif.body ?? '';
  const data = link ? { deepLink: link, notificationId: notif.id } : { notificationId: notif.id };

  let successCount = 0;

  for (const t of tokens) {
    if (t.platform === 'ios') {
      const ok = await sendApnsPush(t.token, title, body, data);
      if (ok) successCount++;
    } else {
      // Handle Android/FCM here later if needed
    }
  }

  // Update last_used_at on the tokens we just used
  await supabase
    .from('push_tokens')
    .update({ last_used_at: new Date().toISOString() })
    .eq('user_id', notif.recipient_id);

  return new Response(JSON.stringify({ ok: true, dispatched: successCount }), {
    headers: { 'Content-Type': 'application/json' },
  });
});


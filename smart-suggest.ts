// ============================================================
// PYKLR — smart-suggest edge function
// ============================================================
// Triggered by a Database Webhook on the `messages` table (INSERT events).
// Examines the last 10 messages in the chat and decides whether a meetup
// is forming. If yes, inserts a system message with is_suggestion=true.
//
// Detection heuristic (intentionally simple at MVP — can be upgraded to an
// LLM call later):
//   1. A message contains a time reference (e.g. "7pm", "7:30 pm", "tomorrow at 6")
//   2. A message references a known court name OR uses "court"/"park"/location language
//   3. At least 2 other users in the thread have reacted affirmatively in the
//      last 10 messages ("i'm in", "+1", "yes", "sure", "going")
// If detected, we emit a single suggestion message and set a 24h cooldown
// (tracked by checking for any prior is_suggestion=true message in the last 24h).
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const TIME_REGEX = /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)\b/;
const LOCATION_HINT_REGEX = /\b(court|courts|park|gym|club)\b/i;
const AFFIRMATIVE_REGEX = /\b(i['']?m in|count me in|\+1|yes|sure|going|let['']?s go|down|in for it)\b/i;

interface WebhookPayload {
  type: 'INSERT';
  table: 'messages';
  schema: 'public';
  record: {
    id: string;
    chat_id: string;
    sender_id: string | null;
    body: string | null;
    is_suggestion: boolean;
    created_at: string;
  };
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

  // Ignore system messages so we don't recursively trigger on our own suggestions
  if (payload.record.is_suggestion || payload.record.sender_id === null) {
    return new Response('skip: system message', { status: 200 });
  }

  const chatId = payload.record.chat_id;

  // Cooldown: don't post a suggestion if we already did in the last 24h
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: recentSuggestion } = await supabase
    .from('messages')
    .select('id')
    .eq('chat_id', chatId)
    .eq('is_suggestion', true)
    .gte('created_at', oneDayAgo)
    .limit(1);

  if (recentSuggestion && recentSuggestion.length > 0) {
    return new Response('cooldown: suggestion already sent in last 24h', { status: 200 });
  }

  // Pull the last 10 messages
  const { data: recent, error: recentError } = await supabase
    .from('messages')
    .select('id, sender_id, body, created_at')
    .eq('chat_id', chatId)
    .eq('is_suggestion', false)
    .order('created_at', { ascending: false })
    .limit(10);

  if (recentError || !recent) {
    return new Response(`error: ${recentError?.message}`, { status: 500 });
  }

  // Analyze
  let timeMessage: { body: string; sender: string | null } | null = null;
  let locationMessage: { body: string } | null = null;
  const affirmativeSenders = new Set<string>();

  for (const m of recent) {
    if (!m.body) continue;
    if (!timeMessage && TIME_REGEX.test(m.body)) {
      timeMessage = { body: m.body, sender: m.sender_id };
    }
    if (!locationMessage && LOCATION_HINT_REGEX.test(m.body)) {
      locationMessage = { body: m.body };
    }
    if (AFFIRMATIVE_REGEX.test(m.body) && m.sender_id) {
      affirmativeSenders.add(m.sender_id);
    }
  }

  // Decision: time + location + >= 2 distinct affirmatives (excluding the proposer)
  const proposer = timeMessage?.sender;
  if (proposer) affirmativeSenders.delete(proposer);

  if (!timeMessage || !locationMessage || affirmativeSenders.size < 2) {
    return new Response('no signal', { status: 200 });
  }

  // Extract the time string for the title
  const timeMatch = timeMessage.body.match(TIME_REGEX);
  const timeStr = timeMatch ? `${timeMatch[1]}${timeMatch[2] ? ':' + timeMatch[2] : ''}${timeMatch[3].toLowerCase()}` : 'soon';

  // Try to detect a court name from the message body (simple match against known courts)
  let courtName = '';
  const lowerBody = locationMessage.body.toLowerCase();
  const { data: courts } = await supabase.from('courts').select('id, name').eq('status', 'verified');
  let courtId: string | null = null;
  if (courts) {
    for (const c of courts) {
      if (lowerBody.includes(c.name.toLowerCase().split(' ')[0])) {
        courtName = c.name;
        courtId = c.id;
        break;
      }
    }
  }

  const titleBase = courtName ? `${timeStr} @ ${courtName}` : timeStr;

  // Insert the suggestion message
  const { error: insertError } = await supabase.from('messages').insert({
    chat_id: chatId,
    sender_id: null,
    body: `Create event "${titleBase}"`,
    is_suggestion: true,
    suggestion_payload: {
      action: 'create_event',
      title: `Create event "${titleBase}"`,
      subtitle: `${affirmativeSenders.size + 1} likely RSVPs · tap to schedule`,
      draft: {
        name: titleBase,
        court_id: courtId,
        starts_at_hint: timeStr,
        rsvps: affirmativeSenders.size + 1,
      },
    },
  });

  if (insertError) {
    return new Response(`insert error: ${insertError.message}`, { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true, suggestion_for: titleBase }), {
    headers: { 'Content-Type': 'application/json' },
  });
});

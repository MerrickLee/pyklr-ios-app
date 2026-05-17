// ============================================================
// PYKLR — dupr-sync edge function
// ============================================================
// OAuth callback receiver + ratings sync.
//
// Flow:
//   1. Client (mobile app) opens an in-app browser to DUPR's OAuth authorize URL
//   2. DUPR redirects back to pyklr://dupr-callback?code=...&user_id=...
//   3. App POSTs the code to this function with the user's Supabase JWT
//   4. We exchange the code for a DUPR access token, fetch the rating,
//      and UPDATE profiles SET dupr_rating=..., dupr_verified=true.
//
// Required env:
//   DUPR_API_KEY
//   DUPR_API_BASE_URL
//   DUPR_WEBHOOK_SECRET   (for the daily refresh cron job)
//
// NOTE: actual DUPR partnership is pending. This implementation reflects
// the documented OAuth pattern; specific endpoints will be confirmed
// once the partnership is approved.
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const DUPR_API_KEY = Deno.env.get('DUPR_API_KEY')!;
const DUPR_API_BASE_URL = Deno.env.get('DUPR_API_BASE_URL') ?? 'https://api.dupr.com/v1';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

interface ExchangeRequest {
  code: string;
  user_id: string;
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Validate user JWT
  const userJwt = authHeader.slice('Bearer '.length);
  const { data: userData, error: userErr } = await supabase.auth.getUser(userJwt);
  if (userErr || !userData.user) {
    return new Response('Invalid token', { status: 401 });
  }

  let body: ExchangeRequest;
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  if (body.user_id !== userData.user.id) {
    return new Response('Forbidden', { status: 403 });
  }

  // 1. Exchange code for DUPR access token
  // (DUPR endpoint TBD pending partnership; the shape below is documented as standard OAuth2)
  const tokenResp = await fetch(`${DUPR_API_BASE_URL}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-API-Key': DUPR_API_KEY,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: body.code,
      redirect_uri: 'pyklr://dupr-callback',
    }),
  });

  if (!tokenResp.ok) {
    const err = await tokenResp.text();
    return new Response(`DUPR token exchange failed: ${err}`, { status: 502 });
  }

  const tokenData = await tokenResp.json();
  const duprAccessToken: string | undefined = tokenData.access_token;
  if (!duprAccessToken) {
    return new Response('No access token from DUPR', { status: 502 });
  }

  // 2. Fetch the user's profile / rating
  const profileResp = await fetch(`${DUPR_API_BASE_URL}/players/me`, {
    headers: { Authorization: `Bearer ${duprAccessToken}` },
  });

  if (!profileResp.ok) {
    return new Response('Could not fetch DUPR profile', { status: 502 });
  }

  const duprProfile = await profileResp.json();
  const rating: number | undefined = duprProfile.singles_rating ?? duprProfile.doubles_rating ?? duprProfile.rating;

  if (!rating) {
    return new Response('No rating on DUPR profile', { status: 502 });
  }

  // 3. Persist
  const { error: updateErr } = await supabase
    .from('profiles')
    .update({
      dupr_rating: rating,
      dupr_verified: true,
      dupr_synced_at: new Date().toISOString(),
    })
    .eq('id', userData.user.id);

  if (updateErr) {
    return new Response(`DB update failed: ${updateErr.message}`, { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true, rating }), {
    headers: { 'Content-Type': 'application/json' },
  });
});

# PYKLR — Getting started

A complete walkthrough from `git clone` to running app. Allow ~2 hours the first time, mostly waiting for external accounts.

---

## Prerequisites

Install before you start:

```bash
# Node 20+ (use nvm if you don't have it)
nvm install 20

# pnpm 9+
npm install -g pnpm

# Expo CLI
npm install -g eas-cli

# Supabase CLI
brew install supabase/tap/supabase   # macOS
# or: scoop install supabase         # Windows
# or: see https://supabase.com/docs/guides/cli for Linux
```

You'll also need:
- **Xcode 15+** (for iOS — Mac only)
- **Android Studio** with an emulator or a physical Android device

---

## 1. Clone and install

```bash
git clone https://github.com/YOUR_ORG/pyklr.git
cd pyklr
pnpm install
```

If install fails on `react-native-maps` or `@sentry/react-native`, those packages do native linking and need Xcode / Android SDK paths set. See the Expo docs: https://docs.expo.dev/get-started/installation/

---

## 2. Set up Supabase

### 2a. Create a project

1. Go to https://supabase.com/dashboard and click **New project**
2. Name it `pyklr-dev` (you'll create `pyklr-prod` later)
3. Choose a region close to your launch market — for NYC tri-state, `us-east-1`
4. Strong password — save it
5. Wait ~2 minutes for provisioning

### 2b. Link the CLI

```bash
cd packages/supabase
pnpm supabase login    # opens browser
pnpm supabase link --project-ref YOUR_PROJECT_REF
```

`YOUR_PROJECT_REF` is the random string in your project URL (e.g. `abcdefghij`).

### 2c. Apply migrations

```bash
pnpm db:push
```

This applies `00000_init.sql` (tables + enums), `00001_rls.sql` (security policies), `00002_functions.sql` (triggers).

You can verify in the Supabase Studio SQL editor:
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
-- Should return ~25 tables: profiles, follows, blocks, courts, events, chats, ...
```

### 2d. Seed dev data (optional)

```bash
pnpm supabase db reset --linked   # WARNING: drops & recreates the DB. Only on dev project.
```

This runs `seed.sql` which inserts 5 sample courts (Flowers Park, New Roc, Glen Island, etc.) so the discover screen has content on first launch.

### 2e. Generate TypeScript types

```bash
pnpm db:gen-types
```

This overwrites `packages/shared/types/database.ts` with the canonical types from your live schema. Re-run this anytime you change migrations.

### 2f. Deploy edge functions

```bash
pnpm supabase functions deploy smart-suggest
pnpm supabase functions deploy push-dispatcher
pnpm supabase functions deploy dupr-sync
```

### 2g. Set up Database Webhooks

In the Supabase dashboard → Database → Webhooks:

**Webhook 1:** `messages-smart-suggest`
- Table: `messages`
- Events: `INSERT`
- Type: HTTP Request → Supabase Edge Function
- Function: `smart-suggest`

**Webhook 2:** `notifications-push`
- Table: `notifications`
- Events: `INSERT`
- Type: HTTP Request → Supabase Edge Function
- Function: `push-dispatcher`

---

## 3. Environment variables

```bash
cd ../..    # back to repo root
cp .env.example .env.local
```

Edit `.env.local`:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...   # From Supabase dashboard → Settings → API
```

You can leave the OAuth credentials blank for now — sign-up with email will work without them. Add Apple/Google/Facebook when you're ready (see section 6).

---

## 4. Run the mobile app

```bash
cd apps/mobile
pnpm dev
```

This starts the Expo Dev Server. Press:
- `i` for the iOS simulator
- `a` for an Android emulator
- Or scan the QR code with **Expo Go** on a physical device (limited — see note below)

> **Note about Expo Go:** Apple Sign-In and react-native-maps require native modules, so Expo Go has limited support. For the full experience, use a Development Build:
> ```bash
> eas build --profile development --platform ios
> ```
> This produces an installable `.app` for the simulator. Takes 10-20 minutes the first time.

---

## 5. Verify the smart-mute interaction

This is the wedge — confirming it works end-to-end is the most important Day 1 test.

1. Sign up two accounts (use simulator + physical device, or two simulators)
2. Manually create a chat:
   ```sql
   -- In Supabase SQL editor
   INSERT INTO chats (type, name, created_by) VALUES ('group', 'Test Group', '<user1-uuid>') RETURNING id;
   -- Then add both users:
   INSERT INTO chat_members (chat_id, user_id, role) VALUES ('<chat-id>', '<user1-uuid>', 'owner');
   INSERT INTO chat_members (chat_id, user_id, role) VALUES ('<chat-id>', '<user2-uuid>', 'member');
   ```
3. Open the chat thread on both devices, send messages, observe realtime delivery
4. As user 1, mute user 2:
   ```sql
   INSERT INTO chat_user_mutes (chat_id, muter_id, muted_id)
   VALUES ('<chat-id>', '<user1-uuid>', '<user2-uuid>');
   ```
5. Refresh the chat — user 2's messages should now appear as the collapsed pill
6. Tap the pill — message expands inline. Tap again — collapses

If steps 4-6 work, the wedge is alive.

To test the smart-suggestion, send a sequence like:
- "anyone for 7pm at flowers park?"
- "I'm in 👍"
- "+1"

The `smart-suggest` edge function should insert a system message (look for `is_suggestion = true`) within a few seconds, and the suggestion card should render in the thread.

---

## 6. External service accounts (when ready)

### Apple Developer ($99/year)

Required for:
- Sign in with Apple (mandatory on iOS if you use other social logins)
- TestFlight + App Store distribution
- Push notifications (APNs)

1. Enroll at https://developer.apple.com/programs/
2. Allow 24-48 hours for approval
3. In App Store Connect, create the app with bundle ID `app.pyklr.ios`

### Google Cloud (free tier)

Required for:
- Google Sign-In
- Google Maps Platform (geocoding, Places autocomplete)
- Firebase Cloud Messaging (Android push)

1. https://console.cloud.google.com — create a project named `pyklr`
2. Enable APIs: Maps SDK for Android, Maps SDK for iOS, Places API, Geocoding API, Identity Toolkit API
3. Create OAuth 2.0 client IDs (iOS + Android + Web) → paste into `.env.local`
4. Create a Maps API key, restrict by bundle ID

### Facebook (free)

1. https://developers.facebook.com/apps/create
2. Add Facebook Login product, configure iOS + Android
3. Paste App ID into `.env.local`

### DUPR partnership

1. Apply at https://mydupr.com/partners
2. Approval is manual — allow 4-8 weeks
3. Until approved, the app uses self-reported ratings only. The `dupr_verified` flag handles both states.

### Expo EAS (free for hobby use)

```bash
eas login
eas init    # in apps/mobile
```

This creates the `projectId` that goes in `app.json`.

### Sentry (free tier: 5K events/mo)

1. Sign up at https://sentry.io
2. Create a React Native project
3. Copy the DSN to `EXPO_PUBLIC_SENTRY_DSN`

### Amplitude (free tier)

1. https://amplitude.com — create a project (you've already done this)
2. Copy the API key from Settings → Projects → your project
3. Paste it into `.env.local` as `EXPO_PUBLIC_AMPLITUDE_API_KEY`

---

## 7. Build for production

Once external accounts are set up:

```bash
# Internal preview build (TestFlight + Google internal track)
cd apps/mobile
eas build --profile preview --platform all

# Production build (after Phase 7 acceptance criteria)
eas build --profile production --platform all
eas submit --platform ios --latest
eas submit --platform android --latest
```

---

## Troubleshooting

**"Cannot find native module 'ExpoAppleAuthentication'"**
- You're running in Expo Go, which doesn't include native modules. Switch to a Development Build (see section 4).

**"PostgrestError: new row violates row-level security policy"**
- Most likely you're trying to insert a row where the foreign key user doesn't match `auth.uid()`. Check the RLS policy in `00001_rls.sql` for the affected table.

**The chat doesn't update in realtime**
- Check that Supabase Realtime is enabled for the `messages` table: Dashboard → Database → Replication → toggle on for `public.messages`.

**Smart suggestion never appears**
- The edge function only fires if (a) time is mentioned, (b) location is mentioned, (c) 2+ affirmative replies exist. Check `packages/supabase/functions/smart-suggest/index.ts` for the detection regex. Tail logs via `supabase functions logs smart-suggest`.

**TypeScript errors in `@pyklr/shared`**
- Run `pnpm db:gen-types` to regenerate `database.ts` against your live schema.

**Maps don't render on Android**
- Make sure `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID` is set and that the API key is restricted to the `app.pyklr.android` package name in the Google Cloud console.

---

## Phase plan reminder

Open `docs/ANTIGRAVITY_PROMPT.md` for the full 7-phase agentic build plan. The starter implements roughly Phase 1 + 2 + key parts of Phase 5 (the wedge).

Next phases in order:
- **Phase 3:** Complete the home + tab nav (most of this is done; remaining is push token registration and the FAB action sheet)
- **Phase 4:** Map screen, court detail, find players, court submission
- **Phase 5 finish:** Messages list with real data, group chat creation flow, smart suggestion polish
- **Phase 6:** Events, forum, profile sub-screens, all settings
- **Phase 7:** Push notifications wired up, deep linking, DUPR sync, admin dashboard, store prep

---

## Done.

You should now have:
- A running mobile app on iOS and Android
- A live Supabase project with 25 tables and 30+ RLS policies
- 3 edge functions deployed
- The smart-mute interaction working end-to-end

If you got stuck anywhere, the answer is most likely in `docs/ARCHITECTURE.md`. If it's not, file an issue.

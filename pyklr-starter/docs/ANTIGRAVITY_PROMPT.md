# PYKLR — Antigravity build prompt

> Paste this entire document into Google Antigravity as the initial project brief. It's structured for Antigravity's agentic task system: discrete phases, clear acceptance criteria, and explicit dependencies between agents.

---

## Project identity

**Name:** PYKLR (pronounced "pickler")
**Tagline:** Meet players. Start matches.
**One-liner:** A pickleball community app for finding players, finding courts, organizing matches, and chatting — with a smart-mute feature that fixes the "noisy group chat" problem.
**Target users:** Recreational and competitive pickleball players (3.0–5.0 DUPR), ages 30–65, NY/NJ/CT tri-state launch.

---

## Brand assets (already in `/assets/`)

- `pyklr-logo-color.png` — primary logo with paddle on blue triangle
- `pyklr-mark.svg` — icon-only mark for app icon and headers
- `Sink_copy.ttf` — pixel font for the splash tagline

**Brand colors:**

```typescript
export const colors = {
  // Light mode
  brandGreen: '#67BF69',        // logo green, primary CTA
  brandGreenDark: '#4FA547',    // pressed states, text on tints
  brandGreenLight: '#EAF5E5',   // tint surfaces

  // Dark mode
  brandLime: '#A8E66A',         // dark-mode primary CTA
  brandLimeDark: '#0A1F08',     // text on lime buttons

  // Shared
  brandBlue: '#4493CC',         // logo triangle, accents
  brandBlueLight: '#E4F0F8',    // tint surfaces

  // Surfaces
  bgLight: '#FAFAF7',
  bgDark: '#0B0B0B',
  surfaceLight: '#FFFFFF',
  surfaceDark: '#161616',
  borderLight: '#F0F0F0',
  borderDark: '#262626',
};
```

**The PYKLR wordmark** must always render with `font-weight: 900; font-style: italic; letter-spacing: -0.04em`. In light mode it's `#4FA547`; in dark mode it's `#A8E66A`.

---

## Tech stack — non-negotiable

| Concern | Choice |
|---------|--------|
| Mobile framework | **Expo SDK 51+ managed workflow**, React Native |
| Language | **TypeScript strict mode** |
| Navigation | **expo-router v3** (file-based routing, deep linking) |
| Styling | **NativeWind** (Tailwind for RN) — same utility classes as the JSX mockup files |
| Server state | **TanStack Query** v5 |
| Client state | **Zustand** |
| Forms | **react-hook-form** + **zod** |
| Backend | **Supabase** (auth + Postgres + Realtime + Storage + Edge Functions) |
| Maps | **react-native-maps** (Apple Maps on iOS, Google Maps on Android) |
| Push | **expo-notifications** |
| Icons | **lucide-react-native** |
| Animations | **react-native-reanimated** v3 |
| Crash reporting | **@sentry/react-native** |
| Analytics | **@amplitude/analytics-react-native** |
| Admin dashboard | **Next.js 14 App Router** on Vercel |
| Monorepo | **pnpm workspaces** + **Turborepo** |

**Do not substitute these.** The architecture is tuned to this stack. Adding alternatives (Firebase, NativeBase, etc.) creates conflicts.

---

## Reference files

Two web-React JSX files in the repo root are the **visual spec**:

- `PyklrLight.jsx` — light mode, all 13 screens
- `PyklrDark.jsx` — dark mode, all 13 screens

These are NOT the code to ship — they are a static reference for what the React Native app should look like. Copy the visual structure (spacing, colors, component composition, content hierarchy) but reimplement using React Native primitives (`View`, `Text`, `Pressable`, `ScrollView`, `Image`, etc.) and NativeWind utility classes.

---

## Build phases

This project is structured as **7 phases**. Each phase is an Antigravity Task. Each task has subtasks. Do not start phase N+1 until phase N's acceptance criteria are met.

---

# PHASE 1 — Foundation

**Goal:** Working monorepo, Expo app boots on iOS + Android, Supabase project is live with schema migrated.

## Task 1.1 — Monorepo scaffold

```bash
mkdir pyklr && cd pyklr
pnpm init
# Create pnpm-workspace.yaml with: apps/*, packages/*
# Create turbo.json with build, dev, lint, test pipelines
mkdir -p apps/mobile apps/admin packages/shared packages/supabase
```

Create at the root:
- `package.json` with workspace scripts (`dev`, `build`, `lint`, `test`)
- `tsconfig.base.json` extended by every package
- `.gitignore`, `.editorconfig`, `.nvmrc` (Node 20.x)
- `turbo.json` with pipeline definitions

**Acceptance:** `pnpm install` succeeds from root, `turbo run lint` runs against empty package tree without error.

## Task 1.2 — Expo app initialization

```bash
cd apps/mobile
pnpm create expo-app . --template expo-template-blank-typescript
pnpm install expo-router react-native-screens react-native-safe-area-context
pnpm install nativewind tailwindcss@^3.4 --save-dev
pnpm install zustand @tanstack/react-query
pnpm install lucide-react-native react-native-svg
pnpm install @supabase/supabase-js react-native-url-polyfill
pnpm install @sentry/react-native @amplitude/analytics-react-native
pnpm install react-hook-form zod @hookform/resolvers
pnpm install react-native-reanimated react-native-gesture-handler
```

Configure:
- `app.json` with `scheme: "pyklr"`, `name: "PYKLR"`, `slug: "pyklr"`, `bundleIdentifier: "app.pyklr.ios"`, `package: "app.pyklr.android"`, `userInterfaceStyle: "automatic"` (system theme by default)
- `babel.config.js` with NativeWind preset + Reanimated plugin
- `tailwind.config.js` extending the color tokens above
- `metro.config.js` for NativeWind
- `tsconfig.json` extending `../../tsconfig.base.json`

**Acceptance:** `pnpm start` launches Metro; app boots on iOS simulator showing a placeholder home screen.

## Task 1.3 — Supabase project setup

1. Create a new Supabase project at supabase.com (name it `pyklr-prod` and `pyklr-dev`).
2. In `packages/supabase`:
   ```bash
   pnpm install supabase --save-dev
   pnpm supabase init
   pnpm supabase link --project-ref <ref>
   ```
3. Create the initial migration `packages/supabase/migrations/00000_init.sql` containing the full schema from the README's database section. Tables in order:
   - `profiles`, `follows`, `blocks`
   - `courts`, `court_edits`, `court_reviews`
   - `events`, `event_rsvps`
   - `chats`, `chat_members`, `chat_user_mutes`, `messages`, `message_reactions`
   - `forum_posts`, `forum_comments`, `forum_votes`, `forum_saves`
   - `notifications`, `push_tokens`, `notification_preferences`
   - `reports`, `referrals`
4. Create `00001_rls.sql` with RLS policies (see README for examples). **Every table must have RLS enabled.**
5. Create `00002_functions.sql` with database functions:
   - `handle_new_user()` trigger that creates a profile row when `auth.users` gets a new row
   - `update_chat_last_message_at()` trigger on `messages` insert
   - `decrement_dm_unread_on_read()` trigger
   - `prevent_self_follow()` check constraint
6. Generate TypeScript types: `pnpm supabase gen types typescript --linked > packages/shared/types/database.ts`

**Acceptance:** `pnpm supabase db push --linked` succeeds; `select * from profiles` in the SQL editor returns empty set; database types are generated.

## Task 1.4 — Supabase client + auth wiring

In `apps/mobile/lib/supabase.ts`:

```typescript
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@pyklr/shared/types/database';

export const supabase = createClient<Database>(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
```

Create `hooks/useAuth.ts` that exposes `session`, `user`, `signIn`, `signOut`, `signUpWithEmail`.

**Acceptance:** Sign up with email creates an `auth.users` row, the `handle_new_user` trigger creates a matching `profiles` row, the session persists across app restarts.

---

# PHASE 2 — Auth and onboarding

**Goal:** Splash → sign in/up (email + Apple + Google + Facebook) → player survey → home. All 4 screens match the JSX mockup spec.

## Task 2.1 — Splash screen

`apps/mobile/app/(auth)/splash.tsx`

- Recreate screen 01 from `PyklrLight.jsx`/`PyklrDark.jsx`.
- Logo SVG must be inline (`react-native-svg`) — not a PNG — so it scales.
- `MEET PLAYERS. START MATCHES.` subtitle uses the `Sink_copy.ttf` font loaded via `expo-font`.
- Two buttons: "Get started" (primary CTA → `/sign-up`) and "I already have an account" (ghost → `/sign-in`).
- Splash auto-skips to home if a session exists.

## Task 2.2 — Sign in / sign up screens

`apps/mobile/app/(auth)/sign-up.tsx` and `sign-in.tsx`

Three OAuth buttons + email/password. Implement each provider:

### Apple Sign-In (iOS-only, required by App Store)
```bash
pnpm expo install expo-apple-authentication
```
Use `signInWithIdToken` against Supabase. iOS only — hide the button on Android.

### Google Sign-In
```bash
pnpm expo install @react-native-google-signin/google-signin
```
Configure `iosClientId` and `webClientId` from env. Call Supabase `signInWithIdToken({ provider: 'google', token })`.

### Facebook Login
```bash
pnpm expo install react-native-fbsdk-next
```
Configure with `EXPO_PUBLIC_FACEBOOK_APP_ID`. Exchange the access token for a Supabase session.

### Email + password
Use `supabase.auth.signUp` / `signInWithPassword`. On sign-up, send email verification via Supabase's built-in flow.

**Acceptance:** All four sign-up methods create a profile row. After sign-up, route to `/survey`. After sign-in to an existing account with completed survey, route to `/(tabs)`.

## Task 2.3 — Player survey

`apps/mobile/app/(auth)/survey.tsx`

Multi-step wizard (4 steps, progress bar at top):
1. Display name + city (geocoded via Google Places autocomplete)
2. Play styles (multi-select chips: Competitive / Fun social / Drills / Open play)
3. Availability (multi-select chips: Mornings / Afternoons / Evenings / Weekends)
4. DUPR rating (optional — text input + "Sync with DUPR" button that opens OAuth flow)

On submit, `UPDATE profiles SET ...` and route to `/(tabs)`.

**Acceptance:** Survey state persists between steps (`useReducer` or Zustand). Completing the survey marks `profile.survey_completed = true`. Skipping mid-flow saves draft state.

---

# PHASE 3 — Core navigation and home

**Goal:** Tab bar with 5 tabs (Home, Discover, +FAB, Messages, Profile). Home dashboard fully functional.

## Task 3.1 — Tab navigator

`apps/mobile/app/(tabs)/_layout.tsx`

Custom tab bar matching the JSX mockup — pill-shaped, white surface (light) or `#161616` surface (dark), raised center FAB. The FAB opens a modal sheet with three actions: "Create event", "Add a court", "New post in forum".

Tab order: Home, Discover, [FAB], Messages, Profile. Use `expo-router` `Tabs` component with a custom `tabBar` prop.

## Task 3.2 — Home screen

`apps/mobile/app/(tabs)/index.tsx`

Sections, in order:
1. Header: "Welcome back, {firstName}" + bell icon (notification center) + avatar
2. Search bar (placeholder: "Search courts, players, events")
3. **Featured event card** (blue background, today's first event the user is RSVP'd to OR the most popular open event nearby) — uses `react-query` to fetch from `events` filtered by `starts_at = today AND status = 'open'`
4. Quick action tiles: "Find players" and "Find courts" (route to `/discover` with respective tab)
5. "Popular near you" — list of 3 courts within 5 miles, sorted by reviews
6. Pull-to-refresh

**Acceptance:** All data is real (from Supabase, not mocked). Loading states use skeleton placeholders. Empty states have helpful copy ("No events near you yet — be the first to create one!").

---

# PHASE 4 — Discovery, courts, players

**Goal:** Map-based discovery, court detail, player browsing, court submission.

## Task 4.1 — Discover map screen

`apps/mobile/app/(tabs)/discover.tsx`

Top: filter chips (`5 mi`, `Indoor`, `Lights`, `Free`, `+ More`).
Middle: `react-native-maps` MapView centered on user location (with permission prompt). Custom green pin component for each court. Tapping a pin opens a bottom sheet with that court's summary.
Bottom: scrollable list view of courts (toggle between map and list with a segmented control above).

Use `expo-location` for user location. Fall back to user's profile `location_city` if denied.

## Task 4.2 — Court detail

`apps/mobile/app/court/[id].tsx`

- Image carousel at top (`expo-image` for caching)
- Court name, distance, rating, fee
- Amenity chips
- "Open play happening" section if there are active events
- Two CTAs: "Directions" (opens Apple/Google Maps) and "Join game" (joins the current open play OR creates a new event)
- Reviews section below

## Task 4.3 — Find players screen

`apps/mobile/app/discover/players.tsx` (a nested route under Discover)

Photo-forward player cards (2-column grid). Each card:
- Player photo (or gradient placeholder if no photo)
- DUPR rating badge in top-right (lime if verified, white if self-reported)
- Name + distance + tag (Verified / Mornings / etc.)
- "Match" button (verified players) or "View" button (others)

Tapping a card opens `app/u/[username].tsx`.

## Task 4.4 — Court submission

`apps/mobile/app/court/new.tsx` (accessible from the FAB)

3-step wizard:
1. Search for the location (Google Places autocomplete) OR drop a pin on a map
2. Add details: name, court count, type, surface, fee, amenities (checkboxes)
3. Upload photos (up to 4 via `expo-image-picker`)

Submission creates a row with `status = 'pending'`. Admin must approve before it appears publicly.

**Acceptance:** Submitting a court creates a `courts` row + uploads images to Supabase Storage at `courts/{id}/photo-{n}.jpg`. The submitter sees a confirmation modal.

---

# PHASE 5 — Messaging (THE WEDGE)

**Goal:** DMs + group chats + per-user muting + smart suggestions.

This phase is the product's differentiator. **Do not under-invest here.** Build the muting interaction first; it's what makes PYKLR PYKLR.

## Task 5.1 — Realtime chat plumbing

Set up Supabase Realtime subscription wrapper in `apps/mobile/hooks/useChat.ts`:

```typescript
export function useChat(chatId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [mutedUsers, setMutedUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    // 1. Fetch existing messages with TanStack Query
    // 2. Fetch chat_user_mutes for current user + this chat
    // 3. Subscribe to INSERT/UPDATE on messages where chat_id = chatId
    const channel = supabase
      .channel(`chat:${chatId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
        (payload) => setMessages(prev => [...prev, payload.new])
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [chatId]);

  return { messages, mutedUsers, /* helpers */ };
}
```

## Task 5.2 — Messages list screen

`apps/mobile/app/(tabs)/messages.tsx`

Three tabs (chip filters): My groups / DMs / Requests.

- "My groups" — list of group chats, sorted by `last_message_at` desc
- "DMs" — list of 1:1 chats
- "Requests" — DMs from users you don't follow yet (separate inbox)

Each row: avatar/group color block + name + last message preview + unread badge + timestamp. Featured group (event group, or pinned) gets the blue tinted background.

## Task 5.3 — Chat thread screen (the wedge)

`apps/mobile/app/chat/[id].tsx`

Header: back button, group avatar, group name, "{N} members · {M} muted" subtitle, three-dot menu.

Message list (inverted scroll, like iMessage):
- Normal message: avatar + sender name + timestamp + bubble
- **Muted user message** (the wedge):
  - Renders as a single-line collapsed pill: `[volume-off icon] Big Mike sent a message — muted [eye icon]`
  - Background: very faint surface, 60% opacity
  - Tap on the pill expands the bubble inline (one-time, until next tap)
  - The muted user is NOT notified
- Your own message: right-aligned, lime bubble

Three-dot menu opens a bottom sheet:
- "View members" → opens member list with a mute toggle next to each
- "Mute conversation" (silences notifications, doesn't hide messages)
- "Leave group"
- "Report group"

Long-press on any message → reactions emoji bar + reply / copy / report.

### Per-user mute implementation

When user taps "Mute this person" in the member list:
```typescript
await supabase.from('chat_user_mutes').insert({
  chat_id: chatId,
  muter_id: currentUserId,
  muted_id: targetUserId,
});
```

On message render:
```typescript
const isMuted = mutedUsers.has(message.sender_id);
return isMuted ? <MutedMessagePill ... /> : <MessageBubble ... />;
```

## Task 5.4 — Smart suggestion card

Edge function `packages/supabase/functions/smart-suggest/index.ts`:

Triggered by `messages` insert. Logic:
1. Look at the last 10 messages in this chat
2. Detect a meetup-forming pattern using simple keyword + structure rules:
   - Time mentioned (regex: `\b\d{1,2}(?::\d{2})?\s?(?:am|pm|AM|PM)\b`)
   - Court or location mentioned (match against `courts.name`)
   - ≥2 affirmative replies ("I'm in", "+1", "yes", "👍")
3. If detected, insert a special message:
   ```sql
   INSERT INTO messages (chat_id, sender_id, body, is_suggestion, suggestion_payload)
   VALUES ($1, NULL, 'Create event...', true, '{"action": "create_event", "draft": {...}}');
   ```
4. The mobile app renders `is_suggestion = true` messages as the green gradient smart-suggestion card with a "Schedule event" button that opens `/event/new` pre-filled.

**Acceptance:** Two users in a group chat — one says "anyone for 7pm at Flowers Park?", the other replies "I'm in 👍" — within 5 seconds the smart suggestion card appears in the thread.

## Task 5.5 — Block, report, leave

- Blocking a user (from their profile or chat menu) creates a `blocks` row + filters their content app-wide via RLS
- Reporting creates a `reports` row → admin moderation queue
- Leaving a group removes the user from `chat_members`

---

# PHASE 6 — Events, forum, profile, settings

**Goal:** All remaining MVP screens functional.

## Task 6.1 — Create event wizard

`apps/mobile/app/event/new.tsx` — 5 steps:
1. Basics (name, format: singles/doubles/mixed)
2. Court (autocomplete from `courts` table, or use selected court if launched from court detail)
3. Skill range (slider 1.0–6.0)
4. Date/time + max players
5. Visibility (public/invite) + invite specific players + description

On submit:
- Insert into `events`
- Create a group chat (`chats.type = 'event'`, `event_id = events.id`)
- Add the host to `chat_members` as owner
- If invite-only, add invited players to `chat_members`
- Push notification to invitees: "{Host} invited you to {Event}"

## Task 6.2 — Event detail

`apps/mobile/app/event/[id].tsx`

- Header with cover (court photo or gradient)
- Date, time, court, skill range, host
- RSVP buttons: Going / Maybe / Declined
- Attendees list with avatars
- "Open chat" button → routes to the event's group chat
- Host can edit/cancel
- Comments section (a thin layer over the event's group chat)

## Task 6.3 — Community forum

`apps/mobile/app/(tabs)/community.tsx`

- Tag chip filter at top: All / Gear / Strategy / Courts / General
- Post feed (Reddit-style cards)
- Tap post → `/p/[id]` shows full post + threaded comments
- Vote arrows on posts and comments
- Subscribe to tag → bell icon turns active
- FAB +New post → `/forum/new` with title, body, optional image, tag

## Task 6.4 — Profile (yours and others)

`apps/mobile/app/(tabs)/profile.tsx` — your own profile
`apps/mobile/app/u/[username].tsx` — anyone's profile (deep-linkable)

Profile screen content:
- Avatar + name + DUPR badge (verified ✓ if synced)
- City + play style chips
- Stats: Matches / Win rate / Followers / Following
- Follow / Unfollow button (others' profiles only)
- Message button (respects `dm_permission` setting)
- Achievement badges row
- Recent activity feed (last 10 events attended, posts authored, courts added)
- Three-dot menu: Block, Report (others' profiles)

**Deep linking:** `https://pyklr.app/u/sarah-k` should open the app to that profile (configure `expo-router` universal links + Apple App Site Association file at `pyklr.app/.well-known/apple-app-site-association`).

## Task 6.5 — Settings

`apps/mobile/app/settings/index.tsx` — index list. Sub-screens:

### Privacy (`settings/privacy.tsx`)
- Profile visibility (Public / Followers / Private) — radio group
- DM permissions (Anyone / Followers / Nobody) — radio group
- Show me to nearby players — toggle
- "Available to match" status — toggle
- Hide my DUPR rating — toggle

### Notifications (`settings/notifications.tsx`)
- Toggle each notification type (DMs, group mentions, event invites, RSVPs, follows, comment replies, forum activity, smart suggestions)
- Email digest frequency (Never / Daily / Weekly) — radio group

### Integrations (`settings/integrations.tsx`)
- DUPR sync (connect/disconnect, last sync time)
- Apple Calendar sync (connect → requests `EventKit` permission)
- Google Calendar sync (OAuth flow)
- Push notifications (deep link to system settings if disabled)

### Blocked (`settings/blocked.tsx`)
- List of blocked users with "Unblock" action

### Account
- Edit profile
- Change email / password
- Data export (button → triggers `digest-mailer` edge function with `type: 'data_export'`)
- Delete account (soft delete with 30-day grace, then `auth.users` delete cascades)

### Appearance
- Theme: System / Light / Dark — radio group, persisted in AsyncStorage

---

# PHASE 7 — Notifications, deep links, polish, admin

## Task 7.1 — Push notifications

```bash
pnpm expo install expo-notifications expo-device
```

On app launch (after auth):
1. Request permission
2. Get Expo push token via `Notifications.getExpoPushTokenAsync()`
3. Save token to `push_tokens` table

Edge function `packages/supabase/functions/push-dispatcher/index.ts`:
- Triggered by `notifications` insert
- Look up the recipient's `push_tokens` and `notification_preferences`
- If the relevant pref is on, POST to Expo Push API:
  ```typescript
  fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: pushToken,
      title: '...',
      body: '...',
      data: { deepLink: 'pyklr://chat/abc123' },
    }),
  });
  ```

Handle notification tap → deep link routing via `expo-router`.

## Task 7.2 — Deep linking

Configure `app.json`:
```json
{
  "scheme": "pyklr",
  "ios": {
    "associatedDomains": ["applinks:pyklr.app"]
  },
  "android": {
    "intentFilters": [{
      "action": "VIEW",
      "data": { "scheme": "https", "host": "pyklr.app" },
      "category": ["BROWSABLE", "DEFAULT"],
      "autoVerify": true
    }]
  }
}
```

Deep link routes:
- `pyklr.app/u/{username}` → profile
- `pyklr.app/p/{post_id}` → forum post
- `pyklr.app/e/{event_id}` → event detail
- `pyklr.app/c/{court_id}` → court detail
- `pyklr.app/invite/{code}` → onboarding with referral attribution

Host `apple-app-site-association` and `assetlinks.json` on the marketing site.

## Task 7.3 — DUPR sync edge function

`packages/supabase/functions/dupr-sync/index.ts`

OAuth flow:
1. User taps "Sync with DUPR" in settings
2. App opens an in-app browser to `https://api.dupr.com/v1/oauth/authorize?client_id=...&redirect_uri=pyklr://dupr-callback`
3. User authorizes; DUPR redirects back to `pyklr://dupr-callback?code=...`
4. App POSTs the code to the edge function
5. Edge function exchanges the code for a DUPR access token, fetches the user's rating, and updates `profiles.dupr_rating = ...`, `dupr_verified = true`, `dupr_synced_at = now()`

Set up a weekly cron job (`pg_cron`) to refresh all synced users' ratings.

**If the DUPR partnership isn't approved in time:** ship with self-reported ratings only and add a "DUPR sync coming soon" placeholder. The `dupr_verified` flag handles both states.

## Task 7.4 — Admin dashboard

`apps/admin/` — Next.js 14 App Router.

Routes:
- `/users` — searchable list, view profile, suspend/ban, delete
- `/courts` — pending submission queue, approve/reject, edit
- `/reports` — moderation queue, view reported content, action (warning / suspend / ignore)
- `/events` — list, edit, cancel
- `/forum` — flagged posts, remove, restore
- `/analytics` — user count, DAU/WAU/MAU, events created, messages sent (Amplitude dashboard embed)

Auth: admin-only route guard using a `role` claim on the JWT (set via custom Postgres `is_admin` function).

## Task 7.5 — Crash reporting and analytics

Initialize Sentry in `apps/mobile/_layout.tsx`:
```typescript
import * as Sentry from '@sentry/react-native';
Sentry.init({ dsn: process.env.EXPO_PUBLIC_SENTRY_DSN, tracesSampleRate: 0.2 });
```

Initialize Amplitude in `apps/mobile/_layout.tsx` (after Sentry) and create a thin wrapper at `apps/mobile/lib/analytics.ts`:
```typescript
// lib/analytics.ts
import * as amplitude from '@amplitude/analytics-react-native';

let initialized = false;

export function initAnalytics() {
  if (initialized || !process.env.EXPO_PUBLIC_AMPLITUDE_API_KEY) return;
  amplitude.init(process.env.EXPO_PUBLIC_AMPLITUDE_API_KEY);
  initialized = true;
}

export function track(event: string, props?: Record<string, unknown>) {
  amplitude.track(event, props);
}

export function identify(userId: string) {
  amplitude.setUserId(userId);
}
```
Call `initAnalytics()` once at app start, `identify(user.id)` on sign-in, and `track(...)` for these key events:
- `auth.sign_up`, `auth.sign_in`
- `profile.completed_survey`
- `event.created`, `event.joined`
- `chat.message_sent`, `chat.user_muted`
- `court.submitted`, `court.viewed`
- `forum.post_created`, `forum.upvoted`
- `smart_suggestion.shown`, `smart_suggestion.accepted`

## Task 7.6 — Empty states, loading states, error boundaries

Every screen must have:
- A loading skeleton (use `react-content-loader`)
- An empty state with helpful copy and a CTA
- An error state with retry
- A global error boundary at the root that reports to Sentry

## Task 7.7 — App Store + Play Store prep

App Store:
- App name: PYKLR
- Subtitle: Meet players. Start matches.
- Description: ~300 words
- Keywords: pickleball, courts, DUPR, find players, match, league
- Screenshots: 6.7" + 6.5" + 5.5" (iPhone) + 12.9" (iPad-optional)
- Privacy policy URL: `pyklr.app/privacy`
- Support URL: `pyklr.app/support`
- App Privacy: declare data collection (account info, location, contacts if used)
- Sign in with Apple: required since other social logins are used (App Store rule)

Play Store:
- Internal testing track with 12+ testers for 14 days (newer Google policy)
- Same description/screenshots
- Data Safety section completed

---

# Acceptance criteria for full launch

The product is ready to ship to TestFlight and Play Store internal track when:

1. ✅ All 13 screens from the JSX mockups are implemented in React Native and match visually
2. ✅ Email + Apple + Google + Facebook sign-up all work end-to-end
3. ✅ User can complete onboarding survey and reach home
4. ✅ User can find courts on a map, view details, and submit a new court
5. ✅ User can find players, send a follow, send a DM
6. ✅ User can create an event, invite players, RSVP
7. ✅ Group chat works in realtime with the per-user mute interaction
8. ✅ Smart suggestion card appears when a meetup forms in chat
9. ✅ Forum supports posts, comments, votes, tags
10. ✅ Push notifications deliver for DMs, event invites, RSVPs, follows, mentions
11. ✅ Deep links route correctly on iOS and Android
12. ✅ Settings exposes all privacy + notification + integration controls
13. ✅ Admin dashboard can approve courts and moderate reports
14. ✅ Crash-free session rate ≥ 99% over 100 sessions in Sentry
15. ✅ TypeScript strict mode, zero `any`, ESLint clean
16. ✅ App icon + splash configured for both platforms
17. ✅ Privacy policy + terms hosted on `pyklr.app`
18. ✅ Data export + account deletion flows tested

---

# How Antigravity should approach this

**Run each phase as a separate Task.** Within a Task, break into sub-tasks for each numbered section. Allow yourself to:

1. **Use the browser preview** to test the running Expo app on every iteration. The dev server URL should be open in your browser tab while you work.
2. **Reference the JSX mockup files** (`PyklrLight.jsx`, `PyklrDark.jsx`) constantly. Open both and split-screen them with the React Native component you're building. Match the visual structure node-for-node.
3. **Use TypeScript strictly.** When in doubt, generate Supabase types with `pnpm supabase gen types` rather than handwriting interfaces.
4. **Test on both iOS and Android simulators** before marking any sub-task complete. The two platforms render maps and push differently.
5. **Commit after each sub-task** with a conventional commit message: `feat(messaging): add per-user mute pill`, `fix(auth): handle Apple sign-in cancellation`.
6. **When stuck on an API integration** (DUPR, Apple, Google, Facebook), surface the blocker and continue with the next sub-task — don't burn cycles on credential issues. Stub the integration with a feature flag and revisit.

---

# Important gotchas

- **Apple App Store rule 4.8:** If you offer Facebook or Google sign-in, you MUST also offer Sign in with Apple on iOS. Don't skip the Apple integration.
- **NativeWind v4 vs v3:** Pin to v4 specifically — v3 has different syntax and breaks layout.
- **expo-router v3 vs v4:** v3 is current stable; v4 alpha syntax differs. Pin to v3.
- **Supabase RLS recursion:** Avoid policies that reference the same table they protect via JOIN — Postgres will throw infinite recursion. Use a SECURITY DEFINER function for cross-table checks.
- **DUPR API approval can take 4–8 weeks.** Start the application before code is written.
- **iOS push tokens are fragile.** Re-register on every app launch; tokens rotate when users uninstall/reinstall.
- **Google Play closed testing requirement:** 12 testers × 14 continuous days before production review. Schedule this into the launch timeline.
- **Smart-mute UX has a sharp edge:** if you mute someone in a 100-message-deep thread, scrolling past their muted pills should be smooth, not janky. Use `FlashList` not `FlatList` for the message list.

---

# Out of scope for this build

Do NOT build (these are Phase 2):

- Tournament brackets and ladder management
- Score reporting / DUPR match submission
- Video coaching library
- AR shot analysis
- Live streaming
- Premium subscriptions and Stripe billing
- In-app gear marketplace
- Multi-language support

If a user asks for these, log them as Phase 2 candidates and move on.

---

# Final note to Antigravity

This is a community app, not a sports utility. **The experience of the smart-mute interaction and the chat-to-event smart-suggestion card is the single most important thing in the entire codebase.** Spend disproportionate effort on those two interactions. Everything else can be 80% — those two must be 100%.

When you finish each Phase, generate a short markdown report at `docs/progress/phase-N.md` summarizing what's done, what's deferred, and any blockers. The Product Manager (Merrick) will review before unblocking the next phase.

Build with care.

— End of brief —

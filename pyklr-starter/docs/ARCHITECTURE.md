# PYKLR

> **Meet players. Start matches.**
> A pickleball community app for iOS + Android, built with React Native, Expo, and Supabase.

![PYKLR Logo](./assets/logos/pyklr-logo-color.png)

---

## Table of contents

1. [What this is](#what-this-is)
2. [Brand](#brand)
3. [Mockups](#mockups)
4. [MVP feature scope](#mvp-feature-scope)
5. [Social features](#social-features)
6. [Tech stack](#tech-stack)
7. [Architecture overview](#architecture-overview)
8. [Database schema](#database-schema)
9. [External APIs and services](#external-apis-and-services)
10. [Folder structure](#folder-structure)
11. [Setup](#setup)
12. [Environment variables](#environment-variables)
13. [Build and deployment](#build-and-deployment)
14. [Phase 2 — deferred](#phase-2--deferred)

---

## What this is

PYKLR is a mobile app for pickleball players to find each other, find courts, organize matches, and stay connected to a local pickleball community. The product wedge is **Smart Messaging** — group chats with granular per-user muting, so people don't leave noisy court chats just because one person is too chatty. Most pickleball apps in the market are either tournament-management tools (Pickleheads, DUPR) or court-finders with a thin social layer (PlayTimeScheduler). PYKLR is community-first.

Core MVP targets a 4–6 month build on a $60K–$100K budget. The technical decisions in this document optimize for that constraint: cross-platform via Expo, Supabase for backend (auth + DB + realtime + storage), and deferred monetization so the team can focus on growth.

**Target launch:** iOS App Store + Google Play, free MVP, NY/NJ/CT tri-state seed market expanding from Westchester County.

---

## Brand

### Logo

The PYKLR mark consists of a green pickleball paddle and ball overlaid on a blue triangle wedge. The wordmark is a bold italic display face with the `MEET PLAYERS. START MATCHES.` tagline set in a pixel/8-bit font (`Sink_copy.ttf`) underneath.

| Variant | Use case |
|---------|----------|
| `pyklr-logo-color.png` | Primary on light surfaces |
| `pyklr-logo-color.ai` | Vector source, for any new export |
| `pyklr-mark-only.svg` | App icon, header glyph, favicon |
| `pyklr-wordmark.svg` | Standalone wordmark when paired with the mark elsewhere |

### Color system

The primary colors are sampled directly from the logo PNG.

| Token | Hex | RGB | Use |
|-------|-----|-----|-----|
| `--brand-green` | `#67BF69` | 103, 191, 105 | Logo green, primary CTAs in light mode |
| `--brand-green-dark` | `#4FA547` | — | Pressed/hover state, text on light tints |
| `--brand-green-light` | `#EAF5E5` | — | Tint surfaces in light mode |
| `--brand-lime` | `#A8E66A` | — | Primary CTAs in **dark mode only** (logo green disappears against black) |
| `--brand-lime-dark` | `#0A1F08` | — | Text on lime buttons |
| `--brand-blue` | `#4493CC` | 68, 147, 204 | Logo triangle, accent on featured cards and avatars |
| `--brand-blue-light` | `#E4F0F8` | — | Tint surfaces |
| `--bg-page-light` | `#FAFAF7` | — | App background, light mode |
| `--bg-page-dark` | `#0B0B0B` | — | App background, dark mode |
| `--surface-dark` | `#161616` | — | Card surfaces, dark mode |
| `--border-dark` | `#262626` | — | Hairline dividers, dark mode |

**Theme rule:** the app supports both light and dark mode, user-selectable in Settings. System default is honored on first launch. Brand green `#67BF69` is used in light mode; the punchier lime `#A8E66A` is used in dark mode because the sage green disappears against black surfaces.

### Typography

| Role | Family | Notes |
|------|--------|-------|
| Headings + wordmark | `Inter` (or `SF Pro Display` on iOS, `Roboto` on Android, via Expo `expo-font`) | Weight 900 italic for `PYKLR` wordmark; weight 700 for headings |
| Body | System default (`-apple-system`, `Roboto`) | 14–16px, weight 400–500 |
| Subtitle/tagline | `Sink_copy.ttf` (custom pixel font in `/assets/fonts/`) | Reserved for the splash subtitle `MEET PLAYERS. START MATCHES.` |
| Numeric/code | `SF Mono`, `Roboto Mono` | DUPR ratings, distances, monospaced status |

The wordmark renders with `font-weight: 900; font-style: italic; letter-spacing: -0.04em` to match the logo exactly.

### Spacing and corners

- Corner radius `lg` = 18px (cards)
- Corner radius `md` = 12px (buttons, inputs)
- Corner radius `xl` = 28px (tab bar pill, modal sheets)
- Spacing scale: 4, 8, 12, 16, 20, 24, 32, 48 (mobile-tuned)

---

## Mockups

Two JSX reference files render the complete 13-screen flow in both modes side-by-side:

- **`PyklrLight.jsx`** — full light-mode app, sage-green CTAs, white surfaces, soft pastel tint cards
- **`PyklrDark.jsx`** — full dark-mode app, lime-green CTAs, obsidian surfaces, ambient radial glows

Each file is a single self-contained React component that renders all 13 screens in iPhone-style frames with proper notches, status bars, scrolling content, and tab bars. They are not React Native — they are web React for **design reference and stakeholder review only**. The actual build uses React Native + Expo (see [Tech stack](#tech-stack)).

### To preview the mockups

```bash
# In any Vite or Next.js project
npm install lucide-react tailwindcss
# Drop PyklrLight.jsx or PyklrDark.jsx into a route, render <PyklrLight /> or <PyklrDark />
```

Or paste into a Claude artifact, a CodeSandbox, or any React playground that supports lucide-react.

### Screens covered

| # | Screen | Light | Dark | Notes |
|---|--------|-------|------|-------|
| 01 | Splash | ✓ | ✓ | Logo intro, sign-in entry |
| 02 | Auth (sign up) | ✓ | ✓ | Apple, Google, Facebook, email |
| 03 | Player survey | ✓ | ✓ | Game style, availability, DUPR |
| 04 | Home dashboard | ✓ | ✓ | Featured event, quick actions, popular courts |
| 05 | Discover map | ✓ | ✓ | Map view with pins and chip filters |
| 06 | Court detail | ✓ | ✓ | Photos, amenities, open play |
| 07 | Find players | ✓ | ✓ | Photo-forward player cards with DUPR badges |
| 08 | Messages list | ✓ | ✓ | Groups + DMs |
| 09 | **Smart chat thread** | ✓ | ✓ | **Per-user mute pill + smart suggestion card — the differentiator** |
| 10 | Create event | ✓ | ✓ | Wizard, format/court/skill/date |
| 11 | Community forum | ✓ | ✓ | Reddit-style with tags and upvotes |
| 12 | Profile | ✓ | ✓ | Stats, achievements, recent activity |
| 13 | Settings | ✓ | ✓ | Privacy toggles, integrations, theme |

### The smart-mute interaction (the wedge)

In screen 09, when a user has muted a member of a group chat, that member's messages collapse to a single-line pill with an eye icon (tap to expand once). This is intentional — the muted user visually disappears from the thread but stays rejoinable. Mute is per-thread, per-user, and reversible. No notification is sent to the muted person. This is the core PYKLR differentiator: granular muting without leaving the group.

### The smart suggestion card (also screen 09)

When the system detects a meetup forming in a group chat (someone proposing a time, +1 confirmations from others), it surfaces a gradient-green card labeled `SMART SUGGESTION` that offers to convert the chat into a formal event with the right court, time, and RSVPs prefilled. This is the chat-to-event bridge.

---

## MVP feature scope

### In scope for launch

| Area | Features |
|------|----------|
| **Auth** | Email + password, Apple Sign-In (required on iOS), Google Sign-In, Facebook Sign-In |
| **Profile** | Photo, display name, location (city), playing level (DUPR or self-reported 1.0–6.0), play style (competitive/social/drills/open play), availability windows, bio (160 chars), profile visibility settings |
| **Discovery** | Find players (filtered by distance, skill, style), find courts (map + list view), court details with photos and amenities |
| **Courts** | Crowdsourced + community-edited database, users can submit new courts, admin review, photo upload, amenity tags |
| **Matches and events** | Create event (5-step wizard: name → format → court → skill range → date/time), RSVP, max player cap, public vs invite-only, comments per event |
| **Smart messaging** | DMs, group chats, per-user muting (the wedge), unmute, smart suggestions, read receipts (toggleable), typing indicators |
| **Forum** | Reddit-style threaded posts, tags (Gear, Strategy, Courts, General), upvotes, comments, sort by hot/new/top |
| **Notifications** | Push (FCM/APNs via Expo Push), in-app notification center, granular preferences (DMs, group mentions, event invites, RSVPs, follows, comments) |
| **Calendar** | Personal event list, ICS export, Apple Calendar + Google Calendar sync |
| **Admin** | Web dashboard for user moderation, court approval, content moderation, basic analytics |

### Social features (full list)

Since social functionality is core to community-app DNA, here's the explicit scope:

#### Following and discovery
- Follow another user (asymmetric, like Twitter — no approval required unless target is private)
- Unfollow, followers list, following list
- Suggested players based on shared courts, skill proximity, and mutual follows
- "Players I've played with" auto-list based on shared event attendance

#### Profile and identity
- Public profile URL: `pyklr.app/u/{username}` (deep-linkable, shareable)
- Profile photo + optional cover image
- Verified badge for DUPR-synced accounts
- Achievement badges (first match, 10 matches, ladder winner, etc.)
- Recent activity feed on profile (matches played, events created, courts added)
- Privacy: public profile / followers-only / private

#### Messaging
- 1:1 direct messages with read receipts and typing indicators
- Group chats (auto-created for events, manually created for friend groups)
- **Per-user muting within groups** (the wedge — see screen 09)
- Mute entire conversation (notification silencing)
- Block user (hides all content + prevents DMs both ways)
- Report user / report message (sent to moderation queue)
- Message reactions (emoji, like Slack)
- Reply threads inside group chats
- Image and location attachments (Phase 1.5 — deferred from MVP, see below)

#### Community forum
- Post creation with tag selection, optional image
- Comments with nested replies (2 levels deep)
- Upvote and downvote on posts and comments
- Subscribe to tags to get notified of new posts
- User-level karma (sum of upvotes received)
- Save/bookmark posts
- Share post outside the app (generates a `pyklr.app/p/{post_id}` link)

#### Privacy and safety
- Block list management
- Report flow (user, message, post, court)
- Granular notification toggles
- "Available to match" online status (toggleable, defaults on)
- Profile visibility tiers (public / followers / private)
- DM permissions (anyone / followers only / nobody)
- Hide DUPR rating (show only "verified" status)
- Data export request flow (GDPR-style, request via Settings → emails CSV within 30 days)
- Account deletion (soft delete with 30-day grace, then hard delete)

#### Sharing and growth loops
- Invite a friend (generates referral link with deep link → app store → onboarding pre-attributed)
- Share event externally (generates link to event page, opens in app if installed or web fallback)
- Share player profile (deep link to profile)
- "I'm at this court" check-in (Phase 1.5 — deferred)

---

## Tech stack

### Mobile (single codebase, iOS + Android)

- **Framework:** React Native via **Expo SDK 51+** (managed workflow)
- **Language:** TypeScript (strict mode)
- **Navigation:** `expo-router` v3 (file-based routing, deep linking native)
- **State management:** Zustand for client state, TanStack Query for server state
- **Styling:** NativeWind (Tailwind for React Native) — same utility classes as the JSX mockups
- **Icons:** `lucide-react-native`
- **Forms:** `react-hook-form` + `zod` for validation
- **Animations:** `react-native-reanimated` v3 + `react-native-gesture-handler`
- **Maps:** `react-native-maps` (Apple Maps on iOS, Google Maps on Android)
- **Push:** `expo-notifications` (handles APNs + FCM under the hood)
- **Storage:** `@react-native-async-storage/async-storage` for local prefs
- **Sentry:** `@sentry/react-native` for crash reporting

### Backend (Supabase)

Supabase is the entire backend — auth, database, realtime, storage, edge functions. This is a deliberate choice to compress build time and reduce DevOps overhead.

- **Auth:** Supabase Auth (email + OAuth providers for Apple/Google/Facebook)
- **Database:** Postgres 15 with Row-Level Security (RLS) on every table
- **Realtime:** Supabase Realtime (Phoenix Channels over WebSocket) for chat, presence, live updates
- **Storage:** Supabase Storage for profile photos, court photos, message attachments
- **Edge Functions:** Deno-based serverless functions for things RLS can't handle:
  - DUPR sync webhook receiver
  - Push notification dispatcher
  - Smart suggestion analyzer (detects meetup formation in chat → creates suggestion card)
  - Report moderation pipeline
  - Daily digest emailer
- **Cron:** Supabase Cron (pg_cron) for scheduled jobs

### Admin web dashboard

- **Framework:** Next.js 14 (App Router) deployed to Vercel
- **UI:** shadcn/ui + Tailwind
- **Auth:** Supabase Auth (admin role check via RLS policy)
- **Hosting:** Vercel free tier sufficient at MVP scale

### Hosting and infrastructure summary

| Component | Provider | Cost estimate (MVP) |
|-----------|----------|---------------------|
| Mobile builds | Expo EAS | $0 (free tier) / $99/mo (production tier) |
| Backend (DB, auth, realtime, storage, functions) | Supabase Pro | $25/mo |
| Admin dashboard | Vercel Hobby/Pro | $0 / $20/mo |
| Push notifications | Expo Push (free) + APNs/FCM (free) | $0 |
| Crash reporting | Sentry | $0 (free tier, 5K events/mo) |
| Analytics | Amplitude | $0 (free tier) |
| Email transactional | Resend | $0 (free 100/day) |
| Domain | `pyklr.app` (already owned) | ~$12/yr |
| Apple Developer Account | Apple | $99/yr |
| Google Play Developer | Google | $25 (one-time) |
| Google Maps Platform | Google Cloud | Free tier covers ~28K map loads/mo |

**Estimated monthly infra cost at MVP launch:** $45–$140/month depending on tier choices.

---

## Architecture overview

```
┌─────────────────────────────────────────────────────────────────┐
│                  Mobile clients (iOS + Android)                 │
│                  Expo + React Native + TypeScript               │
└────────────┬────────────────────────────┬───────────────────────┘
             │                            │
             │ HTTPS (Supabase JS SDK)    │ WebSocket (Realtime)
             │                            │
┌────────────▼────────────────────────────▼───────────────────────┐
│                          Supabase                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐    │
│  │   Auth   │  │ Postgres │  │ Realtime │  │   Storage    │    │
│  │ (OAuth + │  │ (RLS on  │  │  (chat,  │  │  (photos,    │    │
│  │  email)  │  │   all)   │  │ presence)│  │ attachments) │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘    │
│                                                                 │
│  ┌────────────────────── Edge Functions ──────────────────────┐│
│  │  dupr-sync · push-dispatcher · smart-suggest               ││
│  │  report-pipeline · digest-mailer · invite-attribution      ││
│  └─────────────────────────────────────────────────────────────┘│
└────────┬────────────────────┬──────────┬─────────────────────────┘
         │                    │          │
         │ webhook            │ outbound │ outbound
         │                    │ HTTPS    │ HTTPS
┌────────▼─────┐  ┌──────────▼──────┐  ┌▼──────────────────┐
│  DUPR API    │  │  Expo Push API  │  │  Google Maps API  │
│  (ratings)   │  │  (APNs + FCM)   │  │  (geocoding,      │
└──────────────┘  └─────────────────┘  │   directions)     │
                                       └───────────────────┘

┌──────────────────────────┐
│   Admin Dashboard        │
│   Next.js on Vercel      │──── direct Supabase connection (admin RLS role)
└──────────────────────────┘
```

---

## Database schema

Tables marked `🔒` have RLS policies enforcing user-scoped access.

```sql
-- ============================================================
-- USERS & PROFILES
-- ============================================================
🔒 profiles
  id (uuid, PK, references auth.users)
  username (text, unique, lowercase)
  display_name (text)
  bio (text, max 160 chars)
  avatar_url (text)
  cover_url (text)
  location_city (text)
  location_lat (float8)
  location_lng (float8)
  dupr_rating (decimal)
  dupr_verified (bool)
  dupr_synced_at (timestamp)
  self_rating (decimal)
  play_styles (text[])  -- {'competitive', 'social', 'drills', 'open_play'}
  availability (text[])  -- {'mornings', 'afternoons', 'evenings', 'weekends'}
  visibility (enum: 'public', 'followers', 'private')
  dm_permission (enum: 'anyone', 'followers', 'nobody')
  available_to_match (bool)
  hide_rating (bool)
  created_at, updated_at

🔒 follows
  follower_id (uuid → profiles.id)
  followed_id (uuid → profiles.id)
  created_at
  PRIMARY KEY (follower_id, followed_id)

🔒 blocks
  blocker_id (uuid → profiles.id)
  blocked_id (uuid → profiles.id)
  created_at
  PRIMARY KEY (blocker_id, blocked_id)

-- ============================================================
-- COURTS (crowdsourced + community-edited)
-- ============================================================
🔒 courts
  id (uuid, PK)
  name (text)
  address (text)
  lat (float8), lng (float8)
  court_count (int)
  court_type (enum: 'outdoor', 'indoor', 'mixed')
  surface (enum: 'asphalt', 'concrete', 'wood', 'turf', 'other')
  fee_type (enum: 'free', 'paid', 'members_only')
  fee_amount (decimal, nullable)
  amenities (text[])  -- {'lights', 'restroom', 'parking', 'water', 'shade'}
  hours (jsonb)
  photos (text[])
  status (enum: 'pending', 'verified', 'closed', 'flagged')
  submitted_by (uuid → profiles.id)
  verified_by (uuid → profiles.id, nullable)
  created_at, updated_at

🔒 court_edits  -- audit log for community edits
  id, court_id, edited_by, field_changed, old_value, new_value, created_at

🔒 court_reviews
  id, court_id, user_id, rating (1-5), comment, photos, created_at

-- ============================================================
-- EVENTS
-- ============================================================
🔒 events
  id (uuid, PK)
  name (text)
  format (enum: 'singles', 'doubles', 'mixed')
  court_id (uuid → courts.id)
  host_id (uuid → profiles.id)
  skill_min, skill_max (decimal)
  starts_at (timestamp)
  ends_at (timestamp, nullable)
  max_players (int)
  visibility (enum: 'public', 'invite_only')
  description (text)
  status (enum: 'open', 'full', 'cancelled', 'completed')
  group_chat_id (uuid → chats.id)  -- auto-created on event create
  created_at, updated_at

🔒 event_rsvps
  event_id, user_id, status (enum: 'going', 'maybe', 'declined'), created_at
  PRIMARY KEY (event_id, user_id)

-- ============================================================
-- MESSAGING (the wedge)
-- ============================================================
🔒 chats
  id (uuid, PK)
  type (enum: 'dm', 'group', 'event')
  name (text, nullable for DMs)
  avatar_url (text, nullable)
  event_id (uuid → events.id, nullable)
  created_by (uuid → profiles.id)
  created_at, updated_at

🔒 chat_members
  chat_id, user_id
  role (enum: 'owner', 'admin', 'member')
  joined_at
  last_read_at
  PRIMARY KEY (chat_id, user_id)

🔒 chat_user_mutes  -- THE WEDGE: per-user, per-chat muting
  chat_id, muter_id, muted_id, created_at
  PRIMARY KEY (chat_id, muter_id, muted_id)

🔒 messages
  id (uuid, PK)
  chat_id (uuid → chats.id)
  sender_id (uuid → profiles.id)
  body (text)
  attachments (jsonb)  -- {type, url, dimensions} for images/locations (Phase 1.5)
  reply_to (uuid → messages.id, nullable)
  is_suggestion (bool, default false)  -- true for smart-suggestion cards
  suggestion_payload (jsonb, nullable)  -- {action: 'create_event', event_draft: {...}}
  created_at, edited_at, deleted_at

🔒 message_reactions
  message_id, user_id, emoji, created_at
  PRIMARY KEY (message_id, user_id, emoji)

-- ============================================================
-- COMMUNITY FORUM
-- ============================================================
🔒 forum_posts
  id (uuid, PK)
  author_id (uuid → profiles.id)
  title (text)
  body (text)
  tag (enum: 'gear', 'strategy', 'courts', 'general')
  image_url (text, nullable)
  upvotes, downvotes (int)
  comment_count (int)
  status (enum: 'published', 'flagged', 'removed')
  created_at, updated_at

🔒 forum_comments
  id, post_id, author_id, body, parent_comment_id (nullable), upvotes, downvotes, created_at

🔒 forum_votes
  user_id, target_type (enum: 'post', 'comment'), target_id, vote (1 or -1)
  PRIMARY KEY (user_id, target_type, target_id)

🔒 forum_saves
  user_id, post_id, created_at
  PRIMARY KEY (user_id, post_id)

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
🔒 notifications
  id (uuid, PK)
  recipient_id (uuid → profiles.id)
  type (enum: 'dm', 'group_mention', 'event_invite', 'event_rsvp',
              'follow', 'comment_reply', 'forum_upvote', 'smart_suggestion')
  actor_id (uuid → profiles.id, nullable)
  target_type (text)  -- 'message', 'event', 'profile', 'post', 'comment'
  target_id (uuid)
  body (text)
  read_at (timestamp, nullable)
  created_at

🔒 push_tokens
  user_id, token, platform (enum: 'ios', 'android'), created_at, last_used_at
  PRIMARY KEY (user_id, token)

🔒 notification_preferences
  user_id (PK)
  push_dm (bool, default true)
  push_group_mention (bool, default true)
  push_event_invite (bool, default true)
  push_event_rsvp (bool, default true)
  push_follow (bool, default true)
  push_comment_reply (bool, default true)
  push_forum_activity (bool, default false)
  push_smart_suggestion (bool, default true)
  email_digest (enum: 'never', 'daily', 'weekly', default 'weekly')

-- ============================================================
-- MODERATION
-- ============================================================
🔒 reports
  id (uuid, PK)
  reporter_id (uuid → profiles.id)
  target_type (enum: 'user', 'message', 'post', 'comment', 'court', 'event')
  target_id (uuid)
  reason (enum: 'spam', 'harassment', 'inappropriate', 'safety', 'other')
  description (text)
  status (enum: 'open', 'reviewing', 'actioned', 'dismissed')
  resolved_by (uuid → profiles.id, nullable)
  resolved_at (timestamp, nullable)
  created_at

-- ============================================================
-- REFERRALS & SHARING
-- ============================================================
🔒 referrals
  id (uuid, PK)
  referrer_id (uuid → profiles.id)
  code (text, unique)
  referred_user_id (uuid → profiles.id, nullable)
  created_at, claimed_at (nullable)
```

### Key RLS policies (illustrative)

```sql
-- Profiles: public profiles visible to all; private profiles only to self
CREATE POLICY profile_select ON profiles FOR SELECT
  USING (
    visibility = 'public'
    OR id = auth.uid()
    OR (visibility = 'followers' AND EXISTS (
      SELECT 1 FROM follows
      WHERE follower_id = auth.uid() AND followed_id = profiles.id
    ))
  );

-- Messages: visible only to chat members; muted-user messages return body only when explicitly unmuted-view
CREATE POLICY messages_select ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_members
      WHERE chat_id = messages.chat_id AND user_id = auth.uid()
    )
  );

-- Blocked users cannot see each other's content
CREATE POLICY blocks_filter ON profiles FOR SELECT
  USING (
    NOT EXISTS (
      SELECT 1 FROM blocks
      WHERE (blocker_id = auth.uid() AND blocked_id = profiles.id)
         OR (blocker_id = profiles.id AND blocked_id = auth.uid())
    )
  );
```

---

## External APIs and services

### Required for MVP launch

| Service | Purpose | Auth method | Cost |
|---------|---------|-------------|------|
| **Apple Sign-In** | iOS login (required by App Store) | Apple Developer Account, Sign in with Apple cert | $99/yr |
| **Google Sign-In** | OAuth login | Google Cloud Console, OAuth 2.0 client IDs (iOS + Android + web) | Free |
| **Facebook Login** | OAuth login | Meta Developer App, Facebook Login product | Free |
| **DUPR API** | Official rating sync | DUPR partnership application — must apply at [mydupr.com/partners](https://mydupr.com/partners). Approval required. | Negotiated |
| **Google Maps Platform** | Geocoding, Places autocomplete, Static Maps | Google Cloud API key, scoped to bundle ID | Free tier covers MVP |
| **Apple MapKit** | iOS-native map rendering | Free (entitlement on Apple Developer Account) | Free |
| **Expo Push Notifications** | Cross-platform push wrapper | Expo account | Free |
| **Apple Push (APNs)** | iOS push delivery | Apple Push Notification cert from Apple Developer Account | Included with $99/yr |
| **Firebase Cloud Messaging** | Android push delivery | Firebase project, `google-services.json` | Free |
| **Apple Calendar (EventKit)** | Local calendar sync | Native iOS permission prompt | Free |
| **Google Calendar API** | Optional cloud calendar sync | Google Cloud Console, OAuth scope `calendar.events` | Free |
| **Supabase** | Backend (auth, DB, realtime, storage, functions) | Supabase project | $25/mo Pro |
| **Sentry** | Crash reporting | Sentry org + project | Free (5K events/mo) |
| **Amplitude** | Product analytics | Amplitude project | Free (free tier) |
| **Resend** | Transactional email (verification, digest) | Resend API key | Free (100/day) |
| **Expo EAS** | Builds + over-the-air updates | Expo account | Free or $99/mo |

### Phase 1.5 (deferred from initial MVP but in this codebase from day 1)

| Service | Purpose |
|---------|---------|
| **Stripe** | Tournament entry fees, future premium subscriptions |
| **Cloudinary** or **imgix** | Image transformation/CDN if Supabase Storage proves insufficient |
| **Mux** or **Cloudflare Stream** | Video coaching content (Phase 2) |
| **OpenAI API** | Smarter chat suggestions, content moderation |

### App Store and Play Store accounts

| Store | Account | Cost | Notes |
|-------|---------|------|-------|
| Apple App Store | Apple Developer Program | $99/yr | Required for TestFlight + production. Allow 4–6 weeks for account approval. |
| Google Play | Google Play Console | $25 one-time | Required for internal testing + production. Closed testing requires 12 testers × 14 days before production review (newer Google policy). |

---

## Folder structure

```
pyklr/
├── README.md
├── ANTIGRAVITY_PROMPT.md
├── PyklrLight.jsx               # Light-mode web React reference
├── PyklrDark.jsx                # Dark-mode web React reference
│
├── apps/
│   ├── mobile/                  # The main Expo + React Native app
│   │   ├── app/                 # expo-router routes (file-based)
│   │   │   ├── (auth)/
│   │   │   │   ├── splash.tsx
│   │   │   │   ├── sign-in.tsx
│   │   │   │   ├── sign-up.tsx
│   │   │   │   └── survey.tsx
│   │   │   ├── (tabs)/
│   │   │   │   ├── _layout.tsx       # Bottom tab navigator
│   │   │   │   ├── index.tsx         # Home
│   │   │   │   ├── discover.tsx      # Map + find players
│   │   │   │   ├── messages.tsx
│   │   │   │   ├── community.tsx     # Forum
│   │   │   │   └── profile.tsx
│   │   │   ├── chat/[id].tsx         # Chat thread
│   │   │   ├── court/[id].tsx        # Court detail
│   │   │   ├── event/[id].tsx        # Event detail
│   │   │   ├── event/new.tsx         # Create event wizard
│   │   │   ├── u/[username].tsx      # Public profile (deep-linkable)
│   │   │   ├── p/[id].tsx            # Public forum post (deep-linkable)
│   │   │   └── settings/
│   │   │       ├── index.tsx
│   │   │       ├── privacy.tsx
│   │   │       ├── notifications.tsx
│   │   │       ├── integrations.tsx
│   │   │       └── blocked.tsx
│   │   ├── components/
│   │   │   ├── ui/                   # Base components (Button, Input, Card, Avatar, Chip)
│   │   │   ├── chat/                 # MessageBubble, MutedPill, SuggestionCard, ChatInput
│   │   │   ├── court/                # CourtCard, CourtMap, AmenityChip
│   │   │   ├── player/               # PlayerCard, PlayerPhoto, DuprBadge
│   │   │   ├── event/                # EventCard, EventWizardStep, RsvpButton
│   │   │   ├── forum/                # PostCard, CommentTree, VoteButton
│   │   │   └── brand/                # PyklrLogo (SVG), Wordmark
│   │   ├── lib/
│   │   │   ├── supabase.ts           # Client init
│   │   │   ├── auth.ts               # OAuth wrappers (Apple, Google, Facebook)
│   │   │   ├── dupr.ts               # DUPR API client
│   │   │   ├── maps.ts               # Geocoding helpers
│   │   │   ├── push.ts               # Push token registration
│   │   │   ├── deeplink.ts           # Deep link routing
│   │   │   └── analytics.ts          # Amplitude wrappers
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useProfile.ts
│   │   │   ├── useChat.ts            # Realtime chat subscription
│   │   │   ├── useMuteList.ts
│   │   │   └── useEvents.ts
│   │   ├── store/                    # Zustand stores
│   │   ├── theme/
│   │   │   ├── colors.ts
│   │   │   ├── typography.ts
│   │   │   └── spacing.ts
│   │   ├── assets/
│   │   │   ├── fonts/
│   │   │   │   └── Sink_copy.ttf
│   │   │   └── logos/
│   │   │       ├── pyklr-logo-color.png
│   │   │       ├── pyklr-mark.svg
│   │   │       └── pyklr-wordmark.svg
│   │   ├── app.json                  # Expo config
│   │   ├── eas.json                  # EAS build config
│   │   ├── tsconfig.json
│   │   ├── tailwind.config.js        # NativeWind config
│   │   └── package.json
│   │
│   └── admin/                        # Next.js admin dashboard
│       ├── app/
│       │   ├── (dashboard)/
│       │   │   ├── users/
│       │   │   ├── courts/           # Approve community-submitted courts
│       │   │   ├── reports/          # Moderation queue
│       │   │   ├── events/
│       │   │   └── analytics/
│       │   └── api/
│       ├── components/
│       └── package.json
│
├── packages/
│   ├── shared/                       # Shared TypeScript types
│   │   ├── types/
│   │   │   ├── database.ts           # Supabase-generated types
│   │   │   ├── profile.ts
│   │   │   ├── event.ts
│   │   │   └── message.ts
│   │   └── constants/
│   │
│   └── supabase/                     # Supabase project as code
│       ├── migrations/               # SQL migrations (one file per change)
│       ├── functions/                # Edge functions
│       │   ├── dupr-sync/
│       │   ├── push-dispatcher/
│       │   ├── smart-suggest/
│       │   ├── report-pipeline/
│       │   └── digest-mailer/
│       ├── seed.sql                  # Dev seed data
│       └── config.toml
│
├── docs/
│   ├── architecture.md
│   ├── design-system.md
│   ├── api-reference.md
│   ├── deployment.md
│   └── moderation-playbook.md
│
├── .env.example
├── .gitignore
├── package.json                      # Monorepo root (pnpm workspaces)
├── pnpm-workspace.yaml
└── turbo.json                        # Turborepo for task orchestration
```

---

## Setup

### Prerequisites

- Node.js 20+ and **pnpm** 9+ (`npm install -g pnpm`)
- Expo CLI: `npm install -g eas-cli`
- Xcode 15+ (for iOS) and Android Studio (for Android)
- A Supabase account
- The Antigravity IDE installed

### Initial install

```bash
git clone https://github.com/{your-org}/pyklr.git
cd pyklr
pnpm install
cp .env.example .env.local
# Fill in your Supabase URL, anon key, and any OAuth credentials
```

### Start the mobile app

```bash
cd apps/mobile
pnpm start            # Starts Expo Dev Server
# Press 'i' for iOS simulator, 'a' for Android, or scan QR with Expo Go
```

### Start the admin dashboard

```bash
cd apps/admin
pnpm dev              # Next.js dev server on localhost:3000
```

### Database migrations

```bash
cd packages/supabase
pnpm supabase start            # Starts local Supabase (Docker)
pnpm supabase db reset         # Applies all migrations + seeds
pnpm supabase db push          # Pushes migrations to remote project
```

---

## Environment variables

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxxxxxxxxxxxxxxxxxx     # Server-side only, NEVER expose

# Apple Sign-In (handled by Expo + Apple Developer cert)
APPLE_TEAM_ID=XXXXXXXXXX
APPLE_BUNDLE_ID=app.pyklr.ios

# Google Sign-In
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=xxxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=xxxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=xxxx.apps.googleusercontent.com

# Facebook Login
EXPO_PUBLIC_FACEBOOK_APP_ID=xxxxxxxxxxxx
FACEBOOK_CLIENT_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# DUPR API
DUPR_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxx
DUPR_API_BASE_URL=https://api.dupr.com/v1
DUPR_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxx

# Google Maps Platform
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS=AIzaXXXXXXXXXXXXXXXXXX
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID=AIzaXXXXXXXXXXXXXXXXXX
GOOGLE_PLACES_API_KEY=AIzaXXXXXXXXXXXXXXXXXX

# Sentry
EXPO_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx

# Amplitude
EXPO_PUBLIC_AMPLITUDE_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Expo
EXPO_PUBLIC_DEEP_LINK_SCHEME=pyklr
EXPO_PUBLIC_UNIVERSAL_LINK_DOMAIN=pyklr.app
```

---

## Build and deployment

### Mobile builds (EAS)

```bash
# Development build (with dev client) — install on physical device for testing
eas build --profile development --platform ios
eas build --profile development --platform android

# Internal preview build (TestFlight + Google internal track)
eas build --profile preview --platform all

# Production build
eas build --profile production --platform all

# Submit to stores
eas submit --platform ios --latest
eas submit --platform android --latest

# Over-the-air JS-only update (no store review)
eas update --branch production --message "Hotfix: messaging crash"
```

### Admin dashboard

Push to `main` branch → Vercel auto-deploys.

### Database changes

```bash
# Create a migration
pnpm supabase migration new add_smart_suggestions

# Apply locally
pnpm supabase db reset

# Push to production
pnpm supabase db push --linked
```

---

## Phase 2 — deferred

Features explicitly NOT in MVP, called out so the team doesn't accidentally scope-creep:

- Tournament/ladder league management (bracket trees, automated scheduling)
- Video coaching content library
- AR shot analysis (camera-based)
- Live match streaming
- Premium subscription tier
- Sponsored event listings (facility marketplace)
- Score reporting integrated with DUPR rating updates (Phase 1.5 candidate)
- In-app gear marketplace
- Multi-language support (English-only at MVP)

---

## License

Proprietary. © 2026 PYKLR. All rights reserved.

---

## Contacts

| Role | Name |
|------|------|
| Product / Growth | Merrick Lee |
| Technical Lead | (Partner B / PYKLR partnership) |
| Design | TBD |

---

*This README is the single source of truth for the project. If it conflicts with another doc, this one wins.*

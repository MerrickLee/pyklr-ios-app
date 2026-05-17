# PYKLR — Starter monorepo

> **Meet players. Start matches.** This is the working scaffold for the PYKLR pickleball community app.

This repo is the starting point for the build described in the full project documentation. Run `pnpm install` and you have a working Expo app booting on iOS + Android with the auth flow, home dashboard, and (most importantly) the smart-mute chat thread already coded.

## What's here

```
pyklr/
├── apps/
│   ├── mobile/                  # Expo + React Native + TypeScript app
│   └── admin/                   # Next.js admin dashboard (placeholder)
├── packages/
│   ├── shared/                  # Cross-package types and constants
│   └── supabase/                # Migrations + edge functions
├── docs/
│   ├── ARCHITECTURE.md          # The full README spec (renamed)
│   ├── ANTIGRAVITY_PROMPT.md    # Agentic-IDE build brief
│   └── ASSETS.md                # Logo asset usage
├── scripts/                     # Utility scripts (logo vectorizer, etc.)
└── GETTING_STARTED.md           # ← Start here
```

## What works on Day 1

- ✅ Sign up with email, Apple, or Google
- ✅ Player survey (play styles, availability, DUPR rating)
- ✅ Home dashboard with featured event card, quick actions, popular courts
- ✅ Tab navigator with raised FAB
- ✅ **Realtime chat thread with per-user muting** — the wedge
- ✅ **Smart suggestion card** rendered when the edge function detects a meetup
- ✅ Theme system (light/dark/system) with persisted preference
- ✅ PYKLR logo as inline SVG component
- ✅ Profile screen with real data from Supabase
- ✅ Sign out

## What's stubbed (TODO comments point to the right Phase)

- Map view with court pins (Phase 4)
- Event creation wizard (Phase 6)
- Forum (Phase 6)
- Settings sub-screens (Phase 6)
- Push notification token registration (Phase 7)
- DUPR sync OAuth flow (Phase 7)
- Admin dashboard (Phase 7)

## Quickstart

```bash
# 1. Install
pnpm install

# 2. Copy .env.example to .env.local and fill in Supabase credentials
cp .env.example .env.local

# 3. Apply database migrations (against a Supabase project you've created)
cd packages/supabase
pnpm supabase link --project-ref YOUR_PROJECT_REF
pnpm db:push

# 4. Generate types
pnpm db:gen-types

# 5. Run the mobile app
cd ../../apps/mobile
pnpm dev
# Press 'i' for iOS or 'a' for Android
```

See `GETTING_STARTED.md` for the full setup walkthrough including OAuth credential setup and external service accounts.

## Tech stack

- **Expo SDK 51** + React Native + TypeScript (strict)
- **expo-router v3** file-based routing
- **NativeWind v4** for Tailwind-flavored styling
- **Supabase** for auth, Postgres, realtime, storage, edge functions
- **TanStack Query** for server state
- **Zustand** for client state
- **lucide-react-native** for icons
- **react-native-svg** for the inline PYKLR logo
- **FlashList** for the chat message list (the wedge needs to scroll smoothly)

See `docs/ARCHITECTURE.md` for the complete architectural rationale.

## Future Roadmap & Enhancements

1. **Live Weather Integration for Outdoor Courts**
   Pickleball is highly weather-dependent. Integrating a simple weather API (like OpenWeather) on the Court Details page to show the current wind speed and rain forecast would save players from driving to a court only to find it's unplayable.

2. **Built-in Scorekeeper & Match Logging**
   A simple, swipe-based scorekeeper widget that players can use during their match. When the match finishes, it automatically logs the result to their profile history and updates their internal win/loss ratio.

3. **Apple Health / Google Fit Integration**
   Pickleball is a great workout. By integrating with HealthKit (iOS), the app could log matches as "Pickleball Workouts," automatically tracking calories burned and heart rate directly into the user's fitness rings.

4. **"Smart" Push Notifications & Deep Linking**
   If a user is near a popular court and it suddenly gets crowded, send a push notification. When they click the notification, use Deep Linking to open the app directly to that specific court's page.

5. **Offline Capabilities**
   Parks often have terrible cell service. By aggressively caching the user's active chats and the details/locations of their favorite courts, the app will remain functional even when they drop down to 1 bar of 3G.

6. **Equipment & Gear Forum**
   You already have a forum table structure. Building out a dedicated space for users to review paddles, shoes, and balls will keep them engaged in the app even when they aren't actively playing a match.

## License

Proprietary. © 2026 PYKLR. All rights reserved.

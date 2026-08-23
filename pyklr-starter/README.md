# Pyklr 🏓

**Pyklr** is a social pickleball app for iOS that helps players find courts, organize games, connect with other players, and build local pickleball communities.

## What It Does

- **Discover Courts** — Browse and search pickleball courts near you using GPS location and Google Maps integration
- **Organize Events** — Create and RSVP to pickup games, leagues, and tournaments with date/time scheduling
- **Chat & Messaging** — Real-time direct and group messaging to coordinate with other players
- **Player Profiles** — Player profiles with DUPR ratings, skill levels, avatars, and bios
- **Community Forums** — Discussion boards for local pickleball communities
- **Push Notifications** — Stay updated on event invites, RSVPs, messages, and community activity
- **Admin Dashboard** — Moderation tools for managing reports and community content

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Expo SDK 54](https://expo.dev/) / React Native 0.81 |
| **Language** | TypeScript, React 19.1 |
| **Navigation** | [Expo Router](https://expo.github.io/router/) (file-based routing) |
| **Styling** | [NativeWind v5](https://www.nativewind.dev/) (Tailwind CSS v4 for React Native) |
| **Backend** | [Supabase](https://supabase.com/) (Auth, Postgres, Realtime, Storage) |
| **Auth** | Apple Sign-In, Google Sign-In, Email/Password (via Supabase Auth) |
| **Maps** | Google Maps API |
| **Animations** | React Native Reanimated 4 (New Architecture) |
| **Monitoring** | Sentry |
| **Build** | [EAS Build](https://expo.dev/eas) (Xcode 26.2 on macOS Sequoia) |
| **Monorepo** | pnpm workspaces + Turborepo |

## Project Structure

```
pyklr-starter/
├── apps/
│   └── mobile/              # Expo mobile app
│       ├── app/             # File-based routes (Expo Router)
│       │   ├── (auth)/      # Sign-in, Sign-up screens
│       │   ├── (tabs)/      # Main tab navigation
│       │   │   ├── index    # Home feed
│       │   │   ├── discover # Court discovery map
│       │   │   ├── messages # Chat inbox
│       │   │   └── profile  # User profile
│       │   ├── chat/        # Chat detail screens
│       │   ├── court/       # Court detail & creation
│       │   ├── event/       # Event detail & creation
│       │   ├── forum/       # Forum threads
│       │   ├── admin/       # Admin dashboard
│       │   ├── settings/    # App settings (notifications, privacy)
│       │   └── profile/     # Profile editing
│       ├── components/      # Reusable UI components
│       ├── hooks/           # Custom React hooks (useAuth, useChat, useCourts, etc.)
│       ├── lib/             # Utilities (auth, supabase client, push, storage)
│       ├── theme/           # Design tokens & theming (light/dark)
│       └── ios/             # Native iOS project (CNG-managed)
├── packages/
│   ├── shared/              # Shared utilities
│   └── supabase/            # Supabase client & types
└── pnpm-workspace.yaml      # Workspace configuration
```

## Current Status

**Version**: 1.0.0  
**Build**: Compiles and bundles successfully  
**EAS Build**: ✅ Passing on `macos-sequoia-15.6-xcode-26.2`  
**Architecture**: React Native New Architecture enabled

### Recently Completed (August 2026)

- **Full SDK upgrade**: Expo 51 → 54, React Native 0.74 → 0.81, React 18 → 19.1
- **NativeWind v5 migration**: Moved from v4 (Tailwind CSS v3) to v5 preview (Tailwind CSS v4, CSS-first config)
- **New Architecture**: Enabled with Reanimated 4 and `react-native-worklets`
- **Facebook removal**: Facebook login and SDK completely removed
- **pnpm unification**: Migrated from pnpm 9 to 10.11.0 with single source of truth for patches

### Known Issues

- **Pre-existing TypeScript errors** (~122): Supabase table types are untyped (`never`), producing TS errors across hooks and screens. These are not build-breaking — the app compiles and runs.
- **Sentry**: Organization/project credentials not configured on EAS. Source map upload is disabled via `SENTRY_DISABLE_AUTO_UPLOAD=true`.
- **lightningcss**: Pinned to `1.30.1` via pnpm override (newer versions have deserialization bugs with Tailwind v4 CSS).
- **tailwindcss**: Pinned to `4.1.12` (4.3.x produces CSS constructs incompatible with `react-native-css`).

## Getting Started

### Prerequisites

- Node.js ≥ 20
- pnpm 10.x (`corepack enable && corepack prepare pnpm@10.11.0 --activate`)
- Xcode 26+ (for iOS builds)
- EAS CLI (`npm install -g eas-cli`)

### Setup

```bash
# Clone
git clone https://github.com/MerrickLee/pyklr-ios-app.git
cd pyklr-ios-app/pyklr-starter

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example apps/mobile/.env.local
# Fill in Supabase URL, Anon Key, Google Client IDs, Maps API Key

# Run on iOS simulator
cd apps/mobile
npx expo start --ios --clear
```

### Building for Distribution

```bash
# Development (simulator)
npx eas-cli build --platform ios --profile development

# Production (App Store)
npx eas-cli build --platform ios --profile production
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Google Sign-In iOS client ID |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Google Sign-In web client ID |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API key |

## App Store

| Field | Value |
|-------|-------|
| Bundle ID | `app.pyklr.ios` |
| App Store Connect ID | `6804323107` |
| Apple Team ID | `HDZQ7ZMG6T` |
| EAS Project ID | `b9fafd08-47ca-4058-bf43-91b826b14961` |
| Owner | `merricklee` |

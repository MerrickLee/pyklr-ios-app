# Handoff → Antigravity: Expo / EAS account linkage

**From:** Claude (Executor & Observer session)
**Date:** 2026-08-22
**Scope:** `apps/mobile`

---

## TL;DR

The Expo project is **already linked** to the `merricklee` account. Do **not**
run a bare `eas init` — it would mint a second project and orphan the existing
one. What's actually missing is CLI installation, an authenticated login, and
the four config bugs in section 3, which will bite during a production build.

---

## 0. BLOCKER — Apple team mismatch (read this first)

`eas build --platform ios --profile production --auto-submit` is currently
failing. The cause is an account/team mismatch, not a code problem.

**Three different Apple teams are in play:**

| Team ID | Name | Role in this mess |
|---|---|---|
| `HDZQ7ZMG6T` | Ron Crosby | **Owns `app.pyklr.ios` and ASC app `6804323107`.** Reached via `merricklee@me.com`. |
| `3GGJ3U2HU3` | Merrick Lee – Individual | What `eas build` actually authenticates into, via `princemlee@aol.com`. Cannot see the bundle ID. |
| `GJN7FWP3ZN` | (unknown) | Appeared in an earlier run: "not associated with an active membership". Cached somewhere — find and clear it. |

**Observed failures, verbatim:**
```
This request is forbidden for security reasons - Team ID: 'GJN7FWP3ZN' is
not associated with an active membership.

Apple ID: princemlee@aol.com
Select a Team > Merrick Lee - Individual (3GGJ3U2HU3)
The bundle identifier app.pyklr.ios is not available to team
"Merrick Lee (Individual)" (3GGJ3U2HU3), change it in your app config and try again.
```

**Decision (from Merrick, 2026-08-22): `HDZQ7ZMG6T` (Ron Crosby) is the
owning team.** Do NOT re-create the bundle ID or the ASC record under the
individual account, and do NOT change `ios.bundleIdentifier` to dodge the
error — that would orphan App ID `app.pyklr.ios` and SKU `PYKLR001`, neither
of which can be reused on Apple.

**Fix:**
1. Clear the cached Apple session that pins `princemlee@aol.com`:
   `~/.app-store/auth/princemlee@aol.com/`
2. Re-authenticate as `merricklee@me.com` and select **Ron Crosby
   (HDZQ7ZMG6T)** at the team prompt.
3. Locate and clear whatever is caching `GJN7FWP3ZN`.
4. Confirm `merricklee@me.com` holds App Manager or Admin on `HDZQ7ZMG6T` —
   it created the ASC record, so it should, but verify before building.

Note: EAS reports `Specified value for "ios.bundleIdentifier" in app.json is
ignored because an ios directory was detected` — the native project is the
source of truth. `ios/Pyklr.xcodeproj` already reads `app.pyklr.ios`, which
is correct; no change needed there.

---

## 1. Current state — verified, not assumed

### Simulator / build
- Builds, bundles, and launches clean on iOS Simulator (iPhone 17 Pro Max, iOS 26.4).
- `iOS Bundled 24356ms index.js (3965 modules)` — no errors.
- Login screen renders; NativeWind, fonts, and SVG assets all working.

### Apple side (completed this session)
| Item | Value |
|---|---|
| Bundle ID | `app.pyklr.ios` — was **already registered** as "Pyklr iOS App" |
| ASC app record | **Created** — Pyklr, iOS 1.0, Prepare for Submission |
| ASC App ID | `6804323107` |
| Apple Team ID | `HDZQ7ZMG6T` (team name: Ron Crosby) |
| Signed-in Apple ID | `merricklee@me.com` |
| SKU | `PYKLR001` |
| License Agreement | None pending — both portals checked, no banner |

### Expo side (pre-existing — already correct)
```
apps/mobile/app.json:
  extra.eas.projectId = b9fafd08-47ca-4058-bf43-91b826b14961
  owner               = merricklee
  updates.url         = https://u.expo.dev/b9fafd08-47ca-4058-bf43-91b826b14961
```
All three are internally consistent. The project IS bound to the Expo account.

### eas.json (updated this session)
```json
"submit": { "production": { "ios": {
  "appleId":     "merricklee@me.com",
  "ascAppId":    "6804323107",
  "appleTeamId": "HDZQ7ZMG6T"
}}}
```
Previously `ascAppId` and `appleTeamId` were both `"TBD"`.

---

## 2. What still needs doing for EAS

1. **eas-cli is not installed.** Absent from `apps/mobile/node_modules/.bin`
   and not global.
   ```bash
   npm i -g eas-cli          # or npx eas-cli for one-offs
   ```

2. **Authenticate as the owning account.** Must be `merricklee` — the `owner`
   field in app.json will reject builds from any other account.
   ```bash
   eas login
   eas whoami                # must print: merricklee
   ```

3. **Verify the link rather than re-initializing.**
   ```bash
   eas project:info          # expect b9fafd08-47ca-4058-bf43-91b826b14961
   ```
   If this errors, the fix is
   `eas init --id b9fafd08-47ca-4058-bf43-91b826b14961` — NOT a bare `eas init`.

4. **`appVersionSource: "remote"`** is set, so the build number lives on EAS
   servers rather than in the repo. Before the first production build:
   ```bash
   eas build:version:set --platform ios
   ```

---

## 3. Config bugs found — fix before any production build

### (a) Facebook plugin placeholders are never interpolated — REAL BUG
```json
["react-native-fbsdk-next", {
  "appID":       "EXPO_PUBLIC_FACEBOOK_APP_ID",     // literal string
  "clientToken": "FACEBOOK_CLIENT_TOKEN",           // literal string
  "scheme":      "fbEXPO_PUBLIC_FACEBOOK_APP_ID"    // literal string
}]
```
`app.json` is static JSON and performs **no** env-var substitution. These
strings land in the native build verbatim and the Facebook SDK will be
misconfigured. Fix: convert `app.json` to `app.config.js` and interpolate
`process.env.*`, or hardcode the real values.

### (b) Version mismatch — three different numbers
- `expo.version` = `0.1.0`
- `expo.ios.runtimeVersion` = `1.0.0`
- ASC record = `1.0`

Reconcile before submitting. `version` most likely should be `1.0.0`.

### (c) Duplicated array entries throughout app.json
- `ios.associatedDomains` — `applinks:pyklr.app` listed **twice**
- `ios.infoPlist.SKAdNetworkItems` — both IDs listed **twice**
- `android.permissions` — entire 8-permission list duplicated (16 entries)
- `android.intentFilters` — identical filter block duplicated

Mostly cosmetic, but SKAdNetwork duplicates draw App Store validation
warnings. Worth a dedupe pass.

### (d) New-architecture mismatch
- `app.json` → `"newArchEnabled": true`
- `ios/Podfile.properties.json` → key absent, so `RCT_NEW_ARCH_ENABLED=0`

The native project builds on the **old** architecture regardless of what
app.json claims. Reconcile deliberately; do not assume new-arch behavior.

---

## 4. Blockers outside the codebase

- **EU trader status is unset.** App Store Connect warns that apps without it
  are removed from the EU App Store. Only an Admin or Account Holder on the
  `Ron Crosby` team can provide it. Needs a human decision on who does this.

---

## 5. Environment notes

- `pnpm` is pinned to `9.0.0` in `packageManager`, but **pnpm 10.x is actually
  running** — the pin is not enforced (corepack off or bypassed).
- `ios/.xcode.env.local` pins `NODE_BINARY` to Homebrew node **25.1.0**;
  Expo SDK 51 / RN 0.74 is untested there (`engines` says `>=20`).
- Repo lives under `~/Documents/` (iCloud Drive) and contains roughly **3,576
  sync-conflict duplicate directories** in `node_modules` (` 2`/` 3`/` 4`
  suffixes), plus `ios/Pods 2` and `ios/build 2`. Recommend relocating the
  repo outside iCloud Drive.

---

## 6. Changes made to the repo this session

| File | Change |
|---|---|
| `apps/mobile/index.js` | **NEW** — `import 'expo-router/entry';` (fixes Metro bundle-path escape) |
| `apps/mobile/package.json` | `main`: `expo-router/entry` → `index.js` |
| `apps/mobile/eas.json` | `appleId`, `ascAppId`, `appleTeamId` filled in |
| `pnpm-workspace.yaml` | Added `patchedDependencies` block — pnpm 10 ignores the old `pnpm` field in package.json |
| `package.json` (root) | Removed the dead `pnpm` field |

### Why the entrypoint change was needed
`"main": "expo-router/entry"` resolved through a pnpm symlink into
`<repo>/node_modules/.pnpm/...`, two levels **above** Metro's server root.
Metro produced a bundle URL beginning `/../../` that escaped the server root
and could not be served — surfacing in the dev client as
"Could not connect to development server." A local `index.js` keeps the
resolved entry inside the project root.

Backups left alongside each edit as `*.bak-entryfix`, `*.bak-patchfix`,
`*.bak-ascids`. Safe to delete once verified.

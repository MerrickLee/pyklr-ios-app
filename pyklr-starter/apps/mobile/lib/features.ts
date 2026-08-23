/**
 * Runtime feature flags.
 */

/**
 * Facebook Login.
 *
 * DISABLED until real Facebook credentials are configured. Two things are
 * currently broken, and both must be fixed before flipping this to `true`:
 *
 *   1. ios/Pyklr/Info.plist contains LITERAL, uninterpolated placeholders:
 *        <key>FacebookAppID</key>      <string>EXPO_PUBLIC_FACEBOOK_APP_ID</string>
 *        <key>FacebookClientToken</key><string>FACEBOOK_CLIENT_TOKEN</string>
 *      app.json/app.config.js does not substitute env vars, and because this is
 *      a bare workflow (an `ios/` directory exists) the config plugin never
 *      re-runs. These strings must be replaced with real values, or the native
 *      project regenerated via `expo prebuild` with the env vars set.
 *
 *   2. EXPO_PUBLIC_FACEBOOK_APP_ID and FACEBOOK_CLIENT_TOKEN are not set on
 *      EAS for the `production` environment:
 *        eas env:create --environment production --name EXPO_PUBLIC_FACEBOOK_APP_ID --value <real>
 *        eas env:create --environment production --name FACEBOOK_CLIENT_TOKEN --value <real> --visibility sensitive
 *
 * With this flag off, the "Continue with Facebook" button is not rendered on
 * the sign-in or sign-up screens. Apple and Google sign-in are unaffected.
 * The underlying signInWithFacebook() in lib/auth.ts is left intact.
 */
export const FACEBOOK_LOGIN_ENABLED = false;

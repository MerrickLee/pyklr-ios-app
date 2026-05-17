// ============================================================
// PYKLR — Analytics (Amplitude)
// ============================================================
// Thin wrapper around @amplitude/analytics-react-native so the rest
// of the app calls `track('event.name', { ... })` and never touches
// the SDK directly. Safe to call before init — no-ops until a key
// is present.
// ============================================================

import * as amplitude from '@amplitude/analytics-react-native';

let initialized = false;

export function initAnalytics(): void {
  const key = process.env.EXPO_PUBLIC_AMPLITUDE_API_KEY;
  if (initialized || !key) return;
  amplitude.init(key);
  initialized = true;
}

export function identify(userId: string): void {
  if (!initialized) return;
  amplitude.setUserId(userId);
}

export function resetIdentity(): void {
  if (!initialized) return;
  amplitude.reset();
}

export function track(event: AnalyticsEvent, props?: Record<string, unknown>): void {
  if (!initialized) return;
  amplitude.track(event, props);
}

// Canonical event names — keep this list authoritative so dashboards
// don't fragment from typo'd event strings.
export type AnalyticsEvent =
  | 'auth.sign_up'
  | 'auth.sign_in'
  | 'auth.sign_out'
  | 'profile.completed_survey'
  | 'event.created'
  | 'event.joined'
  | 'chat.message_sent'
  | 'chat.user_muted'
  | 'chat.user_unmuted'
  | 'court.submitted'
  | 'court.viewed'
  | 'forum.post_created'
  | 'forum.upvoted'
  | 'smart_suggestion.shown'
  | 'smart_suggestion.accepted'
  | 'ui.button_clicked';

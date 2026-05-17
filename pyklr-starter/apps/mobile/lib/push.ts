import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from './supabase';

/**
 * Register the device for push notifications.
 * - Requests permission
 * - Gets Expo push token
 * - Upserts to `push_tokens` table
 *
 * iOS push tokens are fragile — re-register on every app launch.
 * Tokens rotate when users uninstall/reinstall.
 */
export async function registerPushToken(userId: string): Promise<string | null> {
  if (!Device.isDevice) {
    // Push notifications only work on physical devices
    console.log('[push] Skipping push registration — not a physical device');
    return null;
  }

  // Request permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('[push] Permission not granted');
    return null;
  }

  // Get the Expo push token
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
    });

    const token = tokenData.data;
    const platform: 'ios' | 'android' = Platform.OS === 'ios' ? 'ios' : 'android';

    // Upsert to push_tokens table
    const { error } = await supabase.from('push_tokens').upsert(
      {
        user_id: userId,
        token,
        platform,
        last_used_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,token',
      }
    );

    if (error) {
      console.warn('[push] Failed to save token:', error.message);
    } else {
      console.log('[push] Token registered:', token.substring(0, 20) + '...');
    }

    return token;
  } catch (e) {
    console.warn('[push] Failed to get push token:', e);
    return null;
  }
}

/**
 * Configure notification behavior (how they appear when app is foregrounded).
 */
export function configurePushNotifications(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

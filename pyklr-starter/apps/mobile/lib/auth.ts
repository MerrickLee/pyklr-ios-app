import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import { supabase } from './supabase';
import Constants from 'expo-constants';
import { track, resetIdentity } from './analytics';

const isExpoGo = Constants.appOwnership === 'expo';

// Configure Google Sign-In once at app start
export function configureGoogleSignIn(): void {
  if (isExpoGo) {
    console.log('[Auth] Running in Expo Go, skipping Google Sign-In configuration.');
    return;
  }
  try {
    const { GoogleSignin } = require('@react-native-google-signin/google-signin');
    GoogleSignin.configure({
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      offlineAccess: false,
    });
  } catch (err) {
    console.error('[Auth] Failed to configure Google Sign-In:', err);
  }
}

export async function signInWithApple(): Promise<{ error: Error | null }> {
  if (Platform.OS !== 'ios') {
    return { error: new Error('Apple Sign-In is iOS only') };
  }

  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) {
      return { error: new Error('No identity token from Apple') };
    }

    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
    });

    return { error };
  } catch (e: unknown) {
    if (typeof e === 'object' && e && 'code' in e && e.code === 'ERR_REQUEST_CANCELED') {
      return { error: null }; // User cancelled — not really an error
    }
    return { error: e instanceof Error ? e : new Error('Apple sign-in failed') };
  }
}

export async function signInWithGoogle(): Promise<{ error: Error | null }> {
  if (isExpoGo) {
    return { error: new Error('Google Sign-In is not supported in Expo Go. Please use a development build or email sign-in.') };
  }

  try {
    const { GoogleSignin } = require('@react-native-google-signin/google-signin');
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();

    if (!userInfo.idToken) {
      return { error: new Error('No ID token from Google') };
    }

    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: userInfo.idToken,
    });

    return { error };
  } catch (e: unknown) {
    try {
      const { statusCodes } = require('@react-native-google-signin/google-signin');
      if (typeof e === 'object' && e && 'code' in e) {
        const code = (e as { code: string }).code;
        if (code === statusCodes.SIGN_IN_CANCELLED) return { error: null };
      }
    } catch {}
    return { error: e instanceof Error ? e : new Error('Google sign-in failed') };
  }
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (!error) track('auth.sign_in');
  return { error };
}

export async function signUpWithEmail(
  email: string,
  password: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.EXPO_PUBLIC_DEEP_LINK_SCHEME}://auth/callback`,
    },
  });
  if (!error) track('auth.sign_up');
  return { error };
}

export async function signOut(): Promise<void> {
  track('auth.sign_out');
  resetIdentity();
  await supabase.auth.signOut();
}

import '@/global.css';
import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { Linking } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import * as Sentry from '@sentry/react-native';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAuth } from '@/hooks/useAuth';
import { configureGoogleSignIn } from '@/lib/auth';
import { initAnalytics, identify } from '@/lib/analytics';
import { registerPushToken, configurePushNotifications } from '@/lib/push';
import { supabase } from '@/lib/supabase';

if (process.env.EXPO_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.2,
    enableAutoSessionTracking: true,
    enableAutoPerformanceTracing: true,
  });
}

SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore — splash screen may already be hidden
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
    mutations: {
      retry: 0,
    },
  },
});

function AuthGate() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Auto-login test user in dev mode
  useEffect(() => {
    const ENABLE_DEV_AUTOLOGIN = true; // Set to true to bypass login, false to test auth screens
    if (__DEV__ && ENABLE_DEV_AUTOLOGIN) {
      const testEmail = 'testuser123@example.com';
      const testPassword = 'TestPassword123!';
      
      console.log('[DevAuth] Attempting auto-login for:', testEmail);
      supabase.auth.signInWithPassword({ email: testEmail, password: testPassword })
        .then(({ data, error }) => {
          if (error) {
            console.log('[DevAuth] Sign in failed, trying auto-signup:', error.message);
            supabase.auth.signUp({ email: testEmail, password: testPassword })
              .then(({ data: signUpData, error: signUpError }) => {
                if (signUpError) {
                  console.error('[DevAuth] Auto-signup failed:', signUpError.message);
                } else {
                  console.log('[DevAuth] Auto-signup successful!');
                }
              });
          } else {
            console.log('[DevAuth] Auto-login successful!');
          }
        });
    }
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/splash');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [session, loading, segments, router]);

  // Register push token and identify analytics user when session is available
  useEffect(() => {
    if (session?.user?.id) {
      identify(session.user.id);
      registerPushToken(session.user.id);

      // Set Sentry user context for error tracking
      Sentry.setUser({ id: session.user.id, email: session.user.email });
    } else {
      Sentry.setUser(null);
    }
  }, [session?.user?.id]);

  return null;
}

/**
 * Deep link handler for push notification taps and universal links.
 * Routes like pyklr://event/123 or https://pyklr.app/event/123
 */
function DeepLinkHandler() {
  const router = useRouter();

  useEffect(() => {
    function handleDeepLink(event: { url: string }) {
      const { url } = event;
      try {
        const parsed = new URL(url);
        const path = parsed.pathname || parsed.host || '';
        if (path) {
          Sentry.addBreadcrumb({
            category: 'navigation',
            message: `Deep link: ${path}`,
            level: 'info',
          });
          router.push(path as never);
        }
      } catch {
        // Non-URL deep links — try as-is
        Sentry.addBreadcrumb({
          category: 'navigation',
          message: `Deep link (raw): ${url}`,
          level: 'info',
        });
      }
    }

    // Handle deep link that opened the app
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    // Handle deep links while app is open
    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, [router]);

  return null;
}

function RootLayoutInner() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <AuthGate />
          <DeepLinkHandler />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: 'transparent' },
            }}
          />
          <StatusBar style="auto" />
        </ErrorBoundary>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Sink: require('../assets/fonts/Sink_copy.ttf'),
  });

  useEffect(() => {
    configureGoogleSignIn();
    initAnalytics();
    configurePushNotifications();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return <RootLayoutInner />;
}

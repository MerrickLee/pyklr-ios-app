import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { colors } from '@/theme/tokens';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary that catches rendering errors and reports them to Sentry.
 * Shows a branded error state with a retry button.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <MyScreen />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.captureException(error, {
      extra: { componentStack: errorInfo.componentStack },
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View
          style={{
            flex: 1,
            backgroundColor: '#0B0B0B',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 32,
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              backgroundColor: `${colors.brand.lime}22`,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 28 }}>⚠️</Text>
          </View>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: '#FFFFFF',
              textAlign: 'center',
            }}
          >
            Something went wrong
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: '#9A9A9A',
              textAlign: 'center',
              marginTop: 8,
              lineHeight: 19,
              maxWidth: 280,
            }}
          >
            We've reported this error and are working on a fix. Please try again.
          </Text>
          {__DEV__ && this.state.error && (
            <Text
              style={{
                fontSize: 11,
                color: '#666666',
                textAlign: 'center',
                marginTop: 12,
                fontFamily: 'monospace',
              }}
              numberOfLines={3}
            >
              {this.state.error.message}
            </Text>
          )}
          <Pressable
            onPress={this.handleReset}
            style={{
              marginTop: 24,
              backgroundColor: colors.brand.lime,
              paddingHorizontal: 24,
              paddingVertical: 14,
              borderRadius: 16,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: colors.brand.limeDark,
              }}
            >
              Try again
            </Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

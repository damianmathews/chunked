/**
 * Convex Auth Provider for React Native
 *
 * Provides Convex database client and authentication context using:
 * - ConvexReactClient for database operations
 * - ConvexAuthProvider for auth state management
 * - SecureStore for encrypted token storage (iOS Keychain/Android Keystore)
 *
 * The provider wraps the entire app and must be placed at the root level
 * to ensure auth state is available throughout the component tree.
 *
 * Environment variables:
 * - EXPO_PUBLIC_CONVEX_URL: Convex deployment URL
 *   (from app.json extra.convexUrl or process.env)
 *
 * NOTE: This file requires convex/_generated to exist.
 * Run `npx convex dev` from repo root before starting the app.
 *
 * @see https://docs.convex.dev/quickstart/react-native
 * @see https://labs.convex.dev/auth/setup/react
 * @see https://docs.expo.dev/versions/latest/sdk/securestore/
 */

import React, { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import Constants from "expo-constants";
import { secureTokenStorage } from "@/lib/secureTokenStorage";

// Get Convex URL from environment
// Expo SDK 52+ supports EXPO_PUBLIC_ env vars automatically
const convexUrl =
  Constants.expoConfig?.extra?.convexUrl ||
  process.env.EXPO_PUBLIC_CONVEX_URL;

// Feature flag: is Convex Auth enabled?
const isConvexEnabled = convexUrl && convexUrl !== "${EXPO_PUBLIC_CONVEX_URL}";

// Initialize Convex client only if URL is configured
// unsavedChangesWarning: false because mobile apps don't have beforeunload events
let convexClient: ConvexReactClient | null = null;

if (isConvexEnabled) {
  convexClient = new ConvexReactClient(convexUrl, {
    unsavedChangesWarning: false,
  });
} else if (__DEV__) {
  console.warn(
    "⚠️  Convex not configured - running without auth backend\n" +
    "To enable: Run 'npx convex dev' from repo root\n" +
    "This will generate EXPO_PUBLIC_CONVEX_URL"
  );
}

/**
 * Root provider for Convex + Auth
 *
 * Conditionally wraps app with Convex when configured.
 * Falls back to pass-through when Convex is not initialized.
 *
 * Note: ConvexAuthProvider internally creates ConvexProvider,
 * so we don't need to nest both. Just use ConvexAuthProvider.
 */
export function ConvexClientProvider({ children }: { children: ReactNode }) {
  // If Convex not configured, render children without provider
  // This allows app to run in "guest mode" without auth
  if (!convexClient) {
    return <>{children}</>;
  }

  return (
    <ConvexAuthProvider client={convexClient} storage={secureTokenStorage}>
      {children}
    </ConvexAuthProvider>
  );
}

export default ConvexClientProvider;

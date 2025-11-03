import React, { ReactNode } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import Constants from "expo-constants";

/**
 * Convex Client Provider for Mobile App
 *
 * Wraps the app with Convex client and authentication.
 */

const convexUrl = Constants.expoConfig?.extra?.convexUrl || process.env.EXPO_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  throw new Error(
    "Missing EXPO_PUBLIC_CONVEX_URL environment variable. " +
    "Add it to your app.json or .env file."
  );
}

const convex = new ConvexReactClient(convexUrl, {
  unsavedChangesWarning: false,
});

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      <ConvexAuthProvider>{children}</ConvexAuthProvider>
    </ConvexProvider>
  );
}

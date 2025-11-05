/**
 * Convex Auth Configuration
 *
 * Configures authentication for mobile and web apps with multiple providers:
 * - Password (email + password, always available)
 * - Apple Sign-In (iOS native)
 * - Google Sign-In (cross-platform)
 *
 * Environment variables (set via: npx convex env set KEY value):
 * - AUTH_APPLE_ID: Apple Service ID
 * - AUTH_APPLE_SECRET: Apple private key (generated JWT)
 * - AUTH_GOOGLE_ID: Google OAuth client ID
 * - AUTH_GOOGLE_SECRET: Google OAuth client secret
 * - SITE_URL: Your app's URL (for OAuth redirects)
 *
 * OAuth callback URLs (configure in provider dashboards):
 * - Apple: https://<deployment>.convex.site/api/auth/callback/apple
 * - Google: https://<deployment>.convex.site/api/auth/callback/google
 *
 * NOTE: Providers are only loaded if their env vars exist. This prevents
 * @auth/core from trying to uppercase undefined values during initialization.
 *
 * @see https://labs.convex.dev/auth/config
 * @see https://labs.convex.dev/auth/config/oauth
 */

import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import Apple from "@auth/core/providers/apple";
import Google from "@auth/core/providers/google";

// Conditionally load OAuth providers only if their env vars exist
// This prevents @auth/core env defaulting errors when vars are missing
const providers: any[] = [];

// Password provider (always available as baseline)
providers.push(
  Password({
    verify: async ({ password }) => {
      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }
      return true;
    },
  })
);

// Apple Sign-In (only if configured)
if (process.env.AUTH_APPLE_ID && process.env.AUTH_APPLE_SECRET) {
  providers.push(
    Apple({
      // Minimal safe profile mapping
      profile(profile: any) {
        return { id: profile.sub, name: profile.name, email: profile.email };
      },
    })
  );
}

// Google Sign-In (only if configured)
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(Google({})); // CALL the factory
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers, // Empty array is fine - Password will be the only provider initially
});

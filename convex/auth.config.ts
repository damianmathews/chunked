/**
 * Convex Auth Configuration
 *
 * Configures authentication for mobile and web apps with multiple providers:
 * - Email OTP via Resend (recommended for mobile)
 * - Apple Sign-In (iOS native)
 * - Google Sign-In (cross-platform)
 *
 * Environment variables required (set via: npx convex env set KEY value):
 * - AUTH_RESEND_KEY: Resend API key (https://resend.com/api-keys)
 * - AUTH_APPLE_CLIENT_ID: Apple Service ID
 * - AUTH_APPLE_CLIENT_SECRET: Apple private key (generated)
 * - AUTH_GOOGLE_CLIENT_ID: Google OAuth client ID
 * - AUTH_GOOGLE_CLIENT_SECRET: Google OAuth client secret
 *
 * OAuth callback URLs (configure in provider dashboards):
 * - Apple: https://<deployment>.convex.site/api/auth/callback/apple
 * - Google: https://<deployment>.convex.site/api/auth/callback/google
 *
 * @see https://labs.convex.dev/auth/config
 * @see https://labs.convex.dev/auth/config/oauth
 */

import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import Apple from "@auth/core/providers/apple";
import Google from "@auth/core/providers/google";

// Build providers array conditionally based on available environment variables
const providers = [
  // Email OTP via Resend (primary mobile auth method)
  // TODO: Integrate ResendOTP from ./ResendOTP.ts
  // For now using Password as fallback
  Password({
    verify: async ({ password }) => {
      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }
      return true;
    },
  }),
];

// Only add Apple if credentials are configured
// Requires: AUTH_APPLE_CLIENT_ID, AUTH_APPLE_CLIENT_SECRET
// @see https://labs.convex.dev/auth/config/oauth#apple
if (process.env.AUTH_APPLE_CLIENT_ID && process.env.AUTH_APPLE_CLIENT_SECRET) {
  providers.push(
    Apple({
      clientId: process.env.AUTH_APPLE_CLIENT_ID,
      clientSecret: process.env.AUTH_APPLE_CLIENT_SECRET,
    })
  );
}

// Only add Google if credentials are configured
// Requires: AUTH_GOOGLE_CLIENT_ID, AUTH_GOOGLE_CLIENT_SECRET
// @see https://labs.convex.dev/auth/config/oauth
if (process.env.AUTH_GOOGLE_CLIENT_ID && process.env.AUTH_GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_CLIENT_ID,
      clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET,
    })
  );
}

export const { auth, signIn, signOut, store } = convexAuth({
  providers,
});

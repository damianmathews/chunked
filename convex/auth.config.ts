// convex/auth.config.ts
import { convexAuth } from "@convex-dev/auth/server";
import type { Provider } from "@auth/core/providers";
// Import providers ONLY when you actually configure them:
// import Google from "@auth/core/providers/google";
// import GitHub from "@auth/core/providers/github";
// import Apple from "@auth/core/providers/apple";

const providers: Provider[] = [];

// No providers configured yet.
// Uncomment and configure when ready:
//
// if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
//   providers.push(
//     Google({
//       clientId: process.env.AUTH_GOOGLE_ID!,
//       clientSecret: process.env.AUTH_GOOGLE_SECRET!,
//     })
//   );
// }

const config = convexAuth({
  providers, // [] is valid; no providers means no auth until env is configured
});

export const { auth, signIn, signOut, store, isAuthenticated } = config;

// Export config with explicit providers field for Convex validation
export default {
  ...config,
  providers,
};

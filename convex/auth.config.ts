// convex/auth.config.ts
import { convexAuth } from "@convex-dev/auth/server";

const providers = [];

const config = convexAuth({
  providers,
});

export const { auth, signIn, signOut, store, isAuthenticated } = config;

export default {
  ...config,
  providers,
};

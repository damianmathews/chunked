import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { DataModel } from "./_generated/dataModel";

/**
 * Convex Auth Configuration
 *
 * This configures authentication for both web and mobile apps.
 * Supports email/password authentication with optional OAuth providers.
 */
export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Password({
      // Optional: Customize password validation
      verify: async ({ password }) => {
        if (password.length < 8) {
          throw new Error("Password must be at least 8 characters long");
        }
        return true;
      },
    }),
    // Add more providers here as needed:
    // Google(),
    // GitHub(),
  ],
});

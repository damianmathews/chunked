import { ReactNode } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";

/**
 * Convex Client Provider for Web App
 *
 * Wraps the app with Convex client and authentication.
 */

const convexUrl = import.meta.env.VITE_CONVEX_URL!;

if (!convexUrl) {
  throw new Error(
    "Missing VITE_CONVEX_URL environment variable. " +
    "Add it to your .env file or set it in your deployment."
  );
}

const convex = new ConvexReactClient(convexUrl);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      <ConvexAuthProvider>{children}</ConvexAuthProvider>
    </ConvexProvider>
  );
}

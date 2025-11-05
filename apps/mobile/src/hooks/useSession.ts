/**
 * Unified Session Hook
 *
 * Bridges Convex Auth with existing Zustand auth system.
 * When Convex is enabled and user is signed in via Convex, uses that.
 * Otherwise falls back to existing Zustand auth.
 *
 * This allows progressive migration: old code continues working,
 * new code can use Convex auth, and both systems coexist.
 *
 * Status values:
 * - "loading": Auth state is being determined
 * - "signedOut": User is not authenticated
 * - "signedIn": User is authenticated (via Convex or Zustand)
 *
 * @see https://labs.convex.dev/auth/api-reference#react
 */

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { useAuth as useZustandAuth } from "@/utils/auth/useAuth";
import Constants from "expo-constants";

type SessionStatus = "loading" | "signedOut" | "signedIn";

export interface UseSessionReturn {
  /** Current auth status */
  status: SessionStatus;
  /** Simplified boolean: is user signed in? */
  isAuthenticated: boolean;
  /** Is auth state still loading? */
  isLoading: boolean;
  /** User data (from Convex or Zustand) */
  user: any;
  /** Sign in function */
  signIn: (...args: any[]) => any;
  /** Sign out function */
  signOut: () => Promise<void>;
  /** Is Convex auth enabled? */
  isConvexEnabled: boolean;
}

/**
 * Check if Convex Auth is enabled via feature flag
 */
function isConvexAuthEnabled(): boolean {
  const flagFromConfig = Constants.expoConfig?.extra?.convexAuthEnabled;
  const flagFromEnv = process.env.EXPO_PUBLIC_CONVEX_AUTH_ENABLED;

  // Check if explicitly enabled (handle string "true")
  return (
    flagFromConfig === "true" ||
    flagFromConfig === true ||
    flagFromEnv === "true" ||
    flagFromEnv === true
  );
}

/**
 * Unified session hook
 *
 * Usage:
 * ```tsx
 * const { status, isAuthenticated, signIn, signOut } = useSession();
 *
 * if (status === "loading") return <LoadingSpinner />;
 * if (status === "signedOut") return <SignInButton onPress={signIn} />;
 * return <AuthenticatedContent />;
 * ```
 */
export function useSession(): UseSessionReturn {
  // Check if Convex is enabled
  const convexEnabled = isConvexAuthEnabled();

  // Get Convex auth state (always call hooks, conditional logic below)
  const convexAuth = useConvexAuth();
  const convexAuthActions = useAuthActions();

  // Get Zustand auth state (legacy system)
  const zustandAuth = useZustandAuth();

  // Determine which system to use
  if (convexEnabled && convexAuth.isAuthenticated) {
    // User signed in via Convex
    return {
      status: convexAuth.isLoading
        ? "loading"
        : convexAuth.isAuthenticated
        ? "signedIn"
        : "signedOut",
      isAuthenticated: convexAuth.isAuthenticated,
      isLoading: convexAuth.isLoading,
      user: null, // TODO: Fetch from Convex useQuery(api.users.me)
      signIn: convexAuthActions.signIn,
      signOut: convexAuthActions.signOut,
      isConvexEnabled: true,
    };
  }

  // Fall back to Zustand auth (legacy)
  return {
    status: !zustandAuth.isReady
      ? "loading"
      : zustandAuth.isAuthenticated
      ? "signedIn"
      : "signedOut",
    isAuthenticated: zustandAuth.isAuthenticated || false,
    isLoading: !zustandAuth.isReady,
    user: zustandAuth.auth,
    signIn: zustandAuth.signIn,
    signOut: zustandAuth.signOut,
    isConvexEnabled: false,
  };
}

export default useSession;

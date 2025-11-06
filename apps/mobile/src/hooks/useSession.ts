/**
 * Unified Session Hook
 *
 * Bridges Supabase Auth with existing Zustand auth system.
 * When Supabase is enabled and user is signed in via Supabase, uses that.
 * Otherwise falls back to existing Zustand auth.
 *
 * This allows progressive migration: old code continues working,
 * new code can use Supabase auth, and both systems coexist.
 *
 * Status values:
 * - "loading": Auth state is being determined
 * - "signedOut": User is not authenticated
 * - "signedIn": User is authenticated (via Supabase or Zustand)
 *
 * @see https://supabase.com/docs/guides/auth/quickstarts/react-native
 */

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth as useZustandAuth } from "@/utils/auth/useAuth";
import { Session } from "@supabase/supabase-js";
import Constants from "expo-constants";

type SessionStatus = "loading" | "signedOut" | "signedIn";

export interface UseSessionReturn {
  /** Current auth status */
  status: SessionStatus;
  /** Simplified boolean: is user signed in? */
  isAuthenticated: boolean;
  /** Is auth state still loading? */
  isLoading: boolean;
  /** User data (from Supabase or Zustand) */
  user: any;
  /** Supabase session */
  session: Session | null;
  /** Sign in with OAuth provider */
  signInWithOAuth: (provider: "google" | "apple") => Promise<void>;
  /** Sign out function */
  signOut: () => Promise<void>;
  /** Is Supabase auth enabled? */
  isSupabaseEnabled: boolean;
}

/**
 * Check if Supabase Auth is enabled via feature flag
 */
function isSupabaseAuthEnabled(): boolean {
  const flagFromConfig = Constants.expoConfig?.extra?.supabaseAuthEnabled;
  const flagFromEnv = process.env.EXPO_PUBLIC_SUPABASE_AUTH_ENABLED;

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
 * const { status, isAuthenticated, signInWithOAuth, signOut } = useSession();
 *
 * if (status === "loading") return <LoadingSpinner />;
 * if (status === "signedOut") return <SignInButton onPress={() => signInWithOAuth('google')} />;
 * return <AuthenticatedContent />;
 * ```
 */
export function useSession(): UseSessionReturn {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if Supabase is enabled
  const supabaseEnabled = isSupabaseAuthEnabled();

  // Get Zustand auth state (legacy system)
  const zustandAuth = useZustandAuth();

  useEffect(() => {
    if (!supabaseEnabled) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabaseEnabled]);

  // Sign in with OAuth
  const signInWithOAuth = async (provider: "google" | "apple") => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: "chunked://auth-callback",
        skipBrowserRedirect: false,
      },
    });
    if (error) throw error;
  };

  // Sign out
  const signOut = async () => {
    if (supabaseEnabled && session) {
      await supabase.auth.signOut();
    }
    // Also sign out from Zustand (if using legacy)
    if (!supabaseEnabled) {
      await zustandAuth.signOut();
    }
  };

  // Determine which system to use
  if (supabaseEnabled && session) {
    // User signed in via Supabase
    return {
      status: loading ? "loading" : session ? "signedIn" : "signedOut",
      isAuthenticated: !!session,
      isLoading: loading,
      user: session?.user || null,
      session,
      signInWithOAuth,
      signOut,
      isSupabaseEnabled: true,
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
    session: null,
    signInWithOAuth: async () => {
      throw new Error("Supabase auth not enabled");
    },
    signOut: zustandAuth.signOut,
    isSupabaseEnabled: false,
  };
}

export default useSession;

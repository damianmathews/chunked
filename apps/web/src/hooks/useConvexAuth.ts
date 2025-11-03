import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth as useConvexAuthBase } from "convex/react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

/**
 * Custom hook for Convex authentication
 *
 * Provides sign in, sign up, sign out, and user state.
 */
export function useConvexAuth() {
  const { isLoading, isAuthenticated } = useConvexAuthBase();
  const { signIn, signOut } = useAuthActions();
  const currentUser = useQuery(api.users.getCurrentUser);
  const currentUserProfile = useQuery(api.users.getCurrentUserProfile);
  const updateProfile = useMutation(api.users.updateProfile);

  /**
   * Sign in with email and password
   */
  const signInWithPassword = async (email: string, password: string) => {
    try {
      await signIn("password", { email, password, flow: "signIn" });
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  };

  /**
   * Sign up with email and password
   */
  const signUpWithPassword = async (email: string, password: string) => {
    try {
      await signIn("password", { email, password, flow: "signUp" });
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    }
  };

  /**
   * Sign out current user
   */
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  };

  return {
    isLoading,
    isAuthenticated,
    user: currentUser,
    profile: currentUserProfile,
    signIn: signInWithPassword,
    signUp: signUpWithPassword,
    signOut: handleSignOut,
    updateProfile,
  };
}

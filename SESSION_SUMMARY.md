# Supabase Auth Migration - Session Summary
**Date:** November 5, 2025
**Status:** In Progress - Google OAuth Not Working Yet

## What We Accomplished ✅

### 1. Completely Removed Convex
- ✅ Deleted all Convex dependencies from package.json
- ✅ Removed entire `/convex/` backend directory
- ✅ Deleted orphaned Convex files:
  - `src/convex/ConvexProvider.tsx`
  - `src/hooks/useConvexAuth.ts`
  - `src/components/auth/SignInScreen.tsx`
  - `src/components/auth/SignUpScreen.tsx`
  - `src/lib/secureTokenStorage.ts`
- ✅ Cleaned up `app.json` (removed convexUrl, convexAuthEnabled)
- ✅ Verified zero remaining Convex references in codebase

### 2. Set Up Supabase
- ✅ Created Supabase project: `epeaofakeridnoodyyhy`
- ✅ Installed dependencies: `@supabase/supabase-js`, `react-native-url-polyfill`
- ✅ Created Supabase client (`src/lib/supabase.ts`) with SecureStore integration
- ✅ Created unified session hook (`src/hooks/useSession.ts`) that bridges Supabase + legacy Zustand auth
- ✅ Added environment variables to `/apps/mobile/.env`:
  ```
  EXPO_PUBLIC_SUPABASE_URL=https://epeaofakeridnoodyyhy.supabase.co
  EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  EXPO_PUBLIC_SUPABASE_AUTH_ENABLED=true
  ```

### 3. Configured Google OAuth
- ✅ Created Google OAuth Web Client ID (see Google Cloud Console)
- ✅ Created iOS OAuth Client ID (for native app)
- ✅ Added redirect URI in Google Cloud Console: `https://epeaofakeridnoodyyhy.supabase.co/auth/v1/callback`
- ✅ Configured Google provider in Supabase dashboard with both client IDs

### 4. Integrated OAuth into Onboarding
- ✅ Updated `src/app/(auth)/onboarding.jsx` to use real `useSession` hook
- ✅ Wired "Continue with Google" button to call `signInWithOAuth("google")`
- ✅ Added loading state and error handling
- ✅ Set up auto-redirect after successful authentication

## What's Still Broken ❌

### The Problem
When clicking "Continue with Google" on the onboarding screen, it still just navigates straight to the app without opening the OAuth flow.

### Why It's Happening (Best Guess)
One or more of these issues:

1. **Environment variables not being read at runtime**
   - The `.env` file is in the correct location (`/apps/mobile/.env`)
   - Expo shows it's loading the env vars: `env: load .env`
   - BUT the React Native app might not be picking them up correctly
   - Need to verify with console.log what `process.env.EXPO_PUBLIC_SUPABASE_AUTH_ENABLED` actually returns

2. **useSession hook falling back to legacy auth**
   - If `isSupabaseAuthEnabled()` returns false, it won't call the OAuth flow
   - Need to add debug logging to see which code path is executing

3. **signInWithOAuth might be failing silently**
   - No error is being thrown/shown
   - Need to add more detailed error logging

4. **Deep linking not configured**
   - The app might not be handling the `chunked://auth-callback` redirect
   - Need to configure URL scheme in `app.json`

## Critical Files

### `/apps/mobile/.env`
```
EXPO_PUBLIC_SUPABASE_URL=https://epeaofakeridnoodyyhy.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwZWFvZmFrZXJpZG5vb2R5eWh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzODgxMzIsImV4cCI6MjA3Nzk2NDEzMn0.QnQq_g7F8ioSTWlhg5tf8BBCY_jxEVQZEJ6P4e8IJsw
EXPO_PUBLIC_SUPABASE_AUTH_ENABLED=true
```

### `src/lib/supabase.ts` (Supabase client)
Working correctly - initializes Supabase with SecureStore

### `src/hooks/useSession.ts` (Auth bridge)
```typescript
function isSupabaseAuthEnabled(): boolean {
  const flagFromConfig = Constants.expoConfig?.extra?.supabaseAuthEnabled;
  const flagFromEnv = process.env.EXPO_PUBLIC_SUPABASE_AUTH_ENABLED;

  return (
    flagFromConfig === "true" ||
    flagFromConfig === true ||
    flagFromEnv === "true" ||
    flagFromEnv === true
  );
}
```
**Issue:** This function might be returning false

### `src/app/(auth)/onboarding.jsx` (Google button)
Line 61-84: `handleGoogleSignIn` function calls `signInWithOAuth("google")`

## Next Steps for Tomorrow

### Step 1: Add Debug Logging
Add console.logs to understand what's happening:

```javascript
// In src/hooks/useSession.ts - isSupabaseAuthEnabled()
console.log('🔍 Checking Supabase enabled status...');
console.log('  flagFromConfig:', flagFromConfig);
console.log('  flagFromEnv:', flagFromEnv);
console.log('  Result:', isSupabaseEnabled);

// In src/app/(auth)/onboarding.jsx - handleGoogleSignIn()
console.log('🔘 Google sign-in clicked');
console.log('  isSupabaseEnabled:', isSupabaseEnabled);
console.log('  About to call signInWithOAuth...');
```

### Step 2: Configure Deep Linking
Add to `app.json`:
```json
{
  "expo": {
    "scheme": "chunked",
    "ios": {
      "bundleIdentifier": "com.chunked.app"
    }
  }
}
```

### Step 3: Test OAuth Manually
Create a simple test button that just calls:
```javascript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'chunked://auth-callback',
  },
});
console.log('OAuth result:', { data, error });
```

### Step 4: Check Supabase Dashboard
- Verify Google provider is actually enabled
- Check Supabase logs for any OAuth attempts
- Verify redirect URL is correct

## Background Processes Running
Multiple old Convex processes are still running - need to kill them:
- cb4ec0, 8915b3, 76fb01, 54e416, a914e5, a6029f, 01089d, efd8bf, aac8a9

Kill with: `pkill -f "npx convex dev"`

## Google OAuth Credentials
- **Web Client ID:** [REDACTED - check Google Cloud Console]
- **Web Client Secret:** [REDACTED - check Google Cloud Console]
- **iOS Client ID:** [REDACTED - check Google Cloud Console]
- **Redirect URI:** https://epeaofakeridnoodyyhy.supabase.co/auth/v1/callback

## Resources
- Supabase Dashboard: https://supabase.com/dashboard/project/epeaofakeridnoodyyhy
- Google Cloud Console: https://console.cloud.google.com/apis/credentials
- Supabase Docs: https://supabase.com/docs/guides/auth/social-login/auth-google?platform=expo

## Time Spent
~3 hours - Most time spent fighting Convex Auth bugs before switching to Supabase

## Architecture Decision
We're using a **feature-flagged bridge pattern**:
- New Supabase Auth (when enabled) + Legacy Zustand Auth (fallback)
- Both systems coexist without breaking changes
- `useSession` hook abstracts the complexity
- Easy to roll back if needed

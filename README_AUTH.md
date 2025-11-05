# Convex Auth Implementation Guide

## Overview

This document describes the Convex Auth integration for the Chunked Golf mobile app. The implementation is **feature-flagged** and designed for **progressive rollout** without breaking existing functionality.

**Status**: 🟡 Infrastructure Complete - Manual Setup Required

## Architecture

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      Mobile App (React Native)              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  ConvexAuthProvider (SecureStore for tokens)           │ │
│  │  ├── useSession() - Unified hook (Convex + Zustand)    │ │
│  │  ├── SignIn UI - Email OTP, Apple, Google             │ │
│  │  └── Account Screen - Profile & sign out              │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↓ HTTPS
┌─────────────────────────────────────────────────────────────┐
│              Convex Backend (convex/ directory)             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  HTTP Routes: /api/auth/signin, /signout, /callback   │ │
│  │  Providers: Password, Apple, Google, Resend OTP       │ │
│  │  Functions: users.ts (me, updateProfile)              │ │
│  │  Tables: users, sessions, userProfiles (authTables)   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Provider Hierarchy

```tsx
<ConvexClientProvider>  ← Database + Auth (conditional, feature-flagged)
  <ThemeProvider>       ← Dark mode and theme colors
    <RoundProvider>     ← Golf round state
      <QueryClientProvider> ← React Query
        <GestureHandlerRootView>
          <Stack />     ← Expo Router navigation
        </GestureHandlerRootView>
      </QueryClientProvider>
    </RoundProvider>
  </ThemeProvider>
</ConvexClientProvider>
```

**Note**: The old Zustand auth system (`useAuth`) remains active. Both systems coexist peacefully.

---

## ✅ What's Already Done

### Backend (convex/)

- [x] **auth.config.ts**: Multi-provider auth config (Password, Apple, Google)
- [x] **ResendOTP.ts**: Email OTP implementation scaffolding
- [x] **http.ts**: HTTP routes for OAuth callbacks (`/api/auth/callback/{provider}`)
- [x] **schema.ts**: Includes `authTables` (users, sessions) + `userProfiles`
- [x] **users.ts**: Queries using `getAuthUserId` (`me`, `getCurrentUser`, `updateProfile`)
- [x] **health.ts**: Connection verification query (`ping`)

### Frontend (apps/mobile/)

- [x] **secureTokenStorage.ts**: SecureStore implementation for token persistence
- [x] **ConvexProvider.tsx**: ConvexAuthProvider with conditional initialization
- [x] **_layout.jsx**: Provider wired at root level (falls back gracefully)
- [x] **useSession.ts**: Unified hook bridging Convex auth + Zustand
- [x] **Environment setup**: `.env.local`, `app.json` config

### Dependencies

- [x] `convex@^1.16.1` - Database client
- [x] `@convex-dev/auth@^0.0.61` - Auth library
- [x] `@auth/core@0.37.0` - Auth core (required by Convex Auth)
- [x] `resend` - Email service for OTP
- [x] `@oslojs/crypto` - Cryptographic utilities
- [x] Native: `expo-secure-store`, `expo-web-browser`, `expo-linking` (already present)

### Security

- [x] Tokens stored in **iOS Keychain / Android Keystore** (via SecureStore)
- [x] No tokens in AsyncStorage or unencrypted storage
- [x] HTTP-only session cookies handled by Convex Auth server

---

## 🔧 Required Manual Setup

### Step 1: Initialize Convex Deployment

**This is the critical first step**. Run from repo root:

```bash
npx convex dev
```

**What this does**:
1. Prompts you to log in to Convex (or create account)
2. Creates a new dev deployment (e.g., `happy-animal-123`)
3. Generates `convex/_generated/` directory with TypeScript types
4. Updates `.env.local` with `CONVEX_DEPLOYMENT=dev:...`
5. Outputs deployment URL: `https://happy-animal-123.convex.cloud`
6. Starts dev server (watches for schema/function changes)

**Keep this terminal running** while developing.

### Step 2: Configure Environment Variables

After `npx convex dev` completes, update `.env.local`:

```bash
# .env.local (repo root)

# Auto-generated by convex dev
CONVEX_DEPLOYMENT=dev:happy-animal-123

# Add this manually (copy from convex dev output)
EXPO_PUBLIC_CONVEX_URL=https://happy-animal-123.convex.cloud

# Enable auth UI (when ready to test)
EXPO_PUBLIC_CONVEX_AUTH_ENABLED=false  # Set to "true" to enable
```

Update `apps/mobile/app.json`:

```json
{
  "expo": {
    "extra": {
      "convexUrl": "https://happy-animal-123.convex.cloud",
      "convexAuthEnabled": "false"
    }
  }
}
```

**Important**: Replace `happy-animal-123` with your actual deployment ID.

### Step 3: Set Up Authentication Providers

#### Option A: Email OTP (Recommended for MVP)

**Get Resend API Key**:
1. Sign up at [resend.com](https://resend.com)
2. Generate API key from dashboard
3. Set in Convex:

```bash
npx convex env set AUTH_RESEND_KEY re_123abc456...
```

**Configure sender email**:
Edit `convex/ResendOTP.ts` line 28:

```ts
from: "Chunked Golf <onboarding@yourdomain.com>", // Update this
```

**Note**: For production, you'll need to verify your domain with Resend.

#### Option B: Apple Sign-In (iOS Native)

**Apple Developer Setup**:
1. Create App ID in Apple Developer portal
2. Enable "Sign in with Apple" capability
3. Create Service ID (use as Client ID)
4. Generate private key and create Client Secret (see [Convex Apple docs](https://labs.convex.dev/auth/config/oauth#apple))

**Set in Convex**:

```bash
npx convex env set AUTH_APPLE_CLIENT_ID com.yourdomain.chunked.service
npx convex env set AUTH_APPLE_CLIENT_SECRET eyJhbGc...  # Generated JWT
```

**Configure callback URL in Apple**:
```
https://happy-animal-123.convex.site/api/auth/callback/apple
```

#### Option C: Google Sign-In (Cross-Platform)

**Google Cloud Console Setup**:
1. Create OAuth 2.0 Client ID
2. Add authorized redirect URI:

```
https://happy-animal-123.convex.site/api/auth/callback/google
```

**Set in Convex**:

```bash
npx convex env set AUTH_GOOGLE_CLIENT_ID 123456789-abc.apps.googleusercontent.com
npx convex env set AUTH_GOOGLE_CLIENT_SECRET GOCSPX-abc123...
```

### Step 4: Verify Convex Connection

**Check Dashboard**:

```bash
npx convex dashboard
```

Opens: `https://dashboard.convex.dev`

**What to verify**:
- ✅ Tables exist: `users`, `sessions`, `userProfiles`
- ✅ Functions visible: `health:ping`, `users:me`, `users:getCurrentUser`
- ✅ HTTP routes active: `/api/auth/signin`, `/api/auth/signout`

**Test health check** from dashboard:
1. Go to Functions tab
2. Run `health:ping`
3. Should return: `{ status: "ok", timestamp: 1234567890, ... }`

### Step 5: Enable Auth in Mobile App

**Start the app**:

```bash
cd apps/mobile
npx expo start
```

**You should see console log**:
```
⚠️  Convex not configured - running without auth backend
To enable: Run 'npx convex dev' from repo root
```

**After completing Steps 1-2**, restart Expo and the warning should disappear.

**To enable auth UI**, set:

```bash
# .env.local
EXPO_PUBLIC_CONVEX_AUTH_ENABLED=true
```

And update `app.json`:

```json
"convexAuthEnabled": "true"
```

---

## 🧪 Testing Checklist

### Basic Connection

- [ ] `npx convex dev` runs without errors
- [ ] Dashboard accessible and shows tables/functions
- [ ] Mobile app starts without crashes
- [ ] No "Convex not configured" warning after setup

### Email OTP Flow (when implemented)

- [ ] Request code → email received with 8-digit code
- [ ] Enter code → user signs in
- [ ] Refresh app → user stays signed in (SecureStore persistence)
- [ ] Sign out → token cleared from SecureStore

### OAuth Flows (Apple/Google)

- [ ] Tap Apple/Google button → in-app browser opens
- [ ] Complete sign-in → redirects back with code
- [ ] User authenticated → `useSession().isAuthenticated === true`
- [ ] Dashboard shows new user in `users` table

### Security Validation

- [ ] Run: `adb shell run-as com.your.app ls -la files/` (Android)
- [ ] Or check iOS Keychain via Xcode
- [ ] Confirm tokens NOT in AsyncStorage
- [ ] Confirm tokens present in SecureStore

### Existing Functionality (No Regressions)

- [ ] Onboarding flow works
- [ ] Round logging works
- [ ] Shot tracking works
- [ ] Analytics screen works
- [ ] Navigation works
- [ ] Guest mode works (auth disabled)

---

## 📁 File Structure

```
chunked/
├── convex/                       # Backend (Convex functions)
│   ├── auth.config.ts           # Auth providers config
│   ├── ResendOTP.ts             # Email OTP implementation
│   ├── http.ts                  # OAuth callback routes
│   ├── schema.ts                # Database schema
│   ├── users.ts                 # User queries/mutations
│   ├── health.ts                # Health check
│   └── _generated/              # Auto-generated (gitignored)
│
├── apps/mobile/
│   ├── src/
│   │   ├── convex/
│   │   │   └── ConvexProvider.tsx     # Auth provider wrapper
│   │   ├── lib/
│   │   │   └── secureTokenStorage.ts  # SecureStore impl
│   │   ├── hooks/
│   │   │   ├── useSession.ts          # Unified auth hook
│   │   │   └── useConvexAuth.ts       # (Legacy, Password flow)
│   │   ├── components/auth/
│   │   │   ├── SignInScreen.tsx       # (Needs update for OTP)
│   │   │   └── SignUpScreen.tsx       # (Needs update)
│   │   └── app/
│   │       └── _layout.jsx            # Root layout with provider
│   └── app.json                       # Expo config (convexUrl)
│
├── .env.local                    # Environment variables (gitignored)
├── package.json                  # Root dependencies
└── README_AUTH.md               # This file
```

---

## 🚧 What Still Needs Implementation

### High Priority

1. **Sign-In UI Updates** (`apps/mobile/src/components/auth/SignInScreen.tsx`)
   - [ ] Switch from Password flow to Email OTP (two-step UI)
   - [ ] Add Apple Sign-In button (with `expo-web-browser` flow)
   - [ ] Add Google Sign-In button
   - [ ] Match theme colors from `ThemeContext` (glass morphism)
   - [ ] Support dark mode

2. **Account Screen** (`apps/mobile/src/app/(account)/index.tsx` - create this)
   - [ ] Show user profile (name, email, avatar)
   - [ ] Sign-out button
   - [ ] "Continue without account" for guests
   - [ ] Conditionally show based on feature flag

3. **Complete OTP Integration** (`convex/ResendOTP.ts`)
   - [ ] Integrate with Convex Auth's built-in code verification
   - [ ] Store codes with expiry in Convex table
   - [ ] Handle code verification in auth flow

4. **Health Check Component** (`apps/mobile/src/components/ConvexHealthCheck.tsx`)
   - [ ] Create dev-only widget showing connection status
   - [ ] Use `useQuery(api.health.ping)`
   - [ ] Wrap in `__DEV__` flag

### Medium Priority

5. **Update useSession Hook**
   - [ ] Add `useQuery(api.users.me)` to fetch user data when Convex enabled
   - [ ] Sync Zustand store with Convex auth state

6. **Onboarding Integration**
   - [ ] Wire "Sign in with Email" button to SignInScreen
   - [ ] Wire "Sign in with Apple" to OAuth flow
   - [ ] Wire "Sign in with Google" to OAuth flow
   - [ ] Implement "Skip for now" → remains in guest mode

7. **Data Migration**
   - [ ] On first sign-in, upload AsyncStorage rounds to Convex
   - [ ] Prompt user: "Import your local data?"
   - [ ] Create migration mutation in `convex/migrations.ts`

### Low Priority

8. **Error Handling**
   - [ ] Network error UI
   - [ ] Auth failure UI (wrong code, expired token, etc.)
   - [ ] Offline mode handling

9. **Analytics**
   - [ ] Track sign-in events
   - [ ] Track provider usage (Apple vs Google vs Email)
   - [ ] Track auth errors

10. **Testing**
    - [ ] Unit tests for useSession
    - [ ] Integration tests for auth flows
    - [ ] E2E tests with Detox

---

## 🐛 Troubleshooting

### "Convex not configured" warning

**Cause**: `EXPO_PUBLIC_CONVEX_URL` not set or invalid.

**Fix**:
1. Run `npx convex dev`
2. Copy deployment URL to `.env.local`
3. Restart Expo: `npx expo start --clear`

### "Cannot find module 'convex/_generated/api'"

**Cause**: Convex has not been initialized.

**Fix**:
1. Run `npx convex dev` from repo root
2. Wait for "Convex functions ready" message
3. Verify `convex/_generated/` directory exists

### App crashes on launch after adding provider

**Cause**: Import error or missing dependency.

**Fix**:
1. Check console for import errors
2. Verify all dependencies installed:
   ```bash
   cd apps/mobile && npm install
   ```
3. Clear Metro cache: `npx expo start --clear`

### OAuth callback not working

**Cause**: Callback URL mismatch.

**Fix**:
1. Check provider dashboard callback URL matches:
   ```
   https://<deployment>.convex.site/api/auth/callback/<provider>
   ```
2. Verify `CONVEX_SITE_URL` env var in Convex dashboard
3. Check Convex logs: `npx convex logs`

### Tokens not persisting after app restart

**Cause**: SecureStore not configured correctly.

**Fix**:
1. Verify `secureTokenStorage` imported in `ConvexProvider.tsx`
2. Check iOS/Android permissions for Keychain/Keystore
3. Test with:
   ```ts
   import * as SecureStore from 'expo-secure-store';
   await SecureStore.setItemAsync('test', 'value');
   const val = await SecureStore.getItemAsync('test'); // Should return 'value'
   ```

### "AUTH_RESEND_KEY is not defined" error

**Cause**: Environment variable not set in Convex.

**Fix**:
```bash
npx convex env set AUTH_RESEND_KEY your-key-here
npx convex env list  # Verify it's set
```

---

## 📚 References

### Convex Documentation

- [React Native Quickstart](https://docs.convex.dev/quickstart/react-native)
- [Convex Auth Setup](https://labs.convex.dev/auth/setup)
- [Auth API Reference](https://labs.convex.dev/auth/api-reference)
- [OAuth Configuration](https://labs.convex.dev/auth/config/oauth)
- [Apple Sign-In](https://labs.convex.dev/auth/config/oauth#apple)
- [HTTP Actions](https://docs.convex.dev/functions/http-actions)
- [CLI Commands](https://docs.convex.dev/cli)

### Expo Documentation

- [SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/)
- [WebBrowser](https://docs.expo.dev/versions/latest/sdk/webbrowser/)
- [Linking](https://docs.expo.dev/versions/latest/sdk/linking/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Monorepo Guide](https://docs.expo.dev/guides/monorepos/)

### Provider Setup Guides

- [Resend API](https://resend.com/docs/send-with-nodejs)
- [Apple Developer](https://developer.apple.com/sign-in-with-apple/)
- [Google OAuth](https://developers.google.com/identity/protocols/oauth2)

---

## 🔄 Rollback Plan

If anything breaks, here's how to revert:

### Rollback to Previous Commit

```bash
git log --oneline  # Find commit before auth changes
git revert <commit-sha>
```

### Disable Convex Without Rollback

```bash
# .env.local
EXPO_PUBLIC_CONVEX_URL=
EXPO_PUBLIC_CONVEX_AUTH_ENABLED=false
```

Restart Expo. App will run in guest mode with old Zustand auth.

### Remove Convex Completely

```bash
# Stop convex dev server (Ctrl+C)

# Uninstall dependencies
cd apps/mobile
npm uninstall convex @convex-dev/auth @auth/core

# Revert _layout.jsx to remove ConvexClientProvider import/wrapper
# Revert any code that imports from convex/_generated

# Restart
npx expo start --clear
```

---

## 💡 Tips for Production

1. **Separate Dev/Prod Deployments**
   ```bash
   # Development
   npx convex dev

   # Production
   npx convex deploy --prod
   ```

2. **Environment Variables per Environment**
   - Use `.env.local` for dev
   - Use `.env.production` for prod (if supported by your setup)
   - Set production env vars via Convex dashboard

3. **Rate Limiting**
   - Convex has built-in rate limiting
   - For OTP: limit code requests per email (add to ResendOTP.ts)

4. **Monitoring**
   - Enable Convex logging: `npx convex env set AUTH_LOG_LEVEL=DEBUG`
   - Set up error tracking (Sentry, Bugsnag)
   - Monitor dashboard for function errors

5. **Data Backup**
   - Convex provides automatic backups
   - Export data periodically: `npx convex export`

---

## 🙋 Getting Help

### Convex Support

- [Discord](https://convex.dev/community)
- [GitHub Issues](https://github.com/get-convex/convex-backend/issues)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/convex)

### Project-Specific Questions

- Open an issue in this repo
- Check git commit history for implementation details:
  ```bash
  git log --grep="convex\|auth" --oneline
  ```

---

## 📝 Change Log

| Date | Commit | Description |
|------|--------|-------------|
| 2025-11-05 | `c95bdc4` | Install Convex dependencies in mobile app |
| 2025-11-05 | `9cbcad0` | Configure backend with multi-provider auth |
| 2025-11-05 | `66b3222` | Wire ConvexAuthProvider with SecureStore |
| 2025-11-05 | TBD | Create useSession hook (bridge layer) |

---

**Next Steps**: Complete Step 1 (run `npx convex dev`), then move through manual setup steps 2-5.

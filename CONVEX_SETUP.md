# Convex Authentication Setup Guide

This guide walks you through setting up Convex authentication for both web and mobile apps.

---

## 📦 Step 1: Install Dependencies

### Root Dependencies
```bash
npm install convex @convex-dev/auth
```

### Web App Dependencies
```bash
cd apps/web
npm install convex @convex-dev/auth
```

### Mobile App Dependencies
```bash
cd apps/mobile
npm install convex @convex-dev/auth
npm install expo-constants  # If not already installed
```

---

## 🚀 Step 2: Initialize Convex

From your project root:

```bash
npx convex dev
```

This will:
1. Prompt you to log in to Convex (or create an account)
2. Create a new Convex project
3. Generate a deployment URL
4. Start the Convex development server

**Save your deployment URL** - you'll need it for environment variables!

---

## 🔐 Step 3: Configure Environment Variables

### Root `.env` file
```bash
VITE_CONVEX_URL=https://your-deployment.convex.cloud
EXPO_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

### Web App `.env` file (`apps/web/.env`)
```bash
VITE_CONVEX_URL=https://your-deployment.convex.cloud
```

### Mobile App Configuration

Add to `apps/mobile/app.json`:
```json
{
  "expo": {
    "extra": {
      "convexUrl": "https://your-deployment.convex.cloud"
    }
  }
}
```

---

## 🏗️ Step 4: Project Structure

Your Convex setup includes:

```
convex/
├── auth.config.ts       # Authentication configuration
├── schema.ts            # Database schema
├── users.ts             # User queries and mutations
├── http.ts              # HTTP routes for auth
└── _generated/          # Auto-generated types (don't edit)

apps/web/src/
├── convex/
│   └── ConvexClientProvider.tsx
├── hooks/
│   └── useConvexAuth.ts
└── components/auth/
    ├── SignInForm.tsx
    └── SignUpForm.tsx

apps/mobile/src/
├── convex/
│   └── ConvexProvider.tsx
├── hooks/
│   └── useConvexAuth.ts
└── components/auth/
    ├── SignInScreen.tsx
    └── SignUpScreen.tsx
```

---

## 🌐 Step 5: Integrate into Web App

### Update `apps/web/src/app/root.tsx`

Wrap your app with the Convex provider:

```tsx
import { ConvexClientProvider } from '../convex/ConvexClientProvider';

export function App() {
  return (
    <ConvexClientProvider>
      {/* Your existing app */}
    </ConvexClientProvider>
  );
}
```

### Use the auth hook

```tsx
import { useConvexAuth } from '../hooks/useConvexAuth';

function MyComponent() {
  const { isAuthenticated, user, signIn, signOut } = useConvexAuth();

  if (!isAuthenticated) {
    return <SignInForm />;
  }

  return (
    <div>
      <h1>Welcome {user?.email}</h1>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

---

## 📱 Step 6: Integrate into Mobile App

### Update `apps/mobile/App.tsx` or main entry

Wrap your app with the Convex provider:

```tsx
import { ConvexClientProvider } from './src/convex/ConvexProvider';

export default function App() {
  return (
    <ConvexClientProvider>
      {/* Your existing app */}
    </ConvexClientProvider>
  );
}
```

### Use the auth hook

```tsx
import { useConvexAuth } from './src/hooks/useConvexAuth';
import { SignInScreen } from './src/components/auth/SignInScreen';

function MyScreen() {
  const { isAuthenticated, user, signOut } = useConvexAuth();

  if (!isAuthenticated) {
    return <SignInScreen />;
  }

  return (
    <View>
      <Text>Welcome {user?.email}</Text>
      <Button title="Sign Out" onPress={signOut} />
    </View>
  );
}
```

---

## 🔧 Step 7: Run Development Servers

### Terminal 1: Convex Dev Server
```bash
npx convex dev
```

### Terminal 2: Web App
```bash
cd apps/web
npm run dev
```

### Terminal 3: Mobile App
```bash
cd apps/mobile
npm start
```

---

## 📚 Usage Examples

### Sign In
```tsx
const { signIn } = useConvexAuth();
await signIn('user@example.com', 'password123');
```

### Sign Up
```tsx
const { signUp } = useConvexAuth();
await signUp('user@example.com', 'password123');
```

### Sign Out
```tsx
const { signOut } = useConvexAuth();
await signOut();
```

### Check Auth State
```tsx
const { isAuthenticated, isLoading, user } = useConvexAuth();

if (isLoading) return <Loading />;
if (!isAuthenticated) return <SignIn />;
return <Dashboard user={user} />;
```

### Update User Profile
```tsx
const { updateProfile } = useConvexAuth();
await updateProfile({
  displayName: 'John Doe',
  bio: 'Software developer',
});
```

---

## 🔒 Security Best Practices

1. **Never commit `.env` files** - Add them to `.gitignore`
2. **Use HTTPS only** - Convex URLs are HTTPS by default
3. **Validate passwords** - Minimum 8 characters (configured in `auth.config.ts`)
4. **Enable rate limiting** - Configure in Convex dashboard
5. **Use SecureStore on mobile** - Already implemented in the hooks

---

## 🎯 Adding OAuth Providers

To add Google, GitHub, etc:

1. Install provider packages:
```bash
npm install @auth/core
```

2. Update `convex/auth.config.ts`:
```tsx
import { Google } from "@convex-dev/auth/providers/Google";
import { GitHub } from "@convex-dev/auth/providers/GitHub";

export const { auth, signIn, signOut } = convexAuth({
  providers: [
    Password(),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
});
```

3. Add environment variables to Convex dashboard

4. Use in your app:
```tsx
const { signIn } = useConvexAuth();
await signIn('google'); // or 'github'
```

---

## 🐛 Troubleshooting

### "Missing CONVEX_URL" Error
- Check your `.env` file has the correct URL
- Restart your dev server after adding env vars
- For mobile, check `app.json` `extra.convexUrl`

### "Authentication failed" Error
- Check Convex dev server is running (`npx convex dev`)
- Verify your deployment URL is correct
- Check browser/app console for detailed errors

### Types Not Generating
```bash
npx convex dev  # This generates types automatically
```

### Mobile App Can't Connect
- Check network settings allow HTTP requests
- Verify `expo-constants` is installed
- Try restarting Expo with cache clear: `npm start --clear`

---

## 📖 Additional Resources

- [Convex Auth Docs](https://docs.convex.dev/auth)
- [Convex React Docs](https://docs.convex.dev/client/react)
- [Convex Dashboard](https://dashboard.convex.dev)

---

## 🎉 You're All Set!

Your authentication is now powered by Convex with:
- ✅ Email/password authentication
- ✅ Secure token storage
- ✅ Real-time user state
- ✅ Type-safe queries and mutations
- ✅ Works on web and mobile

# 🚀 Convex Auth - Quick Start

Get up and running with Convex authentication in 5 minutes!

---

## 1️⃣ Install & Initialize (2 min)

```bash
# Install dependencies
npm install convex @convex-dev/auth

# Initialize Convex
npx convex dev
```

This opens your browser to create/login to Convex and gives you a deployment URL like:
`https://happy-animal-123.convex.cloud`

---

## 2️⃣ Set Environment Variables (1 min)

Create `.env` in project root:

```bash
VITE_CONVEX_URL=https://your-deployment.convex.cloud
EXPO_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

**Replace with your actual URL from step 1!**

---

## 3️⃣ Wrap Your Apps (1 min)

### Web App (`apps/web/src/app/root.tsx`):
```tsx
import { ConvexClientProvider } from '../convex/ConvexClientProvider';

export function Layout({ children }) {
  return (
    <ConvexClientProvider>
      {children}
    </ConvexClientProvider>
  );
}
```

### Mobile App (`apps/mobile/App.tsx`):
```tsx
import { ConvexClientProvider } from './src/convex/ConvexProvider';

export default function App() {
  return (
    <ConvexClientProvider>
      {/* Your app */}
    </ConvexClientProvider>
  );
}
```

---

## 4️⃣ Use Auth in Your Components (1 min)

```tsx
import { useConvexAuth } from '../hooks/useConvexAuth';
import { SignInForm } from '../components/auth/SignInForm';

function MyComponent() {
  const { isLoading, isAuthenticated, user, signOut } = useConvexAuth();

  if (isLoading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <SignInForm />;
  }

  return (
    <div>
      <h1>Welcome {user?.email}!</h1>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

---

## ✅ Done!

You now have:
- ✅ Secure authentication
- ✅ Email/password sign in & sign up
- ✅ Real-time user state
- ✅ Works on web & mobile
- ✅ Type-safe with TypeScript

---

## 📝 Next Steps

1. **Start dev servers:**
   ```bash
   # Terminal 1
   npx convex dev

   # Terminal 2
   cd apps/web && npm run dev

   # Terminal 3
   cd apps/mobile && npm start
   ```

2. **Customize UI:**
   - Edit `SignInForm.tsx` / `SignUpForm.tsx`
   - Add your own styling

3. **Add OAuth:**
   - See `CONVEX_SETUP.md` for Google/GitHub setup

4. **Deploy:**
   ```bash
   npx convex deploy
   ```

---

## 🆘 Need Help?

- 📖 Full guide: `CONVEX_SETUP.md`
- 🌐 Docs: https://docs.convex.dev/auth
- 💬 Discord: https://convex.dev/community

Happy coding! 🎉

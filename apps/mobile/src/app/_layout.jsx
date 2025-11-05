/**
 * Root Layout
 *
 * Provider hierarchy (outer to inner):
 * 1. ConvexClientProvider - Database + Auth (feature-flagged)
 * 2. ThemeProvider - Theme and dark mode
 * 3. RoundProvider - Golf round state
 * 4. QueryClientProvider - React Query for data fetching
 * 5. GestureHandlerRootView - Gesture handling
 * 6. Stack - Navigation
 *
 * The old auth system (useAuth from Zustand) remains active until
 * Convex Auth is fully tested and enabled via feature flag.
 *
 * @see Expo Router: https://docs.expo.dev/router/introduction/
 * @see Convex: https://docs.convex.dev/quickstart/react-native
 */

import { useAuth } from "@/utils/auth/useAuth";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { RoundProvider } from "@/contexts/RoundContext";
import DataConsentModal from "@/components/DataConsentModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ConvexClientProvider from "@/convex/ConvexProvider";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  const { initiate, isReady } = useAuth();
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);

  useEffect(() => {
    initiate();
  }, [initiate]);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
      checkDataConsent();
    }
  }, [isReady]);

  const checkDataConsent = async () => {
    try {
      const savedConsent = await AsyncStorage.getItem("data_consent");
      if (savedConsent === null) {
        // User hasn't been asked for consent yet
        setShowConsentModal(true);
      }
    } catch (error) {
      console.error("Error checking data consent:", error);
    } finally {
      setConsentChecked(true);
    }
  };

  const handleConsentModalClose = () => {
    setShowConsentModal(false);
  };

  if (!isReady || !consentChecked) {
    return null;
  }

  return (
    <ConvexClientProvider>
      <ThemeProvider>
        <RoundProvider>
          <QueryClientProvider client={queryClient}>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <Stack
                screenOptions={{ headerShown: false }}
                initialRouteName="index"
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              </Stack>

              <DataConsentModal
                visible={showConsentModal}
                onClose={handleConsentModalClose}
              />
            </GestureHandlerRootView>
          </QueryClientProvider>
        </RoundProvider>
      </ThemeProvider>
    </ConvexClientProvider>
  );
}

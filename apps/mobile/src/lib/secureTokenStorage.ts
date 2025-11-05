/**
 * Secure Token Storage for Convex Auth
 *
 * Implements TokenStorage interface using Expo SecureStore
 * for secure, encrypted token persistence on native devices.
 *
 * Tokens are stored in the device's secure enclave (iOS Keychain/Android Keystore)
 * and are never exposed to AsyncStorage or other insecure storage.
 *
 * @see https://docs.expo.dev/versions/latest/sdk/securestore/
 * @see https://labs.convex.dev/auth/api-reference#react
 */

import * as SecureStore from "expo-secure-store";

export const secureTokenStorage = {
  /**
   * Retrieve a token from secure storage
   */
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error(`SecureStore getItem error for key "${key}":`, error);
      return null;
    }
  },

  /**
   * Store a token in secure storage
   */
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error(`SecureStore setItem error for key "${key}":`, error);
      throw error;
    }
  },

  /**
   * Remove a token from secure storage
   */
  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error(`SecureStore removeItem error for key "${key}":`, error);
      throw error;
    }
  },
};

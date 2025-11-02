import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("theme_preference");
      if (savedTheme !== null) {
        setIsDark(savedTheme === "dark");
      } else {
        // Default to system preference if no saved preference
        setIsDark(systemColorScheme === "dark");
      }
    } catch (error) {
      console.error("Error loading theme preference:", error);
      setIsDark(systemColorScheme === "dark");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDark;
      setIsDark(newTheme);
      await AsyncStorage.setItem(
        "theme_preference",
        newTheme ? "dark" : "light",
      );
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  };

  const theme = {
    isDark,
    isLoading,
    toggleTheme,
    colors: {
      // Base colors following Liquid Glass
      background: isDark ? "#000000" : "#FAFAFA",
      surface: isDark ? "rgba(28, 28, 30, 0.82)" : "rgba(255, 255, 255, 0.85)",
      surfaceElevated: isDark
        ? "rgba(44, 44, 46, 0.85)"
        : "rgba(255, 255, 255, 0.68)",

      // Glass materials
      glass: isDark ? "rgba(28, 28, 30, 0.68)" : "rgba(255, 255, 255, 0.68)",
      glassThick: isDark
        ? "rgba(28, 28, 30, 0.85)"
        : "rgba(255, 255, 255, 0.85)",

      // Text with enhanced contrast for glass
      text: isDark ? "#FFFFFF" : "#1C1C1E",
      textSecondary: isDark
        ? "rgba(235, 235, 245, 0.8)"
        : "rgba(60, 60, 67, 0.8)",
      textTertiary: isDark
        ? "rgba(235, 235, 245, 0.6)"
        : "rgba(60, 60, 67, 0.6)",

      // Golf-specific accent colors (system tints)
      primary: isDark ? "#30D158" : "#34C759", // iOS system green
      primaryDark: "#30D158", // iOS system green dark
      accent: isDark ? "#30D158" : "#34C759",

      // Semantic colors
      danger: isDark ? "#FF453A" : "#FF3B30",
      dangerDark: "#FF453A",
      warning: isDark ? "#FF9F0A" : "#FF9500",
      warningDark: "#FF9F0A",

      // Border and separator colors for glass
      border: isDark ? "rgba(84, 84, 88, 0.65)" : "rgba(60, 60, 67, 0.18)",
      borderLight: isDark ? "rgba(84, 84, 88, 0.35)" : "rgba(60, 60, 67, 0.12)",
      separator: isDark ? "rgba(84, 84, 88, 0.6)" : "rgba(60, 60, 67, 0.2)",

      // Input colors with glass backdrop
      inputBackground: isDark
        ? "rgba(28, 28, 30, 0.68)"
        : "rgba(242, 242, 247, 0.8)",
      inputBackgroundFocused: isDark
        ? "rgba(44, 44, 46, 0.85)"
        : "rgba(255, 255, 255, 0.9)",
      placeholder: isDark
        ? "rgba(235, 235, 245, 0.6)"
        : "rgba(60, 60, 67, 0.6)",

      // Status bar
      statusBarStyle: isDark ? "light" : "dark",

      // Card colors with glass effect
      cardBackground: isDark
        ? "rgba(28, 28, 30, 0.68)"
        : "rgba(255, 255, 255, 0.68)",
      cardBorder: isDark ? "rgba(84, 84, 88, 0.3)" : "rgba(60, 60, 67, 0.15)",

      // Button states
      buttonSecondary: isDark
        ? "rgba(44, 44, 46, 0.85)"
        : "rgba(242, 242, 247, 0.8)",
      buttonSecondaryText: isDark ? "#FFFFFF" : "#34C759",

      // Golf score colors
      scoreGood: isDark ? "#30D158" : "#34C759", // System green
      scoreOkay: isDark ? "#FF9F0A" : "#FF9500", // System orange
      scoreBad: isDark ? "#FF453A" : "#FF3B30", // System red

      // Shadow for depth
      shadow: isDark ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.14)",
      shadowHeavy: isDark ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.25)",
    },

    // Liquid Glass specific properties
    glass: {
      translucency: 0.68,
      backdropBlurRadius: 24,
      saturation: 1.1,
      brightness: 1.05,
      cornerRadius: 16,
      strokeOpacity: 0.18,
    },

    // Animation properties
    motion: {
      springs: {
        stiffness: 520,
        damping: 42,
      },
      durations: {
        enter: 240,
        exit: 200,
        emphasis: 320,
      },
    },

    // Typography (SF Pro system)
    typography: {
      weights: {
        title: "600", // semibold
        label: "500", // medium
        body: "400", // regular
      },
    },
  };

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};
